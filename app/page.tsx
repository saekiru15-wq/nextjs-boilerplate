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
const statusClass = (s: string) => s === "완료" ? "green" : s === "보충 필요" ? "yellow" : s === "미완료" ? "red" : "gray";

export default function Home() {
  const [active, setActive] = useState(MENU[0]);
  const [state, setState] = useState<Obj | null>(null);
  const [auth, setAuth] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [register, setRegister] = useState(false);
  const [id, setId] = useState(""); const [pw, setPw] = useState(""); const [name, setName] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [taskTitle, setTaskTitle] = useState(""); const [taskDesc, setTaskDesc] = useState(""); const [taskDue, setTaskDue] = useState(""); const [taskAssignees, setTaskAssignees] = useState<string[]>([]);
  const [qSubject, setQSubject] = useState(SUBJECTS[0]); const [qTitle, setQTitle] = useState(""); const [qBody, setQBody] = useState("");
  const [chatUser, setChatUser] = useState(""); const [chatText, setChatText] = useState("");
  const [aiText, setAiText] = useState(""); const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]); const [aiBusy, setAiBusy] = useState(false);
  const [month, setMonth] = useState(new Date()); const [calendar, setCalendar] = useState<any[]>([]);

  const toast = (msg: string) => {
    setError(msg);
    window.setTimeout(() => setError(v => v === msg ? "" : v), 3000);
  };

  async function refresh() {
    try {
      const s = await rpc("app_state");
      setState(s); setAuth(true); setError("");
    } catch (e: any) {
      setAuth(false);
      const msg = String(e?.message || "");
      // Not logged in is normal on the login page; do not show a permanent warning.
      if (msg && !/UNAUTHORIZED|로그인|token/i.test(msg)) toast(msg);
    }
  }

  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    if (!auth) return;
    const from = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().slice(0, 10);
    rpc("app_calendar", { p_from: from, p_to: to }).then(d => setCalendar(Array.isArray(d) ? d : arr(d, ["events", "calendar", "data"]))).catch(() => setCalendar([]));
  }, [auth, month]);

  async function action(fn: string, args: Obj = {}) {
    try { setBusy(true); setError(""); await rpc(fn, args); await refresh(); }
    catch (e: any) { toast(e?.message || "작업에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function submitAuth(e: FormEvent) {
    e.preventDefault();
    try {
      setBusy(true); setError("");
      if (register) await rpc("app_register", { p_id: id.trim(), p_name: name.trim(), p_pw: pw, p_subject: subject });
      await rpc("app_login", { p_id: id.trim(), p_pw: pw });
      await refresh();
    } catch (e: any) { toast(e?.message || "로그인에 실패했습니다."); }
    finally { setBusy(false); }
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) { toast("숙제 제목을 입력해주세요."); return; }
    if (!taskAssignees.length) { toast("이 숙제의 수행 대상을 선택해주세요."); return; }
    await action("app_create_task", { p_title: taskTitle.trim(), p_desc: taskDesc.trim(), p_subject: state?.subject || subject, p_due: taskDue || null, p_assignees: taskAssignees, p_files: [] });
    setTaskTitle(""); setTaskDesc(""); setTaskDue(""); setTaskAssignees([]);
  }

  async function createQuestion() {
    if (!qTitle.trim() || !qBody.trim()) { toast("질문 제목과 내용을 입력해주세요."); return; }
    await action("app_create_question", { p_subject: qSubject, p_title: qTitle.trim(), p_body: qBody.trim(), p_files: [] });
    setQTitle(""); setQBody("");
  }

  async function askAI(e: FormEvent) {
    e.preventDefault(); if (!aiText.trim()) return;
    const text = aiText.trim(); setAiText(""); setAiBusy(true);
    const history = [...aiMessages, { role: "user", content: text }]; setAiMessages(history);
    try {
      const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "AI 요청에 실패했습니다.");
      setAiMessages(v => [...v, { role: "assistant", content: d.text }]);
    } catch (e: any) { setAiMessages(v => [...v, { role: "assistant", content: `AI 연결 오류: ${e?.message || "알 수 없는 오류"}` }]); }
    finally { setAiBusy(false); }
  }

  const me = state?.me || "";
  const users = arr(state, ["users", "members"]);
  const tasks = arr(state, ["tasks", "task_list", "app_tasks"]);
  const questions = arr(state, ["questions", "question_list"]);
  const notifications = arr(state, ["notifications", "notification_list"]);
  const messages = useMemo(() => Object.values(state?.chats || {}).flatMap((v: any) => Array.isArray(v) ? v : []), [state]);
  const assignedTasks = tasks.filter((t: any) => Array.isArray(t.assigneeIds) && t.assigneeIds.includes(me));
  const createdTasks = tasks.filter((t: any) => t.creatorId === me);

  if (!auth) return <div className="auth-page"><form className="auth-card" onSubmit={submitAuth}>
    <div className="brand big"><span>학습</span> 멘토링</div><h1>{register ? "회원가입" : "로그인"}</h1>
    <p className="muted">숙제 · 질문 · 일정 · 개인채팅 · AI 학습도우미</p>
    {register && <><input placeholder="이름" value={name} onChange={e => setName(e.target.value)} required/><select value={subject} onChange={e => setSubject(e.target.value)}>{SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></>}
    <input placeholder="아이디" value={id} onChange={e => setId(e.target.value)} required/><input type="password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} required/>
    <button className="primary" disabled={busy}>{busy ? "처리 중..." : register ? "가입하고 시작" : "로그인"}</button>
    {error && <div className="error">{error}</div>}
    <button type="button" className="link" onClick={() => { setRegister(v => !v); setError(""); }}>{register ? "로그인으로 돌아가기" : "처음이신가요? 회원가입"}</button>
  </form></div>;

  return <div className="shell">
    <aside className="sidebar"><div className="brand"><span>학습</span> 멘토링</div><nav className="nav">{MENU.map(m => <button key={m} className={active === m ? "active" : ""} onClick={() => setActive(m)}>{m}</button>)}</nav><button className="logout" onClick={() => action("app_logout").then(() => location.reload())}>↪ 로그아웃</button></aside>
    <main className="main"><header className="topbar"><h1>{active}</h1><button className="icon-btn" onClick={() => setActive("🔔 알림")}>🔔 {notifications.filter((n: any) => !n.read).length}</button></header>
      <div className="content">{error && <div className="error banner">{error}</div>}
        {active === "🏠 홈" && <><section className="hero"><h2>오늘도 차근차근, 공부를 이어가요 👋</h2><p>숙제와 질문, 일정과 개인채팅을 한곳에서 관리하세요.</p></section><div className="grid"><Stat label="제출할 숙제" value={assignedTasks.length} icon="📝"/><Stat label="내가 낸 숙제" value={createdTasks.length} icon="📤"/><Stat label="완료" value={assignedTasks.filter((t:any)=>(t.statusByUser?.[me]||"미제출")==="완료").length} icon="✅"/><Stat label="새 알림" value={notifications.filter((n:any)=>!n.read).length} icon="🔔"/></div><TaskSubmitList tasks={assignedTasks} me={me} submit={id=>action("app_submit_task",{p_task:Number(id),p_memo:"",p_files:[]})}/></>}

        {active === "📝 숙제" && <div className="split"><section className="card form-card"><h2>📤 숙제 내기</h2><p className="muted">내 담당 과목의 숙제를 등록하고 수행 대상을 선택합니다.</p><div className="muted smalltext">담당 과목: {state?.subject || "-"}</div><input placeholder="숙제 제목" value={taskTitle} onChange={e=>setTaskTitle(e.target.value)}/><textarea placeholder="설명" value={taskDesc} onChange={e=>setTaskDesc(e.target.value)}/><input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)}/><div><b>수행 대상</b>{users.filter((u:any)=>u.id!==me).map((u:any)=><label key={u.id} style={{display:"block",marginTop:7}}><input type="checkbox" checked={taskAssignees.includes(u.id)} onChange={e=>setTaskAssignees(v=>e.target.checked?[...v,u.id]:v.filter(x=>x!==u.id))}/> {u.name} <span className="muted">({u.subject})</span></label>)}</div><button className="primary" disabled={busy} onClick={createTask}>숙제 등록</button></section><section><h2>📋 내가 낸 숙제</h2><p className="muted">내가 등록한 숙제와 각 수행자의 상태를 확인합니다.</p><CreatedTaskList tasks={createdTasks}/></section></div>}

        {active === "❓ 질문게시판" && <><section className="card form-card"><h2>질문 작성</h2><label className="smalltext">질문 과목</label><select value={qSubject} onChange={e=>setQSubject(e.target.value)}>{SUBJECTS.map(s=><option key={s}>{s}</option>)}</select><input placeholder="제목" value={qTitle} onChange={e=>setQTitle(e.target.value)}/><textarea placeholder="내용" value={qBody} onChange={e=>setQBody(e.target.value)}/><button className="primary" disabled={busy} onClick={createQuestion}>등록</button></section><section className="card">{questions.length?questions.map((q:any)=><article className="post" key={q.id}><div className="section-title"><b>{q.title}</b><span className="badge gray">{q.subject||"전체"}</span></div><p>{q.body}</p>{(q.comments||[]).map((c:any)=><div className="muted smalltext" key={c.id}>↳ {c.name||c.user_id}: {c.body}</div>)}<input placeholder="댓글 작성 후 Enter" onKeyDown={e=>{if(e.key==="Enter"&&e.currentTarget.value.trim()){action("app_add_comment",{p_type:"question",p_target:Number(q.id),p_text:e.currentTarget.value.trim(),p_files:[]});e.currentTarget.value=""}}}/></article>):<Empty text="아직 등록된 질문이 없습니다."/>}</section></>}

        {active === "📅 캘린더" && <Calendar month={month} setMonth={setMonth} events={calendar}/>} 
        {active === "💬 개인채팅" && <Chat users={users} messages={messages} me={me} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} send={(to,text)=>action("app_send_message",{p_to:to,p_text:text,p_files:[]})}/>} 
        {active === "🤖 AI 학습도우미" && <section className="card ai"><div className="ai-head"><div><h2>🤖 AI 학습도우미</h2><p className="muted">개념 설명, 풀이 힌트, 학습 계획을 도와줍니다.</p></div><span className="badge green">AI</span></div><div className="ai-messages">{aiMessages.length?aiMessages.map((m,i)=><div key={i} className={m.role==="user"?"ai-msg user":"ai-msg"}>{m.content}</div>):<div className="ai-welcome">공부와 관련된 질문을 입력해보세요.</div>}</div><form className="ai-compose" onSubmit={askAI}><input value={aiText} onChange={e=>setAiText(e.target.value)} placeholder="공부와 관련된 질문을 입력하세요"/><button className="primary" disabled={aiBusy}>{aiBusy?"생각 중...":"질문하기"}</button></form></section>}
        {active === "🔔 알림" && <section className="card"><div className="section-title"><h2>알림</h2><button className="outline" onClick={()=>action("app_mark_notifications_read",{p_ids:notifications.map((n:any)=>Number(n.id))})}>모두 읽음</button></div>{notifications.length?notifications.map((n:any)=><div className="post" key={n.id}><b>{n.title}</b><div className="muted">{n.body}</div></div>):<Empty text="새 알림이 없습니다."/>}</section>}
      </div>
    </main>
  </div>;
}
function Stat({label,value,icon}:{label:string;value:number;icon:string}){return <div className="card stat"><div><div className="muted">{label}</div><strong>{value}</strong></div><span>{icon}</span></div>}
function Empty({text}:{text:string}){return <div className="empty">{text}</div>}
function TaskSubmitList({tasks,me,submit}:{tasks:any[];me:string;submit:(id:number)=>void}){return <section className="card"><div className="section-title"><h2>📥 숙제 제출</h2></div>{tasks.length?tasks.map((t:any)=>{const status=t.statusByUser?.[me]||"미제출";return <article className="task" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject||"전체"} · 마감 {t.due||"-"}</div>{t.description&&<div className="smalltext">{t.description}</div>}</div><div className="task-actions"><span className={`badge ${statusClass(status)}`}>{status}</span>{status!=="완료"&&<button className="outline" onClick={()=>submit(Number(t.id))}>제출</button>}</div></article>}) : <Empty text="현재 나에게 배정된 숙제가 없습니다."/>}</section>}
function CreatedTaskList({tasks}:{tasks:any[]}){return <section className="card">{tasks.length?tasks.map((t:any)=><article className="task" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject||""} · 마감 {t.due||"-"}</div><div className="smalltext">수행 대상: {(t.assigneeIds||[]).map((uid:string)=>uid).join(", ")||"없음"}</div></div><div className="task-actions">{(t.assigneeIds||[]).map((uid:string)=><span className={`badge ${statusClass(t.statusByUser?.[uid]||"미제출")}`} key={uid}>{t.statusByUser?.[uid]||"미제출"}</span>)}</div></article>):<Empty text="내가 낸 숙제가 없습니다."/>}</section>}
function Calendar({month,setMonth,events}:{month:Date;setMonth:(d:Date)=>void;events:any[]}){const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();return <section className="card calendar"><div className="cal-head"><button onClick={()=>setMonth(new Date(y,m-1,1))}>‹</button><h2>{y}년 {m+1}월</h2><button onClick={()=>setMonth(new Date(y,m+1,1))}>›</button></div><div className="week">{["일","월","화","수","목","금","토"].map(x=><b key={x}>{x}</b>)}</div><div className="days">{Array.from({length:first+days},(_,i)=>i<first?null:i-first+1).map((d,i)=><div className="day" key={i}>{d&&<><span>{d}</span>{events.filter((e:any)=>String(e.due||e.date||"").endsWith(`-${String(d).padStart(2,"0")}`)).slice(0,2).map((e:any,j:number)=><em key={j}>{e.title||"일정"}</em>)}</>}</div>)}</div></section>}
function Chat({users,messages,me,selected,setSelected,text,setText,send}:{users:any[];messages:any[];me:string;selected:string;setSelected:(v:string)=>void;text:string;setText:(v:string)=>void;send:(to:string,text:string)=>void}){const visible=messages.filter((m:any)=>selected&&(m.from===selected||m.to===selected));return <section className="card chat"><div className="chat-users"><h3>대화 상대</h3>{users.filter((u:any)=>u.id!==me).map((u:any)=><button key={u.id} className={selected===u.id?"selected":""} onClick={()=>setSelected(u.id)}>{u.name}<span className="muted smalltext">{u.subject}</span></button>)}</div><div className="chat-main"><div className="messages">{visible.length?visible.map((m:any)=><div key={m.id} className={m.from===me?"bubble mine":"bubble"}>{m.text||m.body}</div>):<Empty text={selected?"아직 메시지가 없습니다.":"대화 상대를 선택하세요."}/>}</div><div className="chat-compose"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&text.trim()&&selected){send(selected,text.trim());setText("")}}} placeholder="메시지를 입력하세요"/><button className="primary small" onClick={()=>{if(text.trim()&&selected){send(selected,text.trim());setText("")}}}>전송</button></div></div></section>}
