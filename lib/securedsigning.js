const axios = require('axios');
const FormData = require('form-data');

function assertEnvVars() {
  const required = ['SECURED_SIGNING_CLIENT_ID', 'SECURED_SIGNING_CLIENT_SECRET', 'SECURED_SIGNING_TOKEN_URL', 'SECURED_SIGNING_API_BASE'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
  }
}

async function getToken() {
  assertEnvVars();
  const TOKEN_URL = process.env.SECURED_SIGNING_TOKEN_URL;
  const CLIENT_ID = process.env.SECURED_SIGNING_CLIENT_ID;
  const CLIENT_SECRET = process.env.SECURED_SIGNING_CLIENT_SECRET;
  const response = await axios.post(TOKEN_URL, {
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!response.data.access_token) throw new Error('Secured Signing token response missing access_token');
  return response.data.access_token;
}

async function uploadDocument(token, docBuffer, filename) {
  const API_BASE = process.env.SECURED_SIGNING_API_BASE;
  const form = new FormData();
  form.append('file', docBuffer, {
    filename,
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const response = await axios.post(`${API_BASE}/v1/documents`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
  });
  if (!response.data.documentId) throw new Error('Secured Signing upload response missing documentId');
  return response.data.documentId;
}

async function createInvitation(token, documentId, signers) {
  const API_BASE = process.env.SECURED_SIGNING_API_BASE;
  const response = await axios.post(
    `${API_BASE}/v1/envelopes`,
    { documentId, signers },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.data.envelopeId) throw new Error('Secured Signing invitation response missing envelopeId');
  return response.data.envelopeId;
}

module.exports = { getToken, uploadDocument, createInvitation, assertEnvVars };
