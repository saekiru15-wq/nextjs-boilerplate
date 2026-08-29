import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://enhpbdwcnoetawiwadld.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const allowed = new Set([
  "app_login", "app_register", "app_logout", "app_state", "app_calendar",
  "app_create_task", "app_submit_task", "app_review_task", "app_create_question",
  "app_add_comment", "app_send_message", "app_mark_notifications_read",
  "app_upload_file", "app_get_file", "app_ai_history", "app_ai_save",
]);

export async function POST(request: NextRequest) {
  if (!SUPABASE_KEY) {
    return NextResponse.json({ error: "Supabase server environment variables are not configured." }, { status: 500 });
  }

  const { fn, args = {}, remember = false } = await request.json();
  if (!allowed.has(fn)) return NextResponse.json({ error: "Unsupported RPC." }, { status: 400 });

  const cookieToken = request.cookies.get("mentor_token")?.value;
  const body = { ...args };
  if (cookieToken && !body.p_token) body.p_token = cookieToken;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let data: unknown = text;
  try { data = JSON.parse(text); } catch {}

  const out = NextResponse.json(data, { status: response.status });
  if (fn === "app_login" && response.ok) {
    const token = extractToken(data);
    if (token) out.cookies.set("mentor_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  if (fn === "app_logout" && response.ok) out.cookies.set("mentor_token", "", { httpOnly: true, expires: new Date(0), path: "/" });
  return out;
}

function extractToken(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return extractToken(value[0]);
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    for (const key of ["token", "session_token", "p_token"]) if (typeof v[key] === "string") return v[key] as string;
    for (const key of ["data", "result", "user"]) { const t = extractToken(v[key]); if (t) return t; }
  }
  return null;
}
