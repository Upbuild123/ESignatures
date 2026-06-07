const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    document_type TEXT NOT NULL,
    client_name   TEXT NOT NULL,
    client_email  TEXT NOT NULL,
    envelope_id   TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'sent',
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const stmtInsert = sqlite.prepare(`
  INSERT INTO documents (document_type, client_name, client_email, envelope_id)
  VALUES (@documentType, @clientName, @clientEmail, @envelopeId)
`);

const stmtUpdateStatus = sqlite.prepare(`
  UPDATE documents
  SET status = @status, updated_at = datetime('now')
  WHERE envelope_id = @envelopeId
`);

const stmtList = sqlite.prepare(`
  SELECT * FROM documents ORDER BY created_at DESC
`);

function insert({ documentType, clientName, clientEmail, envelopeId }) {
  const info = stmtInsert.run({ documentType, clientName, clientEmail, envelopeId });
  return { id: info.lastInsertRowid, envelope_id: envelopeId, status: 'sent' };
}

function updateStatus(envelopeId, status) {
  stmtUpdateStatus.run({ envelopeId, status });
}

function list() {
  return stmtList.all();
}

function close() {
  sqlite.close();
}

module.exports = { insert, updateStatus, list, close };
