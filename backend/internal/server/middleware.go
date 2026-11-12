package server

import (
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// isHTTPSRequest menentukan apakah request asli memakai HTTPS (di balik proxy).
func isHTTPSRequest(c *gin.Context) bool {
	if c.Request.TLS != nil {
		return true
	}
	if strings.EqualFold(strings.TrimSpace(c.GetHeader("X-Forwarded-Proto")), "https") {
		return true
	}
	if strings.Contains(strings.ToLower(c.GetHeader("CF-Visitor")), `"scheme":"https"`) {
		return true
	}
	return false
}
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		c.Next()

		duration := time.Since(start).Milliseconds()
		status := c.Writer.Status()

		if status >= 400 {
			Metrics.Errors++
		}
		Metrics.Requests++
		Metrics.LastReq = start

		log.Printf("REQ %s %s %d %dms", method, path, status, duration)
	}
}
