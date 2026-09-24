const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let s=fs.readFileSync(f,"utf8");

if(!s.includes("modern-task-modal-state")){
  s=s.replace('export default function Home(){',
    'export default function Home(){\n const modernTaskModalState=useState(false),taskModalOpen=modernTaskModalState[0],setTaskModalOpen=modernTaskModalState[1]; // modern-task-modal-state');
}

s=s.replace(/<button className="logout"[^>]*>↪ 로그아웃<\/button>/g,"");

s=s.replace(
  /\{active==="📤 숙제 내기"&&[\s\S]*?\n \{active==="📥 숙제 제출"&&/,
  `{active==="📤 숙제 내기"&&<div className="single"><section className="card modern-create-card"><div className="modern-create-head"><div><h2>숙제 내기</h2><p className="muted">숙제 정보를 입력하고 수행 대상을 선택하세요.</p></div><button className="primary" type="button" onClick={()=>setTaskModalOpen(true)}>숙제 내기</button></div><div className="info-row"><span>과목</span><b>{currentUser?.subject||"-"}</b></div><div className="info-row"><span>출제자</span><b>{userLabel(currentUser)}</b></div></section><section><h2>📋 내가 낸 숙제</h2><p className="muted">내가 출제한 숙제는 제목과 기본 정보만 보이며, 클릭하면 세부사항을 확인할 수 있습니다.</p><CreatedTaskList tasks={createdTasks} users={users}/></section>{taskModalOpen&&<div className="modern-modal-backdrop" onMouseDown={()=>!busy&&setTaskModalOpen(false)}><section className="modern-modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="modern-modal-head"><div><h2>숙제 내기</h2><p className="muted">새 숙제의 내용을 입력하세요.</p></div><button type="button" className="modern-close" onClick={()=>!busy&&setTaskModalOpen(false)}>×</button></div><div className="modern-modal-body"><div className="info-row"><span>과목</span><b>{currentUser?.subject||"-"}</b></div><div className="info-row"><span>출제자</span><b>{userLabel(currentUser)}</b></div><label>숙제 제목<input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder="숙제 제목"/></label><label>숙제 내용 / 설명<textarea value={taskDesc} onChange={e=>setTaskDesc(e.target.value)} placeholder="숙제 내용 / 설명"/></label><label>마감일<input type="date" value={taskDue} onChange={e=>setTaskDue(e.target.value)}/></label><div><b>수행 대상</b>{users.filter((u:any)=>u.id!==me).map((u:any)=><label key={u.id} className="check-row"><input type="checkbox" checked={taskAssignees.includes(u.id)} onChange={e=>setTaskAssignees(v=>e.target.checked?[...v,u.id]:v.filter(x=>x!==u.id))}/>{userLabel(u)}</label>)}</div><FilePicker files={taskFiles} setFiles={setTaskFiles}/></div><div className="modern-modal-actions"><button type="button" className="outline" disabled={false} onClick={()=>setTaskModalOpen(false)}>취소</button><button type="button" className="primary" disabled={busy} onClick={createTask}>{busy?progress||"처리 중...":"숙제 등록"}</button></div></section></div>}</div>} {active==="📥 숙제 제출"&&`
);

s=s.replace(
  /async function createTask\(e:FormEvent\)\{([\s\S]*?)setProgress\("")\}catch/,
  (m,body)=>m.replace('setProgress("")}catch','setProgress("");setTaskModalOpen(false)}catch')
);

s=s.replace(
  /async function submitTask\(t:any\)\{([\s\S]*?)setProgress\("")\}catch/,
  (m,body)=>m.replace('setProgress("")}catch','setProgress("")}catch')
);

const taskSubmitStart=s.indexOf("function TaskSubmitList(");
const taskSubmitEnd=s.indexOf("function CreatedTaskList(",taskSubmitStart);
if(taskSubmitStart<0||taskSubmitEnd<0)throw new Error("TaskSubmitList block not found");
const taskSubmit = `function TaskSubmitList({tasks,me,files,setFiles,memos,setMemos,titles,setTitles,bodies,setBodies,submit,users}:{tasks:any[];me:string;files:Record<string,File[]>;setFiles:(v:Record<string,File[]>)=>void;memos:Record<string,string>;setMemos:(v:Record<string,string>)=>void;titles:Record<string,string>;setTitles:(v:Record<string,string>)=>void;bodies:Record<string,string>;setBodies:(v:Record<string,string>)=>void;submit:(t:any)=>Promise<void>;users:any[]}){const[openKey,setOpenKey]=useState<string|null>(null);return <section className="card">{tasks.length?tasks.map((t:any)=>{const key=String(t.id),status=t.statusByUser?.[me]||"미제출",isOpen=openKey===key;return <article className="task task-large" key={t.id}><div className="task-main"><div className="section-title"><div><b>{t.title}</b><div className="muted smalltext">과목: {t.subject||"-"} · 출제자: {userLabel(users.find((u:any)=>u.id===t.creatorId))} · 마감: {t.due||"-"}</div></div><span className={"badge "+statusClass(status)}>{status}</span></div><div className="task-desc">{t.desc||t.description||"내용 없음"}</div><AttachmentList attachments={t.attachments}/>{t.feedbackByUser?.[me]&&<div className="feedback">피드백: {t.feedbackByUser[me]}</div>}{status!=="완료"&&<button type="button" className="primary" onClick={()=>setOpenKey(key)}>숙제 제출</button>}</div>{isOpen&&<div className="modern-modal-backdrop" onMouseDown={()=>setOpenKey(null)}><section className="modern-modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><div className="modern-modal-head"><div><h2>숙제 제출</h2><p className="muted">{t.title}</p></div><button type="button" className="modern-close" onClick={()=>setOpenKey(null)}>×</button></div><div className="modern-modal-body"><div className="info-row"><span>과목</span><b>{t.subject||"-"}</b></div><div className="info-row"><span>마감일</span><b>{t.due||"-"}</b></div><label>제출 제목<input value={titles[key]||""} onChange={e=>setTitles({...titles,[key]:e.target.value})} placeholder="제출 제목"/></label><label>제출 내용<textarea value={bodies[key]||""} onChange={e=>setBodies({...bodies,[key]:e.target.value})} placeholder="제출 내용"/></label><label>제출 메모(선택)<textarea value={memos[key]||""} onChange={e=>setMemos({...memos,[key]:e.target.value})} placeholder="제출 메모(선택)"/></label><FilePicker files={files[key]||[]} setFiles={f=>setFiles({...files,[key]:f})}/></div><div className="modern-modal-actions"><button type="button" className="outline" disabled={false} onClick={()=>setOpenKey(null)}>취소</button><button type="button" className="primary" disabled={!titles[key]?.trim()||!bodies[key]?.trim()} onClick={async()=>{await submit(t);setOpenKey(null)}}>제출하기</button></div></section></div>}</article>}) : <Empty text="현재 나에게 배정된 숙제가 없습니다."/>}</section>}`;
s=s.slice(0,taskSubmitStart)+taskSubmit+"\n"+s.slice(taskSubmitEnd);

const cssFile=path.join(process.cwd(),"app","globals.css");
let css=fs.readFileSync(cssFile,"utf8");
if(!css.includes("MODERN-BW-THEME")){
css+=`
/* MODERN-BW-THEME */
:root{--bg:#f5f5f5;--fg:#111;--card:#fff;--muted:#666;--line:#d2d2d2;--primary:#111;--primary2:#111}
body{font-family:Arial,Helvetica,sans-serif}
.auth-page{background:#f5f5f5}
.auth-card{border:1px solid #111;box-shadow:none;border-radius:14px}
.brand span{color:#111}
.sidebar{background:#fff;border-right:1px solid #111}
.nav button,.logout{color:#333}
.nav button:hover,.nav .active{background:#111;color:#fff}
.topbar{background:#fff;border-bottom:1px solid #111;backdrop-filter:none}
.user-pill{background:#f5f5f5;border-color:#bbb;color:#333}
.hero{background:#111;color:#fff;border-radius:14px;box-shadow:none}
.card{border-color:#d0d0d0;box-shadow:none;border-radius:12px}
.primary{background:#111;border:1px solid #111;color:#fff}
.outline,.icon-btn,.theme-toggle,.mini-btn,.review-btn,.cal-head button{border-color:#111;color:#111;background:#fff}
.primary:hover{background:#333}
.nav .active{font-weight:700}
.badge{background:#eee!important;color:#111!important;border:1px solid #ccc}
.red,.yellow,.green,.blue,.gray{background:#eee!important;color:#111!important}
input,textarea,select,.form-card input,.form-card textarea,.submission-form input,.submission-form textarea,.comments-block input,.file-chip,.attachment{border-color:#111!important}
.modern-create-card{padding:24px}
.modern-create-head{display:flex;align-items:center;justify-content:space-between;gap:16px}
.modern-create-head h2{margin:0 0 5px}
.modern-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);display:grid;place-items:center;padding:20px;z-index:1000}
.modern-modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;color:#111;border:1px solid #111;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
.modern-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:22px 24px;border-bottom:1px solid #111}
.modern-modal-head h2{margin:0 0 4px}
.modern-close{width:34px;height:34px;border:1px solid #111;background:#fff;color:#111;border-radius:7px;font-size:24px;line-height:1}
.modern-modal-body{display:grid;gap:14px;padding:22px 24px}
.modern-modal-body label{display:grid;gap:7px;font-weight:700;font-size:14px}
.modern-modal-body input,.modern-modal-body textarea,.modern-modal-body select{width:100%;border:1.5px solid #111!important;border-radius:7px;padding:11px 12px;background:#fff;color:#111;outline:none}
.modern-modal-body input:focus,.modern-modal-body textarea:focus,.modern-modal-body select:focus{box-shadow:0 0 0 2px #1112}
.modern-modal-body textarea{min-height:110px;resize:vertical}
.modern-modal-body .file-picker{border:1.5px solid #111;padding:12px;border-radius:8px}
.modern-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:16px 24px;border-top:1px solid #111}
.modern-modal .check-row{font-weight:400}
.modern-modal .info-row{border-color:#ddd}
@media(max-width:600px){.modern-modal-backdrop{padding:10px}.modern-modal{max-height:94vh}.modern-modal-head,.modern-modal-body,.modern-modal-actions{padding-left:16px;padding-right:16px}.modern-create-head{align-items:flex-start;flex-direction:column}.modern-create-head .primary{width:100%}}
/* MODERN-BW-THEME */
`;
}
fs.writeFileSync(f,s);fs.writeFileSync(cssFile,css);
console.log("[modern-ui] black/white modern theme + separate task create/submit modals + sidebar logout removed");
