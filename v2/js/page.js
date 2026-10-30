// Gili's Tours v2, עמודי מסמך (הצהרת נגישות ובהמשך פרטיות): הדר לבן קבוע שמתחבא בגלילה למטה, ותפריט טלפון.
(() => {
  const hdr = document.getElementById('hdr'), burger = document.getElementById('burger');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    hdr.classList.toggle('hide', y > 300 && y > lastY && !document.body.classList.contains('nav-open'));
    lastY = y;
  }, { passive: true });
  const setNav = open => {
    document.body.classList.toggle('nav-open', open);
    if (open) hdr.classList.remove('hide');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'סגירת התפריט' : 'תפריט');
    document.documentElement.classList.toggle('lock', open);
  };
  burger.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => setNav(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });
})();
