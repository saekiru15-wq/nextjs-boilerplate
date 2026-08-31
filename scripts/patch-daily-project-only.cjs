const fs=require('fs'),path=require('path');
const page=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(page,'utf8');

// ADDITIVE ONLY: add one navigation item and one isolated Daily Project view.
if(!s.includes('📚 데일리 프로젝트')){
  s=s.replace(/const MENU = \[[^;]+\];/,m=>m.replace('"🔔 알림"','"📚 데일리 프로젝트", "🔔 알림"'));
}

if(!s.includes('dailyProjectWords')){
  const state=' const[dailyProjectWords,setDailyProjectWords]=useState<{word:string;meaning:string}[]>([]),[dailyProjectLoading,setDailyProjectLoading]=useState(false);\n';
  s=s.replace(' const[aiText,setAiText]=useState("")',state+' const[aiText,setAiText]=useState("")');
}

if(!s.includes('daily-vocab-2200.json')){
  const effect=' useEffect(()=>{if(active!=="📚 데일리 프로젝트"||dailyProjectWords.length||dailyProjectLoading)return;setDailyProjectLoading(true);fetch("/daily-vocab-2200.json",{cache:"no-store"}).then(r=>r.ok?r.json():[]).then(v=>setDailyProjectWords(Array.isArray(v)?v:[])).catch(()=>setDailyProjectWords([])).finally(()=>setDailyProjectLoading(false))},[active,dailyProjectWords.length,dailyProjectLoading]);\n';
  s=s.replace(' useEffect(()=>{refresh()},[]);',' useEffect(()=>{refresh()},[]);\n'+effect);
}

if(!s.includes('<DailyProject words={dailyProjectWords}')){
  s=s.replace('{active==="🤖 AI 학습도우미"&&<section className="card ai">','{active==="📚 데일리 프로젝트"&&<DailyProject words={dailyProjectWords} loading={dailyProjectLoading}/>} {active==="🤖 AI 학습도우미"&&<section className="card ai">');
  s += '\nfunction DailyProject({words,loading}:{words:{word:string;meaning:string}[];loading:boolean}){const today=new Date().toISOString().slice(0,10);const daily=useMemo(()=>{if(!words.length)return[];let seed=2166136261;for(const ch of today)seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;const pool=words.map((_,i)=>i),out:{word:string;meaning:string}[]=[];while(pool.length&&out.length<30){seed=(Math.imul(seed,1664525)+1013904223)>>>0;out.push(words[pool.splice(seed%pool.length,1)[0]])}return out},[words,today]);return <section><div className="section-heading"><div><h2>📚 데일리 프로젝트</h2><p className="muted">오늘의 랜덤 영단어 30개</p></div><span className="badge green">{today}</span></div><section className="card daily-project-card">{loading?<Empty text="단어를 불러오는 중입니다..."/>:daily.length?<div className="daily-project-list">{daily.map((v,i)=><div className="daily-project-word" key={i}><span>{i+1}</span><b>{v.word}</b><span>{v.meaning}</span></div>)}</div>:<Empty text="단어장을 불러오지 못했습니다."/>}</section></section>}\n';
}

const cssFile=path.join(process.cwd(),'app','globals.css');
let css=fs.readFileSync(cssFile,'utf8');
if(!css.includes('.daily-project-card')){
  css+='\n.daily-project-card{padding:0}.daily-project-list{display:grid}.daily-project-word{display:grid;grid-template-columns:42px minmax(120px,.8fr) 1.8fr;gap:14px;align-items:center;padding:16px;border-bottom:1px solid var(--line)}.daily-project-word:last-child{border-bottom:0}.daily-project-word>span:first-child{color:var(--muted)}.daily-project-word>span:last-child{color:var(--muted)}@media(max-width:600px){.daily-project-word{grid-template-columns:34px 1fr;gap:6px 10px}.daily-project-word>span:last-child{grid-column:2}}';
}
fs.writeFileSync(page,s);fs.writeFileSync(cssFile,css);
console.log('[daily-project-only] added isolated Daily Project feature');
