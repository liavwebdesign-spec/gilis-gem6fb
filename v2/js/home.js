// Gili's Tours v2, עמוד הבית: הדר, תפריט, וואטסאפ צף, כניסות בגלילה, ספירת המספרים מ-1, "להכיר אותנו", קרוסלת הביקורות בטלפון, והטופס (תצוגה מקדימה).
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // פתיחה: הטקסט נכנס ברכות כשהצילום מוכן
  const hero = $('#hHero'), himg = $('.hv-hero-media img');
  const ready = () => hero.classList.add('ready');
  if (himg.complete) requestAnimationFrame(ready); else himg.addEventListener('load', ready, { once: true });
  setTimeout(ready, 1200);

  // הדר: לבן כשטקסט הפתיחה מגיע אליו (שלא יעלה על הכפתורים), מתחבא בגלילה למטה וחוזר למעלה
  const hdr = $('#hdr'), wa = $('.wa-float'), htitle = $('#h-t');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    hdr.classList.toggle('scrolled', y > vh * 0.82 || (y > 40 && htitle.getBoundingClientRect().top < hdr.offsetHeight + 16));
    hdr.classList.toggle('hide', y > vh && y > lastY && !document.body.classList.contains('nav-open'));
    wa.classList.toggle('show', y > vh * 0.8);
    lastY = y;
    parallax();
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
    if (e.target.matches('.hv-nums')) countUp();
    seen.unobserve(e.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rv, .rv-img, .hd, .hv-nums').forEach(el => seen.observe(el));

  // תמונות הרוחב זזות לאט מול הגלילה
  const par = $$('.hd-media, .hv-stmt-media, .hv-sum-media, .hv-bnr-media');
  function parallax() {
    if (reduce) return;
    const vh = innerHeight;
    par.forEach(m => {
      const r = m.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const k = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      m.style.transform = `translate3d(0,${(k * -5).toFixed(2)}%,0)`;
    });
  }

  // המספרים: נספרים פעם אחת מ-1, רך ושקט
  const nums = $$('.hn[data-to]');
  const fmt = v => v.toLocaleString('en-US');
  if (!reduce) nums.forEach(n => { n.textContent = '1' + (n.dataset.suf || ''); });
  let counted = false;
  function countUp() {
    if (counted || reduce) return;
    counted = true;
    const t0 = performance.now(), dur = 2400;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      nums.forEach(n => { const to = +n.dataset.to; n.textContent = fmt(Math.round(1 + (to - 1) * e)) + (n.dataset.suf || ''); });
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // סימונה ואבישי: "להכיר אותנו" פותח את המשך הסיפור
  const abBtn = $('#abBtn'), abMore = $('#abMore');
  abBtn.addEventListener('click', () => {
    const open = abMore.hidden;
    abMore.hidden = !open;
    abBtn.setAttribute('aria-expanded', open);
    $('span', abBtn).textContent = open ? 'פחות' : 'להכיר אותנו';
  });

  // ביקורות בטלפון: הנקודות עוקבות אחרי הכרטיס שבמרכז
  const hrG = $('#hrG'), dots = $$('#hrDots span');
  hrG.addEventListener('scroll', () => {
    const cards = $$('.hr', hrG), mid = hrG.getBoundingClientRect().left + hrG.clientWidth / 2;
    let best = 0, d = Infinity;
    cards.forEach((c, i) => { const r = c.getBoundingClientRect(), x = Math.abs(r.left + r.width / 2 - mid); if (x < d) { d = x; best = i; } });
    dots.forEach((s, i) => s.classList.toggle('on', i === best));
  }, { passive: true });

  // הטופס: עוד לא מחובר. בודקים שדות חובה ומראים שזו תצוגה מקדימה, שום פרט לא נשלח
  const form = $('#leadForm'), msg = $('#leadMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = ['name', 'phone', 'privacy'].map(n => form.elements[n]).filter(el => el.type === 'checkbox' ? !el.checked : !el.value.trim());
    $$('input', form).forEach(el => el.removeAttribute('aria-invalid'));
    bad.forEach(el => el.setAttribute('aria-invalid', 'true'));
    if (bad.length) {
      msg.className = 'hl-msg err';
      msg.textContent = 'חסרים פרטים: שם, טלפון ואישור מדיניות הפרטיות.';
      bad[0].focus();
      return;
    }
    msg.className = 'hl-msg';
    msg.textContent = 'תצוגה מקדימה: הטופס יחובר בהמשך, שום פרט לא נשלח.';
  });

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
})();
