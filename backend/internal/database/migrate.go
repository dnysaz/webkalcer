package database

const schema = `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		github_id TEXT UNIQUE,
		google_id TEXT UNIQUE,
		username TEXT NOT NULL,
		email TEXT,
		avatar_url TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS sessions (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		session_id TEXT UNIQUE NOT NULL,
		token TEXT NOT NULL,
		expires_at DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS projects (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		repo_url TEXT NOT NULL,
		subdomain TEXT UNIQUE NOT NULL,
		status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'building', 'deployed', 'failed')),
		env_vars TEXT DEFAULT '{}',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		views INTEGER DEFAULT 0,
		last_visited_at DATETIME,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS deployments (
		id TEXT PRIMARY KEY,
		project_id TEXT NOT NULL,
		status TEXT NOT NULL CHECK(status IN ('pending', 'building', 'success', 'failed')),
		log TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS site_visits (
		project_id TEXT NOT NULL,
		day TEXT NOT NULL,
		count INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (project_id, day),
		FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
	);
`

// Migrate menyiapkan skema. Database lama yang masih memakai id INTEGER
// dibangun ulang dengan id UUID v7 sebelum skema baru diterapkan.
func Migrate(db *Database) error {
	legacy, err := hasLegacyIntegerIDs(db)
	if err != nil {
		return err
	}
	if legacy {
		if err := rebuildWithUUIDs(db); err != nil {
			return err
		}
	}

	if _, err := db.DB().Exec(schema); err != nil {
		return err
	}

	// Kolom tambahan untuk database lama yang belum punya statistik kunjungan.
	for _, stmt := range []string{
		`ALTER TABLE projects ADD COLUMN views INTEGER DEFAULT 0`,
		`ALTER TABLE projects ADD COLUMN last_visited_at DATETIME`,
		// release menyimpan nama folder rilis (.releases/<subdomain>/<release>)
		// agar deployment lama bisa dipromosikan kembali (rollback).
		`ALTER TABLE deployments ADD COLUMN release TEXT DEFAULT ''`,
		// webhook_secret menyimpan secret HMAC webhook GitHub (terenkripsi).
		`ALTER TABLE projects ADD COLUMN webhook_secret TEXT DEFAULT ''`,
		// custom_domain memungkinkan project disajikan di domain milik user.
		`ALTER TABLE projects ADD COLUMN custom_domain TEXT DEFAULT ''`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_custom_domain ON projects(custom_domain) WHERE custom_domain <> ''`,
		// google_id mendukung login Google. Kolom ini ditambahkan untuk database lama.
		`ALTER TABLE users ADD COLUMN google_id TEXT`,
	} {
		_, _ = db.DB().Exec(stmt)
	}

	// Index tambahan untuk query yang sering dipakai.
	_, _ = db.DB().Exec(`CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)`)
	_, _ = db.DB().Exec(`CREATE INDEX IF NOT EXISTS idx_projects_subdomain ON projects(subdomain)`)
	_, _ = db.DB().Exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`)
	_, _ = db.DB().Exec(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`)
	// Pastikan tabel users mendukung google_id dan github_id yang nullable (untuk login Google).
	if err := ensureUsersGoogleSupport(db); err != nil {
		return err
	}
	return nil
}

// ensureUsersGoogleSupport memastikan tabel users memiliki kolom google_id dan
// github_id yang boleh NULL, supaya pengguna Google bisa disimpan. Database lama
// yang masih memakai github_id NOT NULL akan dibangun ulang dengan skema baru.
func ensureUsersGoogleSupport(db *Database) error {
	type pragmaColumn struct {
		CID     int    `db:"cid"`
		Name    string `db:"name"`
		Type    string `db:"type"`
		NotNull int    `db:"notnull"`
		Default any    `db:"dflt_value"`
		PK      int    `db:"pk"`
	}
	var columns []pragmaColumn
	if err := db.DB().Select(&columns, "PRAGMA table_info(users)"); err != nil {
		return err
	}

	hasGoogle := false
	githubNotNull := false
	for _, column := range columns {
		if column.Name == "google_id" {
			hasGoogle = true
		}
		if column.Name == "github_id" && column.NotNull == 1 {
			githubNotNull = true
		}
	}
	if hasGoogle && !githubNotNull {
		return nil
	}

	// Bangun ulang tabel users dengan skema yang mendukung Google.
	if _, err := db.DB().Exec("PRAGMA foreign_keys=OFF"); err != nil {
		return err
	}
	defer func() { _, _ = db.DB().Exec("PRAGMA foreign_keys=ON") }()

	if _, err := db.DB().Exec(`CREATE TABLE users_new (
		id TEXT PRIMARY KEY,
		github_id TEXT UNIQUE,
		google_id TEXT UNIQUE,
		username TEXT NOT NULL,
		email TEXT,
		avatar_url TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return err
	}

	if hasGoogle {
		if _, err := db.DB().Exec(`INSERT INTO users_new (id, github_id, google_id, username, email, avatar_url, created_at)
			SELECT id, github_id, google_id, username, email, avatar_url, created_at FROM users`); err != nil {
			_, _ = db.DB().Exec("DROP TABLE users_new")
			return err
		}
	} else {
		if _, err := db.DB().Exec(`INSERT INTO users_new (id, github_id, google_id, username, email, avatar_url, created_at)
			SELECT id, github_id, NULL, username, email, avatar_url, created_at FROM users`); err != nil {
			_, _ = db.DB().Exec("DROP TABLE users_new")
			return err
		}
	}

	if _, err := db.DB().Exec("DROP TABLE users"); err != nil {
		_, _ = db.DB().Exec("DROP TABLE users_new")
		return err
	}
	if _, err := db.DB().Exec("ALTER TABLE users_new RENAME TO users"); err != nil {
		return err
	}
	return nil
}
