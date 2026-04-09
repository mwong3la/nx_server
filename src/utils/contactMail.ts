import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const BRAND_NAME = 'NexBridge';
const BRAND_TAGLINE = 'Connecting Markets. Delivering Excellence.';
const BRAND_SUBLINE =
  'Reliable road freight, cargo handling, and supply chain solutions across Kenya and East Africa.';

/** Inline attachment id — must match <img src="cid:..."> */
const LOGO_CID = 'nexbridge-logo@email';

/** Tailwind-aligned: blue-900, orange-600, stone/orange-50 */
const C = {
  blue: '#1e3a8a',
  orange: '#ea580c',
  orangeLight: '#fff7ed',
  stone100: '#f5f5f4',
  stone200: '#e7e5e4',
  stone500: '#78716c',
  stone600: '#57534e',
  stone900: '#1c1917',
  white: '#ffffff',
} as const;

const MAX_NAME = 200;
const MAX_EMAIL = 320;
const MAX_MESSAGE = 10_000;

export function validateContactPayload(body: unknown): {
  ok: true;
  name: string;
  email: string;
  message: string;
} | { ok: false; message: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Invalid request body' };
  }
  const { name, email, message } = body as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    return { ok: false, message: 'Name is required' };
  }
  if (typeof email !== 'string' || !email.trim()) {
    return { ok: false, message: 'Email is required' };
  }
  if (typeof message !== 'string' || !message.trim()) {
    return { ok: false, message: 'Message is required' };
  }
  const nameTrim = name.trim();
  const emailTrim = email.trim();
  const messageTrim = message.trim();
  if (nameTrim.length > MAX_NAME) {
    return { ok: false, message: 'Name is too long' };
  }
  if (emailTrim.length > MAX_EMAIL) {
    return { ok: false, message: 'Email is too long' };
  }
  if (messageTrim.length > MAX_MESSAGE) {
    return { ok: false, message: 'Message is too long' };
  }
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
  if (!emailOk) {
    return { ok: false, message: 'Invalid email address' };
  }
  return { ok: true, name: nameTrim, email: emailTrim, message: messageTrim };
}

function tryReadLocalLogoFile(): string | null {
  const custom = process.env.CONTACT_LOGO_PATH?.trim();
  if (custom) {
    const abs = path.resolve(custom);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return abs;
  }
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, 'assets', 'logo.png'),
    path.resolve(cwd, '..', 'nexbridge_', 'public', 'logo.png'),
    path.resolve(__dirname, '..', '..', 'assets', 'logo.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

type LogoMailParts = {
  attachments: nodemailer.SendMailOptions['attachments'] | undefined;
  imgSrc: string;
};

/**
 * Logo only from disk (CID inline). No HTTP fetch and no hotlinked site URLs.
 * Paths: CONTACT_LOGO_PATH, backend/assets/logo.png, ../nexbridge_/public/logo.png (from backend cwd).
 */
function resolveLogoForEmail(): LogoMailParts {
  const localPath = tryReadLocalLogoFile();
  if (!localPath) {
    return { attachments: undefined, imgSrc: '' };
  }
  return {
    attachments: [
      {
        filename: 'logo.png',
        path: localPath,
        cid: LOGO_CID,
        contentDisposition: 'inline',
      },
    ],
    imgSrc: `cid:${LOGO_CID}`,
  };
}

function buildContactEmailHtml(
  params: { name: string; email: string; message: string },
  logoImgSrc: string
): string {
  const n = escapeHtml(params.name);
  const e = escapeHtml(params.email);
  const m = escapeHtml(params.message);

  const logoBlock = logoImgSrc
    ? `<img src="${escapeHtml(logoImgSrc)}" alt="${escapeHtml(BRAND_NAME)}" width="200" style="display:block;max-width:220px;width:200px;height:auto;margin:0 auto 16px;border:0;outline:none;text-decoration:none;" />`
    : `<div style="height:8px;"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background-color:${C.stone100};">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(180deg,${C.orangeLight} 0%,${C.white} 45%,${C.stone100} 100%);padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:${C.white};border-radius:16px;overflow:hidden;border:1px solid ${C.stone200};box-shadow:0 4px 24px rgba(30,58,138,0.06);">
        <tr>
          <td style="padding:28px 28px 24px;background:linear-gradient(135deg,${C.orangeLight} 0%,${C.white} 55%,#fafaf9 100%);border-bottom:1px solid #fed7aa;text-align:center;">
            ${logoBlock}
            <p style="margin:0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${C.orange};">${escapeHtml(BRAND_NAME)} · Website contact</p>
            <p style="margin:10px 0 0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:17px;font-weight:700;color:${C.blue};line-height:1.3;">${escapeHtml(BRAND_TAGLINE)}</p>
            <p style="margin:8px 0 0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${C.stone600};line-height:1.5;">${escapeHtml(BRAND_SUBLINE)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${C.stone500};">From</p>
            <p style="margin:0 0 18px;font-size:16px;font-weight:600;color:${C.stone900};">${n}</p>
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${C.stone500};">Email</p>
            <p style="margin:0 0 18px;font-size:15px;"><a href="mailto:${e}" style="color:${C.orange};font-weight:600;text-decoration:none;">${e}</a></p>
            <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${C.stone500};">Message</p>
            <div style="border-left:4px solid ${C.orange};padding:14px 16px 14px 18px;background:${C.stone100};border-radius:0 10px 10px 0;">
              <p style="margin:0;font-size:15px;line-height:1.55;color:${C.stone900};white-space:pre-wrap;">${m}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:${C.stone100};border-top:1px solid ${C.stone200};">
            <p style="margin:0;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:${C.stone500};text-align:center;">
              This message was sent from the <strong style="color:${C.blue};">${escapeHtml(BRAND_NAME)}</strong> website contact form.<br />
              <span style="color:${C.stone500};">Reply to this email to respond directly to the sender.</span>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/**
 * Gmail: CONTACT_EMAIL + CONTACT_APP_PASSWORD = account that sends (From).
 * CONTACT_TO_EMAIL = inbox that receives contact form messages (To); must differ from CONTACT_EMAIL.
 */
function getMailConfig():
  | { ok: true; to: string; from: string; transport: nodemailer.Transporter }
  | { ok: false; reason: string } {
  const gmailUser = (process.env.CONTACT_EMAIL || '').trim();
  const gmailPass = (process.env.CONTACT_APP_PASSWORD || '').trim();

  if (gmailUser && gmailPass) {
    const to = (process.env.CONTACT_TO_EMAIL || '').trim();
    if (!to) {
      return {
        ok: false,
        reason:
          'CONTACT_TO_EMAIL is required — the address that receives contact form messages (different from CONTACT_EMAIL)',
      };
    }
    if (to.toLowerCase() === gmailUser.toLowerCase()) {
      return {
        ok: false,
        reason:
          'CONTACT_TO_EMAIL must be different from CONTACT_EMAIL (From = sending Gmail, To = your preferred inbox)',
      };
    }
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
    return { ok: true, to, from: gmailUser, transport };
  }

  // Optional legacy: custom SMTP + CONTACT_TO_EMAIL
  const to = (process.env.CONTACT_TO_EMAIL || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = Number(process.env.SMTP_PORT || '587');
  const secure =
    process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';

  if (host && user && pass && to) {
    const from = (process.env.SMTP_FROM || '').trim() || user;
    const transport = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) && port > 0 ? port : 587,
      secure,
      auth: { user, pass },
    });
    return { ok: true, to, from, transport };
  }

  return {
    ok: false,
    reason:
      'Set CONTACT_EMAIL (sending Gmail), CONTACT_APP_PASSWORD (App Password), and CONTACT_TO_EMAIL (receiving inbox, different from CONTACT_EMAIL); or use SMTP_HOST, SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL',
  };
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; reason: string; isConfig?: boolean }> {
  const cfg = getMailConfig();
  if (!cfg.ok) {
    return { ok: false, reason: cfg.reason, isConfig: true };
  }

  const { to, from, transport } = cfg;
  const subject = `${BRAND_NAME} · New message from ${params.name}`;
  const text = [
    `${BRAND_NAME}`,
    BRAND_TAGLINE,
    BRAND_SUBLINE,
    '',
    '— Website contact form —',
    '',
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    '',
    'Message:',
    params.message,
    '',
    'Reply to this email to reach the sender.',
  ].join('\n');

  const { attachments, imgSrc } = resolveLogoForEmail();
  const html = buildContactEmailHtml(params, imgSrc);

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: params.email,
      subject,
      text,
      html,
      ...(attachments?.length ? { attachments } : {}),
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to send email';
    console.error('[contactMail] send failed:', msg);
    return { ok: false, reason: 'Could not send message. Please try again later.' };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
