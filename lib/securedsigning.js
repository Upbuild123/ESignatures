const axios = require('axios');
const FormData = require('form-data');

const TOKEN_URL = 'https://www.securedsigning.com/api/oauth2/token';
const API_BASE = 'https://api.securedsigning.com/Web/v1.4';

function assertEnvVars() {
  const required = ['SECURED_SIGNING_CLIENT_ID', 'SECURED_SIGNING_CLIENT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  }
}

async function getToken() {
  assertEnvVars();
  const response = await axios.post(TOKEN_URL, {
    grant_type: 'client_credentials',
    client_id: process.env.SECURED_SIGNING_CLIENT_ID,
    client_secret: process.env.SECURED_SIGNING_CLIENT_SECRET,
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.data.access_token) throw new Error('Secured Signing token response missing access_token');
  return response.data.access_token;
}

// Returns a document Reference string
async function uploadDocument(token, docBuffer, filename) {
  const form = new FormData();
  form.append('file', docBuffer, {
    filename,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const response = await axios.post(`${API_BASE}/Document/Uploader`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
  });
  if (!response.data.Reference) throw new Error('Secured Signing upload response missing Reference');
  return response.data.Reference;
}

// Returns a PackageReference string (used as envelopeId)
async function createInvitation(token, documentReference, signers) {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  // Secured Signing requires FirstName, LastName, Email per signer
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
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  if (!response.data.PackageReference) throw new Error('Secured Signing invitation response missing PackageReference');
  return response.data.PackageReference;
}

module.exports = { getToken, uploadDocument, createInvitation, assertEnvVars };
