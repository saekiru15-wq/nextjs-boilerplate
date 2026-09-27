const fs=require('fs'),path=require('path');
const page=path.join(process.cwd(),'app','page.tsx');
const cssFile=path.join(process.cwd(),'app','globals.css');
let s=fs.readFileSync(page,'utf8');

// Grayscale interaction theme: remove the book emoji without changing the menu structure.
s=s.replaceAll('📚 데일리 프로젝트','◇ 데일리 프로젝트');

// Notification bulk delete. The RPC is added separately to the Supabase project.
if(!s.includes('app_delete_all_notifications')){
  const old='<div className="section-title"><h2>알림</h2><button className="outline" onClick={()=>action("app_mark_notifications_read",{p_ids:notifications.map((n:any)=>Number(n.id))})}>모두 읽음</button></div>';
  const neu='<div className="section-title"><h2>알림</h2><div className="notification-actions"><button className="outline" onClick={()=>action("app_mark_notifications_read",{p_ids:notifications.map((n:any)=>Number(n.id))})}>모두 읽음</button><button className="outline notification-delete-all" onClick={async()=>{if(await showConfirm("알림 삭제","받은 알림을 모두 삭제할까요?"))await action("app_delete_all_notifications")}}>전체 삭제</button></div></div>';
  if(s.includes(old)) s=s.replace(old,neu);
}

fs.writeFileSync(page,s);

let css=fs.readFileSync(cssFile,'utf8');
const theme=`
/* GRAYSCALE-INTERACTION-THEME */
/* Keep primary/action buttons black; use gray for selected states and passive interaction surfaces. */
.nav button:hover,.nav .active{background:#e2e2e2!important;color:#111!important}
.subject-tabs button:hover{background:#ededed!important;color:#111!important}
.subject-tabs button.active{background:#e2e2e2!important;color:#111!important;border-color:#bdbdbd!important}
.chat-users button:hover,.chat-users .selected{background:#e2e2e2!important;color:#111!important}
.ai-model-switch button:hover{background:#ededed!important;color:#111!important}
.ai-model-switch button.active{background:#e2e2e2!important;color:#111!important;border-color:#bdbdbd!important}
.calendar-event{background:#e2e2e2!important;color:#111!important}
.cal-head button:hover{background:#e2e2e2!important}
.bubble.mine{background:#e2e2e2!important;color:#111!important}
.check-row{position:relative;display:flex;align-items:center;gap:10px;min-height:46px;margin:6px 0;padding:11px 13px;border:1px solid var(--line);border-radius:10px;background:var(--card);cursor:pointer;transition:background .12s ease,border-color .12s ease}
.check-row:has(input:checked){background:#e2e2e2!important;border-color:#bdbdbd}
.check-row input{position:absolute;opacity:0;pointer-events:none}
.check-row:hover{background:#f0f0f0}
.notification-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.notification-delete-all{color:#111!important}
.section-heading{margin-bottom:18px}
.form-card{gap:12px}
.card+.card{margin-top:16px}
.modern-modal-body{gap:16px!important}
@media(max-width:600px){.notification-actions{width:100%}.notification-actions button{flex:1}.check-row{min-height:48px}}
`;
if(!css.includes('GRAYSCALE-INTERACTION-THEME')) css+=theme;
fs.writeFileSync(cssFile,css);
console.log('[gray-theme] grayscale selected states, whole-cell assignee selection, notification bulk delete UI, daily-project icon cleanup, and spacing applied');
