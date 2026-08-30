"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Obj = Record<string, any>;
const MENU = ["🏠 홈", "📝 숙제", "❓ 질문게시판", "📅 캘린더", "💬 개인채팅", "🤖 AI 학습도우미", "🔔 알림"];
const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];

async function rpc(fn: string, args: Obj = {}) {
  const r = await fetch("/api/rpc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fn, args }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d?.message || d?.error || "요청에 실패했습니다.");
  return d;
}
const arr = (v: any, keys: string[]) => { for (const k of keys) if (Array.isArray(v?.[k])) return v[k]; return []; };
const statusClass = (s: string) => s === "완료" ? "green" : s === "보충 필요" || s === "보충필요" ? "yellow" : s === "미완료" ? "red" : "gray";

export default function Home() {
  const [active, setActive] = useState(MENU[0]);
  const [state, setState] = useState<Obj | null>(null);
  const [auth, setAuth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [register, setRegister] = useState(false);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [query, setQuery] = useState("");
  const [qTitle, setQTitle] = useState("");
  const [qBody, setQBody] = useState("");
  const [chatUser, setChatUser] = useState("");
  const [chatText, setChatText] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [calendar, setCalendar] = useState<any[]>([]);

  async function refresh() {
    try {
      const s = await rpc("app_state", {});
      setState(s);
      setAuth(true);
      setError("");
      return true;
    } catch (e: any) {
      setAuth(false);
      const msg = String(e?.message || "");
      if (msg && !/(unauthorized|로그인|token)/i.test(msg)) setError(msg);
      return false;
    }
  }

  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!auth) return;
    const from = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().slice(0, 10);
    rpc("app_calendar", { p_from: from, p_to: to }).then(d => setCalendar(Array.isArray(d) ? d : arr(d, ["events", "calendar", "data"]))).catch(() => setCalendar([]));
  }, [auth, month]);

  async function action(fn: string, args: Obj = {}) {
    try { setBusy(true); setError(""); await rpc(fn, args); await refresh(); }
    catch (e: any) { setError(e?.message || "작업에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function submitAuth(e: FormEvent) {
    e.preventDefault();
    if (!id.trim() || !pw) return;
    try {
      setBusy(true); setError("");
      if (register) await rpc("app_register", { p_id: id.trim(), p_name: name.trim(), p_pw: pw, p_subject: subject });
      await rpc("app_login", { p_id: id.trim(), p_pw: pw });
      const ok = await refresh();
      if (!ok) throw new Error("로그인 세션을 확인하지 못했습니다.");
    } catch (e: any) { setError(e?.message || "로그인에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function askAI(e: FormEvent) {
    e.preventDefault();
    const text = aiText.trim();
    if (!text) return;
    setAiText("");
    const history = [...aiMessages, { role: "user", content: text }];
    setAiMessages(history); setAiBusy(true);
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "AI 요청에 실패했습니다.");
      setAiMessages(v => [...v, { role: "assistant", content: d.text }]);
    } catch (e: any) { setAiMessages(v => [...v, { role: "assistant", content: `AI 연결 오류: ${e?.message || "알 수 없는 오류"}` }]); }
    finally { setAiBusy(false); }
  }

  const users = arr(state, ["users", "members"]);
  const tasks = arr(state, ["tasks", "task_list", "app_tasks"]);
  const questions = arr(state, ["questions", "question_list"]);
  const notifications = arr(state, ["notifications", "notification_list"]);
  const meId = state?.me || "";
  const meUser = users.find((u: any) => u.id === meId);
  const mySubject = meUser?.subject || "-";
  const filteredTasks = tasks.filter((t: any) => `${t.title || ""} ${t.subject || ""}`.toLowerCase().includes(query.toLowerCase()));
  const unread = notifications.filter((n: any) => !(n.is_read ?? n.read)).length;
  const chatMessages = useMemo(() => Object.values(state?.chats || {}).flatMap((v: any) => Array.isArray(v) ? v : []), [state]);

  if (!auth) return <div className="auth-page"><form className="auth-card" onSubmit={submitAuth}>
    <div className="brand big"><span>학습</span> 멘토링</div>
    <h1>{register ? "회원가입" : "로그인"}</h1>
    <p className="muted">숙제 · 질문 · 일정 · 개인채팅 · AI 학습도우미</p>
    {register && <><input placeholder="이름" value={name} onChange={e => setName(e.target.value)} required/><select value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></>}
    <input placeholder="아이디" value={id} onChange={e => setId(e.target.value)} required/>
    <input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} required/>
    <button className="primary" disabled={busy}>{busy ? "처리 중..." : register ? "가입하고 시작" : "로그인"}</button>
    {error && <div className="error">{error}</div>}
    <button type="button" className="link" onClick={() => { setRegister(v => !v); setError(""); }}>{register ? "로그인으로 돌아가기" : "처음이신가요? 회원가입"}</button>
  </form></div>;

  return <div className="shell">
    <aside className="sidebar"><div className="brand"><span>학습</span> 멘토링</div><nav className="nav">{MENU.map(m => <button key={m} className={active === m ? "active" : ""} onClick={() => setActive(m)}>{m}</button>)}</nav><button className="logout" onClick={() => action("app_logout").then(() => location.reload())}>↪ 로그아웃</button></aside>
    <main className="main"><header className="topbar"><h1>{active}</h1><button className="icon-btn" onClick={() => setActive("🔔 알림")}>🔔 {unread}</button></header><div className="content">{error && <div className="error banner">{error}</div>}

      {active === "🏠 홈" && <><section className="hero"><h2>오늘도 차근차근, 공부를 이어가요 👋</h2><p>담당 과목: <b>{mySubject}</b> · 학습 자료와 일정을 한곳에서 관리하세요.</p></section><div className="grid"><Stat label="숙제" value={tasks.length} icon="📝"/><Stat label="완료" value={tasks.filter((t: any) => t.statusByUser?.[meId] === "완료").length} icon="✅"/><Stat label="보충 필요" value={tasks.filter((t: any) => ["보충 필요", "보충필요"].includes(t.statusByUser?.[meId])).length} icon="💡"/><Stat label="새 알림" value={unread} icon="🔔"/></div><TaskList tasks={filteredTasks} query={query} setQuery={setQuery} meId={meId} onSubmit={id => action("app_submit_task", { p_task: Number(id), p_memo: "", p_files: [] })}/></>}

      {active === "📝 숙제" && <TaskList tasks={filteredTasks} query={query} setQuery={setQuery} meId={meId} onSubmit={id => action("app_submit_task", { p_task: Number(id), p_memo: "", p_files: [] })}/>} 

      {active === "❓ 질문게시판" && <><section className="card form-card"><h3>질문 작성</h3><input placeholder="제목" value={qTitle} onChange={e => setQTitle(e.target.value)}/><textarea placeholder="내용" value={qBody} onChange={e => setQBody(e.target.value)}/><button className="primary small" disabled={busy || !qTitle.trim() || !qBody.trim()} onClick={() => action("app_create_question", { p_subject: mySubject, p_title: qTitle, p_body: qBody, p_files: [] }).then(() => { setQTitle(""); setQBody(""); })}>등록</button></section><section className="card">{questions.length ? questions.map((q: any) => <article className="post" key={q.id}><b>{q.title}</b><span className="muted">{q.subject || "전체"}</span><p>{q.body}</p>{(q.comments || []).map((c: any) => <div className="muted smalltext" key={c.id}>↳ {c.name || c.user_id}: {c.body}</div>)}<input placeholder="댓글 작성 후 Enter" onKeyDown={e => { if (e.key === "Enter" && e.currentTarget.value.trim()) { const v = e.currentTarget.value.trim(); action("app_add_comment", { p_type: "question", p_target: Number(q.id), p_text: v, p_files: [] }); e.currentTarget.value = ""; } }}/></article>) : <Empty text="아직 등록된 질문이 없습니다."/>}</section></>}

      {active === "📅 캘린더" && <Calendar month={month} setMonth={setMonth} events={calendar}/>} 
      {active === "💬 개인채팅" && <Chat users={users} messages={chatMessages} meId={meId} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} send={(to, text) => action("app_send_message", { p_to: to, p_text: text, p_files: [] })}/>} 
      {active === "🤖 AI 학습도우미" && <section className="card ai"><div className="ai-head"><div><h2>🤖 AI 학습도우미</h2><p className="muted">개념 설명, 풀이 힌트, 학습 계획을 도와줍니다.</p></div><span className="badge green">AI</span></div><div className="ai-messages">{aiMessages.length ? aiMessages.map((m, i) => <div key={i} className={m.role === "user" ? "ai-msg user" : "ai-msg"}>{m.content}</div>) : <div className="ai-welcome">공부와 관련된 질문을 입력해보세요.</div>}</div><form className="ai-compose" onSubmit={askAI}><input value={aiText} onChange={e => setAiText(e.target.value)} placeholder="공부와 관련된 질문을 입력하세요"/><button className="primary" disabled={aiBusy}>{aiBusy ? "생각 중..." : "질문하기"}</button></form></section>}
      {active === "🔔 알림" && <section className="card"><div className="section-title"><h2>알림</h2><button className="outline" onClick={() => action("app_mark_notifications_read", { p_ids: notifications.map((n: any) => Number(n.id)) })}>모두 읽음</button></div>{notifications.length ? notifications.map((n: any) => <div className="post" key={n.id}><b>{n.title}</b><span className="muted">{n.body}</span></div>) : <Empty text="새 알림이 없습니다."/>}</section>}
    </div></main>
  </div>;
}
function Stat({label,value,icon}:{label:string;value:number;icon:string}){return <div className="card stat"><div><div className="muted">{label}</div><strong>{value}</strong></div><span>{icon}</span></div>}
function TaskList({tasks,query,setQuery,meId,onSubmit}:{tasks:any[];query:string;setQuery:(v:string)=>void;meId:string;onSubmit:(id:any)=>void}){return <><div className="section-title"><h2>숙제</h2><input placeholder="숙제 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div><section className="card">{tasks.length ? tasks.map((t:any) => {const status=t.statusByUser?.[meId] || "미제출";return <div className="task" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject || ""} · 마감 {t.due || "-"}</div>{t.description && <div className="smalltext">{t.description}</div>}</div><div className="task-actions"><span className={`badge ${statusClass(status)}`}>{status}</span>{status !== "완료" && t.id && <button className="outline" onClick={() => onSubmit(t.id)}>제출</button>}</div></div>}) : <Empty text="등록된 숙제가 없습니다."/>}</section></>}
function Calendar({month,setMonth,events}:{month:Date;setMonth:(d:Date)=>void;events:any[]}){const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();return <section className="card calendar"><div className="cal-head"><button onClick={()=>setMonth(new Date(y,m-1,1))}>‹</button><h2>{y}년 {m+1}월</h2><button onClick={()=>setMonth(new Date(y,m+1,1))}>›</button></div><div className="week">{["일","월","화","수","목","금","토"].map(x=><b key={x}>{x}</b>)}</div><div className="days">{Array.from({length:first+days},(_,i)=>i<first?null:i-first+1).map((d,i)=><div className="day" key={i}>{d&&<><span>{d}</span>{events.filter((e:any)=>{const s=String(e.due||e.date||"");return s.endsWith(`-${String(d).padStart(2,"0")}`)||s===`${m+1}/${d}`}).slice(0,2).map((e:any,j:number)=><em key={j}>{e.title||e.subject||"일정"}</em>)}</>}</div>)}</div></section>}
function Chat({users,messages,meId,selected,setSelected,text,setText,send}:{users:any[];messages:any[];meId:string;selected:string;setSelected:(v:string)=>void;text:string;setText:(v:string)=>void;send:(to:string,text:string)=>void}){const visible=messages.filter((m:any)=>selected&&(m.from===selected||m.to===selected));return <section className="card chat"><div className="chat-users"><h3>대화 상대</h3>{users.filter((u:any)=>u.id!==meId).map((u:any)=><button key={u.id} className={selected===u.id?"selected":""} onClick={()=>setSelected(u.id)}>{u.name}<span className="muted smalltext">{u.subject}</span></button>)}</div><div className="chat-main"><div className="messages">{visible.length?visible.map((m:any)=><div key={m.id} className={m.from===meId?"bubble mine":"bubble"}>{m.text||m.body}</div>):<Empty text={selected?"아직 메시지가 없습니다.":"대화 상대를 선택하세요."}/>}</div><div className="chat-compose"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&text.trim()&&selected){send(selected,text.trim());setText("")}}} placeholder="메시지를 입력하세요"/><button className="primary small" onClick={()=>{if(text.trim()&&selected){send(selected,text.trim());setText("")}}}>전송</button></div></div></section>}
function Empty({text}:{text:string}){return <div className="empty">{text}</div>}
