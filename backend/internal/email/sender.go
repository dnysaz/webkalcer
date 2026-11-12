// Package email mengirim email transaksional lewat API Sender.net.
// API key hanya dipakai di server dan tidak pernah diekspos ke browser.
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// ErrNotConfigured dikembalikan bila SENDER_API_KEY belum diisi.
var ErrNotConfigured = errors.New("email service is not configured")

// DefaultSenderEndpoint adalah endpoint kirim email tanpa template di Sender.
const DefaultSenderEndpoint = "https://api.sender.net/v2/message/send"

// Message adalah satu email transaksional yang akan dikirim.
type Message struct {
	FromName  string
	FromEmail string
	ToName    string
	ToEmail   string
	Subject   string
	Text      string
	HTML      string
}

// Sender adalah klien tipis untuk Sender.net.
type Sender struct {
	apiKey     string
	endpoint   string
	httpClient *http.Client
}

// NewSender membuat klien Sender. apiKey boleh kosong; Send akan
// mengembalikan ErrNotConfigured sampai kredensial diisi.
func NewSender(apiKey string) *Sender {
	return &Sender{
		apiKey:   strings.TrimSpace(apiKey),
		endpoint: DefaultSenderEndpoint,
		// Timeout mencegah request form menggantung saat Sender lambat.
		httpClient: &http.Client{Timeout: 20 * time.Second},
	}
}

// Configured melaporkan apakah API key sudah tersedia.
func (s *Sender) Configured() bool {
	return s != nil && s.apiKey != ""
}

// SetEndpoint mengganti URL endpoint; dipakai unit test dengan server palsu.
func (s *Sender) SetEndpoint(url string) {
	s.endpoint = url
}

type senderPayload struct {
	From    senderAddress `json:"from"`
	To      senderAddress `json:"to"`
	Subject string        `json:"subject"`
	Text    string        `json:"text"`
	HTML    string        `json:"html"`
}

type senderAddress struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

type senderResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	EmailID string `json:"emailId"`
}

// Send mengirim satu email dan mengembalikan ID email dari Sender.
func (s *Sender) Send(ctx context.Context, msg Message) (string, error) {
	if !s.Configured() {
		return "", ErrNotConfigured
	}
	if strings.TrimSpace(msg.ToEmail) == "" {
		return "", fmt.Errorf("recipient email is empty")
	}
	if strings.TrimSpace(msg.FromEmail) == "" {
		return "", fmt.Errorf("sender email is empty")
	}

	body, err := json.Marshal(senderPayload{
		From:    senderAddress{Email: msg.FromEmail, Name: msg.FromName},
		To:      senderAddress{Email: msg.ToEmail, Name: msg.ToName},
		Subject: msg.Subject,
		Text:    msg.Text,
		HTML:    msg.HTML,
	})
	if err != nil {
		return "", fmt.Errorf("failed to encode email: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.endpoint, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to build the request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to reach Sender: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("Sender rejected the email (status %d): %s", resp.StatusCode, strings.TrimSpace(string(raw)))
	}

	var result senderResponse
	if err := json.Unmarshal(raw, &result); err == nil && !result.Success {
		return "", fmt.Errorf("Sender rejected the email: %s", result.Message)
	}

	return result.EmailID, nil
}
