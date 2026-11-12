package handler

import (
	"context"
	"fmt"
	"html"
	"log"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"webkalcer/backend/internal/config"
	"webkalcer/backend/internal/email"

	"github.com/gin-gonic/gin"
)

// EmailSender adalah bagian klien email yang dipakai handler pesanan.
// Dibuat sebagai interface agar handler bisa diuji tanpa memanggil Sender.
type EmailSender interface {
	Send(ctx context.Context, msg email.Message) (string, error)
}

// paketInfo adalah data paket yang ditampilkan di email. Nilai diambil dari
// server (bukan dari body request) supaya klien tidak bisa memalsukan harga.
type paketInfo struct {
	Name  string
	Price string
}

var paketCatalog = map[string]paketInfo{
	"landing-page":   {Name: "Landing Page Statis", Price: "Rp450.000 (sekali bayar)"},
	"website-custom": {Name: "Website Custom", Price: "mulai Rp999.999"},
}

// OrderHandler menerima pesanan dari formulir publik dan meneruskannya ke email.
type OrderHandler struct {
	sender     EmailSender
	toEmail    string
	toName     string
	fromEmail  string
	fromName   string
	configured bool
	// now bisa diganti di test agar waktu email deterministik.
	now func() time.Time
}

// NewOrderHandler membuat handler pesanan publik.
func NewOrderHandler(cfg config.EmailConfig, sender EmailSender) *OrderHandler {
	return &OrderHandler{
		sender:     sender,
		toEmail:    strings.TrimSpace(cfg.ToEmail),
		toName:     strings.TrimSpace(cfg.ToName),
		fromEmail:  strings.TrimSpace(cfg.FromEmail),
		fromName:   strings.TrimSpace(cfg.FromName),
		configured: strings.TrimSpace(cfg.SenderAPIKey) != "" && strings.TrimSpace(cfg.ToEmail) != "",
		now:        time.Now,
	}
}

type orderInput struct {
	Nama   string `json:"nama"`
	Kontak string `json:"kontak"`
	Bisnis string `json:"bisnis"`
	Pesan  string `json:"pesan"`
	Paket  string `json:"paket"`
}

// CreateOrder menangani POST /api/orders. Endpoint ini publik (tanpa login)
// tetapi dibatasi rate limit di router.
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	// Batasi ukuran body agar payload raksasa tidak menghabiskan memori.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 64<<10)

	if !h.configured {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "layanan email belum dikonfigurasi. Hubungi admin WebKalcer.",
		})
		return
	}

	var input orderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "format permintaan tidak valid"})
		return
	}

	input.Nama = sanitizeSingleLine(input.Nama)
	input.Kontak = sanitizeSingleLine(input.Kontak)
	input.Bisnis = sanitizeSingleLine(input.Bisnis)
	input.Pesan = strings.TrimSpace(input.Pesan)
	input.Paket = strings.TrimSpace(input.Paket)

	if msg := validateOrder(input); msg != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": msg})
		return
	}

	paket, ok := paketCatalog[input.Paket]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "paket tidak dikenal"})
		return
	}

	receivedAt := h.now().In(time.FixedZone("WIB", 7*60*60))
	subject, textBody, htmlBody := buildOrderEmail(input, paket, receivedAt)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 25*time.Second)
	defer cancel()

	emailID, err := h.sender.Send(ctx, email.Message{
		FromName:  h.fromName,
		FromEmail: h.fromEmail,
		ToName:    h.toName,
		ToEmail:   h.toEmail,
		Subject:   subject,
		Text:      textBody,
		HTML:      htmlBody,
	})
	if err != nil {
		// Jangan log isi form (data pribadi); cukup error dari Sender.
		log.Printf("failed to send the order email: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "pesanan gagal dikirim. Silakan coba lagi atau hubungi kami lewat WhatsApp.",
		})
		return
	}

	log.Printf("order email sent (paket=%s, emailId=%s)", input.Paket, emailID)
	c.JSON(http.StatusCreated, gin.H{"ok": true})
}

// validateOrder mengembalikan pesan kesalahan pertama, atau string kosong.
func validateOrder(input orderInput) string {
	switch {
	case utf8.RuneCountInString(input.Nama) < 2:
		return "nama minimal 2 karakter"
	case utf8.RuneCountInString(input.Nama) > 100:
		return "nama maksimal 100 karakter"
	case utf8.RuneCountInString(input.Kontak) < 3:
		return "WhatsApp atau email wajib diisi"
	case utf8.RuneCountInString(input.Kontak) > 150:
		return "kontak maksimal 150 karakter"
	case utf8.RuneCountInString(input.Bisnis) > 150:
		return "nama bisnis maksimal 150 karakter"
	case utf8.RuneCountInString(input.Pesan) < 10:
		return "ceritakan kebutuhan Anda minimal 10 karakter"
	case utf8.RuneCountInString(input.Pesan) > 5000:
		return "pesan maksimal 5000 karakter"
	case input.Paket == "":
		return "paket wajib dipilih"
	}
	return ""
}

// sanitizeSingleLine meratakan input satu baris dan memotong karakter kontrol
// agar tidak bisa dipakai untuk menyisipkan header email.
func sanitizeSingleLine(s string) string {
	s = strings.TrimSpace(s)
	s = strings.NewReplacer("\r", " ", "\n", " ", "\t", " ").Replace(s)
	return strings.Join(strings.Fields(s), " ")
}

func buildOrderEmail(input orderInput, paket paketInfo, receivedAt time.Time) (subject, text, htmlBody string) {
	bisnis := input.Bisnis
	if bisnis == "" {
		bisnis = "-"
	}
	waktu := receivedAt.Format("2 January 2006, 15:04") + " WIB"

	subject = fmt.Sprintf("[Pesanan Baru] %s — %s", paket.Name, input.Nama)

	var sb strings.Builder
	fmt.Fprintf(&sb, "Pesanan baru dari formulir webkalcer.com\n\n")
	fmt.Fprintf(&sb, "Paket   : %s (%s)\n", paket.Name, paket.Price)
	fmt.Fprintf(&sb, "Nama    : %s\n", input.Nama)
	fmt.Fprintf(&sb, "Kontak  : %s\n", input.Kontak)
	fmt.Fprintf(&sb, "Bisnis  : %s\n", bisnis)
	fmt.Fprintf(&sb, "Waktu   : %s\n\n", waktu)
	fmt.Fprintf(&sb, "Pesan:\n%s\n", input.Pesan)
	text = sb.String()

	e := html.EscapeString
	pesanHTML := e(input.Pesan)
	pesanHTML = strings.ReplaceAll(pesanHTML, "\r\n", "\n")
	pesanHTML = strings.ReplaceAll(pesanHTML, "\n", "<br>")

	htmlBody = fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:24px;background:#F1F3F4;font-family:Roboto,Arial,sans-serif;color:#202124;">
  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="background:#1A73E8;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700;">
        Pesanan Baru — WebKalcer
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <p style="margin:0 0 20px;font-size:16px;">Ada pesanan baru dari formulir <b>webkalcer.com</b>.</p>
        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;">
          <tr><td style="padding:6px 0;color:#5F6368;width:110px;">Paket</td><td style="padding:6px 0;"><b>%s</b><br><span style="color:#5F6368;">%s</span></td></tr>
          <tr><td style="padding:6px 0;color:#5F6368;">Nama</td><td style="padding:6px 0;">%s</td></tr>
          <tr><td style="padding:6px 0;color:#5F6368;">Kontak</td><td style="padding:6px 0;">%s</td></tr>
          <tr><td style="padding:6px 0;color:#5F6368;">Bisnis</td><td style="padding:6px 0;">%s</td></tr>
          <tr><td style="padding:6px 0;color:#5F6368;">Waktu</td><td style="padding:6px 0;">%s</td></tr>
        </table>
        <h2 style="margin:24px 0 8px;font-size:16px;">Pesan</h2>
        <div style="background:#F1F3F4;border-radius:12px;padding:16px;font-size:15px;line-height:1.7;">%s</div>
        <p style="margin:24px 0 0;font-size:13px;color:#5F6368;">Balas email ini atau hubungi kontak di atas untuk menindaklanjuti pesanan.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
		e(paket.Name), e(paket.Price),
		e(input.Nama), e(input.Kontak), e(bisnis), e(waktu),
		pesanHTML,
	)

	return subject, text, htmlBody
}
