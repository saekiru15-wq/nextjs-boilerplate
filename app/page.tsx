"use client";

import { useMemo, useState } from "react";

const tasks = [
  { title: "수학 미적분 문제풀이", subject: "수학", due: "오늘", status: "완료", cls: "green" },
  { title: "영어 독해 과제", subject: "영어", due: "내일", status: "보충필요", cls: "yellow" },
  { title: "과학 탐구 보고서", subject: "과학", due: "9/2", status: "미완료", cls: "red" },
  { title: "한국사 학습지", subject: "한국사", due: "9/4", status: "미제출", cls: "gray" },
];

const menu = ["🏠 홈", "📝 숙제", "❓ 질문게시판", "📅 캘린더", "💬 개인채팅", "🤖 AI 학습도우미"];

export default function Home() {
  const [active, setActive] = useState("🏠 홈");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => tasks.filter((t) => `${t.title} ${t.subject}`.includes(query)), [query]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span>수호</span> 학습멘토링</div>
        <nav className="nav">
          {menu.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}>{item}</button>)}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <h1>{active}</h1>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><button className="icon-btn">🔔 2</button><div style={{fontWeight:700}}>이수호</div></div>
        </header>
        <div className="content">
          <section className="hero">
            <h2>오늘도 차근차근, 공부를 이어가요 👋</h2>
            <p>숙제부터 질문, 일정, AI 학습도우미까지 한곳에서 관리하세요.</p>
          </section>

          <div className="grid">
            <div className="card stat"><div><div className="muted">오늘 숙제</div><strong>4</strong></div><span>📝</span></div>
            <div className="card stat"><div><div className="muted">완료</div><strong>1</strong></div><span>✅</span></div>
            <div className="card stat"><div><div className="muted">보충 필요</div><strong>1</strong></div><span>💡</span></div>
            <div className="card stat"><div><div className="muted">새 알림</div><strong>2</strong></div><span>🔔</span></div>
          </div>

          <div className="section-title"><h3>숙제 현황</h3><input value={query} onChange={e => setQuery(e.target.value)} placeholder="숙제 검색" style={{border:"1px solid #e7e9f0",borderRadius:10,padding:"9px 12px",background:"#fff"}} /></div>
          <section className="card">
            {filtered.map((task) => <div className="task" key={task.title}><div><b>{task.title}</b><div className="muted" style={{fontSize:13,marginTop:4}}>{task.subject} · 마감 {task.due}</div></div><span className={`badge ${task.cls}`}>{task.status}</span></div>)}
          </section>

          <div className="section-title"><h3>빠른 이동</h3></div>
          <div className="quick-grid">
            <button className="quick" onClick={() => setActive("📅 캘린더")}><b>📅 일정 확인</b><span className="muted">마감일과 학습 일정을 한눈에</span></button>
            <button className="quick" onClick={() => setActive("❓ 질문게시판")}><b>❓ 질문 남기기</b><span className="muted">질문을 올리고 서로 답변하기</span></button>
            <button className="quick" onClick={() => setActive("🤖 AI 학습도우미")}><b>🤖 AI에게 질문</b><span className="muted">개념 설명과 풀이 힌트 받기</span></button>
          </div>
        </div>
      </main>
    </div>
  );
}
