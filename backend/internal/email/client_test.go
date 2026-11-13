package email

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// newTestClient membuat klien Resend yang mengarah ke server palsu.
func newTestClient(t *testing.T, handler http.HandlerFunc) (*Client, *httptest.Server) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)

	c := NewClient("test-api-key")
	c.SetEndpoint(srv.URL)
	return c, srv
}

func TestSendPostsExpectedPayload(t *testing.T) {
	var gotAuth, gotPath string
	var payload map[string]any

	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		gotPath = r.URL.Path
		if ct := r.Header.Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
			t.Errorf("Content-Type = %q, ingin application/json", ct)
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Errorf("decode payload: %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"id":"abc-123"}`))
	})

	id, err := c.Send(context.Background(), Message{
		FromName:  "WebKalcer",
		FromEmail: "no-reply@webkalcer.com",
		ToName:    "Tim WebKalcer",
		ToEmail:   "owner@webkalcer.com",
		Subject:   "Pesanan baru",
		Text:      "isi teks",
		HTML:      "<p>isi html</p>",
	})
	if err != nil {
		t.Fatalf("Send: %v", err)
	}
	if id != "abc-123" {
		t.Errorf("id = %q, ingin abc-123", id)
	}
	if gotAuth != "Bearer test-api-key" {
		t.Errorf("Authorization = %q, ingin Bearer test-api-key", gotAuth)
	}
	if gotPath != "/" {
		t.Errorf("path = %q", gotPath)
	}

	if payload["from"] != "WebKalcer <no-reply@webkalcer.com>" {
		t.Errorf("from = %v", payload["from"])
	}
	to, _ := payload["to"].([]any)
	if len(to) != 1 || to[0] != "Tim WebKalcer <owner@webkalcer.com>" {
		t.Errorf("to = %v", payload["to"])
	}
	if payload["subject"] != "Pesanan baru" {
		t.Errorf("subject = %v", payload["subject"])
	}
	if payload["text"] != "isi teks" || payload["html"] != "<p>isi html</p>" {
		t.Errorf("body = text %v / html %v", payload["text"], payload["html"])
	}
}

func TestSendRequiresConfiguration(t *testing.T) {
	c := NewClient("")
	if c.Configured() {
		t.Fatal("klien tanpa API key seharusnya belum configured")
	}
	_, err := c.Send(context.Background(), Message{FromEmail: "a@b.c", ToEmail: "d@e.f"})
	if !errors.Is(err, ErrNotConfigured) {
		t.Errorf("error = %v, ingin ErrNotConfigured", err)
	}
}

func TestSendReportsAPIErrors(t *testing.T) {
	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"statusCode":401,"name":"validation_error","message":"API key is invalid"}`))
	})

	_, err := c.Send(context.Background(), Message{
		FromEmail: "no-reply@webkalcer.com",
		ToEmail:   "owner@webkalcer.com",
		Subject:   "x",
	})
	if err == nil || !strings.Contains(err.Error(), "401") {
		t.Errorf("error = %v, ingin menyebut status 401", err)
	}
	if err == nil || !strings.Contains(err.Error(), "API key is invalid") {
		t.Errorf("error = %v, ingin memuat alasan dari Resend", err)
	}
}

func TestSendSurfacesValidationMessage(t *testing.T) {
	c, _ := newTestClient(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnprocessableEntity)
		_, _ = w.Write([]byte(`{"statusCode":422,"name":"validation_error","message":"Invalid 'to' field"}`))
	})

	_, err := c.Send(context.Background(), Message{
		FromEmail: "no-reply@webkalcer.com",
		ToEmail:   "owner@webkalcer.com",
		Subject:   "x",
	})
	if err == nil || !strings.Contains(err.Error(), "Invalid 'to' field") {
		t.Errorf("error = %v, ingin memuat pesan validasi Resend", err)
	}
}

func TestSendRejectsMissingAddresses(t *testing.T) {
	c := NewClient("test-api-key")
	if _, err := c.Send(context.Background(), Message{ToEmail: "a@b.c"}); err == nil {
		t.Error("from kosong seharusnya error")
	}
	if _, err := c.Send(context.Background(), Message{FromEmail: "a@b.c"}); err == nil {
		t.Error("to kosong seharusnya error")
	}
}
