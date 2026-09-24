const fs=require("fs"),path=require("path");
const f=path.join(process.cwd(),"app","page.tsx");
let page=fs.readFileSync(f,"utf8");
page=page.replace(new RegExp(`<button className="logout"[^>]*>↪ 로그아웃</button>`,"g"),"");
fs.writeFileSync(f,page);
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
.modern-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);display:grid;place-items:center;padding:20px;z-index:1000}
.modern-modal{width:min(620px,100%);max-height:90vh;overflow:auto;background:#fff;color:#111;border:1px solid #111;border-radius:14px;box-shadow:0 24px 70px rgba(0,0,0,.28)}
.modern-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:22px 24px;border-bottom:1px solid #111}
.modern-modal-body{display:grid;gap:14px;padding:22px 24px}
.modern-modal-body label{display:grid;gap:7px;font-weight:700;font-size:14px}
.modern-modal-body input,.modern-modal-body textarea,.modern-modal-body select{width:100%;border:1.5px solid #111!important;border-radius:7px;padding:11px 12px;background:#fff;color:#111;outline:none}
.modern-modal-body textarea{min-height:110px;resize:vertical}
.modern-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:16px 24px;border-top:1px solid #111}
.modern-close{width:34px;height:34px;border:1px solid #111;background:#fff;color:#111;border-radius:7px;font-size:24px;line-height:1}
@media(max-width:600px){.modern-modal-backdrop{padding:10px}.modern-modal{max-height:94vh}.modern-modal-head,.modern-modal-body,.modern-modal-actions{padding-left:16px;padding-right:16px}}
/* MODERN-BW-THEME */
`;
}
fs.writeFileSync(cssFile,css);
console.log("[modern-ui] monochrome theme and logout cleanup applied");