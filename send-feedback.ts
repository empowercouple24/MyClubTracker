// send-feedback — Supabase Edge Function
// Reads a feedback row by id (server-side via service role), formats a
// notification email with all submission context, sends to Jeffrey.
//
// Body schema:
//   { feedbackId: string }
//
// Why pass the id and not the body? So we don't trust the client to format
// the email. The DB row is the source of truth; this function reads from
// it and shapes the notification.
//
// Required Supabase secrets:
//   - BREVO_API_KEY
//   - SUPABASE_URL (auto-injected)
//   - SUPABASE_SERVICE_ROLE_KEY (auto-injected)
//
// Deploy with "Verify JWT" OFF (matches other functions in this project).

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const FROM_EMAIL = 'noreply@myclubtracker.com';
const FROM_NAME  = 'MyClubTracker';
const NOTIFY_TO  = 'empowercouple24@gmail.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SERVICE_HEADERS = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchFeedback(id: string): Promise<any> {
  // Get the feedback row
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/feedback?id=eq.${id}&select=*`, { headers: SERVICE_HEADERS });
  if (!r1.ok) throw new Error(`feedback fetch failed: ${r1.status}`);
  const fbArr = await r1.json();
  if (!fbArr.length) throw new Error('feedback row not found');
  const fb = fbArr[0];

  // Optionally enrich with org name + location name for the email body
  let orgName: string | null = null;
  let locName: string | null = null;
  if (fb.org_id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/organizations?id=eq.${fb.org_id}&select=name`, { headers: SERVICE_HEADERS });
    if (r.ok) { const a = await r.json(); orgName = a[0]?.name ?? null; }
  }
  if (fb.location_id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/locations?id=eq.${fb.location_id}&select=name`, { headers: SERVICE_HEADERS });
    if (r.ok) { const a = await r.json(); locName = a[0]?.name ?? null; }
  }

  return { ...fb, _orgName: orgName, _locName: locName };
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function categoryLabel(c: string): string {
  if (c === 'bug') return '🐛 Bug';
  if (c === 'feature') return '💡 Feature request';
  if (c === 'question') return '❓ Question';
  return c;
}

function buildHtml(fb: any): string {
  const submittedAt = new Date(fb.created_at).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
  const ctxBits: string[] = [];
  if (fb.user_role)  ctxBits.push(`<strong>Role:</strong> ${escapeHtml(fb.user_role)}`);
  if (fb._orgName)   ctxBits.push(`<strong>Org:</strong> ${escapeHtml(fb._orgName)}`);
  if (fb._locName)   ctxBits.push(`<strong>Club:</strong> ${escapeHtml(fb._locName)}`);
  const ctx = ctxBits.length ? ctxBits.join(' &nbsp;·&nbsp; ') : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:14px;box-shadow:0 4px 20px rgba(30,45,61,0.10);overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#1e2d3d 0%,#2d4a6b 100%);padding:24px 32px;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,0.55);margin:0 0 6px;">New feedback submission</p>
        <h1 style="font-size:20px;font-weight:800;color:#ffffff;margin:0;line-height:1.3;">${categoryLabel(fb.category)}: ${escapeHtml(fb.subject)}</h1>
      </td></tr>
      <tr><td style="padding:24px 32px 8px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;font-size:13px;color:#5b7087;">
            <strong>From:</strong> ${escapeHtml(fb.user_email)}${ctx ? '<br/>' + ctx : ''}
          </td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#5b7087;">
            <strong>Submitted:</strong> ${submittedAt}
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:8px 32px 24px;">
        <div style="background:#f8fafc;border-left:3px solid #2d4a6b;padding:14px 18px;border-radius:4px;">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#8fa3b3;margin:0 0 8px;">Message</p>
          <div style="font-size:14px;color:#1e2d3d;line-height:1.6;white-space:pre-wrap;">${escapeHtml(fb.body)}</div>
        </div>
      </td></tr>
      <tr><td style="background:#f8fafc;border-top:1px solid #e5e9ef;padding:16px 32px;text-align:center;">
        <p style="font-size:12px;color:#8fa3b3;margin:0;">
          Review &amp; respond in the
          <a href="https://myclubtracker.com/admin.html" style="color:#3a5470;text-decoration:none;font-weight:600;">admin dashboard</a>.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

async function sendBrevo({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  const payload: Record<string, unknown> = {
    sender: { email: FROM_EMAIL, name: FROM_NAME },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };
  if (replyTo) payload.replyTo = { email: replyTo };
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.message || body?.code || 'Brevo send failed';
    throw new Error(`Brevo ${res.status}: ${msg}`);
  }
  return body;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ sent: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
  try {
    const raw = await req.text();
    if (!raw) {
      return new Response(JSON.stringify({ sent: false, error: 'Empty body' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    const body = JSON.parse(raw);
    const id = body.feedbackId;
    if (!id) {
      return new Response(JSON.stringify({ sent: false, error: 'Missing feedbackId' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const fb = await fetchFeedback(id);
    const html = buildHtml(fb);
    const subject = `[${categoryLabel(fb.category)}] ${fb.subject}`;
    // Use submitter email as replyTo so Jeffrey can hit reply and respond
    // directly. Doesn't break SPF since the From: address is still the
    // verified noreply@myclubtracker.com sender.
    const result = await sendBrevo({
      to: NOTIFY_TO,
      subject,
      html,
      replyTo: fb.user_email,
    });

    return new Response(JSON.stringify({ sent: true, id: result.messageId }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('send-feedback error:', String(err));
    return new Response(JSON.stringify({ sent: false, error: String(err?.message || err) }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
