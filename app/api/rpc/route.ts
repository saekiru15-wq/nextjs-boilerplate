import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://enhpbdwcnoetawiwadld.supabase.co";
const SUPABASE_KEY = "sb_publishable_5gHrPhRHnXLbHVZG0JPgEA_16_3HYIj";

const allowed = new Set(["app_login","app_register","app_logout","app_state","app_calendar","app_create_task","app_update_task","app_delete_task","app_submit_task","app_update_submission","app_delete_submission","app_review_task","app_create_question","app_update_question","app_delete_question","app_add_comment","app_update_comment","app_delete_comment","app_list_comments","app_send_message","app_update_message","app_delete_message","app_mark_notifications_read","app_upload_file","app_get_file","app_ai_history","app_ai_save","app_update_account","app_delete_account"]);

export async function POST(request: NextRequest) {
  try {
    const { fn, args = {} } = await request.json();
    if (!allowed.has(fn)) return NextResponse.json({ error: "Unsupported RPC." }, { status: 400 });
    const body: Record<string, unknown> = { ...args };
    const cookieToken = request.cookies.get("mentor_token")?.value ?? null;
    if (!("p_token" in body) && (fn === "app_state" || fn === "app_calendar")) body.p_token = cookieToken;
    else if (cookieToken && !("p_token" in body)) body.p_token = cookieToken;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
    const text = await response.text();
    let data: unknown = text; try { data = JSON.parse(text); } catch {}
    if (!response.ok) { const detail = typeof data === "object" && data !== null ? data as Record<string, unknown> : {}; return NextResponse.json({ error: detail.message || detail.error || detail.hint || text || `Supabase RPC failed (${response.status})`, code: detail.code, details: detail.details }, { status: response.status }); }
    if (fn === "app_state" && cookieToken) data = await enrichComments(data, cookieToken);
    const out = NextResponse.json(data);
    if (fn === "app_login" || fn === "app_register") { const token = extractToken(data); if (token) out.cookies.set("mentor_token", token, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 30 }); }
    return out;
  } catch (e) { console.error("[api/rpc] failed", e); return NextResponse.json({ error: e instanceof Error ? e.message : "서버 요청 중 오류가 발생했습니다." }, { status: 500 }); }
}

async function enrichComments(value: unknown, token: string): Promise<unknown> {
  if (!value || typeof value !== "object") return value;
  const root = value as Record<string, unknown>;
  const enrichList = async (items: unknown[], type: "task" | "question") => Promise.all(items.map(async (item) => {
    if (!item || typeof item !== "object") return item;
    const obj = item as Record<string, unknown>;
    const id = Number(obj.id);
    if (!Number.isFinite(id)) return obj;
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/app_list_comments`, { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ p_token: token, p_type: type, p_target: id }), cache: "no-store" });
      if (!r.ok) return { ...obj, comments: [] };
      const comments = await r.json();
      return { ...obj, comments: Array.isArray(comments) ? comments : [] };
    } catch { return { ...obj, comments: [] }; }
  }));
  if (Array.isArray(root.tasks)) root.tasks = await enrichList(root.tasks, "task");
  if (Array.isArray(root.task_list)) root.task_list = await enrichList(root.task_list, "task");
  if (Array.isArray(root.app_tasks)) root.app_tasks = await enrichList(root.app_tasks, "task");
  if (Array.isArray(root.questions)) root.questions = await enrichList(root.questions, "question");
  if (Array.isArray(root.question_list)) root.question_list = await enrichList(root.question_list, "question");
  return root;
}

function extractToken(value: unknown): string | null { if (!value) return null; if (Array.isArray(value)) return extractToken(value[0]); if (typeof value === "object") { const v = value as Record<string, unknown>; for (const key of ["token","session_token","p_token"]) if (typeof v[key] === "string") return v[key] as string; for (const key of ["data","result","user"]) { const t = extractToken(v[key]); if (t) return t; } } return null; }
