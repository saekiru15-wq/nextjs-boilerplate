const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let s=fs.readFileSync(f,"utf8");

// Final visual pass: keep internal menu keys for routing, but render clean line icons/text.
const navOld=/<nav className="nav">\{MENU\.map\(m=>\(.*?<\/nav>/s;
const navNew='<nav className="nav">{MENU.map(m=><button key={m} className={active===m?"active":""} onClick={()=>{setActive(m);setMobileMenu(false)}}><NavIcon name={menuIcon(m)}/><span>{menuText(m)}</span></button>)}</nav>';
if(navOld.test(s)) s=s.replace(navOld,navNew);

s=s.replace('<h1>{active}</h1>','<h1 className="page-title"><NavIcon name={menuIcon(active)}/><span>{menuText(active)}</span></h1>');
s=s.replace('<button className="icon-btn notification-bell" onClick={()=>setActive("🔔 알림")}>🔔 {notifications.filter((n:any)=>!n.read).length}{notifications.some((n:any)=>!n.read)&&<span className="notification-unread-dot" aria-label="읽지 않은 알림"/>}</button>',
'<button className="icon-btn notification-bell" onClick={()=>setActive("🔔 알림")}><NavIcon name="bell"/><span>{notifications.filter((n:any)=>!n.read).length}</span>{notifications.some((n:any)=>!n.read)&&<span className="notification-unread-dot" aria-label="읽지 않은 알림"/>}</button>');

// Replace the entire home view after all other build-time patches, including the old sentence/emoji dashboard.
const homeRe=/\{active==="🏠 홈"&&[\s\S]*?\}\s*\{active==="📤 숙제 내기"&&/;
const homeNew='{active==="🏠 홈"&&<HomeDashboard assignedTasks={assignedTasks} createdTasks={createdTasks} notifications={notifications} me={me} users={users}/>} {active==="📤 숙제 내기"&&';
if(homeRe.test(s)) s=s.replace(homeRe,homeNew);

// Clean emoji headings inside major visible sections without changing routing keys.
s=s.replace('<h2>📋 내가 낸 숙제</h2>','<h2>내가 낸 숙제</h2>');
s=s.replace('<h2>📥 숙제 제출하기</h2>','<h2>숙제 제출하기</h2>');
s=s.replace('<h2>📚 데일리 프로젝트</h2>','<h2>데일리 프로젝트</h2>');
s=s.replace('<h2>🤖 AI 학습도우미</h2>','<h2>AI 학습도우미</h2>');
s=s.replace('<h2>🔔 알림</h2>','<h2>알림</h2>');
s=s.replace('<h2>📌 밀린 숙제</h2>','<h2>밀린 숙제</h2>');

const marker='function NavIcon(';
if(!s.includes(marker)){
 s=s.replace('function Stat({label,value,icon}:{label:string;value:number;icon:string})',
`function menuText(m:string){return m.replace(/^\\S+\\s+/,"")}
function menuIcon(m:string){if(m.includes("홈"))return "home";if(m.includes("숙제 내기"))return "edit";if(m.includes("숙제 제출"))return "upload";if(m.includes("질문"))return "question";if(m.includes("캘린더"))return "calendar";if(m.includes("개인채팅"))return "chat";if(m.includes("데일리"))return "book";if(m.includes("AI"))return "spark";if(m.includes("알림"))return "bell";return "dot"}
function NavIcon({name}:{name:string}){const paths:any={home:"M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3z",edit:"M4 20l4.2-1 9.9-9.9-3.2-3.2L5 15.8 4 20z M14.1 5.9l2-2a1.7 1.7 0 0 1 2.4 0l.6.6a1.7 1.7 0 0 1 0 2.4l-2 2",upload:"M12 16V4m0 0-4 4m4-4 4 4M5 12v7h14v-7",question:"M8.2 9a4 4 0 1 1 7.1 2.5c-.9 1.1-2.3 1.5-2.9 2.5-.2.3-.3.7-.3 1.1M12 18h.01",calendar:"M4 5h16v15H4z M8 3v4m8-4v4M4 9h16",chat:"M4 5h16v11H8l-4 4z",book:"M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4z M7 20h12",spark:"M12 3l1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3z",bell:"M6 17h12l-1.2-2V10a4.8 4.8 0 0 0-9.6 0v5z M10 20h4",dot:"M12 5v14 M5 12h14"};return <svg className="line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.dot}/></svg>}
function HomeDashboard({assignedTasks,createdTasks,notifications,me,users}:{assignedTasks:any[];createdTasks:any[];notifications:any[];me:string;users:any[]}){const completed=assignedTasks.filter((t:any)=>(t.statusByUser?.[me]||"미제출").trim()==="완료").length;const submitted=assignedTasks.filter((t:any)=>{const st=(t.statusByUser?.[me]||"미제출").trim();return st==="완료"||st==="검토중"||st==="제출 대기"}).length;const total=assignedTasks.length;const pct=total?Math.round(completed/total*100):0;const upcoming=[...assignedTasks].filter((t:any)=>t.due&&String(t.due)>=new Date().toISOString().slice(0,10)).sort((a:any,b:any)=>String(a.due).localeCompare(String(b.due))).slice(0,4);const sentence=["정부가 새로운 정책을 시행하기에 앞서 예상되는 부작용을 충분히 검토하지 않는다면, 문제를 해결하려던 조치가 오히려 다른 문제를 초래할 가능성도 배제하기 어렵다.","겉으로 드러난 결과만을 근거로 현상의 원인을 단정해서는 안 되며, 서로 다른 요인이 어떤 방식으로 상호작용했는지를 함께 살펴볼 필요가 있다.","많은 사람들이 효율성을 높이기 위해 선택한 방법이라도 특정한 상황에서는 오히려 예상보다 큰 비용을 발생시킬 수 있다는 점을 고려해야 한다.","연구자는 자신의 가설과 일치하는 자료만을 선택적으로 해석하기보다, 그 가설을 반박할 가능성이 있는 증거까지 검토해야 보다 타당한 결론에 도달할 수 있다."][Math.floor(Date.now()/3600000)%4];return <section className="home-dashboard"><div className="home-top"><section className="card sentence-card"><div className="card-title-row"><div><h2>오늘의 문장</h2><p className="muted">문장의 구조와 의미를 천천히 살펴보세요.</p></div><span className="line-icon-wrap"><NavIcon name="book"/></span></div><p className="daily-sentence-text">{sentence}</p></section><div className="home-side"><section className="card schedule-card"><div className="card-title-row"><h2>오늘의 일정</h2><NavIcon name="calendar"/></div>{upcoming.length?<div className="schedule-list">{upcoming.map((t:any)=><div className="schedule-item" key={t.id}><div><b>{t.title}</b><span>{t.due}</span></div><span className="badge">{(t.statusByUser?.[me]||"미제출").trim()}</span></div>)}</div>:<div className="empty compact">예정된 일정이 없습니다.</div>}<button className="outline full-btn" onClick={()=>{}}>일정 보기</button></section><section className="card progress-card"><div><h2>내 숙제 진행률</h2><p className="muted">완료 {completed} / 전체 {total}</p><p className="progress-sub">제출·검토 포함 {submitted}건</p></div><div className="donut" style={{"--progress":`${pct*3.6}deg`} as any}><div><strong>{pct}%</strong><span>완료</span></div></div></section></div></div><section className="card homework-strip"><div className="card-title-row"><div><h2>가장 임박한 숙제</h2><p className="muted">마감일이 가까운 숙제입니다.</p></div><span className="muted">{assignedTasks.length}건</span></div>{upcoming.length?<div className="home-task-list">{upcoming.map((t:any)=><div className="home-task-item" key={t.id}><div><b>{t.title}</b><span>{t.subject||"-"} · 마감 {t.due}</span></div><span className="badge">{(t.statusByUser?.[me]||"미제출").trim()}</span></div>)}</div>:<div className="empty compact">등록된 숙제가 없습니다.</div>}</section><section className="card notice-card"><div className="card-title-row"><h2>공지사항</h2><span className="muted">최근 알림 {notifications.filter((n:any)=>!n.read).length}건</span></div><div className="notice-row"><span>숙제와 일정은 각 메뉴에서 자세히 확인할 수 있습니다.</span><span className="muted">{createdTasks.length}개 출제</span></div></section></section>}
function Stat({label,value,icon}:{label:string;value:number;icon:string})`);
}
fs.writeFileSync(f,s);

const cssFile=path.join(process.cwd(),"app","globals.css");
let css=fs.readFileSync(cssFile,"utf8");
if(!css.includes("FINAL-CLEAN-DASHBOARD")){
 css+=`
/* FINAL-CLEAN-DASHBOARD */
.page-title{display:flex;align-items:center;gap:10px}
.line-icon{width:21px;height:21px;display:block;flex:none}
.nav button{display:flex;align-items:center;gap:13px;font-size:15px;color:#222}
.nav button .line-icon{width:20px;height:20px}
.nav .active{background:#111!important;color:#fff!important}
.notification-bell{display:inline-flex;align-items:center;gap:7px}
.home-dashboard{display:grid;gap:18px}
.home-top{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(330px,.8fr);gap:18px}
.sentence-card{min-height:235px;padding:26px}
.card-title-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
.card-title-row h2{margin:0;font-size:20px}
.card-title-row p{margin:5px 0 0}
.line-icon-wrap{display:grid;place-items:center;width:38px;height:38px;border:1px solid #111;border-radius:10px}
.daily-sentence-text{font-size:23px;line-height:1.8;font-weight:700;margin:34px 0 0;letter-spacing:-.02em}
.home-side{display:grid;gap:18px}
.schedule-card,.progress-card{padding:22px}
.schedule-list{display:grid;gap:8px;margin:18px 0 12px}
.schedule-item,.home-task-item{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #ddd;padding:10px 0}
.schedule-item:last-child,.home-task-item:last-child{border-bottom:0}
.schedule-item div,.home-task-item div{display:grid;gap:4px;min-width:0}
.schedule-item span:not(.badge),.home-task-item span:not(.badge){font-size:12px;color:#777}
.full-btn{width:100%;margin-top:4px}
.progress-card{display:flex;align-items:center;justify-content:space-between;gap:18px}
.progress-card h2{margin:0 0 7px}
.progress-sub{font-size:12px;color:#777;margin:6px 0 0}
.donut{width:128px;height:128px;flex:none;border-radius:50%;background:conic-gradient(#111 var(--progress),#e2e2e2 var(--progress));display:grid;place-items:center;position:relative}
.donut:before{content:"";position:absolute;inset:12px;border-radius:50%;background:#fff}
.donut>div{position:relative;z-index:1;text-align:center;display:grid;gap:2px}
.donut strong{font-size:25px}
.donut span{font-size:11px;color:#777}
.homework-strip,.notice-card{padding:22px}
.home-task-list{display:grid;gap:0;margin-top:10px}
.notice-row{margin-top:12px;padding-top:14px;border-top:1px solid #ddd;display:flex;justify-content:space-between;gap:12px}
.compact{padding:22px 0}
@media(max-width:1000px){.home-top{grid-template-columns:1fr}.home-side{grid-template-columns:1fr 1fr}}
@media(max-width:650px){.home-side{grid-template-columns:1fr}.daily-sentence-text{font-size:18px;line-height:1.7}.sentence-card{min-height:0}.progress-card{align-items:flex-start}.donut{width:105px;height:105px}.donut:before{inset:10px}.nav button{gap:10px}.notice-row{display:grid}}
`;
}
fs.writeFileSync(cssFile,css);
