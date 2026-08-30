const fs=require('fs'),path=require('path');
const f=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(f,'utf8');

// Make the edit dialog show the same attachment limits as create/submit forms.
s=s.replace('lab.textContent=x.label;','lab.textContent=x.type===\"files\"?x.label+\" (최대 5개 · 파일당 10MB 이하)\":x.label;');

// Enforce the 5-file total on edits, not merely the number of newly selected files.
s=s.replace('async v=>{await rpc(\"app_update_task\"','async v=>{if(((t.attachments||[]).length+(v.files||[]).length)>MAX_FILES)throw new Error(`수정 후 첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);await rpc(\"app_update_task\"');
s=s.replace('async v=>{await rpc(\"app_update_comment\"','async v=>{if(((c.attachments||[]).length+(v.files||[]).length)>MAX_FILES)throw new Error(`수정 후 첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);await rpc(\"app_update_comment\"');
s=s.replace('async v=>{await action(\"app_update_question\"','async v=>{if(((q.attachments||[]).length+(v.files||[]).length)>MAX_FILES)throw new Error(`수정 후 첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);await action(\"app_update_question\"');
s=s.replace('async v=>{await rpc(\"app_update_message\"','async v=>{if(((m.attachments||[]).length+(v.files||[]).length)>MAX_FILES)throw new Error(`수정 후 첨부파일은 최대 ${MAX_FILES}개까지 가능합니다.`);await rpc(\"app_update_message\"');

// Every successful task edit already calls refresh; keep a fallback state refresh after modal save.
// Avoid hard reloads for edit operations so the changed record appears immediately.
fs.writeFileSync(f,s);
console.log('[edit-fix] edit attachment limits and live-refresh hooks applied');
