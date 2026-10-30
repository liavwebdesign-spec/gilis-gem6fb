// Gili's Tours v2: התאמות תצוגה (B19, ת"י 5568). הכפתור הקבוע בצד שמאל, בכל עמוד.
// משנה רק הצגה: בלי תיקון אוטומטי, בלי זיהוי טכנולוגיה מסייעת, בלי שליחה לשרת. הנגישות של האתר לא תלויה בו.
(() => {
  const KEY = 'gilis-a11y', doc = document.documentElement;
  const link = document.querySelector('.a11y-fab');
  if (!link) return;
  const forced = matchMedia('(forced-colors: active)').matches;
  const MODES = [
    ['contrast', 'ניגודיות גבוהה'], ['gray', 'גווני אפור'], ['invert', 'היפוך צבעים'], ['links', 'הדגשת קישורים'],
    ['font', 'גופן קריא'], ['spacing', 'ריווח טקסט'], ['still', 'עצירת אנימציות'], ['cursor', 'סמן גדול'], ['guide', 'קו קריאה'],
  ].filter(m => !(forced && ['contrast', 'gray', 'invert'].includes(m[0]))); // לא דורסים את מצב הניגודיות של המערכת
  const SCALES = [1, 1.12, 1.25, 1.4];
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
  saved.scale = saved.scale || 0;
  if (saved.still === undefined) saved.still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const statement = link.getAttribute('href');

  // בלי JS זה קישור להצהרה; כאן הוא הופך לכפתור שפותח את החלונית
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = link.className;
  btn.innerHTML = link.innerHTML;
  btn.setAttribute('aria-label', 'התאמות תצוגה');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'a11y-panel');
  link.replaceWith(btn);

  const panel = document.createElement('div');
  panel.className = 'a11y-panel';
  panel.id = 'a11y-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'a11y-title');
  panel.innerHTML =
    '<div class="a11y-head"><h2 id="a11y-title">התאמות תצוגה</h2><button class="a11y-x" type="button" aria-label="סגירת התאמות התצוגה"><svg class="ic" aria-hidden="true"><use href="#i-x"/></svg></button></div>' +
    '<div class="a11y-opts"><div class="a11y-row"><span id="a11y-size">גודל טקסט</span><button type="button" data-size="-1" aria-describedby="a11y-size">הקטנה</button><button type="button" data-size="1" aria-describedby="a11y-size">הגדלה</button></div>' +
    MODES.map(m => `<button type="button" data-mode="${m[0]}" aria-pressed="false">${m[1]}</button>`).join('') +
    '<button type="button" data-reset>איפוס כל ההגדרות</button></div>' +
    `<div class="a11y-foot"><a href="${statement}">הצהרת נגישות</a><span class="a11y-note">ההגדרות נשמרות במכשיר הזה</span></div>`;
  panel.inert = true;
  const scrim = document.createElement('div');
  scrim.className = 'a11y-scrim';
  const guide = document.createElement('div');
  guide.className = 'a11y-line';
  guide.setAttribute('aria-hidden', 'true');
  document.body.append(scrim, panel, guide);
  addEventListener('pointermove', e => { if (saved.guide) guide.style.transform = `translateY(${e.clientY - 2}px)`; }, { passive: true });

  let wasStill = null;
  const apply = () => {
    doc.style.setProperty('--a11y-zoom', SCALES[saved.scale]);
    doc.classList.toggle('a11y-zoom', saved.scale > 0);
    MODES.forEach(([k]) => {
      doc.classList.toggle('a11y-' + k, !!saved[k]);
      panel.querySelector(`[data-mode="${k}"]`).setAttribute('aria-pressed', String(!!saved[k]));
    });
    // "עצירת אנימציות" מגיע גם לסרטונים ולמהלכי הגלילה: כל עמוד מאזין לאירוע הזה
    const still = !!saved.still;
    if (still !== wasStill) {
      wasStill = still;
      window.gilisStill = still;
      document.dispatchEvent(new CustomEvent('a11y:still', { detail: still }));
    }
    try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
  };
  const open = o => {
    panel.classList.toggle('open', o);
    scrim.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', String(o));
    panel.inert = !o;
    if (o) setTimeout(() => panel.querySelector('.a11y-x').focus(), 60);
    else btn.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => open(!panel.classList.contains('open')));
  panel.querySelector('.a11y-x').addEventListener('click', () => open(false));
  scrim.addEventListener('click', () => open(false));
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
  panel.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.mode;
    saved[k] = !saved[k];
    if (k === 'gray' && saved.gray) saved.invert = false; // מסנן אחד בכל פעם
    if (k === 'invert' && saved.invert) saved.gray = false;
    apply();
  }));
  panel.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
    saved.scale = Math.max(0, Math.min(SCALES.length - 1, saved.scale + +b.dataset.size));
    apply();
  }));
  panel.querySelector('[data-reset]').addEventListener('click', () => {
    saved = { scale: 0, still: matchMedia('(prefers-reduced-motion: reduce)').matches };
    apply();
  });
  apply();
})();
