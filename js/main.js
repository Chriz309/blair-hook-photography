/* Blair Hook Photography — site behaviour */
const WHATSAPP = '27729633580';
document.documentElement.classList.remove('no-js');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* header + menu */
(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const btn = document.querySelector('.menu-btn');
  const set = open => { document.body.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
  btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
})();

/* reveal on scroll */
(() => {
  const els = document.querySelectorAll('.fade, .reveal-img');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .15, rootMargin: '0px 0px -5% 0px' });
  els.forEach(e => io.observe(e));
})();

/* hero slideshow */
(() => {
  const imgs = [...document.querySelectorAll('.hero-slides img')];
  const ticks = [...document.querySelectorAll('.slide-count button')];
  if (imgs.length < 2) return;
  let i = 0, t;
  const show = n => { imgs[i].classList.remove('on'); ticks[i] && ticks[i].classList.remove('on'); i = n; const im = imgs[i]; if (im.loading === 'lazy') im.loading = 'eager'; im.classList.add('on'); ticks[i] && ticks[i].classList.add('on'); };
  const go = () => { clearInterval(t); if (!reduce) t = setInterval(() => show((i + 1) % imgs.length), 7000); };
  ticks.forEach((b, n) => b.addEventListener('click', () => { show(n); go(); }));
  go();
})();

/* parallax on full-bleed images */
(() => {
  if (reduce) return;
  const els = [...document.querySelectorAll('.bleed > img')];
  if (!els.length) return;
  const tick = () => { els.forEach(img => { const r = img.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; img.style.transform = `translateY(${(-7 - p * 7).toFixed(2)}%)`; }); };
  window.addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
})();

/* session list: floating image preview */
(() => {
  const peek = document.querySelector('.peek');
  const rows = [...document.querySelectorAll('.srow')];
  if (!peek || !rows.length || matchMedia('(hover: none)').matches) return;
  const imgs = [...peek.querySelectorAll('img')];
  let x = 0, y = 0, cx = 0, cy = 0, raf;
  const loop = () => { cx += (x - cx) * .14; cy += (y - cy) * .14; peek.style.left = cx + 'px'; peek.style.top = cy + 'px'; raf = requestAnimationFrame(loop); };
  rows.forEach((r, n) => {
    r.addEventListener('mouseenter', e => { x = cx = e.clientX; y = cy = e.clientY; imgs.forEach((im, k) => im.classList.toggle('on', k === n)); peek.classList.add('on'); cancelAnimationFrame(raf); loop(); });
    r.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
    r.addEventListener('mouseleave', () => { peek.classList.remove('on'); setTimeout(() => cancelAnimationFrame(raf), 500); });
  });
})();

/* testimonials */
(() => {
  const qs = [...document.querySelectorAll('.testi blockquote')];
  const ticks = document.querySelector('.ticks');
  if (!qs.length) return;
  let i = 0, t;
  qs.forEach((_, n) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Review ${n + 1}`); b.addEventListener('click', () => { show(n); go(); }); ticks.appendChild(b); });
  const show = n => { i = n; qs.forEach((q, k) => q.classList.toggle('on', k === n)); [...ticks.children].forEach((d, k) => d.classList.toggle('on', k === n)); };
  const go = () => { clearInterval(t); t = setInterval(() => show((i + 1) % qs.length), 7500); };
  const fit = () => { const box = document.querySelector('.testi .quotes'); box.style.minHeight = Math.max(...qs.map(q => q.scrollHeight)) + 'px'; };
  addEventListener('resize', fit); fit(); show(0); go();
})();

/* lightbox */
const Lightbox = (() => {
  const lb = document.querySelector('.lb');
  if (!lb) return null;
  const img = lb.querySelector('img'), count = lb.querySelector('.count');
  let list = [], i = 0, last = null;
  const show = n => { i = (n + list.length) % list.length; img.style.opacity = 0; const pre = new Image(); pre.onload = () => { img.src = pre.src; img.alt = list[i].querySelector('img').alt; img.style.opacity = 1; }; pre.src = list[i].dataset.full; count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`; };
  const open = (items, n, trig) => { list = items; last = trig; show(n); lb.classList.add('on'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); };
  const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; last && last.focus(); };
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', () => show(i - 1));
  lb.querySelector('.next').addEventListener('click', () => show(i + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1); });
  let tx = 0; lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); });
  return { open };
})();

/* portfolio filters */
(() => {
  const grid = document.querySelector('.masonry[data-filter]');
  if (!grid) return;
  const tiles = [...grid.querySelectorAll('.tile')];
  const btns = [...document.querySelectorAll('.filters button')];
  const apply = cat => {
    btns.forEach(b => b.classList.toggle('on', b.dataset.f === cat));
    let n = 0;
    tiles.forEach(t => { const on = cat === 'all' || t.dataset.cat === cat; t.classList.toggle('hide', !on); t.classList.remove('show'); if (on) { void t.offsetWidth; t.style.animationDelay = Math.min(n++, 10) * 60 + 'ms'; t.classList.add('show'); } });
    history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
  };
  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.f)));
  tiles.forEach(t => t.addEventListener('click', () => { const v = tiles.filter(x => !x.classList.contains('hide')); Lightbox && Lightbox.open(v, v.indexOf(t), t); }));
  const h = location.hash.slice(1); if (h && btns.some(b => b.dataset.f === h)) apply(h);
})();

/* other lightbox groups */
document.querySelectorAll('[data-lb-group]').forEach(g => {
  const items = [...g.querySelectorAll('[data-full]')];
  items.forEach((it, n) => it.addEventListener('click', () => Lightbox && Lightbox.open(items, n, it)));
});

/* quote request → WhatsApp */
(() => {
  const f = document.getElementById('quoteForm');
  if (!f) return;
  const pre = new URLSearchParams(location.search).get('session');
  if (pre) { const r = f.querySelector(`input[name=session][value="${pre}"]`); if (r) r.checked = true; }
  if (f.date) f.date.min = new Date().toISOString().slice(0, 10);
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const s = (f.querySelector('input[name=session]:checked') || {}).value || 'Photoshoot';
    const d = f.date.value ? new Date(f.date.value + 'T12:00').toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible';
    const lines = [
      'Hi Chris, I would like to request a quote from Blair Hook Photography.',
      '',
      `*Name:* ${f.name.value.trim()}`,
      `*Session:* ${s}`,
      `*Date:* ${d}`,
      f.people.value ? `*Number of people:* ${f.people.value}` : null,
      f.place.value.trim() ? `*Location:* ${f.place.value.trim()}` : null,
      f.msg.value.trim() ? `\n${f.msg.value.trim()}` : null,
    ].filter(x => x !== null);
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();

document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
