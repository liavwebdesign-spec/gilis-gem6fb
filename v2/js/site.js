// Gili's Tours v2: תנועה מאופקת. הדר, כניסות, קו המסלול שנמתח בגלילה, קרוסלות, טופס.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // הדר: לבן אחרי ההירו, מתחבא בגלילה למטה וחוזר למעלה
  const hdr = $('#hdr');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('scrolled', y > 40);
    hdr.classList.toggle('hide', y > 600 && y > lastY && !document.body.classList.contains('nav-open'));
    lastY = y;
  };

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

  // סרטון ההירו: כפתור עצירה, ובלי ניגון אוטומטי כשמבקשים פחות תנועה
  const vid = $('#heroVid'), tg = $('#vidToggle');
  const setVid = play => {
    play ? vid.play().catch(() => {}) : vid.pause();
    tg.classList.toggle('paused', !play);
    tg.setAttribute('aria-pressed', !play);
    tg.setAttribute('aria-label', play ? 'עצירת הסרטון' : 'הפעלת הסרטון');
    tg.querySelector('use').setAttribute('href', play ? '#i-pause' : '#i-play');
  };
  if (reduce || window.gilisStill) { vid.removeAttribute('autoplay'); setVid(false); }
  tg.addEventListener('click', () => setVid(vid.paused));
  // "עצירת אנימציות" בהתאמות התצוגה עוצר גם את הסרטונים
  document.addEventListener('a11y:still', e => { if (e.detail) { setVid(false); $$('video').forEach(v => v.pause()); } });

  // כניסות
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv, .rv-img').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  // סרטון כרטיס המלון: מתנגן רק כשהוא במסך
  const hv = $('.htl-vid');
  if (hv && !reduce) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { hv.play().then(() => hv.classList.add('on')).catch(() => {}); }
      else hv.pause();
    }, { threshold: 0.4 }).observe(hv);
  }

  // המסלול: הקו הזהוב נמתח לפי התקדמות הגלילה בימים, והתחנה הפעילה נדלקת
  const route = $('#route'), line = $('#routeLine'), days = $$('.day'), stops = $$('.stop');
  const L = line.getTotalLength();
  line.style.strokeDasharray = L;
  line.style.strokeDashoffset = reduce ? 0 : L;
  const daysBox = $('.days'), mapCard = $('.map-card');
  const onRoute = () => {
    const r = daysBox.getBoundingClientRect(), vh = innerHeight;
    // בטלפון המפה לא דביקה, אז הקו נמתח בזמן שהמפה עצמה עוברת במסך
    const narrow = innerWidth <= 960, m = mapCard.getBoundingClientRect();
    const p = narrow
      ? Math.min(1, Math.max(0, (vh * 0.9 - m.top) / (vh * 0.55)))
      : Math.min(1, Math.max(0, (vh * 0.62 - r.top) / (r.height - vh * 0.25)) / 0.72);
    if (!reduce) line.style.strokeDashoffset = L * (1 - Math.min(1, p));
    let active = 0;
    days.forEach((d, i) => { if (d.getBoundingClientRect().top < vh * 0.6) active = i; });
    days.forEach((d, i) => d.classList.toggle('on', i === active && r.top < vh * 0.6));
    stops.forEach((s, i) => s.classList.toggle('on', reduce || (narrow ? p >= [0.02, 0.5, 0.98][i] : r.top < vh * 0.6 && i <= Math.min(active, 2))));
    route.classList.toggle('back-on', active === 3 && r.top < vh * 0.6);
  };

  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); onRoute(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', onRoute);
  onScroll(); onRoute();

  // קרוסלת מלונות בטלפון: נקודות
  const hg = $('#hotelsG'), dotsBox = $('#hotelsDots'), cards = $$('.htl', hg);
  cards.forEach(() => dotsBox.appendChild(document.createElement('i')));
  const dots = $$('i', dotsBox);
  dots[0].classList.add('on');
  const dotIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const i = cards.indexOf(e.target); dots.forEach((d, j) => d.classList.toggle('on', i === j)); }
  }), { root: hg, threshold: 0.6 });
  cards.forEach(c => dotIO.observe(c));

  // מדריכים: חיצים שגוללים כרטיס אחד, נכבים בקצוות (RTL: scrollLeft שלילי)
  const gt = $('#gTrack'), arrows = $$('.g-arr');
  const step = () => gt.querySelector('.post').getBoundingClientRect().width + 28;
  arrows.forEach(b => b.addEventListener('click', () => {
    gt.scrollBy({ left: (b.dataset.dir === 'next' ? -1 : 1) * step(), behavior: reduce ? 'auto' : 'smooth' });
  }));
  const syncArrows = () => {
    const max = gt.scrollWidth - gt.clientWidth, x = Math.abs(gt.scrollLeft);
    arrows[0].disabled = x < 4;
    arrows[1].disabled = x > max - 4;
  };
  gt.addEventListener('scroll', syncArrows, { passive: true });
  syncArrows();

  // שאלות: פתיחה בגובה
  $$('.acc details').forEach(d => {
    const s = $('summary', d), b = $('.acc-b', d);
    s.addEventListener('click', e => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const h = b.scrollHeight;
        b.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 320, easing: 'ease' }).onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        const h = b.scrollHeight;
        b.animate([{ height: '0px' }, { height: h + 'px' }], { duration: 360, easing: 'ease' });
      }
    });
  });

  // טופס: בדיקת שדות חובה; החיבור לפאנל בשלב הפאנל
  const form = $('#leadForm'), msg = $('#formMsg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let bad = null;
    ['name', 'phone'].forEach(n => {
      const f = form.elements[n], ok = n === 'phone' ? f.value.replace(/\D/g, '').length >= 9 : f.value.trim().length > 1;
      f.setAttribute('aria-invalid', !ok);
      if (!ok && !bad) bad = f;
    });
    if (bad) { msg.className = 'form-msg err'; msg.textContent = 'נא למלא שם ומספר טלפון תקין.'; bad.focus(); return; }
    msg.className = 'form-msg';
    msg.textContent = 'תצוגה מקדימה: הטופס עוד לא מחובר, ושום פרט לא נשלח.';
  });
})();
