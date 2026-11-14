import { transporter } from './_mailer.js';

// Visit /api/mail-check to see whether the website can sign in to the sending Gmail.
// It sends nothing and never shows the password.
export default async function handler(req, res) {
  const pass = process.env.GMAIL_APP_PASSWORD || '';
  const result = { passwordSet: pass.length > 0, passwordLength: pass.replace(/\s/g, '').length };
  try {
    await transporter.verify();
    result.gmailLogin = 'ok';
  } catch (err) {
    result.gmailLogin = 'failed';
    result.code = err.code || null;
    result.responseCode = err.responseCode || null;
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(result);
}
