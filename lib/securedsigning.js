const axios = require('axios');
const FormData = require('form-data');

async function getToken() {
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
  return response.data.documentId;
}

async function createInvitation(token, documentId, signers) {
  const API_BASE = process.env.SECURED_SIGNING_API_BASE;
  const response = await axios.post(
    `${API_BASE}/v1/envelopes`,
    { documentId, signers },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.envelopeId;
}

module.exports = { getToken, uploadDocument, createInvitation };
