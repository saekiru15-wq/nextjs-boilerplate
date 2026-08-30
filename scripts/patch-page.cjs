const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'app', 'page.tsx');
let s = fs.readFileSync(file, 'utf8');

const homeRe = /\{active===\"🏠 홈\"&&[\s\S]*?\}\s*\{active===\"📤 숙제 내기\"/;
const home = `{active===\"🏠 홈\"&&<><section className=\"hero\"><h2>오늘의 영어 문장</h2><div className=\"daily-english\"><b>{dailyEnglish.en}</b><p>{dailyEnglish.ko}</p></div></section><div className=\"grid\"><Stat label=\"제출할 숙제\" value={assignedTasks.length} icon=\"📝\"/><Stat label=\"내가 낸 숙제\" value={createdTasks.length} icon=\"📤\"/><Stat label=\"완료\" value={assignedTasks.filter((t:any)=>(t.statusByUser?.[me]||\"미제출\")==\="완료\").length} icon=\"✅\"/><Stat label=\"새 알림\" value={notifications.filter((n:any)=>!n.read).length} icon=\"🔔\"/></div><section className=\"card\"><div className=\"section-title\"><div><h2>⏰ 가장 임박한 숙제</h2><p className=\"muted\">마감일이 가까운 숙제 3개입니다.</p></div><button className=\"outline\" onClick={()=>setActive(\"📥 숙제 제출\")}>숙제 제출로 이동</button></div><UpcomingTasks tasks={assignedTasks} users={users} me={me}/></section></>} {active===\"📤 숙제 내기\"`;
if (!homeRe.test(s)) throw new Error('home block not found');
s = s.replace(homeRe, home);

const daily = `const DAILY_ENGLISH=[
  [\"Small steps taken every day can lead to meaningful progress.\",\"매일 내딛는 작은 걸음이 의미 있는 발전으로 이어질 수 있다.\"],
  [\"A good question can lead you to a better understanding.\",\"좋은 질문 하나가 더 나은 이해로 이끌 수 있다.\"],
  [\"What matters most is not how fast you learn, but how consistently you practice.\",\"가장 중요한 것은 얼마나 빨리 배우느냐가 아니라 얼마나 꾸준히 연습하느냐이다.\"],
  [\"When you make a mistake, try to understand why it happened before moving on.\",\"실수했을 때는 넘어가기 전에 왜 그런 일이 일어났는지 이해하려고 해라.\"],
  [\"Reading carefully helps you notice ideas that you might otherwise miss.\",\"주의 깊게 읽으면 그렇지 않으면 놓칠 수도 있는 생각들을 발견하는 데 도움이 된다.\"],
  [\"The more clearly you explain your reasoning, the easier it becomes for others to understand you.\",\"자신의 추론을 더 명확하게 설명할수록 다른 사람들이 당신을 이해하기 쉬워진다.\"],
  [\"Even difficult problems become easier when you break them into smaller parts.\",\"어려운 문제도 작은 부분으로 나누면 더 쉬워진다.\"],
  [\"Learning from a mistake is often more valuable than simply getting the right answer.\",\"실수에서 배우는 것은 단순히 정답을 얻는 것보다 더 가치 있을 때가 많다.\"],
  [\"If you cannot explain an idea in simple words, you may need to study it again.\",\"어떤 생각을 쉬운 말로 설명할 수 없다면 다시 공부할 필요가 있을지도 모른다.\"],
  [\"Patience gives you time to think carefully before making an important decision.\",\"인내심은 중요한 결정을 내리기 전에 신중하게 생각할 시간을 준다.\"]
];
const dailyEnglish=DAILY_ENGLISH[Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000)%DAILY_ENGLISH.length];
`;
if (!s.includes('const DAILY_ENGLISH=')) s = s.replace('const MENU =', daily+'const MENU =');

const createdRe = /function CreatedTaskList\([\s\S]*?\nfunction Calendar/;
const created = `function CreatedTaskList({tasks,users,refresh}:{tasks:any[];users:any[];refresh?:()=>Promise<void>}){const[drafts,setDrafts]=useState<Record<string,string>>({});async function addComment(t:any){const text=(drafts[String(t.id)]||'').trim();if(!text)return;try{await rpc(\"app_add_comment\",{p_type:\"task\",p_target:Number(t.id),p_text:text,p_files:[]});setDrafts(v=>({...v,[String(t.id)]:''}));await refresh?.()}catch(e:any){window.alert(e?.message||\"댓글 등록에 실패했습니다.\")}}return <section className=\"card\">{tasks.length?tasks.map((t:any)=><details className=\"created-task\" key={t.id}><summary className=\"created-task-summary\"><div><b>{t.title}</b><div className=\"muted smalltext\">과목: {t.subject||\"-\"} · 출제자: {userLabel(users.find((u:any)=>u.id===t.creatorId))} · 마감: {t.due||\"-\"}</div></div></summary><div className=\"created-task-detail\"><div className=\"task-desc\">{t.desc||t.description||\"내용 없음\"}</div><AttachmentList attachments={t.attachments}/><div className=\"smalltext\"><b>수행 대상 및 상태</b></div>{(t.assigneeIds||[]).map((uid:string)=><div className=\"assignee-status\" key={uid}><span>☐ {userLabel(users.find((u:any)=>u.id===uid))}</span><span className=\"badge\">{t.statusByUser?.[uid]||\"미제출\"}</span></div>)}<div className=\"comments-block\"><b>댓글</b>{(t.comments||[]).length?(t.comments||[]).map((c:any)=><div className=\"comment\" key={c.id}>↳ {userLabel(users.find((u:any)=>u.id===c.userId))}: {c.text||c.body}</div>):<div className=\"muted smalltext\">아직 댓글이 없습니다.</div>}<input value={drafts[String(t.id)]||\"\"} placeholder=\"댓글 작성 후 Enter\" onChange={e=>setDrafts(v=>({...v,[String(t.id)]:e.target.value}))} onKeyDown={e=>{if(e.key===\"Enter\"&&!e.shiftKey){e.preventDefault();addComment(t)}}}/></div></div></details>):<Empty text=\"내가 낸 숙제 없습니다.\"/>}</section>}
function Calendar`;
if (!createdRe.test(s)) throw new Error('created task block not found');
s = s.replace(createdRe, created);

const calendarRe = /function Calendar\([\s\S]*?\nfunction Chat/;
const calendar = `function Calendar({month,setMonth,events,users}:{month:Date;setMonth:(d:Date)=>void;events:any[];users:any[]}){const y=month.getFullYear(),m=month.getMonth(),first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();const[selected,setSelected]=useState<any|null>(null);return <><section className=\"card calendar\"><div className=\"cal-head\"><button onClick={()=>setMonth(new Date(y,m-1,1))}>‹</button><h2>{y}년 {m+1}월</h2><button onClick={()=>setMonth(new Date(y,m+1,1))}>›</button></div><div className=\"week\">{[\"일\",\"월\",\"화\",\"수\",\"목\",\"금\",\"토\"].map(x=><b key={x}>{x}</b>)}</div><div className=\"days\">{Array.from({length:first+days},(_,i)=>i<first?null:i-first+1).map((d,i)=><div className=\"day\" key={i}>{d&&<><span>{d}</span>{events.filter((e:any)=>String(e.due||e.date||\"\").endsWith(\"-\"+String(d).padStart(2,\"0\"))).slice(0,3).map((e:any,j:number)=><button type=\"button\" className=\"calendar-event\" key={e.id||j} onClick={()=>setSelected(e)}>{e.title||\"일정\"}</button>)}</>}</div>)}</div></section>{selected&&<div className=\"modal-backdrop\" onClick={()=>setSelected(null)}><div className=\"modal-card\" onClick={e=>e.stopPropagation()}><button className=\"modal-close\" onClick={()=>setSelected(null)}>×</button><h2>{selected.title||\"숙제\"}</h2><div className=\"info-row\"><span>과목</span><b>{selected.subject||\"-\"}</b></div><div className=\"info-row\"><span>출제자</span><b>{userLabel(users.find((u:any)=>u.id===selected.creatorId))}</b></div><div className=\"info-row\"><span>마감</span><b>{selected.due||\"-\"}</b></div>{selected.status&&<div className=\"info-row\"><span>내 상태</span><b>{selected.status}</b></div>}<div className=\"task-desc\">{selected.description||selected.desc||\"내용 없음\"}</div><button className=\"primary\" onClick={()=>setSelected(null)}>닫기</button></div></div>}</>}
function Chat`;
if (!calendarRe.test(s)) throw new Error('calendar block not found');
s = s.replace(calendarRe, calendar);

s = s.replace('<CreatedTaskList tasks={createdTasks} users={users}/>', '<CreatedTaskList tasks={createdTasks} users={users} refresh={refresh}/>');
s = s.replace('<Calendar month={month} setMonth={setMonth} events={calendar}/>', '<Calendar month={month} setMonth={setMonth} events={calendar} users={users}/>');

const upcoming = `function UpcomingTasks({tasks,users,me}:{tasks:any[];users:any[];me:string}){const list=[...tasks].filter((t:any)=>t.due).sort((a:any,b:any)=>String(a.due).localeCompare(String(b.due))).slice(0,3);return list.length?<div className=\"upcoming-list\">{list.map((t:any)=>{const status=t.statusByUser?.[me]||\"미제출\";return <div className=\"upcoming-item\" key={t.id}><div><b>{t.title}</b><div className=\"muted smalltext\">{t.subject||\"-\"} · {t.due}</div><div className=\"muted smalltext\">출제자: {userLabel(users.find((u:any)=>u.id===t.creatorId))}</div></div><span className=\"badge\">{status}</span></div>})}</div>:<Empty text=\"마감일이 지정된 숙제가 없습니다.\"/>}\n`;
if (!s.includes('function UpcomingTasks')) s = s.replace('function Stat(', upcoming+'function Stat(');

fs.writeFileSync(file, s);
