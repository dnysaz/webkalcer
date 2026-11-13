package server

import (
	"net/http"

	"webkalcer/backend/internal/builder"
	"webkalcer/backend/internal/config"
	"webkalcer/backend/internal/database"
)

type Server struct {
	cfg            *config.Config
	db             *database.Database
	srv            *http.Server
	worker         *builder.Worker
	processManager *ProcessManager
}

func New(cfg *config.Config, db *database.Database, worker *builder.Worker) (*Server, *ProcessManager) {
	// Satu ProcessManager dipakai router (site/project handler) dan signal
	// handler, supaya proses SSR benar-benar dihentikan saat service restart.
	pm := NewProcessManager()
	r := NewRouter(cfg, db, worker, pm)

	return &Server{
		cfg:            cfg,
		db:             db,
		srv:            &http.Server{Addr: cfg.Server.Addr, Handler: r},
		worker:         worker,
		processManager: pm,
	}, pm
}

func (s *Server) ListenAndServe() error {
	return s.srv.ListenAndServe()
}

func (s *Server) GetProcessManager() *ProcessManager {
	return s.processManager
}
