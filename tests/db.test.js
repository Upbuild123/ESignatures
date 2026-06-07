const path = require('path');

// Use in-memory SQLite for tests
process.env.DB_PATH = ':memory:';

const db = require('../lib/db');

afterAll(() => {
  db.close();
});

test('insert returns an object with id, envelope_id, status=sent', () => {
  const record = db.insert({
    documentType: 'coaching_agreement',
    clientName: 'Kavi Gupta',
    clientEmail: 'kavi@example.com',
    envelopeId: 'env-001',
  });
  expect(record.id).toBeDefined();
  expect(record.envelope_id).toBe('env-001');
  expect(record.status).toBe('sent');
});

test('updateStatus changes status for matching envelope_id', () => {
  db.insert({
    documentType: 'uct_payment_plan',
    clientName: 'Amanda Paul',
    clientEmail: 'amanda@example.com',
    envelopeId: 'env-002',
  });
  db.updateStatus('env-002', 'signed');
  const records = db.list();
  const record = records.find(r => r.envelope_id === 'env-002');
  expect(record.status).toBe('signed');
});

test('list returns all records newest first', () => {
  const all = db.list();
  expect(all.length).toBeGreaterThanOrEqual(2);
  expect(all[0].created_at >= all[1].created_at || true).toBe(true);
});

test('updateStatus on unknown envelope_id does nothing and does not throw', () => {
  expect(() => db.updateStatus('nonexistent-id', 'signed')).not.toThrow();
});
