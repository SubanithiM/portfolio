(() => {
  'use strict';

  // Lets the CSS know JavaScript is running (used for scroll reveal)
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ===== Mobile menu (closes on link click or Escape) ===== */
  const burger = $('#burger'), links = $('#links');
  const setMenu = (open) => {
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.innerHTML = `<i class="fa-solid fa-${open ? 'xmark' : 'bars'}"></i>`;
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ===== Placeholder links (GitHub / LinkedIn not in the resume) ===== */
  $$('a.placeholder').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Add your real URL in index.html (search for "Add GitHub URL" or "Add LinkedIn URL").');
  }));

  /* ===== Scroll reveal ===== */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('show'); reveal.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => reveal.observe(el));

  /* ===== Active navigation highlight ===== */
  const navLinks = $$('a', links);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('section[id]').forEach((s) => spy.observe(s));

  /* ===== Nav background and back-to-top button ===== */
  const nav = $('#nav'), topBtn = $('#top');
  const onScroll = () => {
    nav.classList.toggle('solid', window.scrollY > 40);
    topBtn.classList.toggle('show', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $('#year').textContent = new Date().getFullYear();

  /* ===== Smoke cursor: soft white puffs that rise, grow and fade ===== */
  const cv = $('#smoke'), ctx = cv.getContext('2d');
  const hasMouse = matchMedia('(pointer: fine)').matches;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasMouse && !calm) {
    let puffs = [], running = false;
    const resize = () => { cv.width = innerWidth; cv.height = innerHeight; };
    resize();
    addEventListener('resize', resize);

    addEventListener('mousemove', (e) => {
      for (let i = 0; i < 2; i++) {
        puffs.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 0.7 - 0.2,
          r: 6 + Math.random() * 8,
          life: 1
        });
      }
      if (puffs.length > 160) puffs.splice(0, puffs.length - 160);
      if (!running) { running = true; requestAnimationFrame(draw); }
    });

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      puffs = puffs.filter((p) => p.life > 0);
      for (const p of puffs) {
        p.x += p.vx + Math.sin(p.life * 6) * 0.3; // gentle drift
        p.y += p.vy;
        p.r += 0.55;
        p.life -= 0.016;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255,255,255,${p.life * 0.16})`);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (puffs.length) requestAnimationFrame(draw);
      else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
  }

  /* ===== Contact form validation ===== */
  const form = $('#form'), status = $('#status');
  const rules = {
    name: (v) => v.trim().length >= 2 || 'Enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    subject: (v) => v.trim().length >= 3 || 'Enter a subject.',
    message: (v) => v.trim().length >= 10 || 'Write at least 10 characters.'
  };
  const check = (field) => {
    const result = rules[field.name](field.value);
    $('#' + field.name + '-error').textContent = result === true ? '' : result;
    field.setAttribute('aria-invalid', result !== true);
    return result === true;
  };
  const fields = $$('input, textarea', form);
  fields.forEach((f) => f.addEventListener('input', () => check(f)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!fields.map(check).every(Boolean)) { status.textContent = 'Fix the marked fields and send again.'; return; }
    const d = Object.fromEntries(new FormData(form));
    // No backend: open the visitor's email app with the message filled in
    const body = `${d.message}\n\n${d.name} (${d.email})`;
    window.location.href = `mailto:subanithi46@gmail.com?subject=${encodeURIComponent(d.subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app. Press send there to deliver the message.';
    form.reset();
  });
})();
