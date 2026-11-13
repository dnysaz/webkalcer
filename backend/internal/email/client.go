// Package email mengirim email transaksional lewat API Resend.
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

// ErrNotConfigured dikembalikan bila RESEND_API_KEY belum diisi.
var ErrNotConfigured = errors.New("email service is not configured")

// DefaultEndpoint adalah endpoint kirim email Resend.
const DefaultEndpoint = "https://api.resend.com/emails"

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

// Client adalah klien tipis untuk Resend.
type Client struct {
	apiKey     string
	endpoint   string
	httpClient *http.Client
}

// NewClient membuat klien Resend. apiKey boleh kosong; Send akan
// mengembalikan ErrNotConfigured sampai kredensial diisi.
func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:   strings.TrimSpace(apiKey),
		endpoint: DefaultEndpoint,
		// Timeout mencegah request form menggantung saat Resend lambat.
		httpClient: &http.Client{Timeout: 20 * time.Second},
	}
}

// Configured melaporkan apakah API key sudah tersedia.
func (c *Client) Configured() bool {
	return c != nil && c.apiKey != ""
}

// SetEndpoint mengganti URL endpoint; dipakai unit test dengan server palsu.
func (c *Client) SetEndpoint(url string) {
	c.endpoint = url
}

// payload mengikuti skema POST /emails milik Resend.
type payload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	Text    string   `json:"text,omitempty"`
	HTML    string   `json:"html,omitempty"`
}

// response dipakai untuk sukses ({"id": "..."}) maupun error
// ({"statusCode":...,"name":"...","message":"..."}).
type response struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Message string `json:"message"`
}

// formatAddress membentuk "Nama <email>" sesuai format Resend.
func formatAddress(name, address string) string {
	name = strings.TrimSpace(name)
	if name == "" {
		return address
	}
	return fmt.Sprintf("%s <%s>", name, address)
}

// Send mengirim satu email dan mengembalikan ID email dari Resend.
func (c *Client) Send(ctx context.Context, msg Message) (string, error) {
	if !c.Configured() {
		return "", ErrNotConfigured
	}
	if strings.TrimSpace(msg.ToEmail) == "" {
		return "", fmt.Errorf("recipient email is empty")
	}
	if strings.TrimSpace(msg.FromEmail) == "" {
		return "", fmt.Errorf("from email is empty")
	}

	body, err := json.Marshal(payload{
		From:    formatAddress(msg.FromName, msg.FromEmail),
		To:      []string{formatAddress(msg.ToName, msg.ToEmail)},
		Subject: msg.Subject,
		Text:    msg.Text,
		HTML:    msg.HTML,
	})
	if err != nil {
		return "", fmt.Errorf("failed to encode email: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.endpoint, bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to build the request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to reach Resend: %w", err)
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		detail := strings.TrimSpace(string(raw))
		var apiErr response
		if json.Unmarshal(raw, &apiErr) == nil && apiErr.Message != "" {
			detail = apiErr.Message
		}
		return "", fmt.Errorf("Resend rejected the email (status %d): %s", resp.StatusCode, detail)
	}

	var result response
	if err := json.Unmarshal(raw, &result); err != nil {
		return "", fmt.Errorf("failed to read the Resend response: %w", err)
	}

	return result.ID, nil
}
