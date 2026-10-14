import {initializeApp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,getDocs,setDoc,addDoc,deleteDoc,query,where,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app=initializeApp({apiKey:"AIzaSyBZ7iA5RmKrhmz8d10-bP3xgL2p1VwG9gc",authDomain:"esm-database-1d98e.firebaseapp.com",projectId:"esm-database-1d98e",appId:"1:420166045833:web:da752d00958d885f0d7658"});
const auth=getAuth(app),db=getFirestore(app);
const $=s=>document.querySelector(s),root=$("#app");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=u=>/^(https?:\/\/|\/)/i.test(u||"")?u:"";
let L=localStorage.getItem("lang")||"ar",S={},user=null,cache={};

const TX={home:["الرئيسية","Home"],about:["من نحن","About Us"],services:["خدماتنا","Services"],pricing:["الأسعار والباقات","Pricing & Packages"],work:["أعمالنا","Our Work"],payment:["طرق الدفع","Payment Methods"],faq:["الأسئلة الشائعة","FAQ"],contact:["تواصل معنا","Contact Us"],
welcome:["أهلاً بيكم في Egypt Sports Media","Welcome to Egypt Sports Media"],explore:["اكتشف خدماتنا","Explore Our Services"],seeWork:["شاهد أعمالنا","See Our Work"],quote:["تواصل معنا لعرض سعر","Contact us for a quote"],request:["اطلب عرض سعر","Request a quote"],all:["الكل","All"],
empty:["لا يوجد محتوى منشور حالياً","No published content yet"],more:["عرض الكل","View all"],watch:["مشاهدة الفيديو","Watch video"],
name:["الاسم","Name"],cInfo:["الإيميل أو رقم الهاتف","Email or phone"],service:["الخدمة المطلوبة","Requested service"],date:["تاريخ الحدث (اختياري)","Event date (optional)"],budget:["الميزانية (اختياري)","Budget (optional)"],message:["رسالتك","Message"],send:["إرسال الطلب","Send request"],
consent:["بإرسال الطلب أنت توافق على تواصلنا معك بخصوص طلبك.","By sending, you agree we may contact you about your request."],
sent:["تم حفظ طلبك بنجاح. سنتواصل معك قريباً.","Your request was saved. We will contact you soon."],bad:["راجع البيانات المطلوبة","Please check the required fields"],fail:["حدث خطأ أثناء الحفظ، حاول مرة أخرى","Could not save, please try again"],
rights:["جميع الحقوق محفوظة","All rights reserved"],ctaT:["جاهز تبدأ مشروعك؟","Ready to start your project?"],account:["الحساب","Account"]};
const T=k=>TX[k]?TX[k][L=="ar"?0:1]:k;
const pick=(o,f)=>o[f+"_"+L]||o[f+"_"+(L=="ar"?"en":"ar")]||"";
const NAV=[["home","/"],["about","/about"],["services","/services"],["pricing","/pricing"],["work","/work"],["payment","/payment"],["faq","/faq"],["contact","/contact"]];

async function load(c,all){
  if(!all&&cache[c])return cache[c];
  const q=all?collection(db,c):query(collection(db,c),where("status","==","published"));
  try{const r=(await Promise.race([getDocs(q),new Promise((_,j)=>setTimeout(()=>j("timeout"),8000))])).docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(+a.order||0)-(+b.order||0));if(!all)cache[c]=r;return r}catch(e){console.error(e);return[]}
}
async function loadSettings(){try{const d=await Promise.race([getDoc(doc(db,"settings","site")),new Promise((_,j)=>setTimeout(()=>j("timeout"),8000))]);S=d.exists()?d.data():{}}catch(e){console.error(e);S={}}}

const nav=(to)=>{history.pushState({},"",to);render();scrollTo(0,0)};
document.addEventListener("click",e=>{const a=e.target.closest("a[data-l]");if(a){e.preventDefault();nav(a.getAttribute("href"))}});
addEventListener("popstate",render);

function setMeta(title,desc){document.title=title||S["name"]||"Egypt Sports Media";const m=document.querySelector('meta[name=description]');if(m)m.content=desc||pick(S,"desc")||""}

/* ---------- public ---------- */
const social=()=>[["facebook","Facebook"],["instagram","Instagram"],["youtube","YouTube"],["tiktok","TikTok"],["whatsapp","WhatsApp"]].filter(([k])=>safeUrl(S[k])).map(([k,n])=>`<a href="${esc(S[k])}" target="_blank" rel="noopener noreferrer">${n}</a>`).join(" ");
function shell(body,path){
  return `<header><div class="wrap bar"><a data-l href="/" class="bar" aria-label="Egypt Sports Media"><img class="logo" src="${esc(safeUrl(S.logo)||"/logo.jpg")}" alt="Egypt Sports Media"><span class="brand">${esc(S.name||"Egypt Sports Media")}</span></a>
  <button class="burger" aria-label="Menu" aria-expanded="false" id="bg">☰</button>
  <nav id="nv">${NAV.map(([k,p])=>`<a data-l href="${p}" class="${path==p?"on":""}" ${path==p?'aria-current="page"':""}>${T(k)}</a>`).join("")}<button class="lang" id="lg">${L=="ar"?"English":"العربية"}</button></nav></div></header>
  <main>${body}</main>
  <footer><div class="wrap"><div><b>${esc(S.name||"Egypt Sports Media")}</b><div>${esc(pick(S,"footer"))}</div><div>© ${new Date().getFullYear()} ${T("rights")}</div></div>
  <div>${S.phone?`<div><a href="tel:${esc(S.phone)}">${esc(S.phone)}</a></div>`:""}${S.email?`<div><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></div>`:""}<div>${social()}</div></div></div></footer>`;
}
const priceOf=x=>x.price?esc(x.price):T("quote");
const empty=()=>`<p class="empty">${T("empty")}</p>`;
const imgOf=x=>safeUrl(x.image)||(x.image||"").startsWith("data:image/")?`<img class="c" loading="lazy" src="${esc(x.image)}" alt="${esc(pick(x,"title"))}">`:"";
const svc=x=>`<article class="card">${imgOf(x)}<div class="b"><h3>${esc(pick(x,"title"))}</h3><p>${esc(pick(x,"desc"))}</p><div class="price">${priceOf(x)}</div><a data-l class="btn sm" href="/contact">${T("request")}</a></div></article>`;
const pkg=x=>`<article class="card ${x.featured=="yes"?"feat":""}"><div class="b"><h3>${esc(pick(x,"title"))}</h3><div class="price">${priceOf(x)}${x.currency?" "+esc(x.currency):""}</div><p>${esc(pick(x,"desc"))}</p><p>${esc(x.features||"")}</p><a data-l class="btn sm" href="/contact">${T("request")}</a></div></article>`;
const prj=x=>`<article class="card">${imgOf(x)}<div class="b"><h3>${esc(pick(x,"title"))}</h3>${x.category?`<span class="tag">${esc(x.category)}</span>`:""}<p>${esc(pick(x,"desc"))}</p>${safeUrl(x.video)?`<a class="btn sm dark" target="_blank" rel="noopener noreferrer" href="${esc(x.video)}">${T("watch")}</a>`:""}</div></article>`;
const sec=(title,items,fn,alt,link)=>items.length?`<section class="s ${alt?"alt":""}"><div class="wrap"><h2>${title}</h2><div class="grid">${items.map(fn).join("")}</div>${link?`<p><a data-l class="btn ghost" href="${link}">${T("more")}</a></p>`:""}</div></section>`:"";

const pages={
 async "/"(){const [s,p,w]=await Promise.all([load("services"),load("packages"),load("projects")]);
  const bg=S.heroBg?`style="background-image:url('${esc(S.heroBg)}')"`:"";
  return `<section class="hero" ${bg}><div class="wrap"><img src="${esc(safeUrl(S.logo)||"/logo.jpg")}" alt="Egypt Sports Media"><div><h1>${esc(pick(S,"heroTitle")||T("welcome"))}</h1><p>${esc(pick(S,"heroText"))}</p><div class="btns"><a data-l class="btn" href="${esc(S.heroLink1||"/services")}">${esc(pick(S,"heroBtn1")||T("explore"))}</a><a data-l class="btn alt" href="${esc(S.heroLink2||"/work")}">${esc(pick(S,"heroBtn2")||T("seeWork"))}</a></div></div></div></section>`
  +(pick(S,"about")?`<section class="s"><div class="wrap"><h2>${T("about")}</h2><p class="txt" style="white-space:pre-line;max-width:760px">${esc(pick(S,"about"))}</p></div></section>`:"")
  +sec(T("services"),s.slice(0,3),svc,1,"/services")+sec(T("pricing"),p.filter(x=>x.featured=="yes").concat(p.filter(x=>x.featured!="yes")).slice(0,3),pkg,0,"/pricing")+sec(T("work"),w.slice(0,6),prj,1,"/work")
  +`<section class="s"><div class="wrap"><h2>${T("ctaT")}</h2><a data-l class="btn" href="/contact">${T("contact")}</a></div></section>`},
 async "/about"(){return `<div class="wrap page"><h1>${T("about")}</h1>${pick(S,"about")?`<p class="txt">${esc(pick(S,"about"))}</p>`:empty()}${pick(S,"mission")?`<h2>${L=="ar"?"الرسالة والرؤية":"Mission & Vision"}</h2><p class="txt">${esc(pick(S,"mission"))}</p>`:""}</div>`},
 async "/services"(){const s=await load("services");return `<div class="wrap page"><h1>${T("services")}</h1>${s.length?`<div class="grid">${s.map(svc).join("")}</div>`:empty()}</div>`},
 async "/pricing"(){const s=await load("packages");return `<div class="wrap page"><h1>${T("pricing")}</h1>${s.length?`<div class="grid">${s.map(pkg).join("")}</div>`:empty()}</div>`},
 async "/work"(){const w=await load("projects"),cats=[...new Set(w.map(x=>x.category).filter(Boolean))];
  return `<div class="wrap page"><h1>${T("work")}</h1>${w.length?`${cats.length?`<div class="filters" id="fl"><button class="btn sm ghost on" data-c="">${T("all")}</button>${cats.map(c=>`<button class="btn sm ghost" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>`:""}<div class="grid" id="pg">${w.map(prj).join("")}</div>`:empty()}</div>`},
 async "/payment"(){const p=await load("paymentMethods");return `<div class="wrap page"><h1>${T("payment")}</h1>${p.length?`<div class="grid">${p.map(x=>`<article class="card">${imgOf(x)}<div class="b"><h3>${esc(pick(x,"title"))}</h3><p>${esc(pick(x,"desc"))}</p>${x.account?`<p dir="ltr"><b>${esc(x.account)}</b></p>`:""}${safeUrl(x.link)?`<a class="btn sm" target="_blank" rel="noopener noreferrer" href="${esc(x.link)}">Link</a>`:""}</div></article>`).join("")}</div>`:empty()}</div>`},
 async "/faq"(){const f=await load("faqs");return `<div class="wrap page"><h1>${T("faq")}</h1>${f.length?f.map(x=>`<details><summary>${esc(pick(x,"title"))}</summary><p>${esc(pick(x,"desc"))}</p></details>`).join(""):empty()}</div>`},
 async "/contact"(){const s=await load("services");
  return `<div class="wrap page"><h1>${T("contact")}</h1><form class="f" id="cf" novalidate>
  <label>${T("name")} *<input name="name" maxlength="100" required></label>
  <label>${T("cInfo")} *<input name="contact" maxlength="100" required></label>
  <label>${T("service")}<select name="service"><option value=""></option>${s.map(x=>`<option>${esc(pick(x,"title"))}</option>`).join("")}</select></label>
  <label>${T("date")}<input type="date" name="date"></label><label>${T("budget")}<input name="budget" maxlength="60"></label>
  <label>${T("message")} *<textarea name="message" maxlength="2000" required></textarea></label>
  <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><small>${T("consent")}</small>
  <button class="btn" id="sb">${T("send")}</button><div id="fm" role="status"></div></form>
  ${S.whatsapp&&safeUrl(S.whatsapp)?`<p><a class="btn dark" target="_blank" rel="noopener noreferrer" href="${esc(S.whatsapp)}">WhatsApp</a></p>`:""}</div>`}
};
async function custom(slug){const p=(await load("pages")).find(x=>x.slug==slug);if(!p)return null;setMeta(pick(p,"title"));return `<div class="wrap page"><h1>${esc(pick(p,"title"))}</h1><p class="txt">${esc(pick(p,"desc"))}</p></div>`}

function bind(path){
  $("#bg")?.addEventListener("click",()=>{const n=$("#nv"),o=n.classList.toggle("open");$("#bg").setAttribute("aria-expanded",o)});
  $("#lg")?.addEventListener("click",()=>{L=L=="ar"?"en":"ar";localStorage.setItem("lang",L);render()});
  $("#fl")?.addEventListener("click",async e=>{const c=e.target.dataset?.c;if(c===undefined)return;[...$("#fl").children].forEach(b=>b.classList.toggle("on",b==e.target));const w=(await load("projects")).filter(x=>!c||x.category==c);$("#pg").innerHTML=w.map(prj).join("")});
  $("#cf")?.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target),v=k=>(f.get(k)||"").toString().trim(),m=$("#fm");
    if(v("website"))return;
    if(!v("name")||v("contact").length<5||!v("message")){m.className="msg err";m.textContent=T("bad");return}
    $("#sb").disabled=true;
    try{await addDoc(collection(db,"contactSubmissions"),{name:v("name").slice(0,100),contact:v("contact").slice(0,100),service:v("service").slice(0,100),date:v("date"),budget:v("budget").slice(0,60),message:v("message").slice(0,2000),status:"new",createdAt:serverTimestamp()});e.target.reset();m.className="msg";m.textContent=T("sent")}
    catch(err){console.error(err);m.className="msg err";m.textContent=T("fail")}
    $("#sb").disabled=false});
}

/* ---------- admin ---------- */
const COMMON=[["title_ar","text","العنوان (عربي)"],["title_en","text","Title (English)"],["desc_ar","area","الوصف (عربي)"],["desc_en","area","Description (English)"]];
const COLS={
 services:{n:"Services / الخدمات",f:[...COMMON,["price","text","Price / السعر (leave empty = quote)"],["image","img","Image / صورة"]]},
 packages:{n:"Packages / الباقات",f:[...COMMON,["price","text","Price / السعر"],["currency","text","Currency / العملة"],["features","area","Features (one per line)"],["featured","sel:no,yes","Featured"]]},
 projects:{n:"Portfolio / الأعمال",f:[...COMMON,["category","text","Category / التصنيف"],["video","text","Video URL"],["image","img","Cover image"]]},
 paymentMethods:{n:"Payment / الدفع",f:[...COMMON,["account","text","Account details (public)"],["link","text","Payment link"],["image","img","Logo"]]},
 faqs:{n:"FAQ / الأسئلة",f:[["title_ar","text","السؤال (عربي)"],["title_en","text","Question (English)"],["desc_ar","area","الإجابة (عربي)"],["desc_en","area","Answer (English)"]]},
 pages:{n:"Pages / صفحات",f:[...COMMON,["slug","text","Slug (a-z, 0-9, -)"]]}
};
const SET=[["name","text","Company name"],["logo","img","Logo (leave empty = default)"],["heroBg","img","Hero background"],["heroTitle_ar","text","Hero title AR"],["heroTitle_en","text","Hero title EN"],["heroText_ar","area","Hero text AR"],["heroText_en","area","Hero text EN"],["heroBtn1_ar","text","Button 1 AR"],["heroBtn1_en","text","Button 1 EN"],["heroLink1","text","Button 1 link (/services)"],["heroBtn2_ar","text","Button 2 AR"],["heroBtn2_en","text","Button 2 EN"],["heroLink2","text","Button 2 link (/work)"],["about_ar","area","About AR"],["about_en","area","About EN"],["mission_ar","area","Mission & vision AR"],["mission_en","area","Mission & vision EN"],["phone","text","Phone"],["email","text","Email"],["whatsapp","text","WhatsApp link (https://wa.me/...)"],["facebook","text","Facebook URL"],["instagram","text","Instagram URL"],["youtube","text","YouTube URL"],["tiktok","text","TikTok URL"],["footer_ar","text","Footer AR"],["footer_en","text","Footer EN"],["desc_ar","area","SEO description AR"],["desc_en","area","SEO description EN"]];
let tab="dash";

function compress(file){return new Promise((res,rej)=>{if(!/^image\/(jpeg|png|webp)$/.test(file.type))return rej("type");const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const k=Math.min(1,900/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*k;c.height=i.height*k;c.getContext("2d").drawImage(i,0,0,c.width,c.height);const d=c.toDataURL("image/jpeg",.75);d.length>900000?rej("size"):res(d)};i.onerror=()=>rej("img");i.src=r.result};r.readAsDataURL(file)})}
function fieldHtml([k,t,l],v){v=v??"";
 if(t=="area")return `<label>${l}<textarea data-k="${k}">${esc(v)}</textarea></label>`;
 if(t=="img")return `<label>${l}<input type="file" accept="image/jpeg,image/png,image/webp" data-f="${k}"><input type="hidden" data-k="${k}" value="${esc(v)}">${v?`<img src="${esc(v)}" style="max-width:140px" alt="">`:""}<small class="im"></small></label>`;
 if(t.startsWith("sel:"))return `<label>${l}<select data-k="${k}">${t.slice(4).split(",").map(o=>`<option ${o==v?"selected":""}>${o}</option>`).join("")}</select></label>`;
 return `<label>${l}<input data-k="${k}" value="${esc(v)}"></label>`}
function wireForm(box){box.querySelectorAll("[data-f]").forEach(i=>i.addEventListener("change",async()=>{const h=box.querySelector(`[data-k="${i.dataset.f}"]`),m=i.parentElement.querySelector(".im");try{h.value=await compress(i.files[0]);m.textContent="✓ ready"}catch(e){m.textContent=e=="size"?"Image too large (max ~900KB after resize)":"Only JPG/PNG/WEBP images"}}))}
const vals=box=>Object.fromEntries([...box.querySelectorAll("[data-k]")].map(i=>[i.dataset.k,i.value.trim()]));
const toast=(t,e)=>{const m=$("#tm");if(m){m.className="msg"+(e?" err":"");m.textContent=t}};

async function renderAdmin(){
  setMeta("Admin");
  if(!user){root.innerHTML=`<div class="login"><h1>${esc("Egypt Sports Media")}</h1><form class="f" id="lf"><label>Email<input type="email" name="e" required autocomplete="username"></label><label>Password<input type="password" name="p" required autocomplete="current-password"></label><button class="btn">Login / دخول</button><div id="tm" role="alert"></div></form></div>`;
   $("#lf").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await signInWithEmailAndPassword(auth,f.get("e"),f.get("p"))}catch{toast("Wrong email or password",1)}};return}
  const tabs=[["dash","Dashboard"],["settings","Website Settings"],...Object.entries(COLS).map(([k,c])=>[k,c.n]),["subs","Contact Submissions"]];
  root.innerHTML=`<div class="adm"><aside class="side">${tabs.map(([k,n])=>`<button data-t="${k}" class="${tab==k?"on":""}">${n}</button>`).join("")}<button id="lo">Logout</button><a data-l href="/" style="padding:10px">← Site</a></aside><div class="main"><div id="tm" role="status"></div><div id="pn">Loading…</div></div></div>`;
  root.querySelectorAll("[data-t]").forEach(b=>b.onclick=()=>{tab=b.dataset.t;renderAdmin()});$("#lo").onclick=()=>signOut(auth);
  const pn=$("#pn");
  try{
   if(tab=="dash"){const out=[];for(const k of Object.keys(COLS)){const r=await load(k,1);out.push([COLS[k].n,r.filter(x=>x.status=="published").length,r.length])}
    const subs=await getDocs(collection(db,"contactSubmissions"));const n=subs.docs.filter(d=>d.data().status=="new").length;
    pn.innerHTML=`<h2>Dashboard</h2><div class="stats">${out.map(([n,p,t])=>`<div class="stat"><b>${p}</b>${n}<br><small>${t} total</small></div>`).join("")}<div class="stat"><b>${n}</b>New requests</div></div>`}
   else if(tab=="settings"){await loadSettings();pn.innerHTML=`<h2>Website Settings</h2><div class="panel" id="fm">${SET.map(f=>fieldHtml(f,S[f[0]])).join("")}<button class="btn" id="sv">Save</button></div>`;wireForm(pn);
    $("#sv").onclick=async()=>{const d=vals(pn);for(const k of["whatsapp","facebook","instagram","youtube","tiktok"])if(d[k]&&!/^https?:\/\//.test(d[k]))return toast("Invalid URL: "+k,1);try{await setDoc(doc(db,"settings","site"),d);S=d;toast("Saved ✓")}catch{toast("Save failed (are you an authorized admin?)",1)}}}
   else if(tab=="subs"){const r=(await getDocs(collection(db,"contactSubmissions"))).docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    pn.innerHTML=`<h2>Contact Submissions</h2><input id="q" placeholder="Search…" style="margin-bottom:10px"><div id="ls"></div>`;
    const draw=()=>{const q=$("#q").value.toLowerCase();$("#ls").innerHTML=r.filter(x=>JSON.stringify(x).toLowerCase().includes(q)).map(x=>`<div class="row" style="display:grid"><b>${esc(x.name)} — ${esc(x.contact)}</b><div>${esc(x.service)} ${esc(x.date)} ${esc(x.budget)}</div><div style="white-space:pre-line">${esc(x.message)}</div><select data-s="${x.id}">${["new","in progress","completed"].map(o=>`<option ${o==x.status?"selected":""}>${o}</option>`).join("")}</select><textarea data-n="${x.id}" placeholder="Private note">${esc(x.note||"")}</textarea><div><button class="btn sm" data-sv="${x.id}">Save</button> <button class="btn sm dark" data-dl="${x.id}">Delete</button></div></div>`).join("")||`<p class="empty">No submissions</p>`;
     $("#ls").querySelectorAll("[data-sv]").forEach(b=>b.onclick=async()=>{const id=b.dataset.sv;try{await setDoc(doc(db,"contactSubmissions",id),{status:$(`[data-s="${id}"]`).value,note:$(`[data-n="${id}"]`).value},{merge:true});toast("Saved ✓")}catch{toast("Save failed",1)}});
     $("#ls").querySelectorAll("[data-dl]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete?"))return;await deleteDoc(doc(db,"contactSubmissions",b.dataset.dl));renderAdmin()})};
    $("#q").oninput=draw;draw()}
   else{const c=COLS[tab],r=await load(tab,1);
    pn.innerHTML=`<h2>${c.n}</h2><button class="btn" id="ad">+ Add</button><div id="ed"></div><div style="margin-top:14px">${r.map(x=>`<div class="row">${x.image?`<img src="${esc(x.image)}" alt="">`:""}<span class="t">${esc(x.title_ar||x.title_en||"—")}</span><span class="tag">${x.status}</span><span>#${x.order||0}</span><button class="btn sm" data-e="${x.id}">Edit</button><button class="btn sm dark" data-d="${x.id}">Delete</button></div>`).join("")||`<p class="empty">Empty</p>`}</div>`;
    const edit=x=>{x=x||{status:"draft",order:r.length+1};$("#ed").innerHTML=`<div class="panel" style="margin:14px 0;padding:14px;border:1px solid var(--line);border-radius:8px">${c.f.map(f=>fieldHtml(f,x[f[0]])).join("")}${fieldHtml(["order","text","Order"],x.order)}${fieldHtml(["status","sel:draft,published","Status"],x.status)}<div><button class="btn" id="sv">Save</button> <button class="btn ghost" id="cn">Cancel</button></div></div>`;wireForm($("#ed"));$("#cn").onclick=()=>$("#ed").innerHTML="";
     $("#sv").onclick=async()=>{const d=vals($("#ed"));if(!d.title_ar&&!d.title_en)return toast("Title required",1);if(tab=="pages"&&!/^[a-z0-9-]+$/.test(d.slug||""))return toast("Invalid slug",1);d.order=+d.order||0;
      try{x.id?await setDoc(doc(db,tab,x.id),d):await addDoc(collection(db,tab),d);cache={};toast("Saved ✓");tab=tab;renderAdmin()}catch{toast("Save failed (are you an authorized admin?)",1)}}};
    $("#ad").onclick=()=>edit();pn.querySelectorAll("[data-e]").forEach(b=>b.onclick=()=>edit(r.find(x=>x.id==b.dataset.e)));
    pn.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{if(!confirm("Delete?"))return;await deleteDoc(doc(db,tab,b.dataset.d));cache={};renderAdmin()})}
  }catch(e){console.error(e);pn.innerHTML=`<p class="msg err">Error loading data. Check Firestore rules and that you are an authorized admin.</p>`}
}

/* ---------- router ---------- */
async function render(){
  const path=location.pathname.replace(/\/+$/,"")||"/";
  document.documentElement.lang=L;document.documentElement.dir=L=="ar"?"rtl":"ltr";
  if(path.startsWith("/admin")){return renderAdmin()}
  let body,fn=pages[path];
  if(fn)body=await fn();else if(path.startsWith("/p/"))body=await custom(path.slice(3));
  if(!body)body=`<div class="wrap page"><h1>404</h1><a data-l class="btn" href="/">${T("home")}</a></div>`;
  setMeta(S.name?`${T(NAV.find(n=>n[1]==path)?.[0]||"home")} | ${S.name}`:undefined);
  root.innerHTML=shell(body,path);bind(path);
}
onAuthStateChanged(auth,u=>{user=u;if(location.pathname.startsWith("/admin"))render()});
render();
loadSettings().then(()=>{if(!location.pathname.startsWith("/admin"))render()});
addEventListener("error",e=>{if(!root.innerHTML.trim())root.innerHTML=`<pre style="padding:20px;color:#b00;white-space:pre-wrap">Error: ${esc(e.message)}</pre>`});
