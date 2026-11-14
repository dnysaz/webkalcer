package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"

	"webkalcer/backend/internal/database"
)

// TestStreamDeploymentLogMengirimDeltaDanStatus memastikan endpoint SSE
// mengirim log awal, lalu delta log + status akhir + event done. Dengan ini
// dashboard tidak perlu menunggu polling 3 detik untuk melihat progres build.
func TestStreamDeploymentLogMengirimDeltaDanStatus(t *testing.T) {
	store := newTestStore(t)
	deployments := database.NewDeploymentStore(store.db)
	handler := newTestHandler(t, store)
	handler.deploymentStore = deployments

	userID := store.createUser(t, "alice")
	projectID := store.createProject(t, userID, "https://github.com/alice/log.git", "log-site", nil)

	dep, err := deployments.Create(projectID, "building", "01:00:00 line one")
	if err != nil {
		t.Fatalf("create deployment: %v", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(
		http.MethodGet,
		"/api/projects/"+projectID+"/deployments/"+dep.ID+"/logs",
		nil,
	).WithContext(ctx)
	c.Params = gin.Params{
		{Key: "id", Value: projectID},
		{Key: "deploymentID", Value: dep.ID},
	}
	c.Set("userID", userID)

	done := make(chan struct{})
	go func() {
		handler.StreamDeploymentLog(c)
		close(done)
	}()

	// Beri handler waktu mengirim state awal, lalu simulasikan worker yang
	// menambah baris log dan menyelesaikan build.
	time.Sleep(50 * time.Millisecond)
	if err := deployments.UpdateStatus(dep.ID, "success", "01:00:00 line one\n01:00:01 line two"); err != nil {
		t.Fatalf("update status: %v", err)
	}

	select {
	case <-done:
	case <-time.After(3 * time.Second):
		t.Fatal("handler SSE tidak selesai setelah deployment sukses")
	}

	body := rec.Body.String()
	if !strings.Contains(body, "event: status") {
		t.Fatalf("tidak ada event status di %q", body)
	}
	if !strings.Contains(body, "line two") {
		t.Fatalf("delta log tidak terkirim: %q", body)
	}
	if !strings.Contains(body, "event: done") {
		t.Fatalf("event done tidak terkirim: %q", body)
	}
	if !strings.Contains(body, `"success"`) {
		t.Fatalf("status akhir success tidak terkirim: %q", body)
	}
	if got := rec.Header().Get("X-Accel-Buffering"); got != "no" {
		t.Errorf("X-Accel-Buffering = %q, ingin \"no\" agar nginx tidak membuffer SSE", got)
	}
}

// TestStreamDeploymentLogMenolakDeploymentMilikProjectLain memastikan log
// deployment tidak bisa diintip lewat project lain milik user yang sama.
func TestStreamDeploymentLogMenolakDeploymentMilikProjectLain(t *testing.T) {
	store := newTestStore(t)
	deployments := database.NewDeploymentStore(store.db)
	handler := newTestHandler(t, store)
	handler.deploymentStore = deployments

	userID := store.createUser(t, "alice")
	projectA := store.createProject(t, userID, "https://github.com/alice/a.git", "site-a", nil)
	projectB := store.createProject(t, userID, "https://github.com/alice/b.git", "site-b", nil)

	dep, err := deployments.Create(projectA, "building", "log a")
	if err != nil {
		t.Fatalf("create deployment: %v", err)
	}

	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(http.MethodGet, "/", nil)
	c.Params = gin.Params{
		{Key: "id", Value: projectB},
		{Key: "deploymentID", Value: dep.ID},
	}
	c.Set("userID", userID)

	handler.StreamDeploymentLog(c)

	if rec.Code != http.StatusNotFound {
		t.Errorf("status = %d, ingin 404 untuk deployment project lain", rec.Code)
	}
}
