const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx"); let s=fs.readFileSync(f,"utf8");
const sentence='<section className="card daily-sentence"><h2>오늘의 문장</h2><p>예상했던 것과 달리 비가 그치지 않자, 우산을 챙겨 나가려던 학생들은 결국 계획을 바꾸어 집에 남기로 했다.</p><p className="muted smalltext">형태소 분석 연습에 활용해 보세요.</p></section>';
const badStart=s.indexOf('<section className="card"><h2>오늘의 문장</h2>');
if(badStart>=0){const badEnd=s.indexOf('</section>',badStart); if(badEnd>=0)s=s.slice(0,badStart)+s.slice(badEnd+10);}
s=s.replace('const nowKey=new Date().toISOString().slice(0,10), me=state?.me||"",users=', 'const nowKey=new Date().toISOString().slice(0,10), me=state?.me||"",users=');
if(!s.includes('overdueTasks=')) s=s.replace('assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)),createdTasks=', 'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출"),createdTasks=');
const ai='{active==="🤖 AI 학습도우미"&&<section className="card ai">';
if(!s.includes('daily-sentence')) s=s.replace(ai,sentence+ai);
fs.writeFileSync(f,s);
