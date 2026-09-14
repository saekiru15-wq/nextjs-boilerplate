const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx"); let s=fs.readFileSync(f,"utf8");
const sentence='<section className="card daily-sentence"><h2>오늘의 문장</h2><p>회의가 끝난 뒤에도 예상하지 못했던 문제가 계속 발견되어, 담당자는 이미 수정한 부분까지 다시 살펴보아야 했다.</p><p className="muted smalltext">형태소 분석 연습에 활용해 보세요.</p></section>';
const badStart=s.indexOf('<section className="card"><h2>오늘의 문장</h2>');
if(badStart>=0){const badEnd=s.indexOf('</section>',badStart); if(badEnd>=0)s=s.slice(0,badStart)+s.slice(badEnd+10);}
s=s.replace('const nowKey=new Date().toISOString().slice(0,10), me=state?.me||"",users=', 'const nowKey=new Date().toISOString().slice(0,10), me=state?.me||"",users=');
if(!s.includes('overdueTasks=')) s=s.replace('assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)),createdTasks=', 'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출"),createdTasks=');
const ai='{active==="🤖 AI 학습도우미"&&<section className="card ai">';
if(!s.includes('daily-sentence')) s=s.replace(ai,sentence+ai);
const overdueBlock='{active==="🏠 홈"&&overdueTasks.length>0&&<section className="card"><h2>📌 밀린 숙제</h2><p className="muted">마감기한이 지난 미제출 과제입니다.</p><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}' ; const homeMarker='{active==="🏠 홈"&&<><section className="hero">' ; s=s.replace(homeMarker,homeMarker).replace('</section><div className="grid">','</section>'+overdueBlock+'<div className="grid">',1);fs.writeFileSync(f,s);return;}
