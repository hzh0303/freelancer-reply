-- AI usage / token / cost tracking for provider-backed generations.
-- Do not store raw generator input or generated output here.

ALTER TABLE usage_logs ADD COLUMN provider TEXT;
ALTER TABLE usage_logs ADD COLUMN provider_request_id TEXT;
ALTER TABLE usage_logs ADD COLUMN requested_model TEXT;
ALTER TABLE usage_logs ADD COLUMN actual_model TEXT;
ALTER TABLE usage_logs ADD COLUMN prompt_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN completion_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN total_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN reasoning_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN cached_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN cache_write_tokens INTEGER;
ALTER TABLE usage_logs ADD COLUMN provider_cost REAL;
ALTER TABLE usage_logs ADD COLUMN provider_cost_unit TEXT;

CREATE INDEX IF NOT EXISTS idx_usage_logs_provider_model_created ON usage_logs(provider, actual_model, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_tokens_created ON usage_logs(total_tokens, created_at);

CREATE TABLE IF NOT EXISTS ai_generation_costs (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  user_id TEXT,
  anon_id TEXT,
  ip_hash TEXT,
  provider TEXT NOT NULL,
  provider_request_id TEXT,
  requested_model TEXT NOT NULL,
  actual_model TEXT,
  status TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  reasoning_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER NOT NULL DEFAULT 0,
  cache_write_tokens INTEGER NOT NULL DEFAULT 0,
  provider_cost REAL,
  provider_cost_unit TEXT,
  upstream_inference_cost REAL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_generation_costs_actor_created ON ai_generation_costs(user_id, anon_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_costs_provider_model_created ON ai_generation_costs(provider, actual_model, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_costs_task ON ai_generation_costs(task_id);
