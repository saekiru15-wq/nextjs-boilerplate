const fs=require('fs'),path=require('path');
const page=path.join(process.cwd(),'app','page.tsx');
let s=fs.readFileSync(page,'utf8');

// File transport only. Keep the existing UI/RPC behavior unchanged; route the
// large binary RPCs directly to Supabase to avoid the Vercel function body limit.
const old='async function rpc(fn:string,args:Obj={}){const r=await fetch("/api/rpc",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fn,args})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error||"요청에 실패했습니다.");return d}';
const neu='async function rpc(fn:string,args:Obj={}){const direct=fn==="app_upload_file"||fn==="app_get_file";const token=typeof window!=="undefined"?sessionStorage.getItem("mentor_token"):null;const payload={...args,...(direct&&token&&!args.p_token?{p_token:token}:{})};async function call(url:string,headers:Record<string,string>){const r=await fetch(url,{method:"POST",headers,body:JSON.stringify({fn,args:payload}),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error||"요청에 실패했습니다.");return d}if(direct&&token){let last:any;for(let i=0;i<3;i++){try{const r=await fetch("https://enhpbdwcnoetawiwadld.supabase.co/rest/v1/rpc/"+fn,{method:"POST",headers:{apikey:"sb_publishable_5gHrPhRHnXLbHVZG0JPgEA_16_3HYIj",Authorization:"Bearer sb_publishable_5gHrPhRHnXLbHVZG0JPgEA_16_3HYIj","Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.message||d?.error||d?.hint||"파일 요청에 실패했습니다.");return d}catch(e){last=e;if(i<2)await new Promise(res=>setTimeout(res,350*(i+1)))}}throw last}const d=await call("/api/rpc",{"Content-Type":"application/json"});if((fn==="app_login"||fn==="app_register")&&typeof window!=="undefined"){const t=typeof d?.token==="string"?d.token:(Array.isArray(d)&&typeof d[0]?.token==="string"?d[0].token:null);if(t)sessionStorage.setItem("mentor_token",t)}return d}';
if(!s.includes(old)) throw new Error('rpc target not found');
s=s.replace(old,neu);
fs.writeFileSync(page,s);
console.log('[file-transport] direct Supabase upload/download with retry applied');
