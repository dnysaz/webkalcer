package handler

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"webkalcer/backend/internal/config"
	"webkalcer/backend/internal/email"

	"github.com/gin-gonic/gin"
)

type fakeEmailClient struct {
	msg    email.Message
	err    error
	calls  int
	lastID string
}

func (f *fakeEmailClient) Send(_ context.Context, msg email.Message) (string, error) {
	f.calls++
	f.msg = msg
	if f.err != nil {
		return "", f.err
	}
	return "email-id-1", nil
}

func newTestOrderHandler(t *testing.T, apiKey string, client EmailClient) *OrderHandler {
	t.Helper()
	h := NewOrderHandler(config.EmailConfig{
		ResendAPIKey: apiKey,
		ToEmail:      "owner@webkalcer.com",
		ToName:       "Tim WebKalcer",
		FromEmail:    "no-reply@webkalcer.com",
		FromName:     "WebKalcer",
	}, client)
	h.now = func() time.Time {
		return time.Date(2026, 11, 12, 12, 34, 0, 0, time.UTC)
	}
	return h
}

func postOrder(t *testing.T, h *OrderHandler, body string) *httptest.ResponseRecorder {
	t.Helper()
	gin.SetMode(gin.TestMode)
	rec := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(rec)
	c.Request = httptest.NewRequest(http.MethodPost, "/api/orders", strings.NewReader(body))
	c.Request.Header.Set("Content-Type", "application/json")
	h.CreateOrder(c)
	return rec
}

func TestCreateOrderSendsEveryField(t *testing.T) {
	client := &fakeEmailClient{}
	h := newTestOrderHandler(t, "client-key", client)

	rec := postOrder(t, h, `{
		"nama": "Budi & <Sari>",
		"kontak": "0812-3456-7890",
		"bisnis": "Toko Kopi \"Pak Budi\"",
		"pesan": "Butuh landing page kopi.\nWarna hangat & tombol <script>alert(1)</script>",
		"paket": "landing-page"
	}`)

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, ingin 201: %s", rec.Code, rec.Body.String())
	}
	if client.calls != 1 {
		t.Fatalf("client dipanggil %d kali, ingin 1", client.calls)
	}

	msg := client.msg
	if msg.ToEmail != "owner@webkalcer.com" || msg.FromEmail != "no-reply@webkalcer.com" {
		t.Errorf("from/to = %q/%q", msg.FromEmail, msg.ToEmail)
	}
	if !strings.Contains(msg.Subject, "Landing Page Statis") || !strings.Contains(msg.Subject, "Budi & <Sari>") {
		t.Errorf("subject = %q", msg.Subject)
	}

	for _, want := range []string{
		"Landing Page Statis",
		"Rp450.000",
		"Budi & <Sari>",
		"0812-3456-7890",
		`Toko Kopi "Pak Budi"`,
		"Butuh landing page kopi.",
		"12 November 2026, 19:34 WIB",
	} {
		if !strings.Contains(msg.Text, want) {
			t.Errorf("body teks tidak memuat %q:\n%s", want, msg.Text)
		}
	}

	// HTML harus meng-escape input pengguna dan tetap memuat isi pesan.
	if strings.Contains(msg.HTML, "<script>") {
		t.Error("HTML email memuat <script> mentah dari input pengguna")
	}
	for _, want := range []string{
		"&lt;script&gt;alert(1)&lt;/script&gt;",
		"Budi &amp; &lt;Sari&gt;",
		"Butuh landing page kopi.<br>",
	} {
		if !strings.Contains(msg.HTML, want) {
			t.Errorf("HTML email tidak memuat %q", want)
		}
	}
}

func TestCreateOrderValidation(t *testing.T) {
	cases := []struct {
		name string
		body string
		want string
	}{
		{"nama pendek", `{"nama":"A","kontak":"0812","pesan":"cukup panjang","paket":"landing-page"}`, "nama minimal"},
		{"kontak kosong", `{"nama":"Budi","kontak":"","pesan":"cukup panjang","paket":"landing-page"}`, "WhatsApp"},
		{"pesan pendek", `{"nama":"Budi","kontak":"0812","pesan":"pendek","paket":"landing-page"}`, "minimal 10"},
		{"paket kosong", `{"nama":"Budi","kontak":"0812","pesan":"cukup panjang","paket":""}`, "paket wajib"},
		{"paket asing", `{"nama":"Budi","kontak":"0812","pesan":"cukup panjang","paket":"gratis"}`, "tidak dikenal"},
		{"json rusak", `{`, "tidak valid"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			client := &fakeEmailClient{}
			h := newTestOrderHandler(t, "client-key", client)

			rec := postOrder(t, h, tc.body)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, ingin 400: %s", rec.Code, rec.Body.String())
			}
			if !strings.Contains(rec.Body.String(), tc.want) {
				t.Errorf("body = %s, ingin memuat %q", rec.Body.String(), tc.want)
			}
			if client.calls != 0 {
				t.Errorf("client dipanggil %d kali untuk input tidak valid", client.calls)
			}
		})
	}
}

func TestCreateOrderRequiresEmailConfiguration(t *testing.T) {
	client := &fakeEmailClient{}
	h := newTestOrderHandler(t, "", client)

	rec := postOrder(t, h, `{"nama":"Budi","kontak":"0812","pesan":"cukup panjang","paket":"landing-page"}`)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("status = %d, ingin 503: %s", rec.Code, rec.Body.String())
	}
	if client.calls != 0 {
		t.Errorf("client tidak boleh dipanggil saat belum dikonfigurasi")
	}
}

func TestCreateOrderReportsEmailFailure(t *testing.T) {
	client := &fakeEmailClient{err: errors.New("client down")}
	h := newTestOrderHandler(t, "client-key", client)

	rec := postOrder(t, h, `{"nama":"Budi","kontak":"0812","pesan":"cukup panjang","paket":"landing-page"}`)

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("status = %d, ingin 502: %s", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "gagal dikirim") {
		t.Errorf("body = %s, ingin pesan gagal yang ramah", rec.Body.String())
	}
}
