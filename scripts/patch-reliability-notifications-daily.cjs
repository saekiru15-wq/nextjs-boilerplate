const fs=require('fs'),path=require('path');
const f=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(f,'utf8');

// Reliable same-origin session transport for homework create/submit.
s=s.replace('async function rpc(fn:string,args:Obj={}){const r=await fetch("/api/rpc",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fn,args})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error||"요청에 실패했습니다.");return d}',
'async function rpc(fn:string,args:Obj={}){const token=typeof window!=="undefined"?sessionStorage.getItem("mentor_token"):null;const headers:Record<string,string>={"Content-Type":"application/json"};if(token)headers["x-mentor-token"]=token;const r=await fetch("/api/rpc",{method:"POST",credentials:"include",headers,body:JSON.stringify({fn,args})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error||"요청에 실패했습니다.");if((fn==="app_login"||fn==="app_register")&&typeof d?.token==="string")sessionStorage.setItem("mentor_token",d.token);return d}');

// Make notification badge a real red unread count.
s=s.replace('<button className="icon-btn" onClick={()=>setActive("🔔 알림")}>🔔 {notifications.filter((n:any)=>!n.read).length}</button>',
'<button className="icon-btn notification-bell" aria-label="알림" onClick={()=>setActive("🔔 알림")}>🔔 {notifications.filter((n:any)=>!n.read).length>0&&<span className="notification-badge">{notifications.filter((n:any)=>!n.read).length}</span>}</button>');

// Add per-notification read helper.
if(!s.includes('async function readNotification(')){
  s=s.replace('async function askAI(e:FormEvent){','async function readNotification(n:any){if(n.read)return;try{await rpc("app_mark_notifications_read",{p_ids:[Number(n.id)]});await refresh()}catch(e:any){toast(e?.message||"알림 읽음 처리에 실패했습니다.")}}\n async function askAI(e:FormEvent){');
}

// Replace notification cards with clickable read behavior.
s=s.replace('<div className="post" key={n.id}><b>{n.title}</b><div className="muted">{n.body}</div></div>',
'<button type="button" className={"post notification-item "+(!n.read?"unread":"")} key={n.id} onClick={()=>readNotification(n)}><b>{n.title}</b><div className="muted">{n.body}</div>{!n.read&&<span className="notification-new">새 알림</span>}</button>');

// Daily Project menu and screen shell.
if(!s.includes('📚 데일리 프로젝트')){
  s=s.replace('const MENU = ["🏠 홈", "📤 숙제 내기", "📥 숙제 제출", "❓ 질문게시판", "📅 캘린더", "💬 개인채팅", "🤖 AI 학습도우미", "🔔 알림"];',
  'const MENU = ["🏠 홈", "📤 숙제 내기", "📥 숙제 제출", "❓ 질문게시판", "📅 캘린더", "💬 개인채팅", "📚 데일리 프로젝트", "🤖 AI 학습도우미", "🔔 알림"];');
  s=s.replace('const[aiText,setAiText]=useState(""),',
  'const[dailyAll,setDailyAll]=useState<{word:string;meaning:string}[]>([]),[dailyLoading,setDailyLoading]=useState(false);\n const[aiText,setAiText]=useState(""),');
  s=s.replace('useEffect(()=>{refresh()},[]);',
  'useEffect(()=>{refresh()},[]);useEffect(()=>{if(active!=="📚 데일리 프로젝트"||dailyAll.length||dailyLoading)return;setDailyLoading(true);fetch("/bjhs-vocab.json",{cache:"no-store"}).then(r=>r.ok?r.json():[]).then(v=>setDailyAll(Array.isArray(v)?v:[])).catch(()=>setDailyAll([])).finally(()=>setDailyLoading(false))},[active,dailyAll.length,dailyLoading]);');
  s=s.replace('{active==="🤖 AI 학습도우미"&&<section className="card ai">',
  '{active==="📚 데일리 프로젝트"&&<DailyProject words={dailyAll} loading={dailyLoading}/>} {active==="🤖 AI 학습도우미"&&<section className="card ai">');
  s+='\nfunction DailyProject({words,loading}:{words:{word:string;meaning:string}[];loading:boolean}){const today=new Date().toISOString().slice(0,10);const daily=useMemo(()=>{if(!words.length)return[];let seed=Array.from(today).reduce((a,c)=>((a*31+c.charCodeAt(0))>>>0),2166136261);const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};const pool=words.map((_,i)=>i),out:{word:string;meaning:string}[]=[];while(pool.length&&out.length<30){out.push(words[pool.splice(Math.floor(rnd()*pool.length),1)[0]])}return out},[words,today]);return <section className="daily-project"><div className="section-heading"><div><h2>📚 데일리 프로젝트</h2><p className="muted">오늘의 랜덤 영단어 30개 · 홈에는 표시되지 않습니다.</p></div><span className="badge green">{today}</span></div><div className="daily-card card">{loading?<Empty text="오늘의 단어를 준비하는 중입니다..."/>:daily.length?<div className="daily-list">{daily.map((v,i)=><div className="daily-word" key={i}><span className="daily-no">{i+1}</span><b>{v.word}</b><span>{v.meaning}</span></div>)}</div>:<Empty text="단어장을 불러오지 못했습니다."/>)}</div></section>}\n';
}

fs.writeFileSync(f,s);

const c=path.join(process.cwd(),'app','globals.css');
let css=fs.readFileSync(c,'utf8');
if(!css.includes('notification-badge')){
css+='\n/* notification badge + daily project */\n.notification-bell{position:relative}.notification-badge{position:absolute;right:-6px;top:-7px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#dc2626;color:#fff;font-size:11px;font-weight:800;display:grid;place-items:center;border:2px solid var(--card)}.notification-item{width:100%;border:0;text-align:left;position:relative;cursor:pointer;font:inherit;color:inherit}.notification-item.unread{border-left:4px solid #dc2626}.notification-new{display:inline-block;margin-top:7px;font-size:11px;color:#dc2626;font-weight:700}.daily-card{padding:0}.daily-list{display:grid}.daily-word{display:grid;grid-template-columns:42px minmax(120px,.8fr) 1.8fr;gap:14px;align-items:center;padding:16px;border-bottom:1px solid var(--line)}.daily-word:last-child{border-bottom:0}.daily-no{color:var(--muted);font-variant-numeric:tabular-nums}.daily-word b{font-size:17px}.daily-word span:last-child{color:var(--muted)}@media(max-width:600px){.daily-word{grid-template-columns:34px 1fr;gap:6px 10px}.daily-word span:last-child{grid-column:2}.notification-badge{right:-4px}}';
fs.writeFileSync(c,css);
}
console.log('[reliability] session fallback, notification badge/read state, daily project shell applied');