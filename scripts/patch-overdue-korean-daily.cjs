const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx"); let s=fs.readFileSync(f,"utf8");
s=s.replace('const me=state?.me||"",users=', 'const nowKey=new Date().toISOString().slice(0,10), me=state?.me||"",users=');
s=s.replace('assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)),createdTasks=', 'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출")!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출")==="미제출"),createdTasks=');
s=s.replace('{active==="📥 숙제 제출"&&<section>', '{active==="📥 숙제 제출"&&<section>');
if(!s.includes('active==="📚 데일리 프로젝트"')){}
s=s.replace('<p>숙제와 질문, 일정과 개인채팅을 한곳에서 관리하세요.</p></section>', '<p>숙제와 질문, 일정과 개인채팅을 한곳에서 관리하세요.</p></section>{overdueTasks.length>0&&<section className="card"><h2>📌 밀린 숙제</h2><p className="muted">마감기한이 지난 미제출 과제입니다.</p><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}');
const marker='{active==="🤖 AI 학습도우미"&&<section className="card ai">';
if(!s.includes('오늘의 문장')){
 s=s.replace(marker,'<section className="card"><h2>오늘의 문장</h2><p>늦은 오후가 되자 학생들은 도서관 창가에 모여 서로의 생각을 조심스럽게 나누었다.</p><p className="muted smalltext">형태소 분석 연습에 활용해 보세요.</p></section>'+marker);
}
fs.writeFileSync(f,s);
