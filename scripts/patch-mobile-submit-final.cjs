const fs=require('fs'),path=require('path');
const f=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(f,'utf8');

// Install mobile drawer state once.
if(!s.includes('mobileMenu,setMobileMenu')) s=s.replace('export default function Home(){','export default function Home(){\n const[mobileMenu,setMobileMenu]=useState(false);');

// Close the drawer whenever a navigation item is selected.
s=s.replace('onClick={()=>setActive(m)}>{m}</button>','onClick={()=>{setActive(m);setMobileMenu(false)}}>{m}</button>');

// Add an explicit close button to the drawer.
if(!s.includes('className="mobile-close"')) s=s.replace('<aside className="sidebar">','<aside className={"sidebar "+(mobileMenu?"mobile-open":"")}><button type="button" className="mobile-close" aria-label="메뉴 닫기" onClick={()=>setMobileMenu(false)}>×</button>');

// Add a high-z-index hamburger button and a click-capturing backdrop.
if(!s.includes('className="hamburger"')) s=s.replace('<main className="main"><header className="topbar"><h1>{active}</h1>','<main className="main"><header className="topbar"><button type="button" className="hamburger" aria-label="메뉴 열기" aria-expanded={mobileMenu} onClick={()=>setMobileMenu(true)}>☰</button><h1>{active}</h1>');
if(!s.includes('className="mobile-backdrop"')) s=s.replace('</aside><main className="main">','</aside>{mobileMenu&&<button type="button" className="mobile-backdrop" aria-label="메뉴 닫기" onClick={()=>setMobileMenu(false)}/>}<main className="main">');

// Keep every submission field in parent state using functional updates so one field can never overwrite another.
const listRe=/function TaskSubmitList\([\s\S]*?\nfunction CreatedTaskList/;
const listFn=`function TaskSubmitList({tasks,me,files,setFiles,memos,setMemos,titles,setTitles,bodies,setBodies,submit,users}:{tasks:any[];me:string;files:Record<string,File[]>;setFiles:(v:any)=>void;memos:Record<string,string>;setMemos:(v:any)=>void;titles:Record<string,string>;setTitles:(v:any)=>void;bodies:Record<string,string>;setBodies:(v:any)=>void;submit:(t:any)=>void;users:any[]}){return <section className="card">{tasks.length?tasks.map((t:any)=>{const key=String(t.id),status=t.statusByUser?.[me]||"미제출";return <article className="task task-large" key={t.id}><div className="task-main"><div className="section-title"><div><b>{t.title}</b><div className="muted smalltext">과목: {t.subject||"-"} · 출제자: {userLabel(users.find((u:any)=>u.id===t.creatorId))} · 마감: {t.due||"-"}</div></div><span className={\`badge \${statusClass(status)}\`}>{status}</span></div><div className="task-desc">{t.desc||t.description||"내용 없음"}</div><AttachmentList attachments={t.attachments}/>{t.feedbackByUser?.[me]&&<div className="feedback">피드백: {t.feedbackByUser[me]}</div>}{status!=="완료"&&<form className="submission-form" onSubmit={e=>{e.preventDefault();submit(t)}}><div className="submission-owner"><b>제출자</b> {userLabel(users.find((u:any)=>u.id===me))}</div><input placeholder="제출 제목" value={titles[key]||""} onChange={e=>setTitles((v:any)=>({...v,[key]:e.target.value}))} required/><textarea placeholder="제출 내용" value={bodies[key]||""} onChange={e=>setBodies((v:any)=>({...v,[key]:e.target.value}))} required/><textarea placeholder="제출 메모(선택)" value={memos[key]||""} onChange={e=>setMemos((v:any)=>({...v,[key]:e.target.value}))}/><FilePicker files={files[key]||[]} setFiles={f=>setFiles((v:any)=>({...v,[key]:f})}/><button type="submit" className="outline" disabled={!titles[key]?.trim()||!bodies[key]?.trim()}>제출하기</button></form>}</div></article>}) : <Empty text="현재 나에게 배정된 숙제가 없습니다."/>}</section>}
function CreatedTaskList`;
if(listRe.test(s)) s=s.replace(listRe,listFn);

fs.writeFileSync(f,s);

const cssFile=path.join(process.cwd(),'app','globals.css');
let css=fs.readFileSync(cssFile,'utf8');
const mobileCss=`\n/* Mobile drawer interaction fix */\n@media(max-width:768px){.hamburger{display:inline-flex!important;position:relative!important;z-index:10002!important;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--fg);font-size:21px;margin-right:8px;cursor:pointer;touch-action:manipulation}.topbar{position:relative!important;z-index:10002!important;display:flex!important;align-items:center!important}.sidebar{position:fixed!important;left:0!important;top:0!important;bottom:0!important;width:min(82vw,320px)!important;z-index:10004!important;transform:translate3d(-110%,0,0)!important;transition:transform .18s ease!important;visibility:hidden!important;pointer-events:none!important}.sidebar.mobile-open{transform:translate3d(0,0,0)!important;visibility:visible!important;pointer-events:auto!important}.mobile-close{display:flex!important;align-items:center;justify-content:center;position:absolute;right:12px;top:12px;width:36px;height:36px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--fg);font-size:22px;line-height:1;z-index:10006!important;cursor:pointer;pointer-events:auto!important;touch-action:manipulation}.mobile-backdrop{display:block!important;position:fixed!important;inset:0!important;border:0!important;padding:0!important;margin:0!important;background:rgba(0,0,0,.35)!important;z-index:10003!important;cursor:pointer}.sidebar.mobile-open~.mobile-backdrop{display:block!important}.main{width:100%!important;margin-left:0!important}.submission-form{width:100%;box-sizing:border-box}.submission-form input,.submission-form textarea{width:100%;box-sizing:border-box}}\n`;
if(!css.includes('Mobile drawer interaction fix')){css+=mobileCss;fs.writeFileSync(cssFile,css)}
console.log('[mobile-submit-final] applied');
