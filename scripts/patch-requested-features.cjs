const fs=require("fs"),path=require("path");
const page=path.join(process.cwd(),"app","page.tsx");
const cssFile=path.join(process.cwd(),"app","globals.css");
let s=fs.readFileSync(page,"utf8");

if(!s.includes("const BOARD_SUBJECTS")){
  s=s.replace(
    'const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];',
    'const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];\nconst BOARD_SUBJECTS = ["전체", "국어", "수학", "과학", "사회", "영어"];\nconst boardSubject = (v:any) => { const x=String(v||""); return x.includes("국어") ? ["국어", "과학"].filter(Boolean).filter((z)=>z==="국어" || x.includes("과학")).concat(x.includes("과학")?["과학"]:[]) : x.includes("과학") ? ["과학"] : x.includes("영어") ? ["영어"] : x.includes("한국사") && x.includes("영어") ? ["영어"] : x ? [x] : []; };\nconst subjectMatches = (item:any, filter:string) => filter==="전체" || boardSubject(item?.subject).includes(filter);\nconst todayKST = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());\nconst taskPriority = (t:any, me:string) => { const status=String(t?.statusByUser?.[me]||"미제출").trim(), due=String(t?.due||""), today=todayKST(); if(status==="보충 필요") return "보충 필요"; if(due && due<today && status!=="완료") return "기한 지남"; if(due===today && status!=="완료") return "오늘 마감"; if(status==="미완료") return "미완료"; return ""; };\nconst priorityClass = (label:string) => label==="기한 지남" || label==="미완료" ? "red" : label==="보충 필요" || label==="오늘 마감" ? "yellow" : "gray";'
  );
}

if(!s.includes("const[taskFilter,setTaskFilter]")){
  s=s.replace(
    'const[id,setId]=useState(""),[pw,setPw]=useState(""),[name,setName]=useState(""),[subject,setSubject]=useState(SUBJECTS[0]);',
    'const[id,setId]=useState(""),[pw,setPw]=useState(""),[name,setName]=useState(""),[subject,setSubject]=useState(SUBJECTS[0]);\n const[taskFilter,setTaskFilter]=useState("전체"),[createdTaskFilter,setCreatedTaskFilter]=useState("전체"),[questionFilter,setQuestionFilter]=useState("전체");'
  );
}

if(!s.includes("const allAssignedTasks=")){
  const marker=/currentUser=users\\.find\\(\\(u:any\\)=>u\\.id===me\\)[\\s\\S]*?createdTasks=tasks\\.filter\\(\\(t:any\\)=>t\\.creatorId===me\\);/;
  const replacement='currentUser=users.find((u:any)=>u.id===me),assignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&(!t.due||String(t.due)>=nowKey||((t.statusByUser?.[me]||"미제출").trim()!=="미제출"))),overdueTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)&&String(t.due||"")<nowKey&&(t.statusByUser?.[me]||"미제출").trim()==="미제출"),allAssignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)),createdTasks=tasks.filter((t:any)=>t.creatorId===me),filteredAssignedTasks=assignedTasks.filter((t:any)=>subjectMatches(t,taskFilter)),filteredCreatedTasks=createdTasks.filter((t:any)=>subjectMatches(t,createdTaskFilter)),filteredQuestions=questions.filter((q:any)=>subjectMatches(q,questionFilter));';
  if(marker.test(s)) s=s.replace(marker,replacement);
}

const tabs='function SubjectTabs({value,onChange}:{value:string;onChange:(v:string)=>void}){return <div className="subject-tabs" role="tablist">{BOARD_SUBJECTS.map(s=><button type="button" key={s} className={value===s?"active":""} onClick={()=>onChange(s)}>{s}</button>)}</div>}\n';

if(!s.includes("function SubjectTabs(")) s=s.replace("function HomeDashboard(",tabs+"function HomeDashboard(");

const homeCallOld='<HomeDashboard assignedTasks={assignedTasks} createdTasks={createdTasks} notifications={notifications} me={me} users={users}/>';
const homeCallNew='<HomeDashboard assignedTasks={assignedTasks} allAssignedTasks={allAssignedTasks} createdTasks={createdTasks} notifications={notifications} me={me} users={users}/>';
s=s.replace(homeCallOld,homeCallNew);

const homeRe=/function HomeDashboard\([\s\S]*?\nfunction TodaySchedule/;
const homeFn=`function HomeDashboard({assignedTasks,allAssignedTasks,createdTasks,notifications,me,users}:{assignedTasks:any[];allAssignedTasks:any[];createdTasks:any[];notifications:any[];me:string;users:any[]}){const completed=assignedTasks.filter((t:any)=>String(t.statusByUser?.[me]||"미제출").trim()==="완료").length;const priority=allAssignedTasks.filter((t:any)=>taskPriority(t,me));return <section className="home-dashboard"><section className="card daily-card"><div className="eyebrow">TODAY</div><h2>오늘의 문장</h2><p>{["정부가 새로운 정책을 시행하기에 앞서 예상되는 부작용을 충분히 검토하지 않는다면, 문제를 해결하려던 조치가 오히려 다른 문제를 초래할 가능성도 배제하기 어렵다.","겉으로 드러난 결과만을 근거로 현상의 원인을 단정해서는 안 되며, 서로 다른 요인이 어떤 방식으로 상호작용했는지를 함께 살펴볼 필요가 있다.","연구자는 자신의 가설과 일치하는 자료만을 선택적으로 해석하기보다, 그 가설을 반박할 가능성이 있는 증거까지 검토해야 보다 타당한 결론에 도달할 수 있다.","특정한 방법이 과거에 효과적으로 작동했다는 사실만으로 다른 조건에서도 같은 결과가 나타날 것이라고 단정해서는 안 된다."][Math.floor(Date.now()/3600000)%4]}</p></section><TodaySchedule tasks={assignedTasks} me={me} users={users}/><section className="card"><div className="section-title"><div><div className="eyebrow">UP NEXT</div><h2>가장 임박한 숙제</h2><p className="muted">오늘 마감은 제외하고, 앞으로 마감되는 숙제 3개입니다.</p></div><button className="outline" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}>상태 확인</button></div><UpcomingTasks tasks={allAssignedTasks} users={users} me={me}/></section>{priority.length>0&&<section className="card priority-card"><div className="section-title"><div><div className="eyebrow">ACTION NEEDED</div><h2>우선 처리 필요</h2><p className="muted">기한이 지났거나 오늘 마감, 보충 필요 상태인 숙제를 먼저 확인하세요.</p></div><span className="badge red">{priority.length}개</span></div><div className="priority-list">{priority.slice(0,5).map((t:any)=><div className="priority-item" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject||"-"} · 마감 {t.due||"-"}</div></div><span className={"badge "+priorityClass(taskPriority(t,me))}>{taskPriority(t,me)}</span></div>)}</div></section>}<ProgressStat completed={completed} total={assignedTasks.length}/><section className="card home-summary"><div><span className="muted">제출할 숙제</span><strong>{assignedTasks.length}</strong></div><div><span className="muted">내가 낸 숙제</span><strong>{createdTasks.length}</strong></div><div><span className="muted">새 알림</span><strong>{notifications.filter((n:any)=>!n.read).length}</strong></div></section></section>}
function TodaySchedule`;
if(homeRe.test(s)) s=s.replace(homeRe,homeFn);

const upcomingRe=/function UpcomingTasks\([\s\S]*?\nfunction Stat/;
const upcomingFn=`function UpcomingTasks({tasks,users,me}:{tasks:any[];users:any[];me:string}){const today=todayKST();const list=[...tasks].filter((t:any)=>t.due&&String(t.due)>today&&String(t.statusByUser?.[me]||"미제출").trim()!=="완료").sort((a:any,b:any)=>String(a.due).localeCompare(String(b.due))).slice(0,3);return list.length?<div className="upcoming-list">{list.map((t:any)=>{const status=String(t.statusByUser?.[me]||"미제출").trim(),p=taskPriority(t,me);return <div className="upcoming-item" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject||"-"} · {t.due} · {userLabel(users.find((u:any)=>u.id===t.creatorId))}</div></div><div className="upcoming-badges">{p&&<span className={"badge "+priorityClass(p)}>{p}</span>}<span className={"badge "+statusClass(status)}>{status}</span></div></div>})}</div>:<Empty text="오늘 이후 마감이 지정된 미완료 숙제가 없습니다."/>}
function Stat`;
if(upcomingRe.test(s)) s=s.replace(upcomingRe,upcomingFn);

const homeworkRe=/\{active==="📥 숙제 제출"&&[\s\S]*?\}\s*\{active==="❓ 질문게시판"/;
const homeworkBlock=`{active==="📥 숙제 제출"&&<section><div className="section-heading"><div><h2>📥 숙제 제출하기</h2><p className="muted">나에게 배정된 숙제만 표시됩니다.</p></div></div><SubjectTabs value={taskFilter} onChange={setTaskFilter}/><TaskSubmitList tasks={filteredAssignedTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}
 {active==="❓ 질문게시판"`;
if(homeworkRe.test(s)) s=s.replace(homeworkRe,homeworkBlock);

const createdSectionRe=/<section><h2>📋 내가 낸 숙제<\/h2>[\s\S]*?<CreatedTaskList[^>]*\/>\<\/section>/;
if(createdSectionRe.test(s)){
  s=s.replace(createdSectionRe,'<section><h2>📋 내가 낸 숙제</h2><p className="muted">내가 출제한 숙제입니다. 과목별로 필터링할 수 있습니다.</p><SubjectTabs value={createdTaskFilter} onChange={setCreatedTaskFilter}/><CreatedTaskList tasks={filteredCreatedTasks} users={users} refresh={refresh} me={me}/></section>');
}

const questionPrefix='<section className="card form-card"><h2>질문 작성</h2>';
if(s.includes('{active==="❓ 질문게시판"') && !s.includes('value={questionFilter} onChange={setQuestionFilter}')){
  s=s.replace(questionPrefix,questionPrefix+'<SubjectTabs value={questionFilter} onChange={setQuestionFilter}/>');
  s=s.replace('questions.length?questions.map((q:any)=>','filteredQuestions.length?filteredQuestions.map((q:any)=>');
}

const chatRe=/function Chat\([\s\S]*$/;
const chatFn=`function Chat({users,messages,me,selected,setSelected,text,setText,files,setFiles,send,notifications,onRead}:{users:any[];messages:any[];me:string;selected:string;setSelected:(v:string)=>void;text:string;setText:(v:string)=>void;files:File[];setFiles:(v:File[])=>void;send:()=>void;notifications:any[];onRead:(ids:number[])=>Promise<void>}){const visible=messages.filter((m:any)=>selected&&(m.from===selected||m.to===selected));const other=users.find((u:any)=>u.id===selected);const messagesRef=useRef<HTMLDivElement>(null);const unreadByUser=useMemo(()=>{const out:Record<string,number>={};for(const n of notifications){if(n.read||n.type!=="message"||n.target_type!=="chat")continue;const msg=messages.find((m:any)=>Number(m.id)===Number(n.target_id));const sender=msg?.from;if(sender&&sender!==me)out[sender]=(out[sender]||0)+1}return out},[notifications,messages,me]);useEffect(()=>{const el=messagesRef.current;if(el)el.scrollTop=el.scrollHeight},[selected,visible.length]);async function chooseUser(uid:string){setSelected(uid);const ids=notifications.filter((n:any)=>!n.read&&n.type==="message"&&n.target_type==="chat").filter((n:any)=>{const msg=messages.find((m:any)=>Number(m.id)===Number(n.target_id));return msg?.from===uid}).map((n:any)=>Number(n.id)).filter(Number.isFinite);if(ids.length)await onRead(ids)}return <section className="card chat"><div className="chat-users"><h3>대화 상대</h3>{users.filter((u:any)=>u.id!==me).map((u:any)=><button key={u.id} className={selected===u.id?"selected":""} onClick={()=>chooseUser(u.id)}><span>{u.name} ({u.subject})</span><small>{u.id}</small>{unreadByUser[u.id]>0&&<span className="chat-unread">{unreadByUser[u.id]}</span>}</button>)}</div><div className="chat-main"><div className="chat-title">{other?\`${other.name} (${other.subject})\`:\`대화 상대를 선택하세요\`}{other&&<span className="muted smalltext"> · {other.id}</span>}</div><div className="messages" ref={messagesRef}>{visible.length?visible.map((m:any)=><div key={m.id} className={m.from===me?"bubble mine":"bubble"}><div>{m.text||m.body}</div><AttachmentList attachments={m.attachments}/><small>{m.at||""}</small></div>):<Empty text={selected?"아직 메시지가 없습니다.":"대화 상대를 선택하세요."}/>}</div><div className="chat-compose"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="메시지를 입력하세요"/><FilePicker files={files} setFiles={setFiles}/><button className="primary small" onClick={send}>전송</button></div></div></section>}`;
if(chatRe.test(s)) s=s.replace(chatRe,chatFn);

s=s.replace(
  '{active==="💬 개인채팅"&&<Chat users={users} messages={messages} me={me} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} files={chatFiles} setFiles={setChatFiles} send={sendChat}/>}',
  '{active==="💬 개인채팅"&&<Chat users={users} messages={messages} me={me} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} files={chatFiles} setFiles={setChatFiles} send={sendChat} notifications={notifications} onRead={async(ids:number[])=>{await rpc("app_mark_notifications_read",{p_ids:ids});await refresh()}}/>}'
);

let css=fs.readFileSync(cssFile,"utf8");
if(!css.includes(".subject-tabs{")){
  css+='\n.subject-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px;padding:4px 0}.subject-tabs button{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:8px 15px;font-size:13px;font-weight:600}.subject-tabs button:hover{color:var(--fg);border-color:#b8bfd0}.subject-tabs button.active{background:var(--primary);color:#fff;border-color:var(--primary)}.upcoming-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}.priority-card{border-color:#fde68a}.priority-list{display:grid;gap:8px}.priority-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:11px;background:#fffdf5}.chat-users button{position:relative}.chat-unread{position:absolute;right:9px;top:50%;transform:translateY(-50%);min-width:21px;height:21px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#ef4444;color:#fff;font-size:11px;font-weight:800}.chat-users button.selected .chat-unread{background:var(--primary)}@media(max-width:600px){.subject-tabs{overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px}.subject-tabs button{flex:0 0 auto}.priority-item{align-items:flex-start}.upcoming-badges{justify-content:flex-start}}\n';
}
fs.writeFileSync(page,s);fs.writeFileSync(cssFile,css);
console.log("[requested-features] subject filters, dashboard priorities/upcoming 3, chat unread badges, and final UI cleanup applied");
