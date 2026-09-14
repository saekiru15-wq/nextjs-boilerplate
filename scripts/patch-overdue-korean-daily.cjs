const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let s=fs.readFileSync(f,"utf8");

// Remove accidental/duplicate daily-sentence and overdue injections from previous patch attempts.
s=s.replace(/<section className="card daily-sentence">[\s\S]*?<\/section>/g,"");
s=s.replace(/<div className="daily-sentence">[\s\S]*?<\/div>/g,"");
s=s.replace(/\{overdueTasks\.length>0&&<section className="card">[\s\S]*?<\/section>\}/g,"");

// Reclassify only overdue, still-unsubmitted tasks.
if(!s.includes("overdueTasks=")){
  s=s.replace(
    'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me))',
    'assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출")'
  );
}

// Replace the old English sentence if present, otherwise add the Korean sentence to the home hero.
const sentence='<div className="daily-sentence"><h3>오늘의 문장</h3><p>회의가 끝난 뒤에도 예상하지 못했던 문제가 계속 발견되어, 담당자는 이미 수정한 부분까지 다시 살펴보아야 했다.</p></div>';
const english=/오늘의 영어 문장[\s\S]{0,500}/;
if(english.test(s)) s=s.replace(english,sentence);
else {
  const marker='<p>숙제와 질문, 일정과 개인채팅을 한곳에서 관리하세요.</p>';
  if(!s.includes('className="daily-sentence"')&&s.includes(marker)) s=s.replace(marker,marker+sentence);
}

fs.writeFileSync(f,s);
