const fs=require('fs');const path=require('path');const f=path.join(process.cwd(),'app','page.tsx');let s=fs.readFileSync(f,'utf8');
if(!s.includes('function CommentList')){
 const fn=`function CommentList({type,target,users,me,refresh}:{type:string;target:number;users:any[];me:string;refresh?:()=>Promise<void>}){const[comments,setComments]=useState<any[]>([]);useEffect(()=>{let live=true;rpc("app_list_comments",{p_type:type,p_target:Number(target)}).then(d=>{if(live)setComments(Array.isArray(d)?d:arr(d,["comments","data"]))}).catch(()=>live&&setComments([]));return()=>{live=false}},[type,target]);return <div className="comments-list">{comments.length?comments.map((c:any)=><div className="comment" key={c.id}><div>↳ {userLabel(users.find((u:any)=>u.id===(c.userId||c.user_id)))}: {c.text||c.body||""}</div>{(c.userId||c.user_id)===me&&<div className="comment-actions"><button className="mini-btn" onClick={async()=>{await editComment(c);await refresh?.()}}>수정</button><button className="mini-btn danger" onClick={async()=>{await deleteComment(c);await refresh?.()}}>삭제</button></div>}</div>):<div className="muted smalltext">아직 댓글이 없습니다.</div>}</div>}
`;
 s=s.replace('function CreatedTaskList',fn+'function CreatedTaskList');
}
if(s.includes('<CommentList type="question" target={Number(q.id)} users={users}/>'))s=s.replace('<CommentList type="question" target={Number(q.id)} users={users}/>','<CommentList type="question" target={Number(q.id)} users={users} me={me} refresh={refresh}/>');
fs.writeFileSync(f,s);
