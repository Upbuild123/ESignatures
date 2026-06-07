require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const db = require('./lib/db');
const { generateDoc } = require('./lib/docgen');
const { getToken, uploadDocument, createInvitation } = require('./lib/securedsigning');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const ARIEL_EMAIL = process.env.ARIEL_EMAIL || 'hari@upbuild.com';
const ARIEL_NAME = 'Ariel Weiss';

const TEMPLATE_MAP = {
  uct_payment_plan: path.join(__dirname, 'templates', 'uct_payment_plan.docx'),
  coaching_agreement: path.join(__dirname, 'templates', 'coaching_agreement.docx'),
  services_agreement: path.join(__dirname, 'templates', 'services_agreement.docx'),
};

const DOCUMENT_LABELS = {
  uct_payment_plan: 'UCT Payment Plan',
  coaching_agreement: 'Coaching Agreement',
  services_agreement: 'Leadership Coaching Proposal',
};

function readView(name) {
  return fs.readFileSync(path.join(__dirname, 'views', name), 'utf8');
}

function renderDashboard(flash = '') {
  const records = db.list();
  const rows = records.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:#999">No documents sent yet.</td></tr>'
    : records.map(r => `
      <tr>
        <td>${esc(DOCUMENT_LABELS[r.document_type] || r.document_type)}</td>
        <td>${esc(r.client_name)}</td>
        <td>${esc(r.client_email)}</td>
        <td>${esc(r.created_at)}</td>
        <td><span class="badge ${esc(r.status)}">${esc(r.status)}</span></td>
      </tr>`).join('');
  return readView('dashboard.html')
    .replace('{{FLASH}}', flash)
    .replace('{{ROWS}}', rows);
}

function renderSend(flash = '') {
  return readView('send.html').replace('{{FLASH}}', flash);
}

function flashHtml(type, msg) {
  return `<div class="flash ${type}">${msg}</div>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Dashboard — single handler, supports ?sent=1 flash
app.get('/', (req, res) => {
  const flash = req.query.sent ? flashHtml('success', 'Document sent successfully!') : '';
  res.send(renderDashboard(flash));
});

// Send form
app.get('/send', (req, res) => {
  res.send(renderSend());
});

// Send document
app.post('/send', async (req, res) => {
  const { documentType, clientName, clientEmail, ...fields } = req.body;

  if (!documentType || !clientName || !clientEmail) {
    return res.status(400).send(renderSend(flashHtml('error', 'Document type, client name, and client email are required.')));
  }

  const templatePath = TEMPLATE_MAP[documentType];
  if (!templatePath) {
    return res.status(400).send(renderSend(flashHtml('error', 'Unknown document type.')));
  }

  const clientFirstName = clientName.split(' ')[0];

  let variables;
  if (documentType === 'uct_payment_plan') {
    variables = {
      participantFullName: clientName,
      participantFirstName: clientFirstName,
      startMonth: fields.startMonth,
      endMonth: fields.endMonth,
      upfrontAmount: fields.upfrontAmount,
      monthlyAmount: fields.monthlyAmount,
      totalAmount: fields.totalAmount,
    };
  } else if (documentType === 'coaching_agreement') {
    variables = {
      clientFirstName,
      clientFullName: clientName,
      feePerSession: fields.feePerSession,
      coachName: fields.coachName,
    };
  } else if (documentType === 'services_agreement') {
    variables = {
      clientFirstName,
      clientFullName: clientName,
      companyName: fields.companyName,
      date: fields.date,
      coachName: fields.coachNameSA,
      hourlyRate: fields.hourlyRate,
      dayRate: fields.dayRate,
      kickoffFee: fields.kickoffFee,
      executiveMonthlyRate: fields.executiveMonthlyRate,
      executiveTotal: fields.executiveTotal,
      ceoTotal: fields.ceoTotal,
      cohortSessionRate: fields.cohortSessionRate,
      cohortTotal: fields.cohortTotal,
      grandTotal: fields.grandTotal,
    };
  } else {
    return res.status(400).send(renderSend(flashHtml('error', 'Unknown document type.')));
  }

  let docBuffer;
  try {
    docBuffer = generateDoc(templatePath, variables);
  } catch (err) {
    return res.status(422).send(renderSend(flashHtml('error', `Template error: ${err.message}`)));
  }

  const filename = `${documentType}_${Date.now()}.docx`;
  const signers = [{ name: clientName, email: clientEmail }];
  if (documentType === 'services_agreement') {
    signers.push({ name: ARIEL_NAME, email: ARIEL_EMAIL });
  }

  let envelopeId;
  try {
    const token = await getToken();
    const documentId = await uploadDocument(token, docBuffer, filename);
    envelopeId = await createInvitation(token, documentId, signers);
  } catch (err) {
    console.error('Secured Signing error:', err.message);
    return res.status(502).send(renderSend(flashHtml('error', 'Failed to send document — please try again.')));
  }

  db.insert({ documentType, clientName, clientEmail, envelopeId });
  res.redirect('/?sent=1');
});

// Webhook
app.post('/webhook', (req, res) => {
  const { envelopeId, status } = req.body;
  if (envelopeId && status) {
    const normalised = status.toLowerCase();
    if (['viewed', 'signed'].includes(normalised)) {
      db.updateStatus(envelopeId, normalised);
    }
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
