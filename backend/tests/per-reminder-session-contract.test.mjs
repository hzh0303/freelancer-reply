import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const source = readFileSync(join(root, 'src/index.ts'), 'utf8');
const apiContract = JSON.parse(readFileSync(join(root, 'docs/api-contract.json'), 'utf8'));
const migrationPath = join(root, 'migrations/0003_reminder_sessions.sql');

test('per-reminder-session refinement contract is implemented end-to-end', () => {
  assert.equal(existsSync(migrationPath), true, 'missing 0003_reminder_sessions.sql migration');
  const migration = readFileSync(migrationPath, 'utf8');

  assert.match(migration, /CREATE TABLE IF NOT EXISTS reminder_sessions/i);
  assert.match(migration, /refinement_count\s+INTEGER/i);
  assert.match(migration, /refinement_limit\s+INTEGER/i);
  assert.match(migration, /initial_task_id/i);

  assert.match(source, /reminderSessionId\??:/, 'GenerateInput should accept reminderSessionId');
  assert.match(source, /createReminderSession\(/, 'initial generation should create a reminder session');
  assert.match(source, /consumeReminderSessionRefinement\(/, 'refinement should consume per-session quota');
  assert.match(source, /REMINDER_SESSION_REQUIRED/, 'refinement without reminderSessionId should be rejected');
  assert.match(source, /REMINDER_SESSION_REFINEMENT_LIMIT_REACHED/, 'second refinement on same session should be rejected');

  const schema = apiContract.paths['/api/generate-payment-reminder'].post.requestBody.content['application/json'].schema;
  assert.ok(schema.properties.reminderSessionId, 'API contract should document reminderSessionId');
  assert.match(apiContract.paths['/api/generate-payment-reminder'].post.responses['200'].description, /reminderSessionId/);
});
