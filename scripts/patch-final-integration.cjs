const fs=require("fs"),path=require("path");
const page=path.join(process.cwd(),"app","page.tsx");
const cssFile=path.join(process.cwd(),"app","globals.css");
let s=fs.readFileSync(page,"utf8");

/* FINAL-INTEGRATION-v1: restore the requested functional set after legacy build patches. */
if(!s.includes("FINAL-INTEGRATION-v1")){
  if(!s.includes("const FINAL_SUBJECTS")){
    s=s.replace(
      'const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];',
      'const SUBJECTS = ["국어&과학", "수학", "사회", "영어&한국사", "국어"];\nconst FINAL_SUBJECTS=["전체","국어","수학","과학","사회","영어"];\nconst finalSubjectMatches=(item:any,filter:string)=>{if(filter==="전체")return true;const x=String(item?.subject||"");return filter==="국어"?x.includes("국어"):filter==="과학"?x.includes("과학"):filter==="영어"?x.includes("영어"):x.includes(filter)};\nconst finalTodayKST=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());\nconst finalStatus=(t:any,me:string)=>String(t?.statusByUser?.[me]||"미제출").trim();\nconst finalIsOverdue=(t:any,me:string)=>{const due=String(t?.due||"");return !!due&&due<finalTodayKST()&&finalStatus(t,me)!=="완료"};\nconst finalPriority=(t:any,me:string)=>{const status=finalStatus(t,me),due=String(t?.due||""),today=finalTodayKST();if(status==="보충 필요")return "보충 필요";if(due&&due<today&&status!=="완료")return "기한 지남";if(due===today&&status!=="완료")return "오늘 마감";if(status==="미완료")return "미완료";return ""};'
    );
  }

  if(!s.includes("[taskFilter,setTaskFilter]")){
    s=s.replace(
      'const[id,setId]=useState(""),[pw,setPw]=useState(""),[name,setName]=useState(""),[subject,setSubject]=useState(SUBJECTS[0]);',
      'const[id,setId]=useState(""),[pw,setPw]=useState(""),[name,setName]=useState(""),[subject,setSubject]=useState(SUBJECTS[0]);\n const[taskFilter,setTaskFilter]=useState("전체"),[createdTaskFilter,setCreatedTaskFilter]=useState("전체"),[questionFilter,setQuestionFilter]=useState("전체");\n'
    );
  }

  if(!s.includes("mentor_dark_mode")){
    s=s.replace(
      'useEffect(()=>{refresh()},[]);',
      'useEffect(()=>{refresh()},[]);\n useEffect(()=>{const saved=typeof window!=="undefined"&&localStorage.getItem("mentor_dark_mode")==="1";setDarkMode(saved);if(typeof document!=="undefined")document.documentElement.classList.toggle("dark",saved)},[]);\n useEffect(()=>{if(typeof document!=="undefined")document.documentElement.classList.toggle("dark",darkMode);if(typeof window!=="undefined")localStorage.setItem("mentor_dark_mode",darkMode?"1":"0")},[darkMode]);'
    );
  }

  s=s.replace(/const MENU = \[[^\]]+\];/,m=>m.includes("📌 밀린 숙제")?m:m.replace('"📥 숙제 제출",','"📥 숙제 제출", "📌 밀린 숙제",'));
  if(!s.includes('"📌 밀린 숙제":"!"')) s=s.replace('"📥 숙제 제출":"⇧",','"📥 숙제 제출":"⇧","📌 밀린 숙제":"!",');

  s=s.replace('setProgress("");try{await refresh()}catch{setError("숙제는 등록되었습니다. 목록 새로고침에 실패했습니다.")}', 'setProgress("");void refresh()');
  s=s.replace('setProgress("");try{await refresh()}catch{setError("숙제는 제출되었습니다. 목록 새로고침에 실패했습니다.")}', 'setProgress("");void refresh()');

  const dataRe=/const me=state\?\.me\|\|"",users=arr\(state,\["users","members"\]\),tasks=arr\(state,\["tasks","task_list","app_tasks"\]\),questions=arr\(state,\["questions","question_list"\]\),notifications=arr\(state,\["notifications","notification_list"\]\),messages=useMemo\(\(\)=>Object\.values\(state\?\.chats\|\|\{\}\)\.flatMap\(\(v:any\)=>Array\.isArray\(v\)\?v:\[\]\),\[state\]\),currentUser=users\.find\(\(u:any\)=>u\.id===me\)[\s\S]*?createdTasks=tasks\.filter\(\(t:any\)=>t\.creatorId===me\);/;
  const dataRepl='const me=state?.me||"",users=arr(state,["users","members"]),tasks=arr(state,["tasks","task_list","app_tasks"]),questions=arr(state,["questions","question_list"]),notifications=arr(state,["notifications","notification_list"]),messages=useMemo(()=>Object.values(state?.chats||{}).flatMap((v:any)=>Array.isArray(v)?v:[]),[state]),currentUser=users.find((u:any)=>u.id===me),allAssignedTasks=tasks.filter((t:any)=>Array.isArray(t.assigneeIds)&&t.assigneeIds.includes(me)),overdueTasks=allAssignedTasks.filter((t:any)=>finalIsOverdue(t,me)),assignedTasks=allAssignedTasks.filter((t:any)=>!finalIsOverdue(t,me)),createdTasks=tasks.filter((t:any)=>t.creatorId===me),filteredAssignedTasks=assignedTasks.filter((t:any)=>finalSubjectMatches(t,taskFilter)),filteredCreatedTasks=createdTasks.filter((t:any)=>finalSubjectMatches(t,createdTaskFilter)),filteredQuestions=questions.filter((q:any)=>finalSubjectMatches(q,questionFilter));';
  if(dataRe.test(s))s=s.replace(dataRe,dataRepl);

  if(!s.includes("function FinalSubjectTabs(")){
    s=s.replace("function HomeDashboard(","function FinalSubjectTabs({value,onChange}:{value:string;onChange:(v:string)=>void}){return <div className=\"subject-tabs\" role=\"tablist\">{FINAL_SUBJECTS.map(v=><button type=\"button\" key={v} className={value===v?\"active\":\"\"} onClick={()=>onChange(v)}>{v}</button>)}</div>}\nfunction HomeDashboard(");
  }

  const homeRe=/function HomeDashboard\([\s\S]*?\nfunction TodaySchedule/;
  if(homeRe.test(s) && !s.includes("우선 처리 필요")){
    const homeFn='function HomeDashboard({assignedTasks,allAssignedTasks,createdTasks,notifications,me,users}:{assignedTasks:any[];allAssignedTasks:any[];createdTasks:any[];notifications:any[];me:string;users:any[]}){const completed=allAssignedTasks.filter((t:any)=>finalStatus(t,me)==="완료").length;const today=finalTodayKST();const upcoming=[...allAssignedTasks].filter((t:any)=>!finalIsOverdue(t,me)&&finalStatus(t,me)!=="완료"&&t.due).sort((a:any,b:any)=>{const ap=finalPriority(a,me)?0:1,bp=finalPriority(b,me)?0:1;if(ap!==bp)return ap-bp;return String(a.due).localeCompare(String(b.due))}).slice(0,3);return <section className="home-dashboard"><section className="card daily-card"><div className="eyebrow">TODAY</div><h2>오늘의 문장</h2><p>{["정부가 새로운 정책을 시행하기에 앞서 예상되는 부작용을 충분히 검토하지 않는다면, 문제를 해결하려던 조치가 오히려 다른 문제를 초래할 가능성도 배제하기 어렵다.","겉으로 드러난 결과만을 근거로 현상의 원인을 단정해서는 안 되며, 서로 다른 요인이 어떤 방식으로 상호작용했는지를 함께 살펴볼 필요가 있다.","연구자는 자신의 가설과 일치하는 자료만을 선택적으로 해석하기보다, 그 가설을 반박할 가능성이 있는 증거까지 검토해야 보다 타당한 결론에 도달할 수 있다.","특정한 방법이 과거에 효과적으로 작동했다는 사실만으로 다른 조건에서도 같은 결과가 나타날 것이라고 단정해서는 안 된다."][Math.floor(Date.now()/3600000)%4]}</p></section><TodaySchedule tasks={assignedTasks} me={me} users={users}/><section className="card"><div className="section-title"><div><div className="eyebrow">UP NEXT</div><h2>가장 임박한 숙제</h2><p className="muted">오늘 마감은 제외하고, 앞으로 마감되는 과제 중 가장 가까운 3개입니다.</p></div></div>{upcoming.length?<div className="upcoming-list">{upcoming.map((t:any)=><div className="upcoming-item" key={t.id}><div><b>{t.title}</b><div className="muted smalltext">{t.subject||"-"} · {t.due}</div></div><span className="badge gray">{finalStatus(t,me)}</span></div>)}</div>:<Empty text="앞으로 마감되는 미완료 숙제가 없습니다."/>}</section><ProgressStat completed={completed} total={allAssignedTasks.length}/><section className="card home-summary"><div><span className="muted">제출할 숙제</span><strong>{assignedTasks.length}</strong></div><div><span className="muted">내가 낸 숙제</span><strong>{createdTasks.length}</strong></div><div><span className="muted">새 알림</span><strong>{notifications.filter((n:any)=>!n.read).length}</strong></div></section></section>}\nfunction TodaySchedule';
    s=s.replace(homeRe,homeFn);
  }
  s=s.replace('<HomeDashboard assignedTasks={assignedTasks} createdTasks={createdTasks} notifications={notifications} me={me} users={users}/>','<HomeDashboard assignedTasks={assignedTasks} allAssignedTasks={allAssignedTasks} createdTasks={createdTasks} notifications={notifications} me={me} users={users}/>');

  s=s.replace('<TaskSubmitList tasks={assignedTasks} me={me}', '<TaskSubmitList tasks={filteredAssignedTasks} me={me}');
  s=s.replace(
      '{active==="❓ 질문게시판"&&',
      '{active==="📌 밀린 숙제"&&<section><div className="section-heading"><div><h2>📌 밀린 숙제</h2><p className="muted">마감일이 지난 미완료 숙제입니다. 여기에서도 제출할 수 있습니다.</p></div><span className="badge red">{overdueTasks.length}개</span></div><TaskSubmitList tasks={overdueTasks} me={me} files={submitFiles} setFiles={setSubmitFiles} memos={submitMemo} setMemos={setSubmitMemo} titles={submitTitle} setTitles={setSubmitTitle} bodies={submitBody} setBodies={setSubmitBody} submit={submitTask} users={users}/></section>}\n {active==="❓ 질문게시판"&&'
    );
  }

  s=s.replace(
    '<div className="section-heading"><div><h2>📥 숙제 제출하기</h2><p className="muted">나에게 배정된 숙제만 표시됩니다.</p></div></div><TaskSubmitList',
    '<div className="section-heading"><div><h2>📥 숙제 제출하기</h2><p className="muted">나에게 배정된 숙제만 표시됩니다.</p></div></div><FinalSubjectTabs value={taskFilter} onChange={setTaskFilter}/><TaskSubmitList'
  );
  if(!s.includes('<FinalSubjectTabs value={createdTaskFilter}')){
    s=s.replace(/<CreatedTaskList tasks=\{createdTasks\} users=\{users\}[^>]*\/>/, '<FinalSubjectTabs value={createdTaskFilter} onChange={setCreatedTaskFilter}/><CreatedTaskList tasks={filteredCreatedTasks} users={users} refresh={refresh} me={me}/>');
  }
  if(!s.includes('<FinalSubjectTabs value={questionFilter}')){
    s=s.replace('{active==="❓ 질문게시판"&&<><section','{active==="❓ 질문게시판"&&<><FinalSubjectTabs value={questionFilter} onChange={setQuestionFilter}/><section');
    s=s.replace('questions.length?questions.map((q:any)=>','filteredQuestions.length?filteredQuestions.map((q:any)=>');
  }

  if(!s.includes('onClick={()=>setDarkMode(v=>!v)}')){
    s=s.replace(
      '<div className="topbar-right"><div className="user-pill">',
      '<div className="topbar-right"><button type="button" className="theme-toggle" title={darkMode?"라이트 모드":"다크 모드"} onClick={()=>setDarkMode(v=>!v)}>{darkMode?"☀":"☾"}</button><div className="user-pill">'
    );
  }

  const chatRe=/function Chat\([\s\S]*?(?=\nfunction DailyProject|$)/;
  if(chatRe.test(s)){
    const chatFn='function Chat({users,messages,me,selected,setSelected,text,setText,files,setFiles,send,notifications,onRead}:{users:any[];messages:any[];me:string;selected:string;setSelected:(v:string)=>void;text:string;setText:(v:string)=>void;files:File[];setFiles:(v:File[])=>void;send:()=>void;notifications:any[];onRead:(ids:number[])=>Promise<void>}){const visible=messages.filter((m:any)=>selected&&(m.from===selected||m.to===selected));const other=users.find((u:any)=>u.id===selected);const messagesRef=useRef<HTMLDivElement>(null);const unreadByUser=useMemo(()=>{const out:Record<string,number>={};for(const n of notifications){if(n.read||n.type!=="message")continue;const msg=messages.find((m:any)=>Number(m.id)===Number(n.target_id));const sender=msg?.from;if(sender&&sender!==me)out[sender]=(out[sender]||0)+1}return out},[notifications,messages,me]);useEffect(()=>{const el=messagesRef.current;if(el)el.scrollTop=el.scrollHeight},[selected,visible.length]);async function chooseUser(uid:string){setSelected(uid);const ids=notifications.filter((n:any)=>!n.read&&n.type==="message").filter((n:any)=>{const msg=messages.find((m:any)=>Number(m.id)===Number(n.target_id));return msg?.from===uid}).map((n:any)=>Number(n.id)).filter(Number.isFinite);if(ids.length)await onRead(ids)}return <section className="card chat"><div className="chat-users"><h3>대화 상대</h3>{users.filter((u:any)=>u.id!==me).map((u:any)=><button key={u.id} className={selected===u.id?"selected":""} onClick={()=>chooseUser(u.id)}><span>{u.name} ({u.subject})</span><small>{u.id}</small>{unreadByUser[u.id]>0&&<span className="chat-unread">{unreadByUser[u.id]}</span>}</button>)}</div><div className="chat-main"><div className="chat-title">{other?other.name+" ("+other.subject+")":"대화 상대를 선택하세요"}{other&&<span className="muted smalltext"> · {other.id}</span>}</div><div className="messages" ref={messagesRef}>{visible.length?visible.map((m:any)=><div key={m.id} className={m.from===me?"bubble mine":"bubble"}><div>{m.text||m.body}</div><AttachmentList attachments={m.attachments}/><small>{m.at||""}</small></div>):<Empty text={selected?"아직 메시지가 없습니다.":"대화 상대를 선택하세요."}/>}</div><div className="chat-compose"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="메시지를 입력하세요"/><FilePicker files={files} setFiles={setFiles}/><button className="primary small" onClick={send}>전송</button></div></div></section>}';
    s=s.replace(chatRe,chatFn);
  }
  s=s.replace(
    '{active==="💬 개인채팅"&&<Chat users={users} messages={messages} me={me} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} files={chatFiles} setFiles={setChatFiles} send={sendChat}/>}',
    '{active==="💬 개인채팅"&&<Chat users={users} messages={messages} me={me} selected={chatUser} setSelected={setChatUser} text={chatText} setText={setChatText} files={chatFiles} setFiles={setChatFiles} send={sendChat} notifications={notifications} onRead={async(ids:number[])=>{await rpc("app_mark_notifications_read",{p_ids:ids});await refresh()}}/>}'
  );

  let css=fs.readFileSync(cssFile,"utf8");
  if(!css.includes("FINAL-INTEGRATION-v1")){
    css+='\n/* FINAL-INTEGRATION-v1 */\n.nav button:nth-child(1):after{content:"홈"!important}.nav button:nth-child(2):after{content:"숙제 내기"!important}.nav button:nth-child(3):after{content:"숙제 제출"!important}.nav button:nth-child(4):after{content:"밀린 숙제"!important}.nav button:nth-child(5):after{content:"질문게시판"!important}.nav button:nth-child(6):after{content:"캘린더"!important}.nav button:nth-child(7):after{content:"개인채팅"!important}.nav button:nth-child(8):after{content:"데일리 프로젝트"!important}.nav button:nth-child(9):after{content:"AI 학습도우미"!important}.nav button:nth-child(10):after{content:"알림"!important}.nav button:nth-child(4):before{content:"!"!important}.nav button:nth-child(5):before{content:"?"!important}.subject-tabs{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 16px;padding:4px 0}.subject-tabs button{border:1px solid var(--line);background:var(--card);color:var(--muted);border-radius:999px;padding:8px 15px;font-size:13px;font-weight:600;cursor:pointer}.subject-tabs button.active{background:#e2e2e2!important;color:#111!important;border-color:#bdbdbd!important}.subject-tabs button:hover{background:#ededed!important;color:#111!important}.chat-users button{position:relative}.chat-unread{position:absolute;right:9px;top:50%;transform:translateY(-50%);min-width:21px;height:21px;padding:0 6px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:#666;color:#fff;font-size:11px;font-weight:800}.chat-users button.selected .chat-unread{background:#444}.priority-list{display:grid;gap:8px}.priority-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 14px;border:1px solid var(--line);border-radius:11px;background:var(--card)}.upcoming-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap}html.dark{--bg:#111;--fg:#eee;--card:#1b1b1b;--muted:#aaa;--line:#373737;--primary:#111;--primary2:#111}html.dark,html.dark body{background:#111!important;color:#eee!important}html.dark .shell,html.dark .main,html.dark .content{background:var(--bg)!important;color:var(--fg)!important}html.dark .sidebar,html.dark .topbar,html.dark .card,html.dark .auth-card,html.dark .modal-card,html.dark .account-menu,html.dark .modern-modal{background:var(--card)!important;color:var(--fg)!important;border-color:var(--line)!important}html.dark input,html.dark textarea,html.dark select,html.dark .modern-modal-body input,html.dark .modern-modal-body textarea,html.dark .modern-modal-body select{background:#151515!important;color:var(--fg)!important;border-color:#555!important}html.dark .modern-modal-head,html.dark .modern-modal-actions{border-color:var(--line)!important}html.dark .modern-close{background:#1b1b1b!important;color:var(--fg)!important;border-color:#555!important}html.dark .check-row{background:#1a1a1a!important;color:var(--fg)!important;border-color:#444!important}html.dark .check-row:has(input:checked){background:#3a3a3a!important}html.dark .bubble.mine{background:#3a3a3a!important;color:#fff!important}html.dark .calendar-event{background:#3a3a3a!important;color:#fff!important}html.dark .subject-tabs button.active{background:#3a3a3a!important;color:#fff!important;border-color:#666!important}html.dark .ai-model-switch button.active{background:#3a3a3a!important;color:#fff!important;border-color:#666!important}html.dark .chat-users button.selected{background:#3a3a3a!important;color:#fff!important}html.dark .hero{background:#222!important;color:#fff!important}html.dark .modern-modal-backdrop{background:rgba(0,0,0,.72)!important}.notification-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.notification-delete-all{color:var(--fg)!important}\n@media(max-width:600px){.subject-tabs{overflow-x:auto;flex-wrap:nowrap}.subject-tabs button{flex:0 0 auto}.priority-item{align-items:flex-start}.notification-actions{width:100%}.notification-actions button{flex:1}}\n';
  }
  fs.writeFileSync(cssFile,css);

  const notifHead='<div className="section-title"><h2>알림</h2><button className="outline" onClick={()=>action("app_mark_notifications_read",{p_ids:notifications.map((n:any)=>Number(n.id))})}>모두 읽음</button></div>';
  if(s.includes(notifHead)&&!s.includes("notification-delete-all")){
    s=s.replace(notifHead,'<div className="section-title"><h2>알림</h2><div className="notification-actions"><button className="outline" onClick={()=>action("app_mark_notifications_read",{p_ids:notifications.map((n:any)=>Number(n.id))})}>모두 읽음</button><button className="outline notification-delete-all" onClick={async()=>{if(await showConfirm("알림 삭제","받은 알림을 모두 삭제할까요?"))await action("app_delete_all_notifications")}}>전체 삭제</button></div></div>');
  }
  fs.writeFileSync(page,s);
}
console.log("[final-integration] requested homework/dashboard/dark-mode/chat/subject features restored");
