const fs=require('fs');const path=require('path');const f=path.join(process.cwd(),'app','page.tsx');let s=fs.readFileSync(f,'utf8');
const r=(a,b)=>{if(s.includes(a))s=s.replace(a,b)};

r('<button className="mini-btn" onClick={()=>editMessage(m)}>수정</button><button className="mini-btn danger" onClick={()=>deleteMessage(m)}>삭제</button>','<button className="mini-btn" onClick={async()=>{const x=window.prompt("메시지를 수정하세요.",m.text||m.body||"");if(x!==null){await rpc("app_update_message",{p_message:Number(m.id),p_text:x,p_files:(m.attachments||[]).map((a:any)=>a.id));location.reload()}}}>수정</button><button className="mini-btn danger" onClick={async()=>{if(window.confirm("메시지를 삭제할까요?")){await rpc("app_delete_message",{p_message:Number(m.id)});location.reload()}}}>삭제</button>');

const cls=/function CommentList\([\s\S]*?\nfunction CreatedTaskList/;
if(cls.test(s)&&!s.slice(s.indexOf('function CommentList('),s.indexOf('function CommentList(')+5000).includes('async function edit(c')){
 s=s.replace(cls,`function CommentList({type,target,users,me,refresh}:{type:string;target:number;users:any[];me:string;refresh?:()=>Promise<void>}){const[comments,setComments]=useState<any[]>([]);async function edit(c:any){const x=window.prompt("댓글을 수정하세요.",c.text||c.body||"");if(x!==null){await rpc("app_update_comment",{p_comment:Number(c.id),p_text:x,p_files:(c.attachments||[]).map((a:any)=>a.id));await refresh?.()}}async function remove(c:any){if(window.confirm("댓글을 삭제할까요?")){await rpc("app_delete_comment",{p_comment:Number(c.id)});await refresh?.()}}useEffect(()=>{let live=true;rpc("app_list_comments",{p_type:type,p_target:Number(target)}).then(d=>{if(live)setComments(Array.isArray(d)?d:arr(d,["comments","data"]))}).catch(()=>live&&setComments([]));return()=>{live=false}},[type,target]);return <div className="comments-list">{comments.length?comments.map((c:any)=><div className="comment" key={c.id}><div>↳ {userLabel(users.find((u:any)=>u.id===(c.userId||c.user_id)))}: {c.text||c.body||""}</div>{(c.userId||c.user_id)===me&&<div className="comment-actions"><button className="mini-btn" onClick={()=>edit(c)}>수정</button><button className="mini-btn danger" onClick={()=>remove(c)}>삭제</button></div>}</div>):<div className="muted smalltext">아직 댓글이 없습니다.</div>}</div>}
function CreatedTaskList`)
}

const qc='<CommentList type="question" target={Number(q.id)} users={users}/>';
if(s.includes(qc))s=s.replace(qc,'<CommentList type="question" target={Number(q.id)} users={users} me={me} refresh={refresh}/>');
const cc='<CreatedTaskList tasks={createdTasks} users={users} refresh={refresh}/>';
if(s.includes(cc))s=s.replace(cc,'<CreatedTaskList tasks={createdTasks} users={users} refresh={refresh} me={me}/>');
fs.writeFileSync(f,s);
