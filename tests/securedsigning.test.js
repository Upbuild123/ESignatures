jest.mock('axios');
const axios = require('axios');
const { getToken, uploadDocument, createInvitation } = require('../lib/securedsigning');

process.env.SECURED_SIGNING_CLIENT_ID = 'test-id';
process.env.SECURED_SIGNING_CLIENT_SECRET = 'test-secret';
process.env.SECURED_SIGNING_TOKEN_URL = 'https://api.securedsigning.com/oauth/token';
process.env.SECURED_SIGNING_API_BASE = 'https://api.securedsigning.com';

describe('getToken', () => {
  test('returns access_token from response', async () => {
    axios.post.mockResolvedValueOnce({ data: { access_token: 'tok-abc' } });
    const token = await getToken();
    expect(token).toBe('tok-abc');
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.securedsigning.com/oauth/token',
      expect.objectContaining({ grant_type: 'client_credentials' }),
      expect.any(Object)
    );
  });
});

describe('uploadDocument', () => {
  test('returns documentId from API response', async () => {
    axios.post.mockResolvedValueOnce({ data: { documentId: 'doc-123' } });
    const id = await uploadDocument('tok-abc', Buffer.from('fake'), 'test.docx');
    expect(id).toBe('doc-123');
  });
});

describe('createInvitation', () => {
  test('returns envelopeId from API response', async () => {
    axios.post.mockResolvedValueOnce({ data: { envelopeId: 'env-xyz' } });
    const signers = [{ name: 'Kavi Gupta', email: 'kavi@example.com' }];
    const id = await createInvitation('tok-abc', 'doc-123', signers);
    expect(id).toBe('env-xyz');
  });
});
