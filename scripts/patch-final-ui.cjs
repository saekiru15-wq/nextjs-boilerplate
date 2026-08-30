const fs=require('fs'),path=require('path');
const f=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(f,'utf8');

// Inject UI state inside the component so it survives all earlier build-time patches.
if(!s.includes('const[aiModel,setAiModel]=useState("gemini-2.5-flash-lite")')){
  s=s.replace('export default function Home(){','export default function Home(){\n const[mobileMenu,setMobileMenu]=useState(false),[aiModel,setAiModel]=useState("gemini-2.5-flash-lite");');
}
s=s.replace('body:JSON.stringify({message:text,history})','body:JSON.stringify({message:text,history,model:aiModel})');

// Question board only: old 국어&과학 choice is shown/stored as 과학.
if(!s.includes('const QUESTION_SUBJECTS')) s=s.replace('const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];','const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];\nconst QUESTION_SUBJECTS = ["과학", "수학", "사회", "영어&한국사", "국어"];');
s=s.replace('const[qSubject,setQSubject]=useState(SUBJECTS[0])','const[qSubject,setQSubject]=useState(QUESTION_SUBJECTS[0])');
s=s.replace('<select value={qSubject} onChange={e=>setQSubject(e.target.value)}>{SUBJECTS.map','<select value={qSubject} onChange={e=>setQSubject(e.target.value)}>{QUESTION_SUBJECTS.map');
s=s.replace('{q.subject||"전체"}','{q.subject==="국어&과학"?"과학":q.subject||"전체"}');

// AI Light/Pro selector. Light is the default.
if(!s.includes('className="ai-model-switch"')){
  s=s.replace('<div className="content">{error&&','<div className="content">{active==="🤖 AI 학습도우미"&&<div className="ai-model-switch"><span>AI 모드</span><button type="button" className={aiModel==="gemini-2.5-flash-lite"?"active":""} onClick={()=>setAiModel("gemini-2.5-flash-lite")}>Light</button><button type="button" className={aiModel==="gemini-2.5-pro"?"active":""} onClick={()=>setAiModel("gemini-2.5-pro")}>Pro</button><small>{aiModel==="gemini-2.5-pro"?"복잡한 추론에 더 강한 Pro":"빠르고 가벼운 Light"}</small></div>}{error&&');
}

// Mobile hamburger/drawer.
s=s.replace('<aside className="sidebar">','<aside className={"sidebar "+(mobileMenu?"mobile-open":"")}><button className="mobile-close" onClick={()=>setMobileMenu(false)}>×</button>');
s=s.replace('onClick={()=>setActive(m)}>{m}</button>','onClick={()=>{setActive(m);setMobileMenu(false)}}>{m}</button>');
s=s.replace('<main className="main"><header className="topbar"><h1>{active}</h1>','<main className="main"><header className="topbar"><button className="hamburger" type="button" aria-label="메뉴" onClick={()=>setMobileMenu(v=>!v)}>☰</button><h1>{active}</h1>');

// Calendar detail gets submit and close buttons.
s=s.replace('function Calendar({month,setMonth,events,users}:{month:Date;setMonth:(d:Date)=>void;events:any[];users:any[]})','function Calendar({month,setMonth,events,users,setActive}:{month:Date;setMonth:(d:Date)=>void;events:any[];users:any[];setActive:(m:string)=>void})');
s=s.replace('<button className="primary" onClick={()=>setSelected(null)}>닫기</button>','<div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:18}}><button className="outline" onClick={()=>setSelected(null)}>닫기</button><button className="primary" onClick={()=>{setActive("📥 숙제 제출");setSelected(null)}}>제출하기</button></div>');
s=s.replace('<Calendar month={month} setMonth={setMonth} events={calendar} users={users}/>','<Calendar month={month} setMonth={setMonth} events={calendar} users={users} setActive={setActive}/>');

// Task-target editing: explicit checkboxes for adding/removing students.
s=s.replace("else if(x.type==='multiselect'){el=document.createElement('select');el.multiple=true;el.size=Math.min(7,Math.max(4,(x.options||[]).length));(x.options||[]).forEach(o=>{const op=document.createElement('option');op.value=String(o.value);op.textContent=String(o.label);op.selected=(x.value||[]).includes(String(o.value));el.appendChild(op)})}","else if(x.type==='multiselect'){el=document.createElement('div');el.style.cssText='display:grid;gap:8px;padding:10px;border:1px solid var(--line);border-radius:10px';(x.options||[]).forEach(o=>{const lab2=document.createElement('label');lab2.style.cssText='display:flex;align-items:center;gap:8px;color:var(--fg);font-size:14px;cursor:pointer';const cb=document.createElement('input');cb.type='checkbox';cb.value=String(o.value);cb.checked=(x.value||[]).includes(String(o.value));lab2.append(cb,document.createTextNode(String(o.label)));el.appendChild(lab2)})}");
s=s.replace("else if(v.multiple&&v.tagName==='SELECT'){out[k]=Array.from(v.selectedOptions||[]).map(o=>String(o.value))}","else if(v.dataset&&v.dataset.multiselect==='1'){out[k]=Array.from(v.querySelectorAll('input[type=checkbox]:checked')).map((o:any)=>String(o.value))}");
s=s.replace("vals[x.key]=el});","if(x.type==='multiselect')el.dataset.multiselect='1';vals[x.key]=el});");
fs.writeFileSync(f,s);

const cssFile=path.join(process.cwd(),'app','globals.css');
let css=fs.readFileSync(cssFile,'utf8');
const mobileCss=`
/* Final mobile navigation/auth and AI model selector */
.hamburger,.mobile-close{display:none}
.ai-model-switch{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 16px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card)}
.ai-model-switch button{border:1px solid var(--line);background:transparent;color:var(--fg);border-radius:999px;padding:7px 13px;cursor:pointer}
.ai-model-switch button.active{background:var(--accent,#6d5dfc);color:#fff;border-color:transparent}
.ai-model-switch small{color:var(--muted);font-size:12px}
@media(max-width:768px){
  .hamburger{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--fg);font-size:21px;cursor:pointer;margin-right:8px}
  .sidebar{position:fixed!important;inset:0 auto 0 0!important;width:min(82vw,320px)!important;z-index:10000!important;transform:translateX(-105%);transition:transform .18s ease;box-shadow:20px 0 50px rgba(0,0,0,.18)}
  .sidebar.mobile-open{transform:translateX(0)}
  .mobile-close{display:flex;align-items:center;justify-content:center;position:absolute;right:12px;top:12px;width:36px;height:36px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--fg);font-size:22px;cursor:pointer}
  .main{width:100%!important;margin-left:0!important}
  .topbar{position:sticky;top:0;z-index:50}
  .topbar h1{font-size:20px}
  .auth-page{min-height:100dvh!important;min-height:100vh!important;display:grid!important;place-items:center!important;padding:16px!important;box-sizing:border-box!important}
  .auth-card{position:fixed!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(420px,calc(100vw - 32px))!important;max-height:calc(100dvh - 32px);overflow:auto;margin:0!important;box-sizing:border-box}
  .content{padding:14px!important}
}
`;
if(!css.includes('Final mobile navigation/auth and AI model selector')){css+=mobileCss;fs.writeFileSync(cssFile,css)}
console.log('[final-ui] mobile nav, question subject mapping, calendar submit action, AI model selector and task-target checkboxes applied');
