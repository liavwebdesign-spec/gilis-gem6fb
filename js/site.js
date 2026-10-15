/* Gili's Tours · ההתנהגויות מיובאות מה-Motion Vault: hd9 (הדר ומגירה), h3 (הירו), g25 (השמש על הקשת), g141 (שיחת וואטסאפ), g02 (חשיפה במסכה), g56 (רגע במסך מלא), C12 (מסדרון), ft8 (פוטר), B19 (נגישות) */
(function(){
"use strict";
var doc=document.documentElement;

/* ---------- MV:h3 · כניסה כשהאלמנט על המסך, נמדד ישירות ולא דרך IntersectionObserver ---------- */
function inView(el,f){
  var ro;
  function chk(){
    var r=el.getBoundingClientRect();
    if(r.top<innerHeight*.9&&r.bottom>0){off();f();}
  }
  function off(){removeEventListener("scroll",chk);removeEventListener("resize",chk);if(ro)ro.disconnect();}
  addEventListener("scroll",chk,{passive:true}); addEventListener("resize",chk);
  if(window.ResizeObserver){ro=new ResizeObserver(chk);ro.observe(document.body);}
  requestAnimationFrame(chk); setTimeout(chk,300);
}
function enter(root){
  var els=root.querySelectorAll(".rv");
  els.forEach(function(el,i){if(!el.style.getPropertyValue("--i"))el.style.setProperty("--i",i);});
  // סקריפט שרץ באיחור, אחרי שרשת הביטחון כבר הראתה את ההירו: נשאר גלוי, בלי כניסה שנייה
  if(els.length&&getComputedStyle(els[0]).opacity==="1")root.classList.add("is-in");
  root.classList.add("rv-on");
  inView(root,function(){root.classList.add("is-in");});
}

/* ---------- הירו: הסרטון נטען רק כשהוא על המסך, ומתנגן לכולם, עם כפתור עצירה ---------- */
(function(){
  var root=document.querySelector(".hero"); if(!root)return;
  var v=root.querySelector("video"), pp=root.querySelector(".hero-pp");
  enter(root);
  if(!v)return;
  inView(root,function(){
    // מתג "עצירת אנימציות" בסרגל הנגישות: הפוסטר נשאר
    if(doc.classList.contains("a11y-still"))return;
    v.querySelectorAll("source").forEach(function(s){if(s.dataset.src)s.src=s.dataset.src;});
    v.muted=true; v.setAttribute("autoplay",""); v.load();
    // אם הדפדפן חוסם הפעלה אוטומטית, הפוסטר פשוט נשאר וההירו עובד
    var p=v.play(); if(p&&p.then)p.then(on,function(){}); else on();
  });
  function on(){v.classList.add("on"); pp.hidden=false;}
  function set(stop){
    if(stop)v.pause(); else{var p=v.play(); if(p&&p.catch)p.catch(function(){});}
    pp.setAttribute("aria-pressed",String(stop));
    pp.setAttribute("aria-label",stop?"הפעלת הווידאו":"עצירת הווידאו");
  }
  pp.addEventListener("click",function(){set(!v.paused);});
  // סרגל הנגישות קורא לזה כשמפעילים או מכבים את עצירת האנימציות
  window.gilisVideo=function(still){if(!v.src&&!v.currentSrc)return; set(!!still);};
})();

// כניסה בגלילה לסקשנים ולמסמכים, כמו בהירו
document.querySelectorAll("main > section:not(.hero), .doc-sec").forEach(function(s){if(s.querySelector(".rv"))enter(s);});

/* ---------- גלילה רכה לעוגנים בעמוד. ב-JS ולא ב-CSS, כי scroll-behavior:smooth על html שובר את הרענון של ScrollTrigger ---------- */
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');
  if(!a||a.classList.contains("skip")||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey)return;
  var id=decodeURIComponent(a.getAttribute("href").slice(1)), t=id&&document.getElementById(id); if(!t)return;
  var calm=matchMedia("(prefers-reduced-motion: reduce)").matches||doc.classList.contains("a11y-still");
  e.preventDefault();
  t.scrollIntoView({behavior:calm?"auto":"smooth",block:"start"});
  if(history.pushState)history.pushState(null,"","#"+id);
  // כמו בקישור רגיל: ה-Tab הבא ממשיך מהיעד
  if(!t.hasAttribute("tabindex")){t.setAttribute("tabindex","-1");t.setAttribute("data-anchor-focus","");}
  t.focus({preventScroll:true});
});

/* ---------- MV:hd9 · מגירה בטלפון ---------- */
function drawer(root, burger, header){
  var panel=root.querySelector(".md-panel"), scrim=root.querySelector(".md-scrim"), closeBtn=root.querySelector(".md-close");
  var last=null;
  root.querySelectorAll(".md-item").forEach(function(el,i){el.style.setProperty("--i",i);});
  panel.inert=true;
  function set(open){
    root.classList.toggle("open",open);
    panel.inert=!open;
    if(header)header.classList.toggle("menu-open",open);
    if(burger)burger.setAttribute("aria-expanded",String(open));
    // נעילת גלילה בלי קפיצה: נועלים את <html> ושומרים את מקום פס הגלילה
    doc.style.scrollbarGutter=open?"stable":"";
    doc.style.overflow=open?"hidden":"";
    if(open){last=document.activeElement;setTimeout(function(){closeBtn.focus();},180);}
    else{var to=(last&&last!==document.body)?last:burger; if(to)to.focus({preventScroll:true});}
  }
  if(burger)burger.addEventListener("click",function(){set(!root.classList.contains("open"));});
  closeBtn.addEventListener("click",function(){set(false);});
  scrim.addEventListener("click",function(){set(false);});
  root.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){set(false);});});
  addEventListener("keydown",function(e){
    if(!root.classList.contains("open"))return;
    if(e.key==="Escape"){set(false);return;}
    if(e.key!=="Tab")return;
    var f=[].slice.call(panel.querySelectorAll("a,button")).filter(function(x){return !x.closest("[inert]")&&x.offsetParent!==null;});
    var i=f.indexOf(document.activeElement);
    var n=e.shiftKey?(i<=0?f.length-1:i-1):(i===f.length-1?0:i+1);
    e.preventDefault(); f[n].focus();
  });
  return set;
}

/* ---------- MV:hd9 · headroom: יוצא בגלילה למטה, חוזר בתנועה הראשונה למעלה ---------- */
function headroom(el,opt){
  opt=opt||{};
  var tol=opt.tol||6, last=0, raf=0;
  function upd(){
    raf=0;
    var y=window.scrollY, d=y-last, top=opt.top!=null?opt.top:el.offsetHeight+24;
    el.classList.toggle("is-scrolled",y>8||el.hasAttribute("data-solid"));
    var hold=el.classList.contains("menu-open")||!!el.querySelector(":focus-visible");
    if(y<=top||hold){el.classList.remove("is-hidden");last=y;return;}
    if(Math.abs(d)<tol)return;
    el.classList.toggle("is-hidden",d>0);
    last=y;
  }
  addEventListener("scroll",function(){if(!raf)raf=requestAnimationFrame(upd);},{passive:true});
  el.addEventListener("focusin",upd);
  last=window.scrollY; upd();
  return upd;
}
var hd=document.getElementById("hd");
if(hd){headroom(hd); var md=document.getElementById("md"); if(md)drawer(md,hd.querySelector(".burger"),hd);}

/* ---------- B19 · סרגל הנגישות (ת"י 5568). נבנה מכאן, כדי שיופיע בכל עמוד שטוען את הקובץ ---------- */
(function(){
  var KEY="gilis-a11y", fab=document.querySelector(".fab-a11y"); if(!fab)return;
  var MODES=[["contrast","ניגודיות גבוהה"],["gray","גווני אפור"],["invert","היפוך צבעים"],["links","הדגשת קישורים"],
    ["font","גופן קריא"],["spacing","ריווח שורות"],["still","עצירת אנימציות"],["cursor","סמן גדול"],["guide-on","קו קריאה"]];
  var SCALES=[1,1.12,1.25,1.4];
  var saved={}; try{saved=JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){}
  saved.scale=saved.scale||0;
  var statement=fab.getAttribute("href");
  // הקישור להצהרה עובד גם בלי JS; כאן הוא הופך לכפתור שפותח את החלונית
  // בדסקטופ הכפתור צף בפינה; בטלפון ובטאבלט הוא בהדר, ליד התפריט, כדי שהפס התחתון לא ישב על טקסט
  var btns=[fab,document.querySelector(".hd-a11y")].filter(Boolean).map(function(a){
    var b=document.createElement("button");
    b.type="button"; b.className=a.className; b.innerHTML=a.innerHTML;
    b.setAttribute("aria-label","נגישות: התאמות תצוגה"); b.setAttribute("aria-expanded","false"); b.setAttribute("aria-controls","a11y-panel");
    a.replaceWith(b); return b;
  }), opener=btns[0];
  var panel=document.createElement("div");
  panel.className="a11y-panel"; panel.id="a11y-panel"; panel.lang="he"; panel.dir="rtl";
  panel.setAttribute("role","dialog"); panel.setAttribute("aria-labelledby","a11y-title"); panel.setAttribute("aria-modal","false");
  panel.innerHTML='<div class="a11y-head"><h2 id="a11y-title">התאמות תצוגה</h2><button class="a11y-x" type="button" aria-label="סגירת התאמות התצוגה"><svg class="ic" aria-hidden="true"><use href="img/icons.svg#i-cross"/></svg></button></div>'+
    '<div class="a11y-opts"><div class="a11y-row"><span id="a11y-size">גודל טקסט</span><button type="button" data-size="-1" aria-describedby="a11y-size">הקטנה</button><button type="button" data-size="1" aria-describedby="a11y-size">הגדלה</button></div>'+
    MODES.map(function(m){return '<button type="button" data-mode="'+m[0]+'" aria-pressed="false">'+m[1]+"</button>";}).join("")+
    '<button type="button" data-reset>איפוס כל ההגדרות</button></div>'+
    '<div class="a11y-foot"><a href="'+statement+'">הצהרת נגישות</a><span class="a11y-note">ההגדרות נשמרות לביקור הבא</span></div>';
  panel.setAttribute("inert","");
  var scrim=document.createElement("div"); scrim.className="a11y-scrim";
  var guide=document.createElement("div"); guide.className="a11y-guide"; guide.setAttribute("aria-hidden","true");
  document.body.appendChild(scrim); document.body.appendChild(panel); document.body.appendChild(guide);
  addEventListener("pointermove",function(e){if(saved["guide-on"])guide.style.transform="translateY("+(e.clientY-2)+"px)";},{passive:true});

  var wasStill=null;
  function apply(){
    doc.style.setProperty("--a11y-scale",SCALES[saved.scale]);
    MODES.forEach(function(m){
      var on=!!saved[m[0]]; doc.classList.toggle("a11y-"+m[0],on);
      var b=panel.querySelector('[data-mode="'+m[0]+'"]'); if(b)b.setAttribute("aria-pressed",String(on));
    });
    // "עצירת אנימציות" מגיע גם למה שה-CSS לא מגיע אליו: הווידאו, ומהלכי הגלילה (הם נבנים מחדש במצב שקט)
    var still=!!saved.still;
    if(still!==wasStill){
      if(window.gilisVideo)window.gilisVideo(still);
      if(wasStill!==null)document.dispatchEvent(new CustomEvent("a11y:still",{detail:still}));
      wasStill=still;
    }
    try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(e){}
  }
  function open(o){
    panel.classList.toggle("open",o); scrim.classList.toggle("open",o);
    btns.forEach(function(b){b.setAttribute("aria-expanded",String(o));});
    if(o){panel.removeAttribute("inert"); setTimeout(function(){panel.querySelector(".a11y-x").focus();},60);}
    else{panel.setAttribute("inert",""); opener.focus({preventScroll:true});}
  }
  btns.forEach(function(b){b.addEventListener("click",function(){opener=b; open(!panel.classList.contains("open"));});});
  panel.querySelector(".a11y-x").addEventListener("click",function(){open(false);});
  scrim.addEventListener("click",function(){open(false);});
  panel.addEventListener("keydown",function(e){if(e.key==="Escape")open(false);});
  document.addEventListener("pointerdown",function(e){if(panel.classList.contains("open")&&!panel.contains(e.target)&&!btns.some(function(b){return b.contains(e.target);})&&e.target!==scrim)open(false);});
  panel.querySelectorAll("[data-mode]").forEach(function(b){
    b.addEventListener("click",function(){
      var k=b.getAttribute("data-mode"); saved[k]=!saved[k];
      if(k==="gray"&&saved.gray)saved.invert=false; if(k==="invert"&&saved.invert)saved.gray=false;   // מסנן אחד בכל פעם
      apply();
    });
  });
  panel.querySelectorAll("[data-size]").forEach(function(b){
    b.addEventListener("click",function(){saved.scale=Math.max(0,Math.min(SCALES.length-1,saved.scale+(+b.getAttribute("data-size"))));apply();});
  });
  panel.querySelector("[data-reset]").addEventListener("click",function(){saved={scale:0};apply();});
  apply();
})();

/* ---------- MV:ft8 · שנה, וכניסה שקטה של הפוטר ---------- */
document.querySelectorAll("[data-year]").forEach(function(e){e.textContent=new Date().getFullYear();});
(function(){var f=document.getElementById("ft"); if(f)inView(f,function(){f.classList.add("is-in");});})();

/* ---------- וואטסאפ צף. בדסקטופ כפתור אחרי מסך גלילה; בטלפון ובטאבלט פס תחתון. בביקור הראשון בועה קצרה ---------- */
(function(){
  var wa=document.querySelector(".fab-wa"); if(!wa)return;
  var bar=wa.parentNode, hero=document.querySelector(".hero, .nf"), cta=document.querySelector(".cta"), foot=document.querySelector("footer"),
      mq=matchMedia("(max-width:1023px)"), tipped=false, KEY="gilis-tip", raf=0;
  // כפתורי וואטסאפ אחרים בעמוד: כשאחד מהם על המסך, הפס לא מכפיל אותו
  var same=[].slice.call(document.querySelectorAll('a[href^="https://wa.me"]')).filter(function(a){return !bar.contains(a)&&!a.closest("#md, dialog, header");});
  function seen(el){if(!el)return false; var r=el.getBoundingClientRect(); return r.height>0&&r.top<innerHeight&&r.bottom>0;}
  function upd(){
    raf=0;
    var on, gone=false;
    if(mq.matches){
      // הפס מופיע אחרי ההירו, ויורד כולו כשעל המסך כפתור וואטסאפ אחר, פס הסיום או הפוטר (conversion.md 1)
      var heroUp=!!hero&&hero.getBoundingClientRect().bottom>innerHeight-72, block=same.some(seen)||seen(cta)||seen(foot);
      on=!heroUp&&!block; gone=!on;
    }else{
      // בעמוד בלי הירו הכפתור שם מההתחלה (בעמוד תודה ו-404 הכפתור הגדול של העמוד הוא ההירו); ליד פס הסיום, שבו כבר יש כפתור וואטסאפ גדול, הוא יורד
      on=(!hero||scrollY>innerHeight*.9)&&!seen(cta);
    }
    wa.classList.toggle("is-off",!on); bar.classList.toggle("is-bar",on); bar.classList.toggle("is-gone",gone);
    if(on&&!tipped){
      tipped=true; var seenTip=false; try{seenTip=!!localStorage.getItem(KEY);}catch(e){}
      if(!seenTip){
        try{localStorage.setItem(KEY,"1");}catch(e){}
        setTimeout(function(){wa.classList.add("tip");},600);
        setTimeout(function(){wa.classList.remove("tip");},5600);
      }
    }
  }
  function req(){if(!raf)raf=requestAnimationFrame(upd);}
  addEventListener("scroll",req,{passive:true}); addEventListener("resize",req); document.addEventListener("click",function(){setTimeout(req,0);}); upd();
})();

/* ---------- C12 · מסדרון הביקורות: חיצים בדסקטופ ---------- */
(function(){
  var list=document.getElementById("rev-list"), nav=document.querySelector(".cor-nav"); if(!list||!nav)return;
  var prev=nav.querySelector('[data-dir="-1"]'), next=nav.querySelector('[data-dir="1"]');
  // בעברית הגלילה האופקית שלילית: scrollLeft רץ מ-0 עד מינוס הרוחב
  function pos(){return Math.abs(list.scrollLeft);}
  function upd(){
    var max=list.scrollWidth-list.clientWidth;
    nav.hidden=max<8;
    prev.disabled=pos()<4; next.disabled=pos()>max-4;
  }
  nav.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click",function(){
      var item=list.querySelector(".shot"), gap=parseFloat(getComputedStyle(list).columnGap)||0;
      var step=item?item.getBoundingClientRect().width+gap:list.clientWidth*.8;
      var rtl=getComputedStyle(list).direction==="rtl";
      var calm=doc.classList.contains("a11y-still")||matchMedia("(prefers-reduced-motion: reduce)").matches;
      list.scrollBy({left:(+b.dataset.dir)*step*(rtl?-1:1),behavior:calm?"auto":"smooth"});
    });
  });
  list.addEventListener("scroll",upd,{passive:true}); addEventListener("resize",upd); upd();
})();

/* ---------- עמוד יעד: לשוניות המלונות לפי סוג החופשה ---------- */
(function(){
  var bar=document.querySelector(".htl-tabs"), list=document.getElementById("htl-list"); if(!bar||!list)return;
  var tabs=[].slice.call(bar.querySelectorAll('[role="tab"]')), cards=[].slice.call(list.children);
  function pick(t,focus){
    tabs.forEach(function(x){var on=x===t; x.setAttribute("aria-selected",on); x.tabIndex=on?0:-1;});
    var type=t.dataset.type;
    cards.forEach(function(c){c.hidden=type!=="all"&&(" "+c.dataset.types+" ").indexOf(" "+type+" ")<0;});
    if(focus)t.focus();
  }
  tabs.forEach(function(t,i){
    t.addEventListener("click",function(){pick(t);});
    t.addEventListener("keydown",function(e){
      // בעברית החץ השמאלי מתקדם
      var k=e.key, n=k==="ArrowLeft"?i+1:k==="ArrowRight"?i-1:k==="Home"?0:k==="End"?tabs.length-1:null;
      if(n===null)return; e.preventDefault(); pick(tabs[(n+tabs.length)%tabs.length],true);
    });
  });
  bar.hidden=false;
})();

/* ---------- הרשימה שלי: לב על מלון או חוויה, והכל נשלח בהודעת וואטסאפ אחת ---------- */
(function(){
  var hearts=[].slice.call(document.querySelectorAll(".heart")), btn=document.querySelector(".ml-btn"), dlg=document.getElementById("ml");
  if(!btn||!dlg||!dlg.showModal)return;
  var KEY="gilis-list", ul=dlg.querySelector(".ml-items"), empty=dlg.querySelector(".ml-empty"), send=dlg.querySelector(".ml-send"),
      count=btn.querySelector(".ml-count"), toast=document.querySelector(".ml-toast"), items=[], tt=0;
  try{items=JSON.parse(localStorage.getItem(KEY)||"[]");}catch(e){items=[];}
  if(!Array.isArray(items))items=[];
  function save(){try{localStorage.setItem(KEY,JSON.stringify(items));}catch(e){}}
  function idx(n,d){for(var i=0;i<items.length;i++)if(items[i].n===n&&items[i].d===d)return i; return -1;}
  function say(t){toast.textContent=t; toast.classList.add("on"); clearTimeout(tt); tt=setTimeout(function(){toast.classList.remove("on");},4200);}
  function render(){
    hearts.forEach(function(h){
      var on=idx(h.dataset.name,h.dataset.dest)>-1;
      h.setAttribute("aria-pressed",on);
      h.setAttribute("aria-label",(on?"הסרה מהרשימה שלי: ":"הוספה לרשימה שלי: ")+h.dataset.name);
    });
    count.textContent=items.length; btn.hidden=!items.length;
    ul.textContent="";
    items.forEach(function(it,i){
      var li=document.createElement("li"), th=document.createElement("span"), tx=document.createElement("span"), b=document.createElement("b"), s=document.createElement("small"), x=document.createElement("button");
      th.className="ml-th";
      if(it.img){var im=document.createElement("img"); im.src=it.img; im.alt=""; im.width=56; im.height=70; im.loading="lazy"; th.appendChild(im);}
      b.textContent=it.n; s.textContent=it.d; tx.append(b,s);
      x.type="button"; x.className="ml-rm"; x.textContent="הסרה"; x.setAttribute("aria-label","הסרה: "+it.n);
      x.addEventListener("click",function(){
        items.splice(i,1); save(); render();
        var next=ul.querySelectorAll(".ml-rm")[Math.min(i,items.length-1)]; (next||dlg.querySelector(".ml-x")).focus();
      });
      li.append(th,tx,x); ul.appendChild(li);
    });
    empty.hidden=!!items.length; send.hidden=!items.length;
    var msg="היי, הכנתי רשימה באתר:\n"+items.map(function(it){return "• "+it.n+" ("+it.d+")";}).join("\n")+"\nאשמח שתבנו לי הצעה";
    send.href="https://wa.me/972544050071?text="+encodeURIComponent(msg);
  }
  hearts.forEach(function(h){
    h.addEventListener("click",function(){
      var i=idx(h.dataset.name,h.dataset.dest), first=!items.length;
      if(i>-1)items.splice(i,1); else items.push({n:h.dataset.name,d:h.dataset.dest,img:h.dataset.img||""});
      save(); render();
      if(i<0)say(first?"נשמר ברשימה שלכם. כשתסיימו לבחור, שולחים לנו הכל בהודעה אחת.":"נוסף לרשימה שלכם.");
      else say("הוסר מהרשימה.");
    });
  });
  btn.addEventListener("click",function(){dlg.showModal();});
  dlg.querySelector(".ml-x").addEventListener("click",function(){dlg.close();});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close();});
  dlg.addEventListener("close",function(){if(!btn.hidden)btn.focus();});
  // רשימה ששונתה בלשונית אחרת
  addEventListener("storage",function(e){if(e.key!==KEY)return; try{items=JSON.parse(e.newValue||"[]")||[];}catch(x){items=[];} render();});
  render();
})();

/* ---------- הטופס הקצר (משני לוואטסאפ) ---------- */
(function(){
  var dlg=document.getElementById("lead"); if(!dlg||!dlg.showModal)return;
  var form=dlg.querySelector("form"), step=dlg.querySelector(".lead-step"), done=dlg.querySelector(".lead-done"), fail=dlg.querySelector(".lead-fail"), opener=null;
  // הכתובת לשליחה תגיע עם פאנל הניהול. עד אז הטופס מראה את מסך התודה ואומר במפורש ששום פרט לא נשלח
  var endpoint=form.getAttribute("data-endpoint")||"";
  document.querySelectorAll("[data-lead-open]").forEach(function(b){b.addEventListener("click",function(){
    opener=b; form.reset(); step.hidden=false; done.hidden=true; fail.hidden=true;
    form.querySelectorAll("[aria-invalid]").forEach(function(x){x.removeAttribute("aria-invalid");});
    form.querySelectorAll(".fld-e").forEach(function(x){x.hidden=true;});
    dlg.showModal();
  });});
  dlg.querySelector("[data-lead-close]").addEventListener("click",function(){dlg.close();});
  dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close();});
  dlg.addEventListener("close",function(){if(opener)opener.focus();});
  function bad(input,errId,isBad){
    var e=document.getElementById(errId); e.hidden=!isBad;
    if(isBad)input.setAttribute("aria-invalid","true"); else input.removeAttribute("aria-invalid");
    return isBad;
  }
  form.addEventListener("submit",function(ev){
    ev.preventDefault();
    var n=form.elements.name, t=form.elements.phone, c=form.elements.consent;
    var digits=t.value.replace(/\D/g,"");
    var errs=[bad(n,"lf-name-e",!n.value.trim()),bad(t,"lf-tel-e",digits.length<9||digits.length>13),bad(c,"lf-c-e",!c.checked)];
    var first=[n,t,c][errs.indexOf(true)]; if(first){first.focus();return;}
    function ok(){step.hidden=true; done.hidden=false; done.focus();}
    if(!endpoint){dlg.querySelector(".lead-dev").hidden=false; ok(); return;}
    fetch(endpoint,{method:"POST",body:new FormData(form)}).then(function(r){if(!r.ok)throw 0; location.href="thanks.html";}).catch(function(){fail.hidden=false;});
  });
})();

/* ---------- GSAP: השמש (g25), השיחה (g141), חשיפת התמונה (g02), והרגע שנפתח למסך מלא (g56) ---------- */
// site.js נטען לפני GSAP, כדי שההירו לא יחכה להורדה מהרשת. התנועה נבנית כש-GSAP מוכן (אחרי כל הסקריפטים הדחויים)
document.addEventListener("DOMContentLoaded",function(){
if(typeof gsap==="undefined")return;   // בלי GSAP הכל גלוי ועומד
gsap.registerPlugin(ScrollTrigger,MotionPathPlugin);
var MOTION="(prefers-reduced-motion: no-preference)", CALM="(prefers-reduced-motion: reduce)";
var mm;
// "עצירת אנימציות" בסרגל הנגישות מתנהג כמו הפחתת תנועה: ענף התנועה לא נבנה, וענף השקט כן
function build(){
  var still=doc.classList.contains("a11y-still");
  var M=still?"not all":MOTION, C=still?"all":CALM;
  mm=gsap.matchMedia();

  // MV:g25 · השמש נוסעת מקורפו (קיץ) אל סיישל (חורף)
  if(document.querySelector(".sun")){
    var path={path:"#sun-arc",align:"#sun-arc",alignOrigin:[.5,.5],autoRotate:false};
    mm.add(M,function(){
      var st={trigger:".sun-wrap",start:"top 85%",end:"top 25%",scrub:.6,invalidateOnRefresh:true};
      gsap.to(".sun",{motionPath:path,ease:"none",scrollTrigger:st});
      gsap.to(".sun .ic",{rotation:-120,ease:"none",scrollTrigger:Object.assign({},st)});
    });
    mm.add(C,function(){
      // בלי תנועה השמש יושבת בסוף המסלול: עכשיו חורף
      var put=function(){gsap.set(".sun",{motionPath:Object.assign({start:1,end:1},path)});};
      put(); addEventListener("resize",put);
      return function(){removeEventListener("resize",put);};
    });
  }

  // עמוד סיישל · שתי סצנות גלילה: הצילום בפתיחה מתרחק לאט כשיורדים, והסירה שעוברת בין האיים לאורך כל הסקשן
  if(document.querySelector(".isls")){
    mm.add(M,function(){
      gsap.fromTo(".hero-media img",{scale:1.12,yPercent:0},{scale:1,yPercent:8,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:.5}});
    });
  }

  // עמוד סיישל · אותו מהלך (g25): סירה עוברת בין שלושת האיים בגלילה. בטלפון המסלול מוסתר והמעברים כתובים בין הכרטיסים
  if(document.querySelector(".boat")){
    var route={path:"#route-path",align:"#route-path",alignOrigin:[.5,.5],autoRotate:false};
    mm.add("(min-width:768px) and "+(still?"not all":MOTION),function(){
      gsap.to(".boat",{motionPath:route,ease:"none",scrollTrigger:{trigger:"#islands",start:"top 60%",end:"bottom 70%",scrub:.6,invalidateOnRefresh:true}});
    });
    mm.add("(min-width:768px) and "+(still?"all":CALM),function(){
      var put=function(){gsap.set(".boat",{motionPath:Object.assign({start:.5,end:.5},route)});};
      put(); addEventListener("resize",put);
      return function(){removeEventListener("resize",put);};
    });
  }

  // עמוד סיישל · האווירה בגלילה: עננים, מטוס, שמש, שחפים, עלה דקל, סירה, צב ושקיעה.
  // כל שכבה רק בשטח ריק. בהפחתת תנועה הן נשארות סטטיות במקום הסופי, והמטוס מוסתר
  (function(){
    var atmo=document.querySelector(".hero-atmo"); if(!atmo)return;
    var fly={path:"#fly-path",align:"#fly-path",alignOrigin:[.5,.5],autoRotate:90};
    var trail=atmo.querySelector(".fly-trail");
    mm.add(M,function(){
      // לפני הגלילה המטוס כבר בנקודת ההתחלה, מתחת לעננים (אחרת הוא נשאר בפינה עד שזזים)
      gsap.set(".plane-wrap",{motionPath:Object.assign({start:0,end:0},fly),scale:1.1});
      var tl=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:.8,invalidateOnRefresh:true}});
      // המטוס עולה מהעננים ומתרחק: קטן ככל שהוא עולה
      tl.fromTo(".plane-wrap",{scale:1.1},{motionPath:Object.assign({start:0,end:1},fly),scale:.7,duration:1},0)
        .fromTo(trail,{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1},0)
        .to(trail,{opacity:0,duration:.3},.7)
        // העננים נפרדים לצדדים ועולים מהר מהעמוד, כאילו יורדים דרכם
        .to(".cl-l",{xPercent:-22,yPercent:-58,duration:1},0)
        .to(".cl-r",{xPercent:24,yPercent:-70,duration:1},0)
        .to(".cl-m",{yPercent:-120,scale:1.25,duration:1},0)
        .to(".cl-back",{xPercent:-30,duration:1},0)
        .to(".glow",{rotate:18,scale:1.2,opacity:.6,duration:1},0);
      return function(){trail.setAttribute("stroke-dashoffset","1"); gsap.set([trail,".plane-wrap",".plane",".cl",".glow"],{clearProps:"all"});};
    });
    mm.add(C,function(){
      var plane=atmo.querySelector(".plane-wrap"); plane.style.display="none"; gsap.set(trail,{opacity:0});
      return function(){plane.style.display=""; gsap.set(trail,{clearProps:"opacity"});};
    });
    // האור והמטוס זזים מעט אחרי העכבר, כמו עומק
    if(matchMedia("(hover:hover) and (pointer:fine)").matches&&!atmo.dataset.mv){
      atmo.dataset.mv=1;
      var hero=document.querySelector(".hero"), glow=atmo.querySelector(".glow"), pl=atmo.querySelector(".plane");
      hero.addEventListener("pointermove",function(e){
        if(!matchMedia(MOTION).matches||doc.classList.contains("a11y-still"))return;
        var r=hero.getBoundingClientRect(), dx=(e.clientX-r.left)/r.width-.5, dy=(e.clientY-r.top)/r.height-.5;
        glow.style.setProperty("--mx",(dx*60)+"px"); glow.style.setProperty("--my",(dy*40)+"px");
        pl.style.setProperty("--px",(dx*-24)+"px"); pl.style.setProperty("--py",(dy*-16)+"px");
      },{passive:true});
    }
  })();

  (function(){
    if(!document.querySelector(".gulls"))return;
    mm.add("(min-width:1024px) and "+(still?"not all":MOTION),function(){
      // שחפים חוצים מימין לשמאל, כל אחד במהירות אחרת, עם גלי גובה קטנים
      gsap.utils.toArray(".gull").forEach(function(g,i){
        var dist=[-1,-.7,-.45][i];
        gsap.fromTo(g,{x:function(){return g.parentNode.offsetWidth*.18;},y:0},{x:function(){return g.parentNode.offsetWidth*dist*.5;},y:[-18,10,-26][i],ease:"none",
          scrollTrigger:{trigger:"#islands",start:"top bottom",end:"top 10%",scrub:.6+i*.3,invalidateOnRefresh:true}});
      });
      // עלה הדקל מתנדנד, והצל שלו זז מעט יותר, כמו אור שעובר
      gsap.fromTo(".frond",{rotate:-7},{rotate:5,ease:"none",scrollTrigger:{trigger:"#hotels",start:"top bottom",end:"bottom top",scrub:.8}});
      gsap.fromTo(".frond-shade",{x:-10,y:-6},{x:18,y:14,ease:"none",scrollTrigger:{trigger:"#hotels",start:"top bottom",end:"bottom top",scrub:1}});
      // הסירה שטה לאורך הגלים
      gsap.fromTo(".sail-boat",{rotate:-4},{motionPath:{path:"#sail-path",align:"#sail-path",alignOrigin:[.5,.82],start:.05,end:.85},rotate:4,ease:"none",
        scrollTrigger:{trigger:"#how",start:"top 85%",end:"bottom 40%",scrub:.8,invalidateOnRefresh:true}});
      // הצב שוחה שמאלה בקשת רכה
      gsap.fromTo(".turtle",{x:0,y:0,rotate:4},{keyframes:{x:[0,-90,-200,-300],y:[0,-14,8,-6]},rotate:-6,ease:"none",
        scrollTrigger:{trigger:"#experiences",start:"top 85%",end:"top 5%",scrub:1}});
      return function(){gsap.set([".gull",".frond",".frond-shade",".sail-boat",".turtle"],{clearProps:"all"});};
    });
    mm.add("(min-width:1024px) and "+(still?"all":CALM),function(){
      var put=function(){gsap.set(".sail-boat",{motionPath:{path:"#sail-path",align:"#sail-path",alignOrigin:[.5,.82],start:.45,end:.45}});};
      put(); addEventListener("resize",put);
      return function(){removeEventListener("resize",put);};
    });
    // הפרונד בטאבלט: נדנוד קטן בלבד
    mm.add("(min-width:768px) and (max-width:1023px) and "+(still?"not all":MOTION),function(){
      gsap.fromTo(".frond",{rotate:-5},{rotate:4,ease:"none",scrollTrigger:{trigger:"#hotels",start:"top bottom",end:"bottom top",scrub:.8}});
    });
  })();

  // סיום: השמש שוקעת אל קו המים והדקל נע ברוח, לאורך הכניסה של הפס
  (function(){
    if(!document.querySelector(".cta-atmo"))return;
    mm.add(M,function(){
      var tl=gsap.timeline({defaults:{ease:"none"},scrollTrigger:{trigger:".cta",start:"top bottom",end:"bottom bottom",scrub:.8}});
      tl.fromTo(".cta-sun",{yPercent:-80},{yPercent:40,duration:1},0)
        .fromTo(".cta-palm",{rotate:-3},{rotate:2,duration:1},0)
        .fromTo(".cta-sea .sh",{scaleX:.4,transformOrigin:"50% 50%"},{scaleX:1,duration:1},.3);
      return function(){gsap.set([".cta-sun",".cta-palm",".cta-sea .sh"],{clearProps:"all"});};
    });
  })();

  // MV:g141 · שיחת וואטסאפ שמתנהלת בגלילה
  (function(){
    var msgs=gsap.utils.toArray(".ch-m"), typ=document.querySelector(".ch-typ");
    if(!msgs.length||!typ)return;
    // ההודעות מוסתרות רק בענף התנועה. בהפחתת תנועה הפונקציה לא רצה והשיחה גלויה
    mm.add(M,function(){
      gsap.set(msgs,{opacity:0,y:12});
      // דגל ולא once: טריגר שנהרג באמצע הגלילה משנה את הרשימה, ורענון מאמצע העמוד מזיז את השאר.
      // נקודת ההתחלה מנכה את ההזזה של ההודעה המוסתרת, כדי שתישאר אותה נקודה לפני ואחרי שהיא מופיעה
      msgs.forEach(function(m){
        var done=false;
        ScrollTrigger.create({trigger:m,start:function(){return "top-="+(gsap.getProperty(m,"y")||0)+" 82%";},onEnter:function(self){
          if(done)return; done=true;
          var show=function(){gsap.fromTo(m,{opacity:0,y:12,scale:.92},{opacity:1,y:0,scale:1,duration:.45,ease:"power3.out"});};
          // "מקלידה..." רק כשגוללים אל ההודעה. בקפיצה (עוגן, חזרה לעמוד) ההודעות פשוט מופיעות, בלי שהעמוד יזוז מתחת
          var jumped=self.scroll()-self.start>innerHeight*.25;
          if(m.classList.contains("in")&&!jumped){m.before(typ);typ.style.display="flex";gsap.delayedCall(.7,function(){typ.style.display="none";show();});}
          else show();
        }});
      });
      return function(){typ.style.display="none";gsap.set(msgs,{clearProps:"opacity,transform"});};
    });
  })();

  // קו השלבים בצד הדביק מתמלא לאורך השיחה: הסצנה השנייה, שמחברת את השלבים לגלילה
  (function(){
    var list=document.querySelector(".how-steps"), chat=document.querySelector(".how-chat"); if(!list||!chat)return;
    mm.add(M,function(){
      gsap.fromTo(list,{"--p":0},{"--p":1,ease:"none",scrollTrigger:{trigger:chat,start:"top 75%",end:"bottom 75%",scrub:.6}});
      return function(){list.style.removeProperty("--p");};
    });
  })();

  // MV:g02 · התמונה של סימונה ואבישי נחשפת מלמטה למעלה, בקצה חד
  mm.add(M,function(){
    gsap.utils.toArray(".paint").forEach(function(el){
      gsap.fromTo(el,{"--reveal":"0%"},{"--reveal":"100%",ease:"none",scrollTrigger:{trigger:el,start:"top 85%",end:"top 25%",scrub:true}});
    });
  });

  // MV:g56 · הכרטיס של סיישל נפתח למסך מלא. clip-path ולא scale: התמונה לא נמתחת, רק החלון גדל
  (function(){
    var root=document.querySelector(".moment"); if(!root)return;
    var media=root.querySelector(".moment-media"), cap=root.querySelector(".moment-cap"), h=cap.querySelector("h2"), p=cap.querySelector("h2 + p");
    mm.add(M,function(){
      var phone=innerWidth<768;
      gsap.timeline({scrollTrigger:{trigger:root,start:"top top",end:"bottom bottom",scrub:.6,invalidateOnRefresh:true}})
        .fromTo(media,{clipPath:phone?"inset(18% 10% 18% 10% round 20px)":"inset(22% 26% 22% 26% round 26px)"},
                      {clipPath:"inset(0% 0% 0% 0% round 0px)",duration:1,ease:"none"},0)
        // הכותרת נשארת, היא המשפט של הרגע; רק גדלה מעט עם הפתיחה
        .fromTo(h,{scale:.86},{scale:1,duration:1,ease:"none"},0)
        // fromTo ולא to: אחרי רענון של ScrollTrigger ה-to מחק את משתנה הקריאות, וההילה הכהה נראתה סביב הכרטיס הסגור
        .fromTo(cap,{"--s":0},{"--s":1,duration:.3,ease:"none"},.6)
        .fromTo(p,{opacity:0},{opacity:1,duration:.3,ease:"none"},.68);
      return function(){gsap.set([media,h,p,cap],{clearProps:"all"});};
    });
  })();
}
build();
document.addEventListener("a11y:still",function(){if(mm)mm.revert(); build(); ScrollTrigger.refresh();});

// השלב הפעיל בצד הדביק מתעדכן לפי ההודעה שהגיעה. שינוי צבע, לא תנועה, ולכן גם בהפחתת תנועה
(function(){
  var list=document.querySelector(".how-steps"); if(!list)return;
  var items=list.querySelectorAll("li");
  function step(n){items.forEach(function(li,i){li.classList.toggle("on",i===n-1);});}
  // הקו עובר ממרכז העיגול הראשון למרכז האחרון
  function rail(){
    var a=items[0].querySelector(".how-num").getBoundingClientRect(), b=items[items.length-1].querySelector(".how-num").getBoundingClientRect(), l=list.getBoundingClientRect();
    if(!a.height)return;
    list.style.setProperty("--rt",(a.top+a.height/2-l.top)+"px");
    list.style.setProperty("--rh",(b.top-a.top)+"px");
    list.style.setProperty("--rx",(l.right-(a.left+a.width/2))+"px");
  }
  rail(); if(window.ResizeObserver)new ResizeObserver(rail).observe(list);
  list.classList.add("is-live"); step(1);
  document.querySelectorAll("[data-step-start]").forEach(function(m){
    var n=+m.dataset.stepStart; if(n<2)return;
    ScrollTrigger.create({trigger:m,start:function(){return "top-="+(gsap.getProperty(m,"y")||0)+" 75%";},onEnter:function(){step(n);},onLeaveBack:function(){step(n-1);}});
  });
})();

// מיקרו אינטראקציות: רק עם עכבר אמיתי ובלי הפחתת תנועה. בודקים בכל תנועה, כדי שמתג "עצירת תנועה" בסרגל הנגישות יעבוד מיד
(function(){
  var fine=matchMedia("(hover:hover) and (pointer:fine)"), calm=matchMedia("(prefers-reduced-motion: reduce)");
  function ok(){return fine.matches&&!calm.matches&&!doc.classList.contains("a11y-still");}

  // הטיה ואור על כרטיסי התמונה
  document.querySelectorAll(".hcard-media,.xp-media,.shot-frame.has-img").forEach(function(el){
    el.classList.add("tilt");
    el.addEventListener("pointermove",function(e){
      if(!ok())return;
      var r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      el.classList.add("is-on");
      el.style.setProperty("--ry",((x-.5)*7).toFixed(2)+"deg"); el.style.setProperty("--rx",((.5-y)*7).toFixed(2)+"deg");
      el.style.setProperty("--gx",(x*100).toFixed(1)+"%"); el.style.setProperty("--gy",(y*100).toFixed(1)+"%");
    },{passive:true});
    el.addEventListener("pointerleave",function(){el.classList.remove("is-on"); el.style.removeProperty("--rx"); el.style.removeProperty("--ry");});
  });

  // כפתורים מגנטיים: הפעולות הראשיות נמשכות מעט אל העכבר
  document.querySelectorAll(".btn-hero,.isl-foot .btn,.htl-more + .btn").forEach(function(b){
    b.classList.add("magnet");
    b.addEventListener("pointermove",function(e){
      if(!ok())return;
      var r=b.getBoundingClientRect(), dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
      b.classList.add("is-on"); b.style.transform="translate("+(dx*.18).toFixed(1)+"px,"+(dy*.3).toFixed(1)+"px)";
    },{passive:true});
    b.addEventListener("pointerleave",function(){b.classList.remove("is-on"); b.style.transform="";});
  });

  // לב: קפיצה כשהוא נדלק (גם במגע)
  document.addEventListener("click",function(e){
    var h=e.target.closest&&e.target.closest(".heart"); if(!h)return;
    requestAnimationFrame(function(){
      h.classList.remove("pop");
      if(h.getAttribute("aria-pressed")==="true"&&!calm.matches){void h.offsetWidth; h.classList.add("pop");}
    });
  });
  document.addEventListener("animationend",function(e){if(e.animationName==="ring")e.target.classList.remove("pop");});

  // המעבר בין האיים: הנקודה של האי מסומנת כשעוברים על הכרטיס שלו
  var dots=document.querySelectorAll(".route-dot");
  document.querySelectorAll(".isl").forEach(function(c,i){
    if(!dots[i])return;
    c.addEventListener("pointerenter",function(){dots[i].classList.add("is-on");});
    c.addEventListener("pointerleave",function(){dots[i].classList.remove("is-on");});
  });

  // לשוניות המלונות: רקע אחד שמחליק ללשונית הנבחרת
  var tabs=document.querySelector(".htl-tabs");
  if(tabs){
    var ind=document.createElement("span"); ind.className="htl-ind"; ind.setAttribute("aria-hidden","true"); tabs.prepend(ind); tabs.classList.add("has-ind");
    var placed, place=function(){
      var t=tabs.querySelector('.htl-tab[aria-selected="true"]'); if(!t||!t.offsetWidth)return;
      var to={x:t.offsetLeft,y:t.offsetTop,width:t.offsetWidth,height:t.offsetHeight};
      // מחליק רק אחרי ההצבה הראשונה, ורק כשמותר לזוז
      if(!placed||!window.gsap||calm.matches||doc.classList.contains("a11y-still"))gsap.set(ind,to); else gsap.to(ind,Object.assign({duration:.45,ease:"power3.out"},to));
      placed=true;
    };
    place(); addEventListener("resize",place);
    new MutationObserver(place).observe(tabs,{attributes:true,subtree:true,attributeFilter:["aria-selected"]});
    if(document.fonts)document.fonts.ready.then(place);
  }
})();

});

})();
