jest.mock('axios');
const axios = require('axios');
const { getToken, uploadDocument, createInvitation, assertEnvVars } = require('../lib/securedsigning');

process.env.SECURED_SIGNING_CLIENT_ID = 'test-id';
process.env.SECURED_SIGNING_CLIENT_SECRET = 'test-secret';
process.env.SECURED_SIGNING_TOKEN_URL = 'https://api.securedsigning.com/oauth/token';
process.env.SECURED_SIGNING_API_BASE = 'https://api.securedsigning.com';

describe('getToken', () => {
  test('returns CLIENT_ID directly as token', async () => {
    const token = await getToken();
    expect(token).toBe('test-id');
  });
});

describe('uploadDocument', () => {
  test('returns Reference from API response', async () => {
    axios.post.mockResolvedValueOnce({ data: { Reference: 'doc-123' } });
    const id = await uploadDocument('tok-abc', Buffer.from('fake'), 'test.docx');
    expect(id).toBe('doc-123');
  });
});

describe('createInvitation', () => {
  test('returns PackageReference from API response', async () => {
    axios.post.mockResolvedValueOnce({ data: { PackageReference: 'env-xyz' } });
    const signers = [{ name: 'Kavi Gupta', email: 'kavi@example.com' }];
    const id = await createInvitation('tok-abc', 'doc-123', signers);
    expect(id).toBe('env-xyz');
  });
});

describe('assertEnvVars', () => {
  test('getToken throws when CLIENT_ID is missing', async () => {
    const saved = process.env.SECURED_SIGNING_CLIENT_ID;
    delete process.env.SECURED_SIGNING_CLIENT_ID;
    await expect(getToken()).rejects.toThrow('Missing required env var: SECURED_SIGNING_CLIENT_ID');
    process.env.SECURED_SIGNING_CLIENT_ID = saved;
  });
});
