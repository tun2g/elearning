import type { SendMailInput } from './mail.service';

/** Soundwell "Midnight Blue" palette (mirrors packages/theme/theme.css). */
const C = {
  primary: '#3b82f6',
  primaryDeep: '#2563eb',
  accent: '#22d3ee',
  ink: '#0f1b2e',
  sub: '#4a5a72',
  bg: '#f7f9fc',
  card: '#ffffff',
  border: '#e6ecf5',
};
// Email-safe stacks (mail clients can't reliably load Fraunces / Plus Jakarta Sans).
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function button(url: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr><td style="border-radius:12px;background:${C.primary};">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-family:${SANS};font-size:16px;font-weight:600;
                  color:#ffffff;text-decoration:none;border-radius:12px;">${label}</a>
      </td></tr>
    </table>`;
}

function layout(opts: { previewText: string; bodyHtml: string }): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="light"/></head>
<body style="margin:0;padding:0;background:${C.bg};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.previewText}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;">
        <tr><td style="padding:0 8px 20px 8px;">
          <span style="font-family:${SERIF};font-size:24px;font-weight:700;color:${C.ink};letter-spacing:-0.01em;">Sound</span><span style="font-family:${SERIF};font-size:24px;font-weight:700;color:${C.primary};letter-spacing:-0.01em;">well</span>
        </td></tr>
        <tr><td style="background:${C.card};border:1px solid ${C.border};border-radius:18px;padding:36px 32px;">
          ${opts.bodyHtml}
        </td></tr>
        <tr><td style="padding:20px 8px 0 8px;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.sub};">
          You received this email because someone used this address on Soundwell.
          If that wasn't you, you can safely ignore it.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px 0;font-family:${SERIF};font-size:22px;font-weight:700;color:${C.ink};">${text}</h1>`;
}
function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.sub};">${text}</p>`;
}
function fallbackLink(url: string): string {
  return `<p style="margin:16px 0 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${C.sub};word-break:break-all;">
    Or paste this link into your browser:<br/><a href="${url}" style="color:${C.primaryDeep};">${url}</a></p>`;
}

function greetName(displayName?: string | null): string {
  return displayName ? `Hi ${displayName},` : 'Hi there,';
}

export function buildVerifyEmail(input: {
  to: string;
  displayName?: string | null;
  url: string;
  expiresHours: number;
}): SendMailInput {
  const subject = 'Verify your email for Soundwell';
  const html = layout({
    previewText: 'Confirm your email to start learning with Soundwell.',
    bodyHtml: [
      heading('Confirm your email'),
      paragraph(greetName(input.displayName)),
      paragraph('Tap the button below to verify your email and finish setting up your Soundwell account.'),
      button(input.url, 'Verify email'),
      paragraph(`This link expires in ${input.expiresHours} hours.`),
      fallbackLink(input.url),
    ].join('\n'),
  });
  const text = [
    greetName(input.displayName),
    '',
    'Verify your email to finish setting up your Soundwell account:',
    input.url,
    '',
    `This link expires in ${input.expiresHours} hours. If you didn't request this, ignore this email.`,
  ].join('\n');
  return { to: input.to, subject, html, text };
}

export function buildMagicLinkEmail(input: {
  to: string;
  displayName?: string | null;
  url: string;
  expiresMinutes: number;
}): SendMailInput {
  const subject = 'Your Soundwell sign-in link';
  const html = layout({
    previewText: 'Your magic link to sign in to Soundwell.',
    bodyHtml: [
      heading('Sign in to Soundwell'),
      paragraph(greetName(input.displayName)),
      paragraph('Tap the button below to sign in. No password needed.'),
      button(input.url, 'Sign in'),
      paragraph(`This link expires in ${input.expiresMinutes} minutes and can only be used once.`),
      fallbackLink(input.url),
    ].join('\n'),
  });
  const text = [
    greetName(input.displayName),
    '',
    'Sign in to Soundwell with this link:',
    input.url,
    '',
    `This link expires in ${input.expiresMinutes} minutes and can only be used once.`,
  ].join('\n');
  return { to: input.to, subject, html, text };
}
