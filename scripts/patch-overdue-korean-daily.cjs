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
const neu='<section className="hero"><h2>오늘의 문장</h2><div className="daily-english"><p>{["정부가 새로운 정책을 시행하기에 앞서 예상되는 부작용을 충분히 검토하지 않는다면, 문제를 해결하려던 조치가 오히려 다른 문제를 초래할 가능성도 배제하기 어렵다.","겉으로 드러난 결과만을 근거로 현상의 원인을 단정해서는 안 되며, 서로 다른 요인이 어떤 방식으로 상호작용했는지를 함께 살펴볼 필요가 있다.","많은 사람들이 효율성을 높이기 위해 선택한 방법이라도 특정한 상황에서는 오히려 예상보다 큰 비용을 발생시킬 수 있다는 점을 고려해야 한다.","연구자는 자신의 가설과 일치하는 자료만을 선택적으로 해석하기보다, 그 가설을 반박할 가능성이 있는 증거까지 검토해야 보다 타당한 결론에 도달할 수 있다."][Math.floor(new Date().getTime()/3600000)%4]}</p></div></section>';
if(s.includes(old)) s=s.replace(old,neu);

// Add overdue section to home, separate from the daily sentence.
const homeEnd='</section><div className="grid">';
const overdue='{overdueTasks.length>0&&<section className="card"><h2>📌 밀린 숙제</h2><p className="muted">마감기한이 지난 미제출 과제입니다.</p><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}';
if(!s.includes('📌 밀린 숙제')&&s.includes(homeEnd)) s=s.replace(homeEnd,'</section>'+overdue+'<div className="grid">',1);

fs.writeFileSync(f,s);
