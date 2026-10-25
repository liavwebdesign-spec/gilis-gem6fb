// Gili's Tours v2, עמוד הבית: הדר, תפריט, וואטסאפ צף, כניסות בגלילה, ספירת המספרים, והמים החיים בפתיחה.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hero = $('#hHero'), htxt = $('.h-txt');
  const water = { dim: 0 };

  // הדר: לבן אחרי ההירו, מתחבא בגלילה למטה וחוזר למעלה
  const hdr = $('#hdr'), wa = $('.wa-float');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    hdr.classList.toggle('scrolled', y > vh * 0.82);
    hdr.classList.toggle('hide', y > vh && y > lastY && !document.body.classList.contains('nav-open'));
    wa.classList.toggle('show', y > vh * 0.8);
    // הטקסט שוקע לאט בגלילה והמים מחשיכים מעט
    const p = Math.min(1, y / vh);
    if (!reduce) {
      htxt.style.transform = p ? `translateY(${p * vh * 0.18}px)` : '';
      htxt.style.opacity = p ? Math.max(0, 1 - p * 2.4) : '';
    }
    water.dim = p;
    lastY = y;
    parallax();
    lightWords();
  };

  new IntersectionObserver(([e]) => wa.classList.toggle('near-end', e.isIntersecting)).observe($('.ftr'));

  // תפריט טלפון
  const burger = $('#burger');
  const setNav = open => {
    document.body.classList.toggle('nav-open', open);
    if (open) hdr.classList.remove('hide');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'סגירת התפריט' : 'תפריט');
    document.documentElement.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('#nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  // כניסות בגלילה: פעם אחת לכל רכיב
  const seen = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.matches('.nums')) countUp();
    seen.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv, .rv-img, .db, .sa-end, .nums').forEach(el => seen.observe(el));

  // היעדים והבאנר: התמונה זזה לאט מול הגלילה
  const par = $$('.db-media, .bnr-media');
  function parallax() {
    if (reduce) return;
    const vh = innerHeight;
    par.forEach(m => {
      const r = m.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const k = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      m.style.transform = `translate3d(0,${(k * -6).toFixed(2)}%,0)`;
    });
  }

  // המשפט הגדול: המילים נדלקות לפי הגלילה
  const stmt = $('#stmt');
  const words = [];
  if (stmt && !reduce) {
    $$('span', stmt).forEach(part => {
      const txt = part.textContent.trim().split(/\s+/);
      part.textContent = '';
      txt.forEach((t, i) => {
        const w = document.createElement('span');
        w.className = 'w'; w.textContent = t;
        part.append(w, i < txt.length - 1 ? ' ' : '');
        words.push(w);
      });
    });
  }
  function lightWords() {
    if (!words.length) return;
    const r = stmt.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.86 - r.top) / (vh * 0.5 + r.height * 0.5)));
    const n = Math.round(p * words.length);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  }

  // המספרים: נספרים פעם אחת כשמגיעים אליהם
  const nums = $$('.n[data-to]');
  const fmt = v => v.toLocaleString('en-US');
  if (!reduce) nums.forEach(n => { n.textContent = '0' + (n.dataset.suf || ''); });
  let counted = false;
  function countUp() {
    if (counted || reduce) return;
    counted = true;
    const t0 = performance.now(), dur = 1800;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      nums.forEach(n => { n.textContent = fmt(Math.round(+n.dataset.to * e)) + (n.dataset.suf || ''); });
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- מים חיים: קוסטיקה (רשת האור בקרקעית) וצל של דקל שזז ברוח ----------
  const cv = $('#hWater');
  const gl = cv.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
  const go = () => requestAnimationFrame(() => hero.classList.add('ready'));

  if (!gl) { go(); onScroll(); addEventListener('scroll', onScroll, { passive: true }); return; }

  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = `precision highp float;
varying vec2 v;
uniform vec2 uRes;uniform float uT,uDim,uHov;uniform vec2 uM;uniform sampler2D uSh;uniform vec4 uAnc;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
// רשת האור שהגלים מטילים על הקרקעית
float caus(vec2 uv,float t){
  vec2 p=mod(uv*6.28318,6.28318)-250.;vec2 i=p;float c=1.;float k=.005;
  for(int n=0;n<5;n++){
    float tt=t*(1.-(3.5/float(n+1)));
    i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
    c+=1./length(vec2(p.x/(sin(i.x+tt)/k),p.y/(cos(i.y+tt)/k)));
  }
  c/=5.;c=1.17-pow(c,1.4);return pow(abs(c),8.);
}
vec2 rot(vec2 cs,vec2 a,float ang,float asp){
  vec2 q=(cs-a)*vec2(asp,1.);float s=sin(ang),c=cos(ang);
  q=mat2(c,s,-s,c)*q;return q/vec2(asp,1.)+a;
}
void main(){
  float asp=uRes.x/uRes.y;
  vec2 cs=vec2(v.x,1.-v.y);              // קואורדינטות כמו בקנבס: למעלה 0
  vec2 q=cs*vec2(asp,1.)*1.05;
  float t=uT*.32;
  // אדוות: מעוותות גם את הרשת וגם את הצל, כמו מבעד למים
  vec2 w=vec2(sin(q.y*3.1+t*1.3)+sin(q.x*2.3-t*.9),cos(q.x*2.7+t*1.1)+cos(q.y*1.9-t*.8))*.011;
  float c1=caus(q*1.35+w,t);
  float c2=caus(q*2.05+w*1.6+vec2(.37,.11),t*1.15+3.1);
  float cs1=caus(q*1.35+w+vec2(.004,0.),t);   // היסט קטן: שוליים בהירים יותר, כמו שבירת אור
  float ca=c1*.9+c2*.4;
  // צל הדקל: שתי קבוצות עלים (אדום קרוב, ירוק רחוק) שנעות ברוח בקצב אחר
  float swA=sin(uT*.55)*.018+sin(uT*1.37+1.)*.007+sin(uT*2.9)*.002;
  float swB=sin(uT*.43+2.)*.022+sin(uT*1.11)*.008;
  vec2 sa=rot(cs+w*1.4,uAnc.xy,swA,asp);
  vec2 sb=rot(cs+w*1.8,uAnc.zw,swB,asp);
  float shA=texture2D(uSh,sa).r, shB=texture2D(uSh,sb).g;
  float sh=clamp(max(shA,shB*.75),0.,1.);
  // אור: חזק יותר בצד הימני-עליון, מתחלף לאט
  float lt=smoothstep(-.35,1.25,v.x*.75+v.y*.45)+.12*sin(uT*.07+v.x*2.);
  vec3 deep=vec3(.03,.235,.265), mid=vec3(.055,.40,.43), sky=vec3(.12,.56,.58);
  vec3 col=mix(deep,mid,clamp(lt,0.,1.));
  col=mix(col,sky,smoothstep(.55,1.3,lt)*.45);
  float hov=exp(-dot((v-uM)*vec2(asp,1.),(v-uM)*vec2(asp,1.))*5.)*uHov;
  float L=(.30+.75*clamp(lt,0.,1.)+hov*.6)*(1.-sh*.92);
  col+=vec3(.6,.95,.92)*ca*L*.85;
  col+=vec3(.25,.55,.55)*max(cs1-c1,0.)*L*.3;
  col*=1.-sh*.58;
  col+=vec3(.05,.10,.10)*hov;
  // פינות כהות ועומק
  vec2 d=v-.5;col*=1.-dot(d,d)*.55;
  col*=1.-uDim*.45;
  col+=(hash(gl_FragCoord.xy+fract(uT))-.5)*.018;
  gl_FragColor=vec4(col,1.);
}`;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { go(); onScroll(); addEventListener('scroll', onScroll, { passive: true }); return; }
  gl.useProgram(pr);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, 'p');
  gl.enableVertexAttribArray(ap);
  gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(pr, n);
  const uRes = U('uRes'), uT = U('uT'), uDim = U('uDim'), uM = U('uM'), uHov = U('uHov'), uAnc = U('uAnc');
  gl.uniform1i(U('uSh'), 0);

  // צל הדקל מצויר בקוד: גבעול מעוקל ועלעלים צרים משני צדדיו, ואז מטושטש כמו צל על קרקעית
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const frond = (c, x0, y0, ang, len, bend, leaf, seed) => {
    let r = seed;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const ex = x0 + Math.cos(ang) * len, ey = y0 + Math.sin(ang) * len;
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    const cx = (x0 + ex) / 2 + nx * bend * len, cy = (y0 + ey) / 2 + ny * bend * len;
    const P = t => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * ex, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * ey];
    // הגבעול: עבה בבסיס ומתחדד לקצה
    c.lineCap = 'round';
    for (let k = 0; k < 24; k++) {
      const [ax1, ay1] = P(k / 24), [ax2, ay2] = P((k + 1) / 24);
      c.lineWidth = Math.max(0.8, len * 0.012 * (1 - 0.85 * k / 24));
      c.beginPath(); c.moveTo(ax1, ay1); c.lineTo(ax2, ay2); c.stroke();
    }
    const N = 26;
    for (let k = 0; k < N; k++) {
      const t = 0.12 + (k / (N - 1)) * 0.86;
      const [px, py] = P(t), [qx, qy] = P(Math.min(1, t + 0.01));
      const ta = Math.atan2(qy - py, qx - px);
      const L = leaf * Math.pow(Math.sin(Math.PI * (0.18 + t * 0.78)), 0.7) * (0.85 + rnd() * 0.3);
      const W = L * 0.06;
      for (const side of [-1, 1]) {
        const a = ta + side * (0.5 + rnd() * 0.12) + side * 0.1 * t;
        const tx = px + Math.cos(a) * L, ty = py + Math.sin(a) * L;
        const mx = (px + tx) / 2, my = (py + ty) / 2, pa = a + Math.PI / 2;
        // עלעל: צורת סירה צרה, קצה מעט כפוף
        c.beginPath();
        c.moveTo(px, py);
        c.quadraticCurveTo(mx + Math.cos(pa) * W, my + Math.sin(pa) * W, tx + Math.cos(a + side * 0.2) * 2, ty + Math.sin(a + side * 0.2) * 2);
        c.quadraticCurveTo(mx - Math.cos(pa) * W * 0.6, my - Math.sin(pa) * W * 0.6, px, py);
        c.fill();
      }
    }
  };

  let anc = [0, 0, 0, 0];
  const drawShadow = (w, h) => {
    const S = 640, W = S, H = Math.round(S * h / w);
    const cnv = document.createElement('canvas'); cnv.width = W; cnv.height = H;
    const c = cnv.getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const D = Math.max(W, H), port = h > w;
    // קבוצה קרובה, משמאל למעלה כמו ברפרנס
    const ax = -0.06 * W, ay = (port ? -0.05 : -0.12) * H;
    c.filter = 'blur(' + Math.round(D * 0.0045) + 'px)';
    c.fillStyle = c.strokeStyle = 'rgb(255,0,0)';
    [[0.10, 0.88, 0.08, 0.16, 3], [0.62, 0.95, 0.05, 0.17, 7], [1.14, 0.84, -0.05, 0.16, 11], [1.58, 0.58, -0.08, 0.13, 17]]
      .forEach(([a, l, b, lf, s]) => frond(c, ax, ay, a, l * D * (port ? 1.05 : 0.95), b, lf * D * (port ? 1.05 : 0.95), s));
    // קבוצה רחוקה ומטושטשת יותר, קצות עלים מלמעלה
    const bx = 0.34 * W, by = -0.42 * H;
    c.filter = 'blur(' + Math.round(D * 0.013) + 'px)';
    c.fillStyle = c.strokeStyle = 'rgb(0,255,0)';
    [[1.05, 0.62, 0.08, 0.17, 31], [1.55, 0.58, -0.05, 0.16, 37], [0.62, 0.55, 0.1, 0.15, 41]]
      .forEach(([a, l, b, lf, s]) => frond(c, bx, by, a, l * D * (port ? 0.95 : 0.85), b, lf * D * (port ? 0.95 : 0.85), s));
    c.filter = 'none';
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
    anc = [ax / W, ay / H, bx / W, by / H];
  };

  let cw = 0, ch = 0;
  const size = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const s = Math.min(dpr, Math.sqrt(1.15e6 / (w * h)));
    const nw = Math.round(w * s), nh = Math.round(h * s);
    if (nw === cw && nh === ch) return;
    cw = cv.width = nw; ch = cv.height = nh;
    gl.viewport(0, 0, nw, nh);
    drawShadow(w, h);
  };

  // עכבר: כתם אור רך שעוקב לאט
  const m = { x: .5, y: .5, tx: .5, ty: .5, h: 0, th: 0 };
  if (matchMedia('(hover: hover)').matches && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      m.tx = (e.clientX - r.left) / r.width; m.ty = 1 - (e.clientY - r.top) / r.height; m.th = 1;
    });
    hero.addEventListener('pointerleave', () => { m.th = 0; });
  }

  let tAcc = 6, last = performance.now(), running = false, paused = reduce, visible = true;
  const frame = now => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!paused) tAcc += dt;
    m.x += (m.tx - m.x) * 0.04; m.y += (m.ty - m.y) * 0.04; m.h += (m.th - m.h) * 0.03;
    gl.uniform2f(uRes, cw, ch);
    gl.uniform1f(uT, tAcc);
    gl.uniform1f(uDim, water.dim);
    gl.uniform2f(uM, m.x, m.y);
    gl.uniform1f(uHov, m.h * 0.5);
    gl.uniform4f(uAnc, anc[0], anc[1], anc[2], anc[3]);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (running) requestAnimationFrame(frame);
  };
  const loop = on => {
    const want = on && visible && !document.hidden && !paused;
    if (want && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!want) running = false;
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; loop(true); }).observe(hero);
  document.addEventListener('visibilitychange', () => loop(true));
  addEventListener('resize', () => { size(); if (!running) frame(performance.now()); });

  // כפתור עצירה: תנועה שנמשכת יותר מחמש שניות צריכה דרך לעצור אותה
  const pb = $('#hPause');
  const setPaused = p => {
    paused = p;
    pb.classList.toggle('paused', p);
    pb.setAttribute('aria-pressed', p);
    pb.setAttribute('aria-label', p ? 'הפעלת תנועת המים' : 'עצירת תנועת המים');
    pb.querySelector('use').setAttribute('href', p ? '#i-play' : '#i-pause');
    loop(true);
  };
  pb.addEventListener('click', () => setPaused(!paused));

  size();
  frame(performance.now());
  cv.classList.add('on');
  if (reduce) setPaused(true);
  loop(true);
  go();

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); if (!running && visible) frame(performance.now()); ticking = false; });
  }, { passive: true });
  onScroll();
})();
