import { transporter, TO, FROM, plain, table } from './_mailer.js';

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

  const body = req.body || {};
  if (Array.isArray(body.services)) body.services = body.services.join('\n');

  if (!body.firstName || !body.surname || !body.email || !body.mobile) {
    return res.status(400).json({ error: 'Name, email and mobile are required' });
  }

  const html = table('Casa Rossa guest registration', FIELDS, body);

  try {
    await transporter.sendMail({
      from: FROM,
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
