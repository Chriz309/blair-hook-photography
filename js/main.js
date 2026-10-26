/* Blair Hook Photography — site behaviour */
const WHATSAPP = '27729633580';
const PRICES = {
  base: 1500,          // couples, graduations and most sessions start here
  groupSmall: 200,     // per person
  groupLarge: 150,     // per person for bigger groups
  groupLargeFrom: 10,  // group size where the lower rate starts
};

document.documentElement.classList.remove('no-js');

/* header + menu */
(() => {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('solid', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const btn = document.querySelector('.menu-btn');
  if (btn) {
    const set = open => { document.body.classList.toggle('menu-open', open); btn.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : ''; };
    btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }
})();

/* reveal on scroll */
(() => {
  const els = document.querySelectorAll('.rv, .clip');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
})();

/* hero photo stack */
(() => {
  const figs = [...document.querySelectorAll('.stack figure')];
  if (figs.length < 3) return;
  let order = figs.map((_, i) => i);
  const paint = () => order.forEach((fi, pos) => figs[fi].dataset.pos = pos < 3 ? pos : 'hidden');
  paint();
  figs.forEach(f => { if (f.dataset.pos === 'hidden') f.style.opacity = 0; });
  const next = () => {
    const top = figs[order[0]];
    top.dataset.pos = 'out';
    setTimeout(() => {
      order.push(order.shift());
      figs.forEach(f => f.style.opacity = '');
      paint();
      figs.forEach(f => { if (f.dataset.pos === 'hidden') f.style.opacity = 0; });
    }, 650);
  };
  let t = setInterval(next, 4200);
  const stack = document.querySelector('.stack');
  stack.addEventListener('click', () => { clearInterval(t); next(); t = setInterval(next, 4200); });
})();

/* horizontal story: drag + buttons */
(() => {
  const s = document.querySelector('.story');
  if (!s) return;
  let down = false, sx = 0, sl = 0, moved = false;
  s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('dragging'); });
  window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; s.scrollLeft = sl - dx; });
  window.addEventListener('pointerup', () => { if (!down) return; down = false; s.classList.remove('dragging'); });
  const step = () => s.querySelector('figure').getBoundingClientRect().width + 19;
  document.querySelectorAll('[data-story]').forEach(b => b.addEventListener('click', () => s.scrollBy({ left: b.dataset.story === 'next' ? step() : -step(), behavior: 'smooth' })));
})();

/* review rotator */
(() => {
  const qs = [...document.querySelectorAll('.quote')];
  const dots = document.querySelector('.dots');
  if (!qs.length || !dots) return;
  let i = 0, t;
  qs.forEach((_, n) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Review ${n + 1}`); b.addEventListener('click', () => { show(n); restart(); }); dots.appendChild(b); });
  const show = n => { i = n; qs.forEach((q, k) => q.classList.toggle('on', k === n)); [...dots.children].forEach((d, k) => d.classList.toggle('on', k === n)); };
  const restart = () => { clearInterval(t); t = setInterval(() => show((i + 1) % qs.length), 6500); };
  // size container to tallest quote
  const fit = () => { const box = document.querySelector('.quotes'); box.style.minHeight = Math.max(...qs.map(q => q.scrollHeight)) + 'px'; };
  window.addEventListener('resize', fit); fit();
  show(0); restart();
})();

/* lightbox (works for any [data-lb] group) */
const Lightbox = (() => {
  const lb = document.querySelector('.lb');
  if (!lb) return null;
  const img = lb.querySelector('img'), count = lb.querySelector('.count');
  let list = [], i = 0, last = null;
  const show = n => { i = (n + list.length) % list.length; img.style.opacity = 0; const src = list[i].dataset.full; const pre = new Image(); pre.onload = () => { img.src = src; img.alt = list[i].querySelector('img').alt; img.style.opacity = 1; }; pre.src = src; count.textContent = `${i + 1} / ${list.length}`; };
  const open = (items, n, trigger) => { list = items; last = trigger; show(n); lb.classList.add('on'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); };
  const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; if (last) last.focus(); };
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
  const grid = document.querySelector('.masonry');
  if (!grid) return;
  const tiles = [...grid.querySelectorAll('.tile')];
  const chips = [...document.querySelectorAll('.chip')];
  const visible = () => tiles.filter(t => !t.classList.contains('hide'));
  const apply = cat => {
    chips.forEach(c => c.classList.toggle('on', c.dataset.f === cat));
    tiles.forEach((t, n) => { const on = cat === 'all' || t.dataset.cat === cat; t.classList.toggle('hide', !on); t.classList.remove('pop'); if (on) { void t.offsetWidth; t.style.animationDelay = Math.min(n, 12) * 30 + 'ms'; t.classList.add('pop'); } });
    history.replaceState(null, '', cat === 'all' ? location.pathname : '#' + cat);
  };
  chips.forEach(c => c.addEventListener('click', () => apply(c.dataset.f)));
  tiles.forEach(t => t.addEventListener('click', () => { const v = visible(); Lightbox && Lightbox.open(v, v.indexOf(t), t); }));
  const h = location.hash.slice(1);
  if (h && chips.some(c => c.dataset.f === h)) apply(h);
})();

/* any other lightbox groups (e.g. graduation page) */
document.querySelectorAll('[data-lb-group]').forEach(group => {
  const items = [...group.querySelectorAll('[data-full]')];
  items.forEach((it, n) => it.addEventListener('click', () => Lightbox && Lightbox.open(items, n, it)));
});

/* price helpers */
const groupPrice = n => Math.max(PRICES.base, n * (n >= PRICES.groupLargeFrom ? PRICES.groupLarge : PRICES.groupSmall));
const rand = n => 'R' + n.toLocaleString('en-ZA').replace(/,/g, ' ');

/* group calculator (pricing page) */
(() => {
  const r = document.getElementById('groupSize');
  if (!r) return;
  const out = document.getElementById('groupOut'), ppl = document.getElementById('groupPeople'), note = document.getElementById('groupNote');
  const upd = () => {
    const n = +r.value;
    ppl.textContent = n + (n === 1 ? ' person' : ' people');
    out.textContent = rand(groupPrice(n));
    const rate = n >= PRICES.groupLargeFrom ? PRICES.groupLarge : PRICES.groupSmall;
    note.textContent = n * rate < PRICES.base ? `Minimum session fee applies (${rand(PRICES.base)})` : `${rand(rate)} per person`;
  };
  r.addEventListener('input', upd); upd();
})();

/* booking form → WhatsApp */
(() => {
  const f = document.getElementById('bookForm');
  if (!f) return;
  const est = document.getElementById('estimate');
  const sizeWrap = document.getElementById('sizeWrap');
  const params = new URLSearchParams(location.search);
  const pre = params.get('type');
  if (pre) { const r = f.querySelector(`input[name=type][value="${pre}"]`); if (r) r.checked = true; }
  const upd = () => {
    const type = (f.querySelector('input[name=type]:checked') || {}).value;
    const n = +f.people.value || 1;
    sizeWrap.style.display = type === 'Group / family' || type === 'Graduation' || type === "21st / birthday" ? '' : 'none';
    let txt = 'Let’s chat';
    if (type === 'Wedding' || type === 'Event') txt = 'Custom quote';
    else if (type === 'Group / family' || ((type === 'Graduation' || type === '21st / birthday') && n > 2)) txt = 'About ' + rand(groupPrice(n));
    else if (type) txt = 'From ' + rand(PRICES.base);
    est.textContent = txt;
  };
  f.addEventListener('input', upd); f.addEventListener('change', upd); upd();
  const today = new Date().toISOString().slice(0, 10);
  if (f.date) f.date.min = today;
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const type = (f.querySelector('input[name=type]:checked') || {}).value || 'Photoshoot';
    const d = f.date.value ? new Date(f.date.value).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'flexible';
    const lines = [
      `Hi Chris! I'd like to book a shoot with Blair Hook Photography 📸`,
      ``,
      `*Name:* ${f.name.value.trim()}`,
      `*Session:* ${type}`,
      `*Date:* ${d}`,
      sizeWrap.style.display !== 'none' ? `*People:* ${f.people.value}` : null,
      f.place.value.trim() ? `*Location idea:* ${f.place.value.trim()}` : null,
      f.msg.value.trim() ? `\n${f.msg.value.trim()}` : null,
    ].filter(x => x !== null);
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
  });
})();

document.querySelectorAll('[data-year]').forEach(e => e.textContent = new Date().getFullYear());
