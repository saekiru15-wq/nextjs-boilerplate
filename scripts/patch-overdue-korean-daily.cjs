const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let s=fs.readFileSync(f,"utf8");
if(!s.includes("const nowKey=")) s=s.replace("export default function Home(){","export default function Home(){ const nowKey=new Date().toISOString().slice(0,10);");

// Remove only the accidental daily-sentence/overdue fragments from earlier attempts.
s=s.replace(/<section className="card daily-sentence">[\s\S]*?<\/section>/g,"");
s=s.replace(/<div className="daily-sentence">[\s\S]*?<\/div>/g,"");
s=s.replace(/\{overdueTasks\.length>0&&<section className="card">[\s\S]*?<\/section>\}/g,"");

// Classify overdue, still-unsubmitted assigned tasks separately.
if(!s.includes("overdueTasks=")){
 s=s.replace(
  'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me))',
  'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출")'
 );
}

// Replace the rendered English sentence block only (never touch source state declarations).
const old='<section className="hero"><h2>오늘의 영어 문장</h2><div className="daily-english"><b>{dailyEnglish[0]}</b><p>{dailyEnglish[1]}</p></div></section>';
const neu='<section className="hero"><h2>오늘의 문장</h2><div className="daily-english"><p>회의가 끝난 뒤에도 예상하지 못했던 문제가 계속 발견되어, 담당자는 이미 수정한 부분까지 다시 살펴보아야 했다.</p></div></section>';
if(s.includes(old)) s=s.replace(old,neu);

// Add overdue section to home, separate from the daily sentence.
const homeEnd='</section><div className="grid">';
const overdue='{overdueTasks.length>0&&<section className="card"><h2>📌 밀린 숙제</h2><p className="muted">마감기한이 지난 미제출 과제입니다.</p><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}';
if(!s.includes('📌 밀린 숙제')&&s.includes(homeEnd)) s=s.replace(homeEnd,'</section>'+overdue+'<div className="grid">',1);

fs.writeFileSync(f,s);
