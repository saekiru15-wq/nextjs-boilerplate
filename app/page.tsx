"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type AnyObj = Record<string, any>;
const menu = ["🏠 홈", "📝 숙제", "❓ 질문게시판", "📅 캘린더", "💬 개인채팅", "🤖 AI 학습도우미"];
const demoTasks = [
  { id: 1, title: "수학 미적분 문제풀이", subject: "수학", due: "오늘", status: "완료" },
  { id: 2, title: "영어 독해 과제", subject: "영어", due: "내일", status: "보충필요" },
  { id: 3, title: "과학 탐구 보고서", subject: "과학", due: "9/2", status: "미완료" },
  { id: 4, title: "한국사 학습지", subject: "한국사", due: "9/4", status: "미제출" },
];

async function rpc(fn: string, args: AnyObj = {}) {
  const r = await fetch("/api/rpc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fn, args }) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || data?.error || "요청에 실패했습니다.");
  return data;
}
function arr(state: any, keys: string[]) { for (const k of keys) if (Array.isArray(state?.[k])) return state[k]; return []; }
function statusClass(s: string) { return s === "완료" ? "green" : s === "보충필요" ? "yellow" : s === "미완료" ? "red" : "gray"; }

export default function Home() {
  const [active, setActive] = useState("🏠 홈");
  const [state, setState] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [login, setLogin] = useState(true);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("수학");
  const [query, setQuery] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [chatText, setChatText] = useState("");
  const [chatUser, setChatUser] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiMessages, setAiMessages] = useState<{role:string;content:string}[]>([]);
  const [aiBusy, setAiBusy] = useState(false);

  async function refresh() {
    try { setLoading(true); const s = await rpc("app_state"); setState(s); setLogin(false); setError(""); }
    catch (e: any) { if (!document.cookie.includes("mentor_token")) setLogin(true); setError(e.message || "연결 오류"); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function submitAuth(e: FormEvent) {
    e.preventDefault(); setError("");
    try {
      if (register) { await rpc("app_register", { p_id: loginId, p_name: name, p_pw: password, p_subject: subject }); }
      await rpc("app_login", { p_id: loginId, p_pw: password }); await refresh();
    } catch (e: any) { setError(e.message || "로그인에 실패했습니다."); }
  }
  async function logout() { await rpc("app_logout"); location.reload(); }
  async function doAction(fn: string, args: AnyObj) { try { await rpc(fn, args); await refresh(); } catch (e: any) { setError(e.message || "작업에 실패했습니다."); } }

  async function askAI(e: FormEvent) {
    e.preventDefault(); if (!aiText.trim()) return;
    const user = aiText.trim(); setAiText(""); setAiBusy(true); const next = [...aiMessages, { role: "user", content: user }]; setAiMessages(next);
    try { const r = await fetch("/api/ai", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ message:user, history:next }) }); const d=await r.json(); if(!r.ok) throw new Error(d.error); const answer=d.text; setAiMessages(v=>[...v,{role:"assistant",content:answer}]); }
    catch(e:any){ setAiMessages(v=>[...v,{role:"assistant",content:`AI 연결 오류: ${e.message}`}]); }
    finally { setAiBusy(false); }
  }

  const tasks = arr(state, ["tasks", "app_tasks", "task_list"]).length ? arr(state,["tasks","app_tasks","task_list"]) : demoTasks;
  const questions = arr(state,["questions","app_questions","question_list"]);
  const users = arr(state,["users","app_users","members"]);
  const messages = arr(state,["messages","app_messages","message_list"]);
  const notifications = arr(state,["notifications","app_notifications","notification_list"]);
  const events = arr(state,["calendar","events","calendar_events"]);
  const filteredTasks = tasks.filter((t:any)=>`${t.title||""} ${t.subject||""}`.toLowerCase().includes(query.toLowerCase()));
  const currentUser = state?.user || state?.me || state?.profile || { name: "이수호", id: "" };
  const unread = notifications.filter((n:any)=>!n.is_read).length;

  if (loading && !state) return <div className="loading">학습멘토링을 불러오는 중...</div>;
  if (login) return <div className="auth-page"><form className="auth-card" onSubmit={submitAuth}><div className="brand big"><span>수호</span> 학습멘토링</div><h1>{register?"회원가입":"로그인"}</h1><p className="muted">숙제·질문·채팅·AI 학습도우미를 한곳에서</p>{register&&<><input placeholder="이름" value={name} onChange={e=>setName(e.target.value)} required/><select value={subject} onChange={e=>setSubject(e.target.value)}><option>수학</option><option>영어</option><option>과학</option><option>국어</option><option>한국사</option></select></>}<input placeholder="아이디" value={loginId} onChange={e=>setLoginId(e.target.value)} required/><input type="password" placeholder="비밀번호" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="primary">{register?"가입하고 시작":"로그인"}</button>{error&&<div className="error">{error}</div>}<button type="button" className="link" onClick={()=>setRegister(!register)}>{register?"이미 계정이 있어요":"처음이신가요? 회원가입"}</button></form></div>;

  return <div className="shell">
    <aside className="sidebar"><div className="brand"><span>수호</span> 학습멘토링</div><nav className="nav">{menu.map(m=><button key={m} className={active===m?"active":""} onClick={()=>setActive(m)}>{m}</button>)}</nav><button className="logout" onClick={logout}>↪ 로그아웃</button></aside>
    <main className="main"><header className="topbar"><h1>{active}</h1><div className="top-actions"><button className="icon-btn" onClick={()=>setActive("🔔 알림")}>🔔 {unread}</button><b>{currentUser?.name || "이수호"}</b></div></header><div className="content">
      {error&&<div className="error banner">{error}</div>}
      {active==="🏠 홈"&&<><section className="hero"><h2>오늘도 차근차근, 공부를 이어가요 👋</h2><p>숙제부터 질문, 일정, 개인채팅, AI까지 한곳에서 관리하세요.</p></section><div className="grid"><Stat label="숙제" value={tasks.length} icon="📝"/><Stat label="완료" value={tasks.filter((t:any)=>t.status==="완료").length} icon="✅"/><Stat label="보충 필요" value={tasks.filter((t:any)=>t.status==="보충필요").length} icon="💡"/><Stat label="새 알림" value={unread} icon="🔔"/></div><section className="card"><div className="section-title"><h3>숙제 현황</h3><input placeholder="검색" value={query} onChange={e=>setQuery(e.target.value)}/></div>{filteredTasks.map((t:any)=><TaskRow key={t.id||t.title} task={t} onSubmit={()=>t.id&&doAction("app_submit_task",{p_task:Number(t.id),p_memo:"",p_files:[]})}/>)}</section></>}
      {active==="📝 숙제"&&<><div className="section-title"><h2>숙제</h2><input placeholder="숙제 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div><section className="card">{filteredTasks.map((t:any)=><TaskRow key={t.id||t.title} task={t} onSubmit={()=>t.id&&doAction("app_submit_task",{p_task:Number(t.id),p_memo:"",p_files:[]})}/>)}</section></>}
      {active==="❓ 질문게시판"&&<><section className="card form-card"><h3>새 질문</h3><input placeholder="제목" value={questionTitle} onChange={e=>setQuestionTitle(e.target.value)}/><textarea placeholder="질문 내용을 입력하세요" value={questionBody} onChange={e=>setQuestionBody(e.target.value)}/><button className="primary small" onClick={()=>doAction("app_create_question",{p_subject:"",p_title:questionTitle,p_body:questionBody,p_files:[]})}>질문 등록</button></section><section className="card">{questions.length?questions.map((q:any)=><article className="post" key={q.id}><b>{q.title}</b><span className="muted">{q.subject||"전체"} · {q.author_name||q.author_id||"사용자"}</span><p>{q.body}</p><div className="comment-box"><input placeholder="댓글을 입력하고 Enter" onKeyDown={e=>{if(e.key==="Enter"&&e.currentTarget.value){doAction("app_add_comment",{p_type:"question",p_target:Number(q.id),p_text:e.currentTarget.value,p_files:[]});e.currentTarget.value=""}}}/></div></article>):<Empty text="아직 질문이 없습니다."/>}</section></>}
      {active==="📅 캘린더"&&<Calendar events={events.length?events:tasks}/>} 
      {active==="💬 개인채팅"&&<><section className="card chat"><div className="chat-users"><h3>대화 상대</h3>{users.length?users.map((u:any)=><button key={u.id} className={chatUser===u.id?"selected":""} onClick={()=>setChatUser(u.id)}>{u.name||u.id}</button>):<p className="muted">사용자 목록은 로그인 후 상태 API에서 제공됩니다.</p>}</div><div className="chat-main"><div className="messages">{messages.filter((m:any)=>!chatUser||m.from_id===chatUser||m.to_id===chatUser).map((m:any)=><div className={m.from_id===currentUser?.id?"bubble mine":"bubble"} key={m.id}>{m.body}</div>)}{!messages.length&&<Empty text="메시지를 선택하세요."/>}</div><div className="chat-compose"><input value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="메시지" onKeyDown={e=>{if(e.key==="Enter"&&chatText.trim()&&chatUser){doAction("app_send_message",{p_to:chatUser,p_text:chatText.trim(),p_files:[]});setChatText("")}}}/><button className="primary small" onClick={()=>{if(chatText.trim()&&chatUser){doAction("app_send_message",{p_to:chatUser,p_text:chatText.trim(),p_files:[]});setChatText("")}}}>전송</button></div></div></section></>}
      {active==="🤖 AI 학습도우미"&&<section className="card ai"><div className="ai-head"><div><h2>🤖 AI 학습도우미</h2><p className="muted">개념 설명, 풀이 힌트, 공부 계획을 도와줘요.</p></div><span className="badge green">AI ON</span></div><div className="ai-messages">{aiMessages.length?aiMessages.map((m,i)=><div className={m.role==="user"?"ai-msg user":"ai-msg"} key={i}>{m.content}</div>):<div className="ai-welcome">무엇이든 공부와 관련해 질문해보세요.</div>}</div><form className="ai-compose" onSubmit={askAI}><input value={aiText} onChange={e=>setAiText(e.target.value)} placeholder="예: 이차함수의 꼭짓점 이동을 설명해줘"/><button className="primary" disabled={aiBusy}>{aiBusy?"생각 중...":"질문하기"}</button></form></section>}
    </div></main>
  </div>;
}
function Stat({label,value,icon}:{label:string;value:number;icon:string}){return <div className="card stat"><div><div className="muted">{label}</div><strong>{value}</strong></div><span>{icon}</span></div>}
function TaskRow({task,onSubmit}:{task:any;onSubmit:()=>void}){return <div className="task"><div><b>{task.title}</b><div className="muted smalltext">{task.subject||"전체"} · 마감 {task.due||"-"}</div>{task.description&&<div className="muted smalltext">{task.description}</div>}</div><div className="task-actions"><span className={`badge ${statusClass(task.status||"미제출")}`}>{task.status||"미제출"}</span>{task.status!=="완료"&&<button className="outline" onClick={onSubmit}>제출</button>}</div></div>}
function Empty({text}:{text:string}){return <div className="empty">{text}</div>}
function Calendar({events}:{events:any[]}){const days=Array.from({length:35},(_,i)=>i-2);return <section className="card calendar"><div className="cal-head"><button>‹</button><h2>2026년 8월</h2><button>›</button></div><div className="week">{["일","월","화","수","목","금","토"].map(x=><b key={x}>{x}</b>)}</div><div className="days">{days.map((d,i)=>{const n=d<1?31+d:d>31?d-31:d;const ev=events.find((e:any)=>String(e.due||e.date||"").includes(`-${String(n).padStart(2,"0")}`));return <div className={(d<1||d>31)?"day muted-day":"day"} key={i}><span>{n}</span>{ev&&<em>{ev.title||ev.subject}</em>}</div>})}</div></section>}
