import nodemailer from 'nodemailer';

// Where registrations are sent. Swap to Pat's address when ready.
const TO = 'innamotravel@gmail.com';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'innamotravel@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FIELDS = [
  ['firstName', 'First name'],
  ['surname', 'Surname'],
  ['email', 'Email'],
  ['mobile', 'Mobile'],
  ['address', 'Home address'],
  ['country', 'Country'],
  ['week', 'Week booked'],
  ['adults', 'Adults'],
  ['children', 'Children and ages'],
  ['arrival', 'Expected arrival time'],
  ['travel', 'Flights or travel details'],
  ['occasion', 'Celebrating'],
  ['accessibility', 'Accessibility requirements'],
  ['dietary', 'Dietary requirements or allergies'],
  ['emergencyName', 'Emergency contact name'],
  ['emergencyPhone', 'Emergency contact phone'],
  ['services', 'Services requested'],
  ['other', 'Other requests, questions or concerns'],
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const esc = (v) => String(v ?? '').trim().slice(0, 4000)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const plain = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
  const body = req.body || {};
  if (Array.isArray(body.services)) body.services = body.services.join('\n');

  if (!body.firstName || !body.surname || !body.email || !body.mobile) {
    return res.status(400).json({ error: 'Name, email and mobile are required' });
  }

  const rows = FIELDS.map(([key, label]) => {
    const value = esc(body[key]).replace(/\n/g, '<br>') || '<span style="color:#999">Not given</span>';
    return `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;color:#6E7350;white-space:nowrap">${label}</td><td style="padding:8px 0;vertical-align:top">${value}</td></tr>`;
  }).join('');

  const html = `<div style="font-family:Georgia,serif;color:#26232A;max-width:640px">
  <h2 style="color:#5B2A45;font-weight:normal">Casa Rossa guest registration</h2>
  <table style="border-collapse:collapse;font-size:15px">${rows}</table>
</div>`;

  try {
    await transporter.sendMail({
      from: '"Casa Rossa" <innamotravel@gmail.com>',
      to: TO,
      replyTo: plain(body.email),
      subject: `Guest registration: ${plain(body.firstName)} ${plain(body.surname)} | ${plain(body.week) || 'week not given'}`,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Registration email failed', err);
    return res.status(500).json({ error: 'Could not send' });
  }
}
