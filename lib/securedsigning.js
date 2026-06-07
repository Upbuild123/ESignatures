const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const API_BASE = 'https://api.securedsigning.com/Web/v1.4';

function assertEnvVars() {
  const required = ['SECURED_SIGNING_CLIENT_ID', 'SECURED_SIGNING_CLIENT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  }
}

// Secured Signing HMAC-SHA256 stateless auth (used when OAuth2 is disabled)
const APP_URL = 'https://noble-imagination-production-22e4.up.railway.app';

function buildAuthHeaders() {
  assertEnvVars();
  const apiKey = process.env.SECURED_SIGNING_CLIENT_ID;
  const secret = process.env.SECURED_SIGNING_CLIENT_SECRET;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex'); // 32 chars

  const message = `${apiKey}\n${timestamp}\n${nonce}`;
  const signature = crypto.createHmac('sha256', secret).update(message).digest('base64');

  return {
    'X-CUSTOM-API-KEY': apiKey,
    'X-CUSTOM-SIGNATURE': signature,
    'X-CUSTOM-DATE': timestamp,
    'X-CUSTOM-NONCE': nonce,
    'Referer': APP_URL,
  };
}

// getToken kept for interface compatibility — returns null (auth is per-request now)
async function getToken() {
  assertEnvVars();
  return null;
}

// Returns a document Reference string
async function uploadDocument(_token, docBuffer, filename) {
  const form = new FormData();
  form.append('file', docBuffer, {
    filename,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const response = await axios.post(`${API_BASE}/Document/Uploader`, form, {
    headers: {
      ...buildAuthHeaders(),
      ...form.getHeaders(),
    },
  });
  if (!response.data.Reference) throw new Error('Secured Signing upload response missing Reference');
  return response.data.Reference;
}

// Returns a PackageReference string (used as envelopeId)
async function createInvitation(_token, documentReference, signers) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const formattedSigners = signers.map(s => {
    const parts = s.name.trim().split(' ');
    return {
      FirstName: parts[0],
      LastName: parts.slice(1).join(' ') || parts[0],
      Email: s.email,
    };
  });

  const response = await axios.post(
    `${API_BASE}/SmartTag/Send2`,
    {
      DocumentReferences: [documentReference],
      Signers: formattedSigners,
      DueDate: dueDate.toISOString(),
      ReturnUrl: `${APP_URL}/`,
      NotifyUrl: `${APP_URL}/webhook`,
    },
    { headers: { ...buildAuthHeaders(), 'Content-Type': 'application/json' } }
  );
  if (!response.data.PackageReference) throw new Error('Secured Signing invitation response missing PackageReference');
  return response.data.PackageReference;
}

module.exports = { getToken, uploadDocument, createInvitation, assertEnvVars };
