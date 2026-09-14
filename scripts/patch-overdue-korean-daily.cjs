const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let s=fs.readFileSync(f,"utf8");

// Remove any previously injected daily sentence and overdue block.
s=s.replace(/<section className="card daily-sentence">[\s\S]*?<\/section>/g,"");
s=s.replace(/\{active==="🏠 홈"&&overdueTasks\.length>0&&<section className="card">[\s\S]*?<\/section>\}/g,"");

// Keep overdue tasks out of the normal submission list.
s=s.replace(
  'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me))',
  'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출")'
);

// Add today's Korean morphology-practice sentence only to the home hero.
const sentence='<div className="daily-sentence"><h3>오늘의 문장</h3><p>회의가 끝난 뒤에도 예상하지 못했던 문제가 계속 발견되어, 담당자는 이미 수정한 부분까지 다시 살펴보아야 했다.</p></div>';
const marker='<p>숙제와 질문, 일정과 개인채팅을 한곳에서 관리하세요.</p>';
if(!s.includes('className="daily-sentence"')&&s.includes(marker)) s=s.replace(marker,marker+sentence);

// Put overdue tasks in a separate section on the home page, never inside the daily sentence.
const homeClose='</section><div className="grid">';
const overdue='{overdueTasks.length>0&&<section className="card"><h2>📌 밀린 숙제</h2><p className="muted">마감기한이 지난 미제출 과제입니다.</p><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}';
if(!s.includes('📌 밀린 숙제')&&s.includes(homeClose)) s=s.replace(homeClose,'</section>'+overdue+'<div className="grid">');

fs.writeFileSync(f,s);
