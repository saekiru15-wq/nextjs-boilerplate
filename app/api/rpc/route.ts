import { NextRequest, NextResponse } from "next/server";

const FALLBACK_URL = "https://enhpbdwcnoetawiwadld.supabase.co";
const RAW_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_URL = /^https?:\/\//i.test(RAW_URL.trim())
  ? RAW_URL.trim().replace(/\/$/, "")
  : `https://${RAW_URL.trim().replace(/\/$/, "")}`;

// IMPORTANT: only a public/publishable Supabase key is used by this RPC proxy.
// A malformed or stale service_role secret must never break the whole site.
const SUPABASE_KEY = (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "").replace(/[\s\r\n\t]/g, "");

const allowed = new Set(["app_login","app_register","app_logout","app_state","app_calendar","app_create_task","app_submit_task","app_review_task","app_create_question","app_add_comment","app_send_message","app_mark_notifications_read","app_upload_file","app_get_file","app_ai_history","app_ai_save"]);

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_KEY) {
      return NextResponse.json({ error: "Supabase publishable key is not configured." }, { status: 500 });
    }

    const { fn, args = {} } = await request.json();
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

    if (!response.ok) {
      const detail = typeof data === "object" && data !== null ? data as Record<string, unknown> : {};
      return NextResponse.json({ error: detail.message || detail.error || detail.hint || text || `Supabase RPC failed (${response.status})`, code: detail.code, details: detail.details }, { status: response.status });
    }

    const out = NextResponse.json(data);
    if (fn === "app_login" || fn === "app_register") {
      const token = extractToken(data);
      if (token) out.cookies.set("mentor_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return out;
  } catch (e) {
    console.error("[api/rpc] failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "서버 요청 중 오류가 발생했습니다." }, { status: 500 });
  }
}

function extractToken(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return extractToken(value[0]);
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    for (const key of ["token","session_token","p_token"]) if (typeof v[key] === "string") return v[key] as string;
    for (const key of ["data","result","user"]) { const t = extractToken(v[key]); if (t) return t; }
  }
  return null;
}
