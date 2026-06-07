const {
  Document, Paragraph, TextRun, HeadingLevel, AlignmentType,
  BorderStyle, Table, TableRow, TableCell, WidthType,
  Packer, UnderlineType,
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'templates');
fs.mkdirSync(OUT, { recursive: true });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function p(runs, opts = {}) {
  const children = typeof runs === 'string'
    ? [new TextRun(runs)]
    : (Array.isArray(runs) ? runs : [runs]);
  return new Paragraph({ children, ...opts });
}

function bold(text) { return new TextRun({ text, bold: true }); }
function run(text, opts = {}) { return new TextRun({ text, ...opts }); }
function ph(name) { return new TextRun({ text: `{{${name}}}`, bold: true }); }
function blank() { return new Paragraph({ children: [new TextRun('')] }); }

// ─── 1. UCT Payment Plan Agreement ───────────────────────────────────────────

async function buildUCTPaymentPlan() {
  const doc = new Document({
    sections: [{
      children: [
        p([bold('Course Payment Agreement')]),
        p([run('Between Upbuild and '), ph('participantFullName'), run(' (referred to as the "Participant")')]),
        blank(),
        p([bold('1. Course enrollment')]),
        p([
          run('The Participant has elected to participate in the Upbuild Coaching Training starting in '),
          ph('startMonth'),
          run(', 2026. As a courtesy, Upbuild is offering the Participant an extended payment plan.'),
        ]),
        blank(),
        p([bold('2. Payment plan')]),
        p([
          run('This agreement confirms that the Participant will pay '),
          ph('upfrontAmount'),
          run(' upfront (upon signing this agreement), and then monthly payments of '),
          ph('monthlyAmount'),
          run(' through '),
          ph('endMonth'),
          run(' until the full balance is paid. The cumulative sum of these payments ('),
          ph('totalAmount'),
          run(') corresponds to the total cost of the training at the discounted fee.'),
        ]),
        blank(),
        p([bold('3. Payment logistics')]),
        p([run('The Participant will receive an invoice via email from QuickBooks for the full cost of the training. The Participant is responsible for making partial payments on the agreed-upon dates. To make a payment, click "Review and pay" in the original email and adjust the payment amount at the top of the screen.')]),
        blank(),
        p([bold('Upbuild will not send additional reminders, so please use the original email each time you make a payment.'), run(' A 3% fee will be applied to payments made by credit card.')]),
        blank(),
        p([bold('4. Course completion and payment')]),
        p([run('If the Participant is unable or chooses not to complete the training, the Participant will still be obligated to settle the remaining balance for the full cost of the course. This agreement stipulates that the Participant\'s payment obligation is tied to course enrollment, not the completion.')]),
        blank(),
        p([bold('5. Our intention')]),
        p([run('This payment plan is meant to serve the Participant and to ease the Participant\'s payment process. When the cohort is built, there is staffing involved, an upfront investment on Upbuild\'s part to get everything prepared for the Participant\'s experience, and a sharing of all coaching resources to be used throughout the course, and therefore, the Participant is responsible for the full cost of the course whether they complete it or not.')]),
        blank(),
        p([run('By my signature below, I accept all terms and conditions described herein.')]),
        blank(),
        blank(),
        p([run('Participant Name: '), ph('participantFullName')]),
        blank(),
        p([run('Signature: _______________________________')]),
        blank(),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, 'uct_payment_plan.docx'), buf);
  console.log('✓ uct_payment_plan.docx');
}

// ─── 2. Coaching Agreement ────────────────────────────────────────────────────

async function buildCoachingAgreement() {
  const doc = new Document({
    sections: [{
      children: [
        p([bold('Upbuild Coaching Agreement')], { alignment: AlignmentType.CENTER }),
        blank(),
        p([run('Dear '), ph('clientFirstName'), run(',')]),
        blank(),
        p([run('Welcome to the Upbuild community! We are excited to be on this journey with you.')]),
        blank(),
        p([run('Before we get started, here are some guidelines we\'d like you to be familiar with.')]),
        blank(),
        p([bold('Description of Coaching:'), run('  Our aim is to provide a thought-provoking and creative process that aspires to maximize potential. It is meant to facilitate the creation of any personal or professional goals as well as the challenges and accountability to accomplish them so that you can gain increasing insights and habits that allow you to be your best self.')]),
        blank(),
        p([run('At Upbuild, we believe the primary function of the Coach is to serve as a human mirror to help you:')]),
        p([run('• Examine what you are experiencing and see your life and career with greater lucidity, lending your own insights to the process.')]),
        p([run('• Surface the underlying motivations and insecurities that are affecting your choices so that you can understand why you\'re doing what you\'re doing and can make intentional decisions.')]),
        p([run('• Concretize your goals and challenges and break them down for practical, step-by-step action.')]),
        p([run('• Be accountable to yourself.')]),
        blank(),
        p([run('If you have any questions, let us know. If not, please sign and return the attached agreement and your Coach will know you\'re ready to begin.')]),
        blank(),
        p([run('And once again, thank you for becoming a part of the Upbuild community!')]),
        blank(),
        p([run('Sincerely on behalf of Upbuild,')]),
        blank(),
        blank(),
        p([ph('coachName')]),
        blank(),
        blank(),
        p([bold('Upbuild Client Agreement')], { alignment: AlignmentType.CENTER }),
        blank(),
        p([run('This Agreement is between '), ph('clientFullName'), run(' (Client) and Upbuild (Company) and is effective as of the date the Client signs it. This Agreement establishes a relationship between the Company and the Coach.')]),
        blank(),
        p([bold('1. Coach-Client Relationship')]),
        p([run('The Coach will maintain the ethics and standards of behavior established by the International Coaching Federation (coachfederation.org/ethics).')]),
        p([run('The Client acknowledges that coaching is a comprehensive process that may involve different areas of the Client\'s life including work, finances, health, relationships, education, recreation, and spirituality.')]),
        p([run('The Client acknowledges that coaching is not therapy and does not substitute for therapy, counseling, or other professional guidance.')]),
        p([run('The Client agrees to communicate honestly, be open to feedback and assistance, and create the time and energy to participate fully in the program.')]),
        blank(),
        p([bold('2. Services')]),
        p([run('The Client agrees to engage in an ongoing Coaching Program through video or phone sessions. The Coach may be available to the Client by email in between scheduled sessions at the discretion of the Coach. The time of coaching meetings will be determined by the Coach and the Client based on mutually agreed upon times.')]),
        blank(),
        p([bold('3. Schedule, Fees, and Cancellation Policy')]),
        p([run('The fee for coaching is '), ph('feePerSession'), run('. The Company will provide an invoice to the Client one time per quarter, and payment is due within 15 days of the invoice date. There is a 3% additional fee for payment by credit card.')]),
        p([run('• A session canceled more than two business days before the session will not be charged.')]),
        p([run('• A session canceled by the Client within two business days of the session will be charged.')]),
        blank(),
        p([bold('4. Termination')]),
        p([run('The Client or Company may terminate this Agreement at any time upon 48 hours\' notice, provided in writing via email or text. Once the Client is ready to complete coaching, the Company requests that the Client consider ending the final session as a "completion session" for closure. All fees will become due and payable upon termination.')]),
        blank(),
        p([bold('5. Confidentiality, Non-Disclosure')]),
        p([run('Unless the parties expressly agree otherwise in writing, all materials or information obtained in connection with the Services are considered the Company\'s confidential information and remain the property of the Company. The Company agrees not to disclose Client information to any outside parties without the Client\'s consent.')]),
        blank(),
        p([bold('6. Applicable Law and Attorneys\' Fees')]),
        p([run('This Agreement shall be governed in accordance with the laws of New York.')]),
        blank(),
        p([run('By my signature below, I accept all terms and conditions described herein.')]),
        blank(),
        blank(),
        p([run('Printed Name: '), ph('clientFullName')]),
        blank(),
        p([run('Signature: _______________________________')]),
        blank(),
        p([run('Date: _______________________________')]),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, 'coaching_agreement.docx'), buf);
  console.log('✓ coaching_agreement.docx');
}

// ─── 3. Leadership Coaching Proposal (Services Agreement) ─────────────────────

async function buildServicesAgreement() {
  const doc = new Document({
    sections: [{
      children: [
        p([bold('Leadership Coaching Proposal')], { alignment: AlignmentType.CENTER }),
        blank(),
        p([ph('date')]),
        blank(),
        p([run('Dear '), ph('clientFirstName'), run(',')]),
        blank(),
        p([run('Thanks again for taking the time to meet with me. I really enjoyed our conversation and appreciate the clarity you shared around what you\'re hoping to build with your leadership team. I\'m excited about the possibility of partnering together and wanted to outline a proposed coaching program aligned with your goals, timeline, and budget.')]),
        blank(),
        p([bold('Overview and Intent')]),
        p([run('The intention of this engagement is to support your leadership team in becoming a high-trust, high-functioning group that is collectively aligned and individually self-aware. Our approach at Upbuild blends deep reflective work with practical, action-oriented coaching.')]),
        blank(),
        p([bold('Proposed Structure')]),
        blank(),
        p([bold('1. Leadership Team Kickoff')]),
        p([run('We will use a half-day to formally kick off the coaching engagement and set a strong foundation for how the team works together. This session will focus on articulating shared leadership values, establishing conscious agreements, building psychological safety, and naming strengths and growth edges within the leadership team.')]),
        blank(),
        p([bold('2. Ongoing Leadership Team Coaching')]),
        p([run('These meetings will be half- or full-day workshops that happen each time the leadership team gathers in person. They will focus on strengthening the team\'s effectiveness and cohesion.')]),
        blank(),
        p([bold('3. 1:1 Coaching for Executive Leadership Team')]),
        p([run('All members of the executive leadership team will be encouraged to engage in individual coaching focused on their personal leadership challenges, growth goals, and role-specific context. Sessions are 60 minutes in duration.')]),
        blank(),
        p([bold('4. 1:1 Coaching for CEO')]),
        p([run('I recommend that we meet twice per month to ensure there\'s sufficient space to process, integrate, and lead through the changes underway.')]),
        blank(),
        p([bold('5. Cohort-Based Group Coaching for High-Potential Leaders')]),
        p([run('A cohort-based group coaching model for 12–15 high-potential leaders. A series of 90-minute group coaching sessions meeting once a month for eight months.')]),
        blank(),
        p([bold('Fees')]),
        blank(),
        p([run('My current fees are '), ph('hourlyRate'), run(' per hour for 1:1 executive coaching and '), ph('dayRate'), run(' day rate for in-person work.')]),
        blank(),
        p([bold('Leadership Team Coaching')]),
        p([run('• Kickoff session (3–4 hours, virtual): '), ph('kickoffFee')]),
        p([run('• Two to three additional in-person leadership team sessions during the year')]),
        blank(),
        p([bold('1:1 Coaching – Executive Leadership Team')]),
        p([run('• '), ph('executiveMonthlyRate'), run(' per executive per month')]),
        p([run('• Estimated total: '), ph('executiveTotal')]),
        blank(),
        p([bold('1:1 Coaching – CEO')]),
        p([run('• Estimated total: '), ph('ceoTotal')]),
        blank(),
        p([bold('Cohort-Based Group Coaching – High-Potential Leaders')]),
        p([run('• '), ph('cohortSessionRate'), run(' per session')]),
        p([run('• Estimated total: '), ph('cohortTotal')]),
        blank(),
        p([bold('Total Estimated Investment')]),
        p([run('Approximately '), ph('grandTotal'), run(' for the year, plus travel expenses for in-person work.')]),
        blank(),
        p([run('Fees would be invoiced quarterly, with actuals based on finalized scope and participation.')]),
        blank(),
        p([bold('Closing')]),
        p([run('I\'m genuinely excited about the work you\'re envisioning. I\'d love to discuss any refinements, answer questions, or adjust the design so that it best serves your team. Thank you for the opportunity.')]),
        blank(),
        p([run('Sincerely,')]),
        blank(),
        blank(),
        p([ph('coachName')]),
        blank(),
        blank(),
        p([bold('By signing below, both parties agree to the terms and scope outlined in this proposal.')]),
        blank(),
        p([run('Client Name: '), ph('clientFullName'), run('  |  Company: '), ph('companyName')]),
        blank(),
        p([run('Client Signature: _______________________________    Date: _______________')]),
        blank(),
        p([run('Upbuild Representative: Ariel Weiss')]),
        blank(),
        p([run('Signature: _______________________________    Date: _______________')]),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(OUT, 'services_agreement.docx'), buf);
  console.log('✓ services_agreement.docx');
}

// ─── Run ─────────────────────────────────────────────────────────────────────

(async () => {
  await buildUCTPaymentPlan();
  await buildCoachingAgreement();
  await buildServicesAgreement();
  console.log('\nAll templates written to templates/');
})();
