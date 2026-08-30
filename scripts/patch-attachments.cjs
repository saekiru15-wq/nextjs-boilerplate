const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'app', 'page.tsx');
let s = fs.readFileSync(file, 'utf8');

function once(oldText, newText, label) {
  if (s.includes(newText)) return;
  if (!s.includes(oldText)) throw new Error(`patch target not found: ${label}`);
  s = s.replace(oldText, newText);
}

once(
  'const[qSubject,setQSubject]=useState(SUBJECTS[0]),[qTitle,setQTitle]=useState(""),[qBody,setQBody]=useState("");',
  'const[qSubject,setQSubject]=useState(SUBJECTS[0]),[qTitle,setQTitle]=useState(""),[qBody,setQBody]=useState(""),[qFiles,setQFiles]=useState<File[]>([]);',
  'question state'
);

once(
  'const[aiText,setAiText]=useState(""),[aiMessages,setAiMessages]=useState<{role:string;content:string}[]>([]),[aiBusy,setAiBusy]=useState(false),',
  'const[aiText,setAiText]=useState(""),[aiFiles,setAiFiles]=useState<File[]>([]),[aiMessages,setAiMessages]=useState<{role:string;content:string}[]>([]),[aiBusy,setAiBusy]=useState(false),',
  'AI state'
);

const oldQuestion = 'async function createQuestion(){try{if(!qTitle.trim()||!qBody.trim())throw new Error("질문 제목과 내용을 입력해주세요.");await action("app_create_question",{p_subject:qSubject,p_title:qTitle.trim(),p_body:qBody.trim(),p_files:[]});setQTitle("");setQBody("")}catch(e:any){toast(e?.message||"질문 등록에 실패했습니다.")}}';
const newQuestion = 'async function createQuestion(){try{if(!qTitle.trim()||!qBody.trim())throw new Error("질문 제목과 내용을 입력해주세요.");setBusy(true);setError("");const ids=await uploadFiles(qFiles,setProgress);await rpc("app_create_question",{p_subject:qSubject,p_title:qTitle.trim(),p_body:qBody.trim(),p_files:ids});await refresh();setQTitle("");setQBody("");setQFiles([]);setProgress("")}catch(e:any){toast(e?.message||"질문 등록에 실패했습니다.");setProgress("")}finally{setBusy(false)}}';
once(oldQuestion, newQuestion, 'question submit');

const oldAsk = 'async function askAI(e:FormEvent){e.preventDefault();if(!aiText.trim())return;const text=aiText.trim();setAiText("");setAiBusy(true);const history=[...aiMessages,{role:"user",content:text}];setAiMessages(history);try{const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,history})});const raw=await r.text();let d:Obj={};try{d=raw?JSON.parse(raw):{}}catch{d={error:raw||"AI 서버가 비어 있는 응답을 반환했습니다."}}if(!r.ok)throw new Error(d.error||d.message||"AI 요청에 실패했습니다.");if(!d.text)throw new Error("AI 응답에 내용이 없습니다.");setAiMessages(v=>[...v,{role:"assistant",content:d.text}])}catch(e:any){setAiMessages(v=>[...v,{role:"assistant",content:`AI 연결 오류: ${e?.message||"알 수 없는 오류"}`}])}finally{setAiBusy(false)}}';
const newAsk = 'async function askAI(e:FormEvent){e.preventDefault();if(!aiText.trim()&&!aiFiles.length)return;const text=aiText.trim();const files=[...aiFiles];setAiText("");setAiFiles([]);setAiBusy(true);try{const ids=await uploadFiles(files,setProgress);const fileNames=files.map(f=>f.name);const prompt=(fileNames.length?`[첨부파일: ${fileNames.join(", ")} ]\\n`:"")+text;const history=[...aiMessages,{role:"user",content:prompt}];setAiMessages(history);const r=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:prompt,history,attachments:ids})});const raw=await r.text();let d:Obj={};try{d=raw?JSON.parse(raw):{}}catch{d={error:raw||"AI 서버가 비어 있는 응답을 반환했습니다."}}if(!r.ok)throw new Error(d.error||d.message||"AI 요청에 실패했습니다.");if(!d.text)throw new Error("AI 응답에 내용이 없습니다.");setAiMessages(v=>[...v,{role:"assistant",content:d.text}]);setProgress("")}catch(e:any){setAiMessages(v=>[...v,{role:"assistant",content:`AI 연결 오류: ${e?.message||"알 수 없는 오류"}`}]);setProgress("")}finally{setAiBusy(false)}}';
once(oldAsk, newAsk, 'AI submit');

once(
  '<textarea placeholder="내용" value={qBody} onChange={e=>setQBody(e.target.value)}/><button className="primary" disabled={busy} onClick={createQuestion}>등록</button>',
  '<textarea placeholder="내용" value={qBody} onChange={e=>setQBody(e.target.value)}/><FilePicker files={qFiles} setFiles={setQFiles}/><button className="primary" disabled={busy} onClick={createQuestion}>등록</button>',
  'question file picker'
);

once(
  '<input placeholder="댓글 작성 후 Enter" onKeyDown={e=>{if(e.key==="Enter"&&e.currentTarget.value.trim()){action("app_add_comment",{p_type:"question",p_target:Number(q.id),p_text:e.currentTarget.value.trim(),p_files:[]});e.currentTarget.value=""}}}/>',
  '<input className="reply-input" style={{border:"1px solid #d6d9e0",borderRadius:"8px"}} placeholder="답장 작성 후 Enter" onKeyDown={e=>{if(e.key==="Enter"&&e.currentTarget.value.trim()){action("app_add_comment",{p_type:"question",p_target:Number(q.id),p_text:e.currentTarget.value.trim(),p_files:[]});e.currentTarget.value=""}}}/>',
  'question reply input'
);

once(
  '<form className="ai-compose" onSubmit={askAI}><input value={aiText} onChange={e=>setAiText(e.target.value)} placeholder="공부와 관련된 질문을 입력하세요"/><button',
  '<form className="ai-compose" onSubmit={askAI}><input value={aiText} onChange={e=>setAiText(e.target.value)} placeholder="공부와 관련된 질문을 입력하세요"/><FilePicker files={aiFiles} setFiles={setAiFiles}/><button',
  'AI file picker'
);

fs.writeFileSync(file, s);