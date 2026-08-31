const fs=require("fs"),path=require("path");
const p=path.join(process.cwd(),"app","page.tsx"),c=path.join(process.cwd(),"app","globals.css");
let s=fs.readFileSync(p,"utf8");
s=s.replace(/<button className="hamburger"[\s\S]*?<\/button>/,"");
s=s.replace(/<button className="mobile-close"[\s\S]*?<\/button>/,"");
if(!s.includes("mobile-vertical-nav")){
const nav='<nav className="mobile-vertical-nav">{MENU.map(m=><button type="button" key={m} className={active===m?"active":""} onClick={()=>setActive(m)}>{m}</button>)}</nav>';
s=s.replace("</header><div className=\"content\">","</header>"+nav+"<div className=\"content\">");
fs.writeFileSync(p,s);
}
let css=fs.readFileSync(c,"utf8");
if(!css.includes(".mobile-vertical-nav{display:none}")){
css+='\n.mobile-vertical-nav{display:none}@media(max-width:600px){.mobile-vertical-nav{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;max-height:42vh!important;overflow-y:auto!important;padding:12px 18px!important;background:var(--card)!important;border-bottom:1px solid var(--line)!important;z-index:20!important}.mobile-vertical-nav button{display:block!important;width:100%!important;min-height:48px!important;border:1px solid var(--line)!important;border-radius:12px!important;background:var(--card)!important;color:var(--fg)!important;text-align:left!important;padding:12px 14px!important;font-size:16px!important;touch-action:manipulation!important}.mobile-vertical-nav button.active{background:#eef0ff!important;color:var(--primary)!important;font-weight:700!important}}';
fs.writeFileSync(c,css);
}