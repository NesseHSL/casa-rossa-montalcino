import { transporter, TO, FROM, plain, table } from './_mailer.js';

// "Come and stay" enquiry form (bottom of most pages).
const FIELDS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['guests', 'Guests'],
  ['week', 'Preferred week'],
  ['message', 'Message'],
  ['page', 'Sent from page'],
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = req.body || {};
  // Hidden field that only bots fill in.
  if (body.website) return res.status(200).json({ ok: true });
  if (!body.name || !body.email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  try {
    await transporter.sendMail({
      from: FROM,
      to: TO,
      replyTo: plain(body.email),
      subject: `Enquiry: ${plain(body.name)} | ${plain(body.week) || 'week not chosen'}`,
      html: table('Casa Rossa enquiry', FIELDS, body),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Enquiry email failed', err);
    return res.status(500).json({ error: 'Could not send' });
  }
}
