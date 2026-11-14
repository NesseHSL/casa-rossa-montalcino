import nodemailer from 'nodemailer';

// Shared email settings for the website's forms.
// Files in api/ that start with "_" are helpers, not web addresses.

// Every form email goes to all of these inboxes.
export const TO = ['patricia@casarossa.estate', 'mark@casarossa.estate'];

// The Gmail account that does the sending ("the postman"). Guests never see it:
// replies go straight to the guest. Its app password lives in Vercel as
// GMAIL_APP_PASSWORD (Project Settings → Environment Variables), never in this code.
const SENDER = 'pat.maotai@gmail.com';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: SENDER, pass: process.env.GMAIL_APP_PASSWORD },
});

export const FROM = `"Casa Rossa website" <${SENDER}>`;

// Make guest text safe to put inside an email.
export const esc = (v) => String(v ?? '').trim().slice(0, 4000)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// One-line text for subjects and reply addresses.
export const plain = (v) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);

// Builds the email: a heading and a table of label / answer rows.
export function table(title, fields, body) {
  const rows = fields.map(([key, label]) => {
    const value = esc(body[key]).replace(/\n/g, '<br>') || '<span style="color:#999">Not given</span>';
    return `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;color:#6E7350;white-space:nowrap">${label}</td><td style="padding:8px 0;vertical-align:top">${value}</td></tr>`;
  }).join('');
  return `<div style="font-family:Georgia,serif;color:#26232A;max-width:640px">
  <h2 style="color:#5B2A45;font-weight:normal">${title}</h2>
  <table style="border-collapse:collapse;font-size:15px">${rows}</table>
  <p style="color:#999;font-size:13px;margin-top:24px">Click Reply to answer the guest directly.</p>
</div>`;
}
