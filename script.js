(() => {
  'use strict';

  // Lets the CSS know JavaScript is running (used for scroll reveal)
  document.documentElement.classList.add('js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

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

  /* ===== Nav background and back-to-top button ===== */
  const nav = $('#nav'), topBtn = $('#top'), bar = $('#progress');
  const onScroll = () => {
    nav.classList.toggle('solid', window.scrollY > 40);
    topBtn.classList.toggle('show', window.scrollY > 500);
    bar.style.width = (window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 100 + '%';   // scroll progress line
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $('#year').textContent = new Date().getFullYear();
  setTimeout(() => { const i = $('#intro'); if (i) i.remove(); }, 3000);   // intro splash cleanup

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
      for (let i = 0; i < 3; i++) {
        puffs.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 0.7 - 0.2,
          r: 8 + Math.random() * 10,
          life: 1
        });
      }
      if (puffs.length > 220) puffs.splice(0, puffs.length - 220);
      if (!running) { running = true; requestAnimationFrame(draw); }
    });

    function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      puffs = puffs.filter((p) => p.life > 0);
      for (const p of puffs) {
        p.x += p.vx + Math.sin(p.life * 6) * 0.3; // gentle drift
        p.y += p.vy;
        p.r += 0.7;
        p.life -= 0.016;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255,255,255,${p.life * 0.26})`);
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

/* ===== Animated gradient background: plain WebGL2, one fullscreen triangle, one shader =====
   Colours and motion come ONLY from CONFIG below. To recolour, change CONFIG, never the shader.
   Wrapped in try/catch so the rest of the portfolio keeps working if WebGL2 is unavailable. */
(() => {
  try {
    const canvas = document.getElementById('gl');
    const gl = canvas && canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
    if (!gl) { if (canvas) canvas.remove(); return; }   // no WebGL2: the plain brown page colour stays

    const CONFIG = {
      bgColor: '#2e2622', colorA: '#5c4a40', colorB: '#a88a76', colorC: '#dccabc', colorD: '#fff2e6',
      scale: 1, speed: 0.33, tilt: 1.87, rock: 0.12, horizon: 0.36, breathe: 0.29, spread: 0.41,
      curve: 3.32, direct: 0.97, bounce: 0.38, bounceCurve: 4.25, spillCentre: 0.3, spillWidth: 2.18,
      spillFloor: 0.26, amount: 0.2, warp: 2.58, warpScale: 0.78, flow: 0.475, roughness: 0.29,
      lacunarity: 1.99, motes: 0.074, moteScale: 7, ambient: 0.24, contrast: 2.45, midpoint: 0.57,
      sink: 0.24, glow: 0.38, grain: 0, grainAnim: 0, dither: 0.58, vignette: 0.21, steer: -0.13,
      lift: 0.11, sweep: 0.5, cursor: 1, parallax: 0.0137, maxDpr: 1
    };
    const hexToVec3 = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

    const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

    const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;
uniform float uScale;

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uTilt, uRock, uHorizon, uBreathe, uSpread, uCurve, uDirect;
uniform float uBounce, uBounceCurve;
uniform float uSpillCentre, uSpillWidth, uSpillFloor;
uniform float uAmount, uWarp, uWarpScale, uFlow, uRoughness, uLacunarity, uMotes, uMoteScale;
uniform float uAmbient, uContrast, uMidpoint, uSink, uGlow;
uniform float uGrain, uDither, uVignette;
uniform float uSteer, uLift, uSweep, uParallax;

#define OCTAVES 4

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}

uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  uv *= uScale;
  vec2 iM = iMouse * uScale;
  float t = iTime * uSpeed;

  vec2 p = uv - iM * uParallax;

  float tilt = uTilt + sin(t * 0.13) * uRock + iM.x * uSteer;
  vec2 dir = vec2(cos(tilt), sin(tilt));
  float axis = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));

  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)),
                fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  float air = fbm(p + uWarp * q + vec2(t * 0.12, -t * 0.09)) * 0.5 + 0.5;

  float horizon = uHorizon + sin(t * 0.09 + 2.1) * uBreathe - iM.y * uLift;
  float alt = clamp(0.5 + (axis - horizon) * uSpread + (air - 0.5) * uAmount, 0.0, 1.0);

  float ac = (across - uSpillCentre - iM.x * uSweep) / max(0.05, uSpillWidth);
  float spill = mix(uSpillFloor, 1.0, exp(-ac * ac));

  float direct = pow(alt, max(0.05, uCurve)) * uDirect * spill;

  float bounce = uBounce * pow(1.0 - alt, max(0.05, uBounceCurve));

  float f = uAmbient + direct + bounce;
  f += uMotes * snoise(p * uMoteScale + vec2(-t * 0.5, t * 0.35)) * 0.5 * alt;

  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const LOC = {};
    const loc = (n) => (n in LOC ? LOC[n] : (LOC[n] = gl.getUniformLocation(program, n)));
    const u1f = (n, v) => gl.uniform1f(loc(n), v);
    const u2f = (n, x, y) => gl.uniform2f(loc(n), x, y);

    /* Each CONFIG key becomes one uniform: u + capitalised key (bgColor is uBg). Colours upload as vec3. */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);   // capped at 1: cheap and smooth
      const w = Math.max(1, Math.round(innerWidth * dpr));
      const h = Math.max(1, Math.round(innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      u2f('iResolution', w, h);
    };
    gl.useProgram(program);
    for (const [key, val] of Object.entries(CONFIG)) {
      if (key === 'cursor' || key === 'maxDpr') continue;
      const name = key === 'bgColor' ? 'uBg' : 'u' + key[0].toUpperCase() + key.slice(1);
      if (typeof val === 'string') { const c = hexToVec3(val); gl.uniform3f(loc(name), c[0], c[1], c[2]); }
      else u1f(name, val);
    }
    resize();

    let resizeQueued = false;   // one resize per frame, however fast the window is dragged
    addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => { resizeQueued = false; resize(); });
    }, { passive: true });

    /* Pointer: the handler only writes a target; the render loop eases toward it */
    const mouse = { x: 0, y: 0, ax: 0, ay: 0, tx: 0, ty: 0 };
    const aim = (e) => {
      mouse.tx = (e.clientX / innerWidth - 0.5) * (innerWidth / innerHeight);
      mouse.ty = 0.5 - e.clientY / innerHeight;
    };
    addEventListener('pointermove', aim, { passive: true });
    addEventListener('pointerdown', aim, { passive: true });

    let visible = true;
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(canvas);

    let prevT = performance.now(), clock = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      const raw = now - prevT;
      prevT = now;
      if (!visible || document.hidden) return;
      /* Clamped frame time: same follow-lag at 60, 120 and 144 Hz, and no lurch after a background tab */
      const ms = raw > 50 ? 50 : raw < 4.167 ? 4.167 : raw;
      const s = ms > 36.7 ? 2.2 : ms * 0.06;
      clock += ms * 0.001;

      /* Two-stage lerp: a fast lead (0.105) chased by a slower body (0.043) */
      const kLead = 0.105 * s, kBody = 0.043 * s;
      mouse.ax += (mouse.tx - mouse.ax) * kLead;
      mouse.ay += (mouse.ty - mouse.ay) * kLead;
      mouse.x += (mouse.ax - mouse.x) * kBody;
      mouse.y += (mouse.ay - mouse.y) * kBody;

      u1f('iTime', clock);
      if (mouse.rest === undefined) mouse.rest = { x: mouse.tx, y: mouse.ty };
      if (!CONFIG.cursor) { mouse.tx = mouse.rest.x; mouse.ty = mouse.rest.y; }
      u2f('iMouse', mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    gl.drawArrays(gl.TRIANGLES, 0, 3);   // one draw first, so there is never a blank canvas
    requestAnimationFrame(frame);
  } catch (err) {
    console.warn('Background gradient disabled:', err);
  }
})();

/* ===== Resume: View and Download buttons =====
   A copy of the resume is embedded below, so these buttons work from any folder, on any host,
   even if the PDF file is missing. When the site is hosted online, the real PDF file is used first.
   If you change the resume PDF and only open the site from your computer, tell me and I will refresh this copy. */
(() => {
  const NAME = 'Subanithi_M_Resume.pdf';
  const EMBEDDED = 'JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL0Jhc2VGb250IC9IZWx2ZXRpY2EgL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcgL05hbWUgL0YxIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKMyAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMiAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0EgPDwKL1MgL1VSSSAvVHlwZSAvQWN0aW9uIC9VUkkgKGh0dHBzOi8vbGlua2VkaW4uY29tL2luL3N1YmFuaXRoaTQ2KQo+PiAvQm9yZGVyIFsgMCAwIDAgXSAvUmVjdCBbIDE5Ny4xNzk4IDczOS43Mzk0IDMwNS4yMjQ4IDc1MC41Mzk0IF0gL1N1YnR5cGUgL0xpbmsgL1R5cGUgL0Fubm90Cj4+CmVuZG9iago1IDAgb2JqCjw8Ci9BIDw8Ci9TIC9VUkkgL1R5cGUgL0FjdGlvbiAvVVJJIChodHRwczovL2dpdGh1Yi5jb20vU3ViYW5pdGhpTSkKPj4gL0JvcmRlciBbIDAgMCAwIF0gL1JlY3QgWyAzNDUuNTgwOCA3MzkuNzM5NCA0MzcuMTE5OCA3NTAuNTM5NCBdIC9TdWJ0eXBlIC9MaW5rIC9UeXBlIC9Bbm5vdAo+PgplbmRvYmoKNiAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1PYmxpcXVlIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMyAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjcgMCBvYmoKPDwKL0EgPDwKL1MgL1VSSSAvVHlwZSAvQWN0aW9uIC9VUkkgKGh0dHBzOi8vem9sb3RvLXU1dDkub25yZW5kZXIuY29tKQo+PiAvQm9yZGVyIFsgMCAwIDAgXSAvUmVjdCBbIDExMi42NzA2IDMzNS4zMTk0IDIyMi4wNTMgMzQ2LjgzOTQgXSAvU3VidHlwZSAvTGluayAvVHlwZSAvQW5ub3QKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0EgPDwKL1MgL1VSSSAvVHlwZSAvQWN0aW9uIC9VUkkgKGh0dHBzOi8vZ2l0aHViLmNvbS9TdWJhbml0aGlNKQo+PiAvQm9yZGVyIFsgMCAwIDAgXSAvUmVjdCBbIDI2Ny43NDkgMzM1LjMxOTQgMzY1LjM5MDYgMzQ2LjgzOTQgXSAvU3VidHlwZSAvTGluayAvVHlwZSAvQW5ub3QKPj4KZW5kb2JqCjkgMCBvYmoKPDwKL0Fubm90cyBbIDQgMCBSIDUgMCBSIDcgMCBSIDggMCBSIF0gL0NvbnRlbnRzIDEzIDAgUiAvTWVkaWFCb3ggWyAwIDAgNTk1LjI3NTYgODQxLjg4OTggXSAvUGFyZW50IDEyIDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAKICAvVHJhbnMgPDwKCj4+IC9UeXBlIC9QYWdlCj4+CmVuZG9iagoxMCAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDEyIDAgUiAvVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMTEgMCBvYmoKPDwKL0F1dGhvciAoU3ViYW5pdGhpIE0pIC9DcmVhdGlvbkRhdGUgKEQ6MjAyNjExMDExNDQ1NDcrMDAnMDAnKSAvQ3JlYXRvciAoXCh1bnNwZWNpZmllZFwpKSAvS2V5d29yZHMgKEphdmEsIFNwcmluZyBCb290LCBNeVNRTCwgUkVTVCBBUEksIEZ1bGwgU3RhY2sgRGV2ZWxvcGVyKSAvTW9kRGF0ZSAoRDoyMDI2MTEwMTE0NDU0NyswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0IChTb2Z0d2FyZSBEZXZlbG9wZXIgXChKYXZhIEZ1bGwgU3RhY2tcKSBSZXN1bWUpIC9UaXRsZSAoU3ViYW5pdGhpIE0gLSBSZXN1bWUpIC9UcmFwcGVkIC9GYWxzZQo+PgplbmRvYmoKMTIgMCBvYmoKPDwKL0NvdW50IDEgL0tpZHMgWyA5IDAgUiBdIC9UeXBlIC9QYWdlcwo+PgplbmRvYmoKMTMgMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggMzIzNQo+PgpzdHJlYW0KR2F1YFY+QmVkbCZxOVNZVzBdTmJmYFItIksnXlppWE1pPWxSb2ozPmEiTkclSjBwRl9VUGcvPWZjUnQvL0tvZCElKS05RzMkRFwqbV1XWGteQT1pRCU5MzhRakpzQClTQl4kUUIrNls8ayJGJnBgSiIlJGgiZihcLVgocXBBTGNEQTBIPlcnMy9WR1o5dFYiTzxvcXJkbDMoMjhSUklbUWExLmNQZzVtKiJGXXFOWkJTdHMpIyhBY0lpNy5YSTJTLEAkMC4oWjYhVHEvNXIlSEZTXWBlKjBNRWJBYENwU2ddZEBwRi4obCMxcSdiSWBHVj4iWW0rZWAjSGlYP2lTIiU9YyFIXjhZMmtCQiQkLkY2ckdvTi00VmksXWMpaSJhSzlJZiFRM0VwKWxSOyFKTTRtTCt0XmJEW0oqUlJ0Ulg8RSJWU14lUjVZT1VZNidPN19iWHEvRGRoJF5RSWIzXS02PVheVyY4TUQmSDYwKzpna0k1JyJnciVSLktNXGRvb1pRQD1uKihGbmRLIUdXRixSQmdGTm0rNz05YV9LN28kJyFiXkBQYHFIaWVUNEJkPm91JCNUL2Q5S29uLlh0SU1MXjRhSG9cXyxdQl9KZFZPXVxfQ0pnY0JLKzprbERBMzlYJlIzb0VcS2NzLl4yPWwxOjNZMVJrXkdLNmFZYzlAZlQ+XnBvW0RmVTdgUlkoOyRub0FqRG1nW1MpZXNlPD9hb0xqKiZySj51XyZWK01KOl4mbE4wSjNuMj9xQyFQZCw+TGddWnIpaShEV1clbE08W0N0bG5MXW5dTkYuQytfWDciR10rNkY3S0FwWlEtcUUyTCxQS0YsLiNwUFZdalRxO0VbIVo2aFQwKEJUKjZAbiNAWCJgS3AkXjI9Rl1ycFlvbTBAblNnSzpaLWVyJEtcUUUhUmwzTl1gQVYncVAjPXAwJG0zJ0hiL1xeNmBVNzFWIW1dV11kKj5nK2trPFVUNCEkPSlOJF1UNSNBKnNhZGNNOWZWTCY0Nkg6M1lVVjRZVjQsJFNGInJxVGRmODdCV0lDU0sjWl8mLjxxMD5sUy07KytRLXJaKmNPLXJhMDpKSUwpWnFWcF5PbzVfJ2xoLi1NbyM5MT5KNXNVQjExRiNPNkdBU2VNTlZobnBrWltESEorKktGaFBWQ2NmR2c1Q2QtckVNYTdaa2RLak0sZ3QiKURfU0lnIlJMaEdLdUJaMEAoJFtlZWBTLmlNJW1lZWpBO3Umb2lcNV1rXWw3Vl5BXGFCJFZSSWhebUleRjFUTjQ0ZydnRydsKztDMzxUQ3QrQWw+NF0tamsiYkJRNFVDcjpeM0BhM2EhYFJTS209blZPMkZSJFA4O1gmcEZHRVxxYk1cMTxlcSpUdShQaEluVC8vJ1AwX2pHZzhBXV5yXy8iVjZSYUJDJDtcZEBaKmRqJHUzIktmRVtkOlouUEpnV2hoI2crNmk4Jyw5NSxVMVJcX0EkTVVMLDZTKE42RTFNUGVsW0pTUkUuUyItWC9TbmElbWY3PzVhLSk4O1c1TlVeIm1oKykhcCZNPmItPWh0XVpsY2lpcFMpZChJYSZrJCZPOFlSYENyKC9LIUZDcjwmSEVlbD9eM2VaXmZWX1FOITQ2LD4nJ3Ijb2VsVCk6YTFhL1YtZkhYJFNwTy5kN1JxPykpNDBxLzBeZy05UlFiVz1baVNvNTMiMlVdXS9wYFs+QlFuPUt0LHBOXEpUcW1ZYilpNjdJJnVXanJbPCJuUHU+L1EkKTdFTXMiZFsyX0hlbSNFR1Yobz5HSE5nYmtDbE9URjowWHJrRmpXcExLOCckI2BOJEQxKFMrPlA3OzQtSl8yWklIaCI1T21SMDFKTUZATistWGBQVzlHLEVdWV8kYSxVcDFSTSwmJjRHcldGUSokSDRVUihvNWo/IUpnTD5SOTI8NFtPazImZWVYME1PU2doV2xucGheRVNiUi5raVl0TDBDZiUpRzMxNkhdITI8PVxQTCEuVGczUyNyYlgnK1lpZ01YLmZnJ0F1PWBaPXEiNWZGV1twMywxRyFMLE1Zb08xXyVqUC02I2xFSmJYQz5KNk9ELjlDLTAiKlpWIjZOWCoqNGMnP1BMPVgqR1UzLFxjY1Jwa0E7MnNWays0NVZWLmltOltpRVBcZlg0KGo8SXRWRTc0IS9kLTAjN3M/b2lZR1ArUVhfM1I+U1hXUEZIX1tFPSZuayY4PicxaCljN2AyUkdvTik6V2ZeJUhgb1pObjtAPWMrYkIsVWAsQV1YPk46bS1YbWAmWDNtUk8wUlFNXTRKcldbc2VzZlckLjluZC9kMmc7I2pPTyJRW08kVE8saG0hUCo5cyxVOEhPVWlLXydJY3RrJG1KKG1WR3BQXTlTQWYvZipeKEtRNGhnNTUkVTxIbldjMmJ0Y2tadVw4Z3RQXipRL1IvUkBmWyolWDxYUSwoaDFTPCVPXzpuWSEuIUBmPCY9VG4+UE9kXUhYO147L0M0aW1lSjhYI2xvZk81KVZjL2AsKVVtWE1IUVUlQS09cDtgWWdrYiNwRFVGaStOUFtALWI8RDdKZGsxPkRbZV0obXRyQmU0XWFLSz5fUjxFcWBNJlBER2U1WHBGQVM0WWk4Y2ArWmAoIig/UGZWaEEwU1hwMmtGWSJqPE4kLkYjTWJYZEU0XzBKJ25APihtclNVY0pUU2dCKS48c0lraEpDZnEmNnVGSSw/QW9lQ15AUlhzJUExZS1MKWJFOmBIOnJLUihXWzZQVVNOMWw6KkoibF88Vk8nPEsoRyFsUzwzT2hEcDhIRk47I1M5NSl1M2FdcUtzbUNQUlI6aDxtXkldP1VuTyIiLG5BPCpbKGNpRlAqc2BoZzRzQytKQCxDYU0nO1A+aVpfdFIhVE9QZW9VcTJFXmI+O1ZoQ1puX1xFZi8hNTkwRWMsb2ksOFo6O2M8UEwmNy1qNi1dSiFLJGFiLFU8bkNbSVJga25cOzo7WFg+NDF0NEgtKCEmSGQ4aVhnbD06YThAJzA6ZC1mdUBNb1A5Pz0zRzRaYShNIk05TW1ldFFgTDVKTVdrbF9wNzJBPWQ/YGIrYmlIOjVBYF8uUkRoY2hVK0tJKzNScWp0bW1lVk1eQE5BZ2kxXz1OWV5KN0ZgJyhwUS0xUlklMy9Yaik4YipHdWhTZlRKXmwlZz91TWdBWjQxclJJMmtiQ1xDVCsuSUUyXyhcTj9qOlJEJVA2dUE5ZE4zZkhpS0o8XW1NMHNAVzYkIVphRlY3XTc8Q1krZlBCTis4TVpqOnVNSz8/blY3QkpdZ2hcX1xRIUxuSUpCPW1CMz8jQio6L14lKlM+S05BXi0pPy0+WGEqLDpaWi9aTDQxUG4qODUkIkNSMiY4XVRfTnEmJT5HXGEtZyZkY25CWiMkRSpFNVIkPXNZamZsYStbNGgnSUEsTHFoXFluYGtDcW9VQjc5KTNca2Y/V29hQnNdPjtGKWgjW2RiVHVKYFQkKVdWTj0xaUEuI0NqYDwmdGpCV1RuMmFKLlxmIzllTT0qXlZxRXBTOkE5M0Y/XEAyKVFmZj5NITdHP0AkTD8iJHN1UWU/QSk2Ll9bSUY1N1hHPk0kVGw8SC06IU5DV1RecCFwXEgkSktHLHBiYVciaWw9TUEtPGU7YkNnL2lmKk8vVmtaImw9ckEnYkVcTVtCdCtuJ2AhTCwqNjRHJmwkblFGaUM+dEN0WEUxUzpxakMuQUktSGoiSWFkLVpCWFswOEJXdSldNm9xUGFcQV1XSlM3Jj1AXTRKRVREZSdBSW1ebkFwZG5RcEBKS3BAPERZSl8lWCZDaipTNTQtZkFQVWI9QjNRLzQrTWo3MkdgPU9YWHQuaXFbQDVVKXFOXDVgX25scy4yLmlJdEU3SiRiakI7bipRZlgqLTJuam1iJW9JQWlPXyFZYEBQL3E7aC5DOSYwMSpuaG82TmRwVFJAO2wvWFVJLz1uSTddTjQkTi1sRTFwcjAiLWUkXXQ2RlMnYW5SWVRuQE9ibWc0Y2MoYT9tS2pQNEU9Q1UnVENeMzwtcmxgdSRMVlRDPTNXU2ReTTEnSTJWJFhQbT4mcUdGUV0+cjRWOGVgPkxxLVNHK1M/bydGQSdtMWRlSkBtczhCJHIkV1pDXV5YPW1GcyUwRmJtNWdpNC9PUTgiTTUzIjI+IVpQSmAtTXU4Tz9EMkdYWSlzWi1kQi5xYSNkWjtOLSQ1Uk1SMSxFMVBvXnI6LVNcaClQNUtKbDktclJdXjdjLiE/XFJUK1lEYTNRNnVXV2ReRzFjWS0jTFw4XT0scnJARkI2K21+PmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDE0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MSAwMDAwMCBuIAowMDAwMDAwMTEyIDAwMDAwIG4gCjAwMDAwMDAyMTkgMDAwMDAgbiAKMDAwMDAwMDMzMSAwMDAwMCBuIAowMDAwMDAwNTE4IDAwMDAwIG4gCjAwMDAwMDA2OTkgMDAwMDAgbiAKMDAwMDAwMDgxNCAwMDAwMCBuIAowMDAwMDAwOTk3IDAwMDAwIG4gCjAwMDAwMDExNzcgMDAwMDAgbiAKMDAwMDAwMTQxOCAwMDAwMCBuIAowMDAwMDAxNDg4IDAwMDAwIG4gCjAwMDAwMDE4NjAgMDAwMDAgbiAKMDAwMDAwMTkyMCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9JRCAKWzxjMGQzYWY4MjhmOGU0NmQ1OTA4NjcwMjEwMzg5MjU4Nz48YzBkM2FmODI4ZjhlNDZkNTkwODY3MDIxMDM4OTI1ODc+XQolIFJlcG9ydExhYiBnZW5lcmF0ZWQgUERGIGRvY3VtZW50IC0tIGRpZ2VzdCAob3BlbnNvdXJjZSkKCi9JbmZvIDExIDAgUgovUm9vdCAxMCAwIFIKL1NpemUgMTQKPj4Kc3RhcnR4cmVmCjUyNDcKJSVFT0YK';
  const getBlob = async () => {
    try {
      const r = await fetch(NAME);
      if (r.ok && (r.headers.get('content-type') || '').includes('pdf')) return await r.blob();
    } catch (e) { /* file:// pages cannot fetch: use the embedded copy */ }
    return new Blob([Uint8Array.from(atob(EMBEDDED), (c) => c.charCodeAt(0))], { type: 'application/pdf' });
  };
  document.querySelectorAll('[data-resume]').forEach((a) => a.addEventListener('click', async (e) => {
    e.preventDefault();
    const url = URL.createObjectURL(await getBlob());
    if (a.dataset.resume === 'download') {
      const d = document.createElement('a');
      d.href = url; d.download = NAME;
      document.body.appendChild(d); d.click(); d.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else if (!window.open(url, '_blank')) {
      location.href = url;
    }
  }));
})();

/* ===== Polish: tech marquee loop, count-up numbers, card spotlight ===== */
(() => {
  const track = document.querySelector('.track');
  if (track) track.innerHTML += track.innerHTML;   // doubled list = seamless loop

  const counter = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    counter.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + (p === 1 ? el.dataset.suffix || '' : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => counter.observe(el));

  document.querySelectorAll('.card').forEach((card) => card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  }));
})();

/* ===== Liquid glass navbar: plain JS port of the "Waterline" React component =====
   A pill of water. The active drop stretches toward the section you pick, splits into droplets on long
   jumps and ripples when it lands. The cursor lifts a meniscus; each icon plays its own little scene.
   Water is drawn by a small WebGL shader; without WebGL a CSS drop is used. Scrolling moves the drop too. */
(() => {
  try {
    const nav = document.getElementById('nimbus');
    if (!nav) return;
    const PAD = 14;   // canvas bleed around the pill, for shadows and ripples
    const items = [...nav.querySelectorAll('.nimbus-item')];
    const icons = items.map((a) => a.querySelector('.nv-ico'));
    nav.insertAdjacentHTML('afterbegin',
      '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="nimbus-refract" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="7" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="soft"/><feDisplacementMap in="SourceGraphic" in2="soft" scale="60" xChannelSelector="R" yChannelSelector="G"/></filter></svg>' +
      '<span class="nimbus-glass" aria-hidden="true"></span><canvas class="nimbus-water" aria-hidden="true"></canvas><span class="nimbus-drop" aria-hidden="true"></span>');
    const canvas = nav.querySelector('.nimbus-water'), dropEl = nav.querySelector('.nimbus-drop');

    const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
    const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`;

    const s = { a: { x: 0, v: 0 }, b: { x: 0, v: 0 }, sy: { s: 1, v: 0 }, lead: 0, lagFrom: 0, sats: [], rips: [],
      t: { x: 0, cy: 0, q: 0, r: 21 }, q: 0, mouse: { x: 0, y: 0, s: 0, on: false }, moving: false, split: false,
      ready: false, w: 0, h: 0, visible: true, reduce: false, raf: 0, last: 0, time: 0, glc: null };
    let current = 0, lockUntil = 0;

    const initGL = (cv) => {
      const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
      if (!gl) return null;
      const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
      const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return null;
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      gl.useProgram(p);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const u = {};
      for (const n of ['uRes', 'uDpr', 'uTime', 'uPill', 'uBlob', 'uSy', 'uRip', 'uMouse', 'uDark', 'uAmb']) u[n] = gl.getUniformLocation(p, n);
      return { gl, u };
    };

    /* ---- drawing ---- */
    const draw = () => {
      const T = s.t, sep = Math.abs(s.a.x - s.b.x);
      const thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1), r = T.r * (1 - 0.3 * thin);
      if (s.glc) {
        const { gl: g, u } = s.glc, dpr = Math.min(window.devicePixelRatio || 1, 2);
        g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight);
        g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2); g.uniform1f(u.uDpr, dpr); g.uniform1f(u.uTime, s.time);
        g.uniform4f(u.uPill, PAD, PAD, s.w, s.h);
        const blobs = new Float32Array(24), sy = new Float32Array(6).fill(1);
        const head = s.lead === 0 ? s.a : s.b, tail = s.lead === 0 ? s.b : s.a;
        blobs.set([head.x, T.cy, s.q * (1 - 0.25 * thin), T.r * (1 - 0.12 * thin), tail.x, T.cy, s.q * (1 - 0.8 * thin), T.r * (1 - 0.5 * thin)], 0);
        sy[0] = sy[1] = s.sy.s;
        s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4));
        g.uniform4fv(u.uBlob, blobs); g.uniform1fv(u.uSy, sy);
        const rips = new Float32Array(24);
        s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4));
        g.uniform4fv(u.uRip, rips); g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s);
        g.uniform1f(u.uDark, 1); g.uniform1f(u.uAmb, s.reduce ? 0 : 1);
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT); g.drawArrays(g.TRIANGLES, 0, 3);
      } else {
        dropEl.style.width = sep + 2 * (s.q + r) + 'px';
        dropEl.style.transform = `translateX(${Math.min(s.a.x, s.b.x) - s.q - r - PAD}px) scaleY(${s.sy.s})`;
      }
    };

    /* ---- physics: two springs (head and tail) make the drop stretch, droplets split off the neck ---- */
    const step = (dt, now) => {
      const T = s.t;
      s.time += dt;
      s.q += (T.q - s.q) * Math.min(1, dt * 12);
      const bodies = [s.a, s.b];
      let still = true;
      if (s.reduce) { s.a.x = s.b.x = T.x; s.a.v = s.b.v = 0; s.sy.s = 1; s.sats = []; }
      else {
        bodies.forEach((B, i) => {
          const lead = i === s.lead, k = lead ? 210 : 72, c = lead ? 25 : 13, f = !lead && now < s.lagFrom ? 0.08 : 1;
          B.v += (k * (T.x - B.x) - c * B.v) * dt * f;
          B.x += B.v * dt;
          const lo = PAD + 6 + s.q + T.r - 3, hi = PAD + s.w - 6 - s.q - T.r + 3;
          if (B.x < lo || B.x > hi) { s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016; B.x = Math.max(lo, Math.min(hi, B.x)); B.v *= -0.25; }
          if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false;
        });
        const L = bodies[s.lead], syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1);
        s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt;
        s.sy.s += s.sy.v * dt;
        if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false;
        const sep = Math.abs(s.a.x - s.b.x);
        const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1));
        if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
          s.split = true;
          const lo = bodies[1 - s.lead], hi = bodies[s.lead];
          [0.3, 0.5, 0.72].forEach((t, j) => s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6, y: T.cy + (Math.random() - 0.5) * 10,
            vx: (lo.v + hi.v) * 0.45, vy: (Math.random() - 0.5) * 60, r: 5 + Math.random() * 3 - j * 0.5, k: 70 + Math.random() * 90 }));
        }
        s.sats = s.sats.filter((d) => {
          d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt;
          d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt;
          d.x += d.vx * dt; d.y += d.vy * dt;
          d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x));
          d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y));
          if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26;
          return d.r > 0.6;
        });
        if (s.sats.length) still = false;
      }
      if (s.moving && still) { s.moving = false; if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 }); }
      s.rips.forEach((p) => (p.age += dt));
      s.rips = s.rips.filter((p) => p.age < 2.4);
      s.mouse.s += ((s.mouse.on ? 1 : 0) - s.mouse.s) * Math.min(1, dt * 7);
    };

    const loop = () => {
      if (s.raf) return;
      s.last = performance.now();
      const tick = (now) => {
        const dt = Math.min((now - s.last) / 1000, 1 / 30); s.last = now;
        step(dt, now); draw();
        const busy = s.moving || s.rips.length || s.sats.length || s.mouse.s > 0.01;
        if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick); else s.raf = 0;   // pauses off-screen
      };
      s.raf = requestAnimationFrame(tick);
    };

    /* ---- layout: where is the active item, how big is the pill ---- */
    const measure = () => {
      const el = items[current]; if (!el) return;
      s.w = nav.offsetWidth; s.h = nav.offsetHeight;
      const T = s.t;
      T.r = el.offsetHeight / 2; T.q = Math.max(0, el.offsetWidth / 2 - T.r);
      T.cy = PAD + el.offsetTop + el.offsetHeight / 2;
      const nx = PAD + el.offsetLeft + el.offsetWidth / 2;
      if (!s.ready) { s.a.x = s.b.x = nx; s.q = T.q; s.ready = true; }
      else if (Math.abs(nx - T.x) > 0.5) {
        s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1;
        s.lagFrom = performance.now() + 70; s.moving = true; s.split = false;
      }
      T.x = nx;
      const dpr = Math.min(window.devicePixelRatio || 1, 2), W = s.w + PAD * 2, Hh = s.h + PAD * 2;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(Hh * dpr)) {
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hh * dpr);
        canvas.style.width = W + 'px'; canvas.style.height = Hh + 'px';
      }
      loop();
    };

    /* ---- setup ---- */
    s.reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    s.glc = initGL(canvas);
    if (!s.glc) nav.dataset.gl = 'off';
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); s.glc = null; nav.dataset.gl = 'off'; });
    const ua = navigator.userAgent;
    if (/Chrome\/|Chromium\/|Edg\//.test(ua) && !/Firefox\//.test(ua) && window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#a)')) nav.dataset.refract = 'on';
    new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; if (s.visible) loop(); }).observe(nav);
    document.addEventListener('visibilitychange', () => { s.visible = document.visibilityState === 'visible'; if (s.visible) loop(); });
    let lastW = -1;
    new ResizeObserver(() => { const w = nav.offsetWidth; if (w !== lastW) { lastW = w; s.ready = false; measure(); } }).observe(nav);
    measure();

    /* ---- interaction ---- */
    const local = (cx, cy) => { const r = nav.getBoundingClientRect(); return { x: cx - r.left + PAD, y: cy - r.top + PAD }; };
    const ripple = (x, y, amp) => { if (s.reduce) return; s.rips.push({ x, y, age: 0, amp }); loop(); };
    const go = (i) => {
      if (i === current || i < 0) return;
      current = i;
      items.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
      measure();
    };
    const select = (i) => {
      const kind = items[i].dataset.fx || 'pop';
      icons.forEach((ic) => ic.removeAttribute('data-fx'));
      void nav.offsetWidth;                      // restart the icon animation
      icons[i].dataset.fx = kind;
      const b = icons[i].getBoundingClientRect(), c = local(b.left + b.width / 2, b.top + b.height / 2);
      if (kind === 'drop') setTimeout(() => ripple(c.x, s.t.cy, 1.4), 430);
      if (kind === 'plane') ripple(c.x, c.y, 0.6);
      lockUntil = performance.now() + 1000;      // ignore scroll-spy while the page scrolls to the section
      go(i);
    };
    items.forEach((a, i) => a.addEventListener('click', () => select(i)));
    nav.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const n = (current + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length;
      items[n].click(); items[n].focus();
    });
    nav.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const p = local(e.clientX, e.clientY); s.mouse.x = p.x; s.mouse.y = p.y; s.mouse.on = true; loop();
    });
    nav.addEventListener('pointerleave', () => { s.mouse.on = false; loop(); });
    nav.addEventListener('pointerdown', (e) => { const p = local(e.clientX, e.clientY); ripple(p.x, p.y, 0.8); });

    /* ---- scroll-spy: the drop follows the section you are reading ---- */
    const ids = items.map((a) => a.getAttribute('href').slice(1));
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && performance.now() > lockUntil) go(ids.indexOf(e.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });
  } catch (err) {
    console.warn('Liquid navbar disabled:', err);
  }
})();


/* ===== About: animated video with its own voice. The round button plays and pauses it.
   Before play, the first frame (your picture) shows. When it ends, it returns to the picture. ===== */
(() => {
  const vid = document.getElementById('reelVideo'), btn = document.getElementById('reelBtn');
  if (!vid || !btn) return;
  const label = btn.querySelector('.reel-label'), stage = btn.closest('.photo-card');
  const render = () => {
    const on = !vid.paused && !vid.ended;
    btn.classList.toggle('is-playing', on);
    label.textContent = on ? 'Pause' : 'Play reel';
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Pause intro video' : 'Play intro video with sound');
    stage.classList.toggle('playing', on);
  };
  btn.addEventListener('click', () => {
    if (vid.paused) vid.play().catch(() => {}); else vid.pause();
  });
  vid.addEventListener('click', () => btn.click());           // clicking the picture works too
  ['play', 'pause', 'ended'].forEach((ev) => vid.addEventListener(ev, render));
  vid.addEventListener('ended', () => { vid.currentTime = 0; render(); });
  vid.addEventListener('error', () => { btn.hidden = true; });   // video file missing: just show the picture
  document.addEventListener('visibilitychange', () => { if (document.hidden) vid.pause(); });
})();
