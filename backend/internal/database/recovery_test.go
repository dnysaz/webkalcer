package database

import (
	"strings"
	"testing"
)

// TestFailStaleBuildingDeployment memastikan deployment yang tertinggal di
// status "building" ditandai gagal (dan log lamanya dipertahankan).
func TestFailStaleBuildingDeployment(t *testing.T) {
	db := newTestDB(t)
	defer db.Close()

	users := NewUserStore(db)
	projects := NewProjectStore(db)
	deployments := NewDeploymentStore(db)

	user, err := users.Create("gh-1", "", "alice", "alice@example.com", "")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	project, err := projects.Create(user.ID, "https://github.com/alice/site.git", "site-a", map[string]string{})
	if err != nil {
		t.Fatalf("create project: %v", err)
	}
	if err := projects.UpdateStatus(project.ID, "building"); err != nil {
		t.Fatalf("update project status: %v", err)
	}
	dep, err := deployments.Create(project.ID, "building", "01:00:00 npm ci")
	if err != nil {
		t.Fatalf("create deployment: %v", err)
	}

	n, err := deployments.FailStaleBuilding("deployment interrupted")
	if err != nil {
		t.Fatalf("FailStaleBuilding: %v", err)
	}
	if n != 1 {
		t.Errorf("baris terpengaruh = %d, ingin 1", n)
	}

	got, err := deployments.GetByID(dep.ID)
	if err != nil {
		t.Fatalf("GetByID: %v", err)
	}
	if got.Status != "failed" {
		t.Errorf("status = %q, ingin failed", got.Status)
	}
	if !strings.Contains(got.Log, "npm ci") || !strings.Contains(got.Log, "deployment interrupted") {
		t.Errorf("log tidak memuat log lama + pesan pemulihan: %q", got.Log)
	}

	m, err := projects.FailStaleBuilds()
	if err != nil {
		t.Fatalf("FailStaleBuilds: %v", err)
	}
	if m != 1 {
		t.Errorf("project terpengaruh = %d, ingin 1", m)
	}
	reloaded, err := projects.GetByID(project.ID)
	if err != nil {
		t.Fatalf("GetByID project: %v", err)
	}
	if reloaded.Status != "failed" {
		t.Errorf("status project = %q, ingin failed", reloaded.Status)
	}
}

// TestFailStaleBuildsIgnoresHealthyProjects memastikan project yang sudah
// deployed tidak ikut diubah.
func TestFailStaleBuildsIgnoresHealthyProjects(t *testing.T) {
	db := newTestDB(t)
	defer db.Close()

	users := NewUserStore(db)
	projects := NewProjectStore(db)

	user, err := users.Create("gh-2", "", "bob", "bob@example.com", "")
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	project, err := projects.Create(user.ID, "https://github.com/bob/site.git", "site-b", map[string]string{})
	if err != nil {
		t.Fatalf("create project: %v", err)
	}
	if err := projects.UpdateStatus(project.ID, "deployed"); err != nil {
		t.Fatalf("update project status: %v", err)
	}

	if _, err := projects.FailStaleBuilds(); err != nil {
		t.Fatalf("FailStaleBuilds: %v", err)
	}

	reloaded, err := projects.GetByID(project.ID)
	if err != nil {
		t.Fatalf("GetByID: %v", err)
	}
	if reloaded.Status != "deployed" {
		t.Errorf("status project = %q, ingin tetap deployed", reloaded.Status)
	}
}
