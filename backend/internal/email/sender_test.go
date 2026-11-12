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

// newTestSender membuat klien Sender yang mengarah ke server palsu.
func newTestSender(t *testing.T, handler http.HandlerFunc) (*Sender, *httptest.Server) {
	t.Helper()
	srv := httptest.NewServer(handler)
	t.Cleanup(srv.Close)

	s := NewSender("test-api-key")
	s.SetEndpoint(srv.URL)
	return s, srv
}

func TestSenderSendPostsExpectedPayload(t *testing.T) {
	var gotAuth, gotPath string
	var payload map[string]any

	s, _ := newTestSender(t, func(w http.ResponseWriter, r *http.Request) {
		gotAuth = r.Header.Get("Authorization")
		gotPath = r.URL.Path
		if ct := r.Header.Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
			t.Errorf("Content-Type = %q, ingin application/json", ct)
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Errorf("decode payload: %v", err)
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":true,"message":"Email sent","emailId":"abc-123"}`))
	})

	id, err := s.Send(context.Background(), Message{
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
		t.Errorf("emailID = %q, ingin abc-123", id)
	}
	if gotAuth != "Bearer test-api-key" {
		t.Errorf("Authorization = %q, ingin Bearer test-api-key", gotAuth)
	}
	if gotPath != "/" {
		t.Errorf("path = %q", gotPath)
	}

	from, _ := payload["from"].(map[string]any)
	to, _ := payload["to"].(map[string]any)
	if from["email"] != "no-reply@webkalcer.com" || from["name"] != "WebKalcer" {
		t.Errorf("from = %+v", from)
	}
	if to["email"] != "owner@webkalcer.com" || to["name"] != "Tim WebKalcer" {
		t.Errorf("to = %+v", to)
	}
	if payload["subject"] != "Pesanan baru" {
		t.Errorf("subject = %v", payload["subject"])
	}
	if payload["text"] != "isi teks" || payload["html"] != "<p>isi html</p>" {
		t.Errorf("body = text %v / html %v", payload["text"], payload["html"])
	}
}

func TestSenderSendRequiresConfiguration(t *testing.T) {
	s := NewSender("")
	if s.Configured() {
		t.Fatal("klien tanpa API key seharusnya belum configured")
	}
	_, err := s.Send(context.Background(), Message{FromEmail: "a@b.c", ToEmail: "d@e.f"})
	if !errors.Is(err, ErrNotConfigured) {
		t.Errorf("error = %v, ingin ErrNotConfigured", err)
	}
}

func TestSenderSendReportsAPIErrors(t *testing.T) {
	s, _ := newTestSender(t, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"message":"invalid token"}`))
	})

	_, err := s.Send(context.Background(), Message{
		FromEmail: "no-reply@webkalcer.com",
		ToEmail:   "owner@webkalcer.com",
		Subject:   "x",
	})
	if err == nil || !strings.Contains(err.Error(), "401") {
		t.Errorf("error = %v, ingin menyebut status 401", err)
	}
}

func TestSenderSendRejectsUnsuccessfulBody(t *testing.T) {
	s, _ := newTestSender(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"success":false,"message":"recipient suppressed"}`))
	})

	_, err := s.Send(context.Background(), Message{
		FromEmail: "no-reply@webkalcer.com",
		ToEmail:   "owner@webkalcer.com",
		Subject:   "x",
	})
	if err == nil || !strings.Contains(err.Error(), "suppressed") {
		t.Errorf("error = %v, ingin memuat alasan dari Sender", err)
	}
}
