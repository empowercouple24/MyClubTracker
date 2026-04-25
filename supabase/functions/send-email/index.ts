// ════════════════════════════════════════════════════════════════════
// MyClubTracker — send-email Edge Function
// Generic transactional email sender via Brevo.
// ════════════════════════════════════════════════════════════════════
//
// Body schema (JSON):
//   { to: string, toName?: string, subject: string, html: string,
//     replyTo?: string }
//
// Returns 200 { success: true, messageId } on success.
// Returns 4xx/5xx with { error, ... } on failure.
//
// Required secret: BREVO_API_KEY
// Required Brevo setup: sender address must be verified in Brevo
//
// Deploy with "Verify JWT" OFF (matches all other functions in this project).
// ════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDER_NAME  = "MyClubTracker";
const SENDER_EMAIL = "noreply@myclubtracker.com";  // must be on a Brevo-verified domain (myclubtracker.com is)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  // Parse body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { to, toName, subject, html, replyTo } = body || {};

  if (!to || typeof to !== "string") {
    return jsonResponse({ error: "Missing or invalid 'to'" }, 400);
  }
  if (!subject || typeof subject !== "string") {
    return jsonResponse({ error: "Missing or invalid 'subject'" }, 400);
  }
  if (!html || typeof html !== "string") {
    return jsonResponse({ error: "Missing or invalid 'html'" }, 400);
  }

  // Get secret
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoKey) {
    return jsonResponse({ error: "BREVO_API_KEY not configured" }, 500);
  }

  // Build Brevo payload
  const payload: Record<string, unknown> = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent: html,
  };

  if (replyTo && typeof replyTo === "string") {
    payload.replyTo = { email: replyTo };
  }

  // Send via Brevo
  let brevoResp: Response;
  try {
    brevoResp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return jsonResponse({
      error: "Network error reaching Brevo",
      detail: String((e as Error)?.message || e),
    }, 502);
  }

  let brevoData: any = null;
  try {
    brevoData = await brevoResp.json();
  } catch {
    // Brevo may return empty body on some errors
  }

  if (!brevoResp.ok) {
    return jsonResponse({
      error: "Brevo rejected the send",
      status: brevoResp.status,
      brevo: brevoData,
    }, 502);
  }

  return jsonResponse({
    success: true,
    messageId: brevoData?.messageId || null,
  });
});
