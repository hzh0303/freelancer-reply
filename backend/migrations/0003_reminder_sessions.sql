-- Strict per-reminder-session refinement tracking.
-- Boundary: do not store raw generator input or generated output.

CREATE TABLE IF NOT EXISTS reminder_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  anon_id TEXT,
  ip_hash TEXT,
  initial_task_id TEXT NOT NULL,
  recommended_stage TEXT NOT NULL,
  input_hash TEXT,
  refinement_count INTEGER NOT NULL DEFAULT 0,
  refinement_limit INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_sessions_user_created ON reminder_sessions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reminder_sessions_anon_created ON reminder_sessions(anon_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reminder_sessions_initial_task ON reminder_sessions(initial_task_id);
