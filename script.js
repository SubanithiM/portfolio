"use strict";

/* ===== SETTINGS =====
   To receive real emails, create a free form at https://formspree.io and paste
   its URL here, e.g. "https://formspree.io/f/yourFormId".
   While this is empty, the form opens the visitor's email app instead. */
const FORM_ENDPOINT = "";
const MY_EMAIL = "subanithi46@gmail.com";

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ===== MOBILE MENU ===== */
const menu = $("#menu"), burger = $("#burger");
function setMenu(open) {
  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* ===== HEADER BACKGROUND + BACK-TO-TOP BUTTON ===== */
const header = $("header"), topBtn = $("#top");
function onScroll() {
  header.classList.toggle("solid", window.scrollY > 20);
  topBtn.classList.toggle("show", window.scrollY > 600);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ===== ACTIVE NAV LINK (highlights the section in view) ===== */
const navLinks = $$("#menu a");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => sectionObserver.observe(s));

/* ===== PLACEHOLDER LINKS (class="ph") do nothing until you add a real URL ===== */
$$("a.ph").forEach(a => a.addEventListener("click", e => e.preventDefault()));

/* ===== FOOTER YEAR ===== */
$("#year").textContent = new Date().getFullYear();

/* ===== CONTACT FORM ===== */
const form = $("#form"), statusEl = $("#status");
const fields = $$("input, textarea", form);

// Each rule returns true when valid, or the error message to show
const rules = {
  name: v => v.trim().length >= 2 || "Enter your name (at least 2 characters).",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Enter a valid email, like name@example.com.",
  subject: v => v.trim().length >= 3 || "Enter a subject (at least 3 characters).",
  message: v => v.trim().length >= 10 || "Write a message of at least 10 characters."
};

function check(field) {
  const result = rules[field.name](field.value);
  const ok = result === true;
  field.classList.toggle("invalid", !ok);
  field.setAttribute("aria-invalid", String(!ok));
  $("#" + field.id + "-err").textContent = ok ? "" : result;
  return ok;
}

fields.forEach(f => f.addEventListener("blur", () => check(f)));
fields.forEach(f => f.addEventListener("input", () => { if (f.classList.contains("invalid")) check(f); }));

form.addEventListener("submit", async e => {
  e.preventDefault();
  const allValid = fields.map(check).every(Boolean); // check every field, not just the first
  if (!allValid) {
    statusEl.textContent = "Please fix the highlighted fields.";
    fields.find(f => f.classList.contains("invalid")).focus();
    return;
  }
  const data = Object.fromEntries(fields.map(f => [f.name, f.value.trim()]));

  if (FORM_ENDPOINT) {
    // Real delivery through a form service
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Request failed");
      form.reset();
      statusEl.textContent = "Message sent. Thank you!";
    } catch {
      statusEl.textContent = "Could not send the message. Please email me directly.";
    }
  } else {
    // Fallback: open the visitor's email app with the message filled in
    const body = `${data.message}\n\n${data.name} (${data.email})`;
    window.location.href = `mailto:${MY_EMAIL}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
    statusEl.textContent = "Opening your email app. Connect a form service for direct delivery.";
  }
});

/* =====================================================================
   MOTION ENGINE: one rAF loop drives the cursor field and the text springs.
   It sleeps when nothing is moving.
   ===================================================================== */
const GAP = 64, REACH = 210, DOT = 1.6, EASE = 0.12;   // Hub Lines settings
const TENSION = 540, FRICTION = 36, BLUR = 8, STAGGER = 17; // Blur In settings
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

const springs = [];   // letters currently animating
let field = null;     // set while the cursor field is mounted
let rafId = 0, last = 0;

function wake() {
  if (!rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); }
}
function frame(now) {
  rafId = 0;
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  let busy = stepSprings(now, dt);
  if (field && field.draw(dt)) busy = true;
  if (busy) rafId = requestAnimationFrame(frame);
}

/* ---------- Blur In: each letter springs from (opacity 0, blur 8px) to (1, 0) ---------- */
function stepSprings(now, dt) {
  for (let i = springs.length - 1; i >= 0; i--) {
    const s = springs[i];
    if (now < s.start) continue;                       // waiting for its stagger delay
    for (let t = dt; t > 0; t -= 0.004) {              // small steps keep the spring stable
      const h = Math.min(t, 0.004);
      s.v += (-TENSION * (s.x - 1) - FRICTION * s.v) * h;
      s.x += s.v * h;
    }
    const done = Math.abs(s.x - 1) < 0.001 && Math.abs(s.v) < 0.01;
    const p = done ? 1 : Math.min(Math.max(s.x, 0), 1);
    s.el.style.opacity = done ? "" : p;
    s.el.style.filter = done ? "" : `blur(${BLUR * (1 - p)}px)`;
    if (done) springs.splice(i, 1);
  }
  return springs.length > 0;
}

const SKIP = "script,style,input,textarea,select,.err,#status,#year,.sr,.skip";
const UNIT = "h1,h2,h3,p,li,dt,dd,label,a,button";   // each unit animates as one group
const groups = new Map();                            // unit element -> its letter spans

function splitText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (n.nodeValue.trim() && !n.parentElement.closest(SKIP)) nodes.push(n);
  }
  nodes.forEach(n => {
    const unit = n.parentElement.closest(UNIT) || n.parentElement;
    const list = groups.get(unit) || groups.set(unit, []).get(unit);
    const frag = document.createDocumentFragment();
    const sr = document.createElement("span");       // real text for screen readers
    sr.className = "sr"; sr.textContent = n.nodeValue;
    const visual = document.createElement("span");   // animated letters, hidden from screen readers
    visual.setAttribute("aria-hidden", "true");
    n.nodeValue.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { visual.append(" "); return; }
      const w = document.createElement("span");
      w.className = "w";
      [...part].forEach(ch => {
        const l = document.createElement("span");
        l.className = "l"; l.textContent = ch; l.style.opacity = "0";
        w.append(l); list.push(l);
      });
      visual.append(w);
    });
    frag.append(sr, visual);
    n.replaceWith(frag);
  });
}

function animateText() {
  const io = new IntersectionObserver((entries, obs) => entries.forEach(e => {
    if (!e.isIntersecting) return;
    obs.unobserve(e.target);                          // play once
    const letters = groups.get(e.target), now = performance.now();
    const gap = Math.min(STAGGER, 1200 / letters.length); // long paragraphs keep a short total delay
    letters.forEach((el, i) => springs.push({ el, x: 0, v: 0, start: now + i * gap }));
    wake();
  }), { threshold: 0.1 });
  groups.forEach((_, unit) => io.observe(unit));
}

if (!reduceMotion.matches && "IntersectionObserver" in window) { splitText(); animateText(); }

/* ---------- Hub Lines: a dot lattice; thin lines run from the eased pointer to nearby dots ---------- */
function mountField() {
  const canvas = document.createElement("canvas");
  canvas.id = "field";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, cols = 0, rows = 0, seen = false;
  let tx = innerWidth / 2, ty = innerHeight / 2, ex = tx, ey = ty, hot = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / GAP); rows = Math.ceil(h / GAP);
    wake();
  }

  function draw(dt) {
    const k = 1 - Math.pow(1 - EASE, dt * 60);       // frame-rate independent easing
    ex += (tx - ex) * k; ey += (ty - ey) * k;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ctx.strokeStyle = "#02d2e3";
    ctx.lineWidth = 1;
    const boost = hot ? 1.5 : 1;                     // brighter over links and buttons
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = GAP / 2 + i * GAP, y = GAP / 2 + j * GAP;
        const near = seen ? Math.max(0, 1 - Math.hypot(ex - x, ey - y) / REACH) : 0;
        ctx.globalAlpha = Math.min(1, 0.07 + near * 0.85);   // dot grows and brightens near the pointer
        ctx.beginPath(); ctx.arc(x, y, DOT + near * 2.2, 0, 6.2832); ctx.fill();
        if (near > 0) {                                      // spoke from the pointer to this dot
          ctx.globalAlpha = Math.min(1, near * near * 0.8 * boost);
          ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x, y); ctx.stroke();
        }
      }
    }
    return Math.hypot(tx - ex, ty - ey) > 0.1;       // keep animating until the field catches up
  }

  const onMove = e => {
    tx = e.clientX; ty = e.clientY; seen = true;
    hot = !!(e.target.closest && e.target.closest("a, button, input"));
    wake();
  };
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("resize", resize);
  field = { draw };
  resize();
  return () => {                                     // teardown
    removeEventListener("pointermove", onMove);
    removeEventListener("resize", resize);
    canvas.remove(); field = null;
  };
}

// Mount only for a mouse-like pointer and when motion is allowed; re-check on change
let unmount = null;
function syncField() {
  const ok = finePointer.matches && !reduceMotion.matches;
  if (ok && !unmount) unmount = mountField();
  else if (!ok && unmount) { unmount(); unmount = null; }
}
finePointer.addEventListener("change", syncField);
reduceMotion.addEventListener("change", syncField);
addEventListener("pagehide", () => { if (unmount) unmount(); });
syncField();

/* ===== CONTOUR BACKGROUND: slow-rolling contour lines on the light ground (marching squares) ===== */
(function () {
  const canvas = document.createElement("canvas");
  canvas.id = "bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  const SCALE = 3.8, COUNT = 2.5, WAVE = 0.37, SPEED = 1.66, CELLS = 96;
  const t0 = performance.now();
  let w = 0, h = 0, last = 0;

  // Smooth analytic field the contour lines are sliced from
  const contour = (x, y, t) => {
    let f = Math.sin(x + t * 0.6) * 0.5;
    f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
    f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
    f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
    return f * 0.5 + 0.5;
  };

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const cols = w >= h ? CELLS : Math.max(8, Math.round(CELLS * w / h));
    const rows = Math.max(8, Math.round(cols * h / w));
    const sx = w / cols, sy = h / rows, aspect = w / h;
    const v = new Float32Array((cols + 1) * (rows + 1));
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const nx = ((i / cols) * 2 - 1) * aspect * SCALE, ny = ((j / rows) * 2 - 1) * SCALE;
      const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE, qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE;
      v[j * (cols + 1) + i] = contour(qx, qy, t) * COUNT;
    }
    ctx.strokeStyle = "rgba(9,10,11,0.08)"; ctx.lineWidth = 1; ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (let level = 0.5; level < COUNT; level += 1) {
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const a = v[j * (cols + 1) + i], b = v[j * (cols + 1) + i + 1];
        const c = v[(j + 1) * (cols + 1) + i + 1], d = v[(j + 1) * (cols + 1) + i];
        const k = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
        if (k === 0 || k === 15) continue;
        const x0 = i * sx, y0 = j * sy;
        const top = [x0 + sx * ((level - a) / (b - a)), y0];
        const right = [x0 + sx, y0 + sy * ((level - b) / (c - b))];
        const bottom = [x0 + sx * ((level - d) / (c - d)), y0 + sy];
        const left = [x0, y0 + sy * ((level - a) / (d - a))];
        const seg = (p, q) => { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); };
        switch (k) {
          case 1: case 14: seg(left, bottom); break;
          case 2: case 13: seg(bottom, right); break;
          case 3: case 12: seg(left, right); break;
          case 4: case 11: seg(top, right); break;
          case 6: case 9: seg(top, bottom); break;
          case 7: case 8: seg(left, top); break;
          case 5: seg(left, top); seg(bottom, right); break;
          case 10: seg(left, bottom); seg(top, right); break;
        }
      }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw((performance.now() - t0) / 1000 * SPEED);
  }
  function tick(now) {
    if (!document.hidden && now - last > 24) { last = now; draw((now - t0) / 1000 * SPEED); }
    requestAnimationFrame(tick);
  }
  addEventListener("resize", resize);
  resize();
  if (!reduceMotion.matches) requestAnimationFrame(tick);   // reduced motion: one still frame
})();
