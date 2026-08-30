const fs=require('fs');const path=require('path');const f=path.join(process.cwd(),'app','page.tsx');let s=fs.readFileSync(f,'utf8');
const r=(a,b,n)=>{if(s.includes(a))s=s.replace(a,b)};

if(!s.includes('async function editMessage')){
 const target='const me=state?.me||"",users=arr(state,["users","members"])';
 const helpers='async function editMessage(m:any){const x=window.prompt("메시지를 수정하세요.",m.text||m.body||"");if(x!==null)await action("app_update_message",{p_message:Number(m.id),p_text:x,p_files:(m.attachments||[]).map((a:any)=>a.id)})}\nasync function deleteMessage(m:any){if(window.confirm("메시지를 삭제할까요?"))await action("app_delete_message",{p_message:Number(m.id)})}\nasync function editComment(c:any){const x=window.prompt("댓글을 수정하세요.",c.text||c.body||"");if(x!==null)await action("app_update_comment",{p_comment:Number(c.id),p_text:x,p_files:(c.attachments||[]).map((a:any)=>a.id)})}\nasync function deleteComment(c:any){if(window.confirm("댓글을 삭제할까요?"))await action("app_delete_comment",{p_comment:Number(c.id)})}\nasync function editQuestion(q:any){const title=window.prompt("질문 제목",q.title||"");if(title===null)return;const body=window.prompt("질문 내용",q.body||"");if(body===null)return;await action("app_update_question",{p_question:Number(q.id),p_subject:q.subject||"전체",p_title:title,p_body:body,p_files:(q.attachments||[]).map((a:any)=>a.id)})}\nasync function deleteQuestion(q:any){if(window.confirm("질문을 삭제할까요?"))await action("app_delete_question",{p_question:Number(q.id)})}\n';
 if(s.includes(target))s=s.replace(target,helpers+target);
}
if(s.includes('<small>{m.at||""}</small></div>')&&!s.includes('className="bubble-actions"'))s=s.replace('<small>{m.at||""}</small></div>','<small>{m.at||""}</small>{m.from===me&&<div className="bubble-actions"><button className="mini-btn" onClick={()=>editMessage(m)}>수정</button><button className="mini-btn danger" onClick={()=>deleteMessage(m)}>삭제</button></div>}</div>');

const cls=/function CommentList\([\s\S]*?\nfunction CreatedTaskList/;
if(cls.test(s)&&!s.slice(s.indexOf('function CommentList('),s.indexOf('function CommentList(')+5000).includes('comment-actions')){
 s=s.replace(cls,`function CommentList({type,target,users,me,refresh}:{type:string;target:number;users:any[];me:string;refresh?:()=>Promise<void>}){const[comments,setComments]=useState<any[]>([]);useEffect(()=>{let live=true;rpc("app_list_comments",{p_type:type,p_target:Number(target)}).then(d=>{if(live)setComments(Array.isArray(d)?d:arr(d,["comments","data"]))}).catch(()=>live&&setComments([]));return()=>{live=false}},[type,target]);return <div className="comments-list">{comments.length?comments.map((c:any)=><div className="comment" key={c.id}><div>↳ {userLabel(users.find((u:any)=>u.id===(c.userId||c.user_id)))}: {c.text||c.body||""}</div>{(c.userId||c.user_id)===me&&<div className="comment-actions"><button className="mini-btn" onClick={async()=>{await editComment(c);await refresh?.()}}>수정</button><button className="mini-btn danger" onClick={async()=>{await deleteComment(c);await refresh?.()}}>삭제</button></div>}</div>):<div className="muted smalltext">아직 댓글이 없습니다.</div>}</div>}
function CreatedTaskList`)
}

const qc='<CommentList type="question" target={Number(q.id)} users={users}/>';
if(s.includes(qc))s=s.replace(qc,'<CommentList type="question" target={Number(q.id)} users={users} me={me} refresh={refresh}/>');
const cc='<CreatedTaskList tasks={createdTasks} users={users} refresh={refresh}/>';
if(s.includes(cc))s=s.replace(cc,'<CreatedTaskList tasks={createdTasks} users={users} refresh={refresh} me={me}/>');
fs.writeFileSync(f,s);
