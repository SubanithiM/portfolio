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

  /* ===== About section: intro video + male voice greeting + fog effect ===== */
  (() => {
    const media  = document.querySelector('.about-media');
    const video  = document.getElementById('about-video');
    const btn    = document.getElementById('intro-play-btn');
    const smokeC = document.getElementById('video-smoke');
    if (!video || !btn || !media) return;

    const INTRO_TEXT = "Hi Everyone! I'm Subanithi. I'm very passionate in Java. Welcome to My Portfolio.";
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ====================================================
       FOG EFFECT — large soft glowing orb that smoothly
       follows the cursor (like the reference image).
       Canvas is always transparent — never darkens video.
    ====================================================== */
    if (smokeC && !calm) {
      const sCtx = smokeC.getContext('2d');

      /* Target (raw mouse) and actual (eased) fog centre */
      let tX = -999, tY = -999;   // off-screen until mouse enters
      let aX = -999, aY = -999;
      let fogRadius  = 0;          // eased radius
      let tRadius    = 0;          // target radius
      let fogRunning = false;
      let inside     = false;

      const syncSize = () => {
        smokeC.width  = media.offsetWidth;
        smokeC.height = media.offsetHeight;
      };
      syncSize();
      new ResizeObserver(syncSize).observe(media);

      media.addEventListener('mouseenter', (e) => {
        const r = media.getBoundingClientRect();
        aX = tX = e.clientX - r.left;
        aY = tY = e.clientY - r.top;
        tRadius = Math.min(smokeC.width, smokeC.height) * 0.55;
        inside = true;
        if (!fogRunning) { fogRunning = true; requestAnimationFrame(drawFog); }
      });

      media.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        tX = e.clientX - r.left;
        tY = e.clientY - r.top;
        tRadius = Math.min(smokeC.width, smokeC.height) * 0.55;
        if (!fogRunning) { fogRunning = true; requestAnimationFrame(drawFog); }
      });

      media.addEventListener('mouseleave', () => {
        inside  = false;
        tRadius = 0;   // shrink fog when cursor leaves
      });

      function drawFog() {
        /* Always clearRect — canvas stays fully transparent underneath */
        sCtx.clearRect(0, 0, smokeC.width, smokeC.height);

        /* Ease position (smooth follow) */
        aX += (tX - aX) * 0.10;
        aY += (tY - aY) * 0.10;
        fogRadius += (tRadius - fogRadius) * 0.08;

        if (fogRadius > 0.5) {
          /* Large soft radial glow — matches the reference "fog orb" look */
          const g = sCtx.createRadialGradient(aX, aY, 0, aX, aY, fogRadius);
          g.addColorStop(0,    'rgba(255,255,255,0.18)');
          g.addColorStop(0.25, 'rgba(255,255,255,0.10)');
          g.addColorStop(0.55, 'rgba(200,210,255,0.05)');
          g.addColorStop(1,    'rgba(255,255,255,0)');
          sCtx.fillStyle = g;
          sCtx.fillRect(0, 0, smokeC.width, smokeC.height);
        }

        /* Keep animating while fog is visible or still fading out */
        if (fogRadius > 0.5 || inside) {
          requestAnimationFrame(drawFog);
        } else {
          fogRunning = false;
          sCtx.clearRect(0, 0, smokeC.width, smokeC.height);
        }
      }
    }

    /* ---- Male-only TTS voice intro ---- */
    function pickMaleVoice(voices) {
      const malePriority = [
        'google uk english male',
        'microsoft david',
        'microsoft mark',
        'microsoft james',
        'google us english',
        'alex', 'fred', 'daniel', 'english male', 'male',
      ];
      for (const kw of malePriority) {
        const v = voices.find(v => v.name.toLowerCase().includes(kw) && v.lang.startsWith('en'));
        if (v) return v;
      }
      /* Exclude all known female names */
      const femaleKw = ['female','zira','hazel','susan','samantha','victoria','karen','moira','tessa','fiona','helena','alice','siri'];
      return voices.find(v =>
        v.lang.startsWith('en') &&
        !femaleKw.some(k => v.name.toLowerCase().includes(k))
      ) || null;
    }

    function speakIntro(onEnd) {
      if (!('speechSynthesis' in window)) { onEnd && onEnd(); return; }
      window.speechSynthesis.cancel();
      const utt    = new SpeechSynthesisUtterance(INTRO_TEXT);
      utt.rate     = 1.15;   // faster — was 0.93
      utt.pitch    = 0.85;   // masculine tone
      utt.volume   = 1;
      const voices = window.speechSynthesis.getVoices();
      const male   = pickMaleVoice(voices);
      if (male) utt.voice = male;
      utt.onend   = () => { onEnd && onEnd(); };
      utt.onerror = () => { onEnd && onEnd(); };
      window.speechSynthesis.speak(utt);
    }

    /* ---- Play / pause toggle ---- */
    video.muted = true;  // always muted — only TTS voice plays

    btn.addEventListener('click', () => {
      video.muted = true;
      video.play().catch(() => {});
      // Stop video automatically when speech ends (video "cut" to prompt length)
      speakIntro(() => {
        video.pause();
        video.currentTime = 0;
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', 'Play intro video and voice greeting');
      });
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Playing — click video to pause');
    });

    /* Tap the video itself while playing → pause & restore button */
    video.addEventListener('click', () => {
      if (!video.paused) {
        video.pause();
        window.speechSynthesis && window.speechSynthesis.cancel();
        btn.classList.remove('playing');
        btn.setAttribute('aria-label', 'Play intro video and voice greeting');
      }
    });

    /* Restore button if video ends naturally */
    video.addEventListener('pause', () => {
      if (video.ended) btn.classList.remove('playing');
    });

    /* Voices load asynchronously on some browsers */
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  })();

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
  const EMBEDDED = 'JVBERi0xLjMKJeLjz9MKMSAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUKL1BhZ2VzIDIgMCBSCi9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9Db3VudCAxCi9LaWRzIFsgMyAwIFIgXQovVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0Fubm90cyBbIDQgMCBSIDI0IDAgUiAyNSAwIFIgMjYgMCBSIDI3IDAgUiAyOCAwIFIgXQovQ29udGVudHMgMTIgMCBSCi9NZWRpYUJveCBbIDAgMCA1OTUuMjc1NiA4NDEuODg5OCBdCi9QYXJlbnQgMiAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA2IDAgUgovUHJvY1NldCBbIC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIC9QREYgL1RleHQgXQovWE9iamVjdCA8PAovRm9ybVhvYi4yMGMzOTEwNjE5Nzg0OGM5NjkwMzdjYzYwY2EzOGJkNSAxNCAwIFIKL0Zvcm1Yb2IuOGI5MjJkYzY1NDYyMGIzN2U1ODY1ODBjYWU0NjZlOGUgMTYgMCBSCi9Gb3JtWG9iLjhkZTUxM2ExNDIyYWFkZTQzY2RlOTQ5ZDZiNmZkNjAyIDE4IDAgUgovRm9ybVhvYi5jNTIzNjdhYzgyMjlkZjMxNTJiYmNiMTYxNzcyZWUyOSAyMCAwIFIKPj4KPj4KL1JvdGF0ZSAwCi9UcmFucyA8PAo+PgovVHlwZSAvUGFnZQo+PgplbmRvYmoKNCAwIG9iago8PAovQSA8PAovUyAvVVJJCi9UeXBlIC9BY3Rpb24KL1VSSSAoaHR0cHNcMDcyXDA1N1wwNTd6b2xvdG9cMDU1dTV0OVwwNTZvbnJlbmRlclwwNTZjb20pCj4+Ci9Cb3JkZXIgWyAwIDAgMCBdCi9SZWN0IFsgMTA2Ljg3OTEgNDM2LjYxNCAyMDcuMTQ2MyA0NDcuMTc0IF0KL1N1YnR5cGUgL0xpbmsKL1R5cGUgL0Fubm90Cj4+CmVuZG9iago1IDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXQovTGVuZ3RoIDMzMTEKPj4Kc3RyZWFtCkdhdUhOPkI/UlomcThfRmQ0X0tJU3Mibz5sKkJMNj9qWVMuLFlLWSxbUG02NiZXQHVFP2pJUS86P0JOb0IpbU02UChpO2BlNWdrMiUrQ1ItcnFicyMxM0UmWS86S1ZcXmtFNF4/Y2pLQUAnO2xJLFJzKWhSLmRGQjUwOmM5PydcR3E7Y1cjbCdQWXFHbjI1VUknaTNsNy1lcHVEbiM6bVppLWwkUzRnRW4rbWo4UVZCcVhgUDUuPWcyPWEoXCVtRFFgMV8hRWwwXk91SixrU3UzQG5SKGhEMGJvJDVqc29GPWtzQyo8LmBwTkc/QTgzT3JRU0g1MEsrRDxWdDVWUVg+RHE+cTE5cyk/Pjh0OCFFaUkhREk6XDVpTDNHb1J0azdGO0skNHBmbnRHaF0oTkdlcyMnb0pJKiNmQS06NC1PaHRfYSVLQzNdT1cuVFpMSitncjFKYGpwJkVPLlBTQk09IW1uWyNfXFZRUmxHW10kbFw/PCY4IW4oMDIsN2FKKmlXbihXPl5HSU5YMTs+XURALDkoPmBxIkpVXmU1a29lPnMzMSVIJWhiZ19AJlw9Ll9nISZWKWMtXzdlXDpEZ1xjYUQ6VFppO1hbOllvVkdsM0ouKU9FYTdZZXBZTCVrPTk+KT87LkQhVHU6KV5JY0V0VFVoJFI2RGkpO15NKkBqLjV1YFg9NVRdbDQnRlJeazdLaT1TaXIjaT1RRilkJ0V0RlMhSVgjV0g5YWcyTG9UVlg4YWliRUNkJVlFQkEnOSxHIyJUK1BzNDZcaU81aTtQQClnUilRQS9ULV4hMykkYmVQXFpJXEI/UVMxK2NVSWY8cyw5RUNuM2JRUiJAdFRlN1ZYb2VgK2JkWWJKOllxXiMkMDhxVE01X2tkci85RD5gZVImdGBTRjshYSlwaWNRbVQ1QVRkPjsoQj4/YWBUSCsiLlM+U1M0MSxhVVNeLWZOVm85SWwxZzRYLHMic11jQDozcGlnZ2tYdUQ3dCkhLTVSXlltLCRRcCU+JTNZWG1TV19EYmFsJ2RaPUwrKl1dZGVSU0FvbTVkJmksZXNnajFDRl5BLEo2SVVLKjBBbVxuWmpQJ1RmOUpdRCZpVSUvVk9GNTFZRkIiaXNFJj9wOiNSO2Y+WF4jaFYwZE4+TEdQT3UiPWJaM1V0XjdJMVAnWFRcUW5oPmlxXjQ9ZU9VMDkkSkxqSSRgUW5vb2s3YTFWa0wmdFQyTlRzV04oUiZmKiFyK2lJZSI4O0RFaENxSEMxMkxANSJiVUxVJUtjNi1XZGE6MmhnK0BeKktjNUUqMVU2VjVsJD9fO0o9MyYpRSNBcC5FIVVrXkArY0okKDNnTTctSi1LR0BEbSMxYiRZLVNRYk4nRm5CZ1AhcEQ1RWpnciY9S21WKVg0PUlyWWJuMEs9U0k5XUIsNGhIME43dGkiJHRYPSpmMENcIjZsaSsqU3BwXy1GXkZvXVg9bWlNWyNqKFBwUUQvIlxTV2E9NFFEbiM6M1wjaUExIiVVUWRfSzBbPUdOTkY9I2crLmc1cUQ4TCswNCwvVUoicmtIbnF0LzApMzJxcG1MWDkmcEpUME1YYVsuJE9INipQY1tMbWBYVEQoV2twcjwtJl5pTHQ1PFQtamdNOFBqP2k7OUUvKmNkNkVwTiIjdUAhajhwVmBrbzpnJlheUk9IcnQpYmsjb1BKNl1wJzpJbFFLa21CcnFxKmchLitBNnMlY0luMGxNLEpjPD1CXFRDVWNDSG1pQD9ILHA3ZW9bJC5tUSlqYiNdcE0wT1ljYFxkM0RTPVteTDA8I0EjNGdINzxLdURabUowXlo3YmF0bz5rUU5WKSVPPVRxKnVVJzEhK1U/ImlkYyE+TERTdCNjQmFYTCcqUVAoSStqODprXWV1Wz9tZXF1aFZiMiQmMFtbYWxBTCpwUlsxWTRIblo8TFVpZ1JuTz80ZExSNjY5RDorOCtWJk0uc15dSGxuJkMoV11dS0VROlk6X0tGVicqInFmUDsiR24lc0Noc2lYSlpCYC5ZM28vNlwnYz5jMjZZQi5AZCpKLWZsPDAoaz8kYTA7RWRjJmdwdCZWXmBoIS1vS0QzJCd0UCoyOk87Wz0rYV5dLmxnYWVOZidVWEZUS2lGZjs/NG8iUzddSVthLXJwOlQ+KFNeRGdDMVJCPSJeNm9jU141TTc6OVM7aWtcdF9wMEhydFQ/XyQ0dDdrIltEb2w/MjpKTlVxOko0MihbITNEZ0lbLT9STW0qWVRWLDIjTCltcF0wXEBmVV5BKzYqalVEJVAjaGJbRDRPY2ouL3VwIkUyPHNVVi1MMStFITheZy1AOUlnNSNMJCcoSl5uaCxiU1YmSTd0R1JxV11ZRiwzQDpSJDI0TlE/UWhcQkJcRkxiIko1XlZoVCM3cHFjcy43KGVxX0EtaTteYWpCQi4vYE5NTGs3MkJhbCo/MyJAajZYRGFkLEAtcFElXSRQZzsrSlhtW1FcNzloZGtPb2VhS2FbV2VMPnRjYlJoIlsjTiVyMzdHQyNVaEs/WGhRJColI0hhZz4kMidOKUxkXVtGNTosPl5JREArPixXO2JBJ284WVY7amkqQk9baDZlOTtxbCQ6RjJSSWU1TU5bcEd1UXRjS1VfTEdbXz1pU3E/QDtbc1BhXjtYTUVea29jP1k/RGQlVFcwNDgjbzViKCtVOCxeN0dhMj03NlYoSjVyXE8lZ0k9LGRTcmU+WmlPUXFLdUheKWdcdCJdR0omNUIkZWB0cVs9NVEhTWwxcWAyWUZxQjAxRjQhNUhSdUMiZVgucV5cXGk9PWlyZG5TZG0lXmBrcWInP25DMDg2cClEJDVPNUtESy9mVUFEYUhkUyItUT1HKklmW1BjODRpZFtGZVM2XmZudEZRXXAvUyhuM0ZoJiQzSFBJQ0YkNiMyXmQkMjQtMTAxJ00wJi9vQSwpcHEiRmdxXGc3Z2ZJJ2lJQSduWmNYVWIkNWQpOSFzRCwmJTlaYU8wUUBuUVlvbDMubTNHRVJjZVtAIScoUFI7NFtCIlVRdS90VUtDYjpBLClPUV9PImFhZihPTUw+X1o1SmtpQE1yPzU4OTVqYjNQNklqJjFMbWY8aCRQNS1JUHEzbkZlRyM7SzkrMTBSWVdvLSUuNWJZPGBwJlxObFNGLmQsb2EuRTQuJUkrTVQ2cF9Bb2M9azZGYyZxTVA4RnAxJkQ0IzU+dW5uISx1Q29KSjc9aWo+PFRRSCZaQUVFTD4tSTJqME5mIyg9K0NJKShBU1QpbzRpPUAxU0pdRjg+cjdfPkRuQi5YYGtAQzsjRyhvRCNwR1VkdU9uLCxSVjhFcF5wc3M0WEtzNlxPSU82dTg0bkArVDtzbVtRU0xlWUo/clRqRygmQXBCNCFWXC5hWCY+NEFlUmJENTRINjtPL2NtVjheVCE2XVknXy8vX18tQCwnb1I3WmZdS0VbQG1dMllsSjlFTjZVJSJcRUVIcVhtLjAsZ1NYVEplUURATzNcUHFdLDc0QkpgJzVuX2otaW5oX3Fqa1k3bTdlVzxIPjZrVVI1WjRpOXJtczZfdVxHSFJpWDRSImshS1drcCJDUDBYRi88KyZzWm48Ml4lSG9wKTxiSTcyaSMuO2NtPzNwLV8yQEpOXkotXU1AYnVzMiwockkzRlkpbUFzbC1Nc2grVEdAJk1yMGY7L0JsPjQnMk1JJS4xJyQtXyYiO1UqRmNMa0dVbmMhNlo0TSZwUmBgYzMwMyd0b0FLR1koX1IhVy5eSnBMTEdEJHRFVnVuLyZkN1NJQUtjYlFMYDArIkE7bSEuTCZrKG09c2olM1VJLDFOPSsvUChPODpmT0ZqLEdwcTxiKDRCSVQ1UDFhLDBuR1JFOyUwWWRGYlgkTmE3cVhAYU9TNShyQ20rOF82QmlENmJSOixlSiZfRjRrW1dnbCdVPUh1NnIxTlZScHFCVDozQDBJQDNnIVhiJSxEXiZoIW49RSlCIl5yVW5nc25cXDsoKDhcXCI+PUpzWltVL3JqRVZTcyxmcGZwaTlLMz5UZlMnJjElX1w0RDdUVT1OPDpBTkZ0PzE9UzU8JWpBNFtGVW1tbmk4JkgjKSFIOGxmcUpnb1A0Jz03N0o5RTpPcGA5cS9Vb1NuUzdrJCswZTJuWV1EQEciQ3JOP1YmdGljITduWVtKMS0pcVleZTU2QD47Tl87TmJwTVVrKTdScmVYYUFGXCtUL1BnLFNmJFFZLltPb3MmQ2dUVjkoKE10Pkw2WnMuRWJzMm5xXXIwKlZLWGMzUUVPTGRLJy1BR2VLZU8tVkNmKG0/YTdsOzJNbztlNzNsLlgtJGxkOjMwTT9cOGdWQD8qSW4sYUxaIWlbL2sncyxBcG4oQSYiYlc+NFtyWVUsKCkoXnAsQ1ZgY3EiLCk5SlFaNH4+CmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago8PAovRjEgNyAwIFIKL0YxLTAgMTMgMCBSCi9GMiA4IDAgUgovRjMgOSAwIFIKL0Y0IDEwIDAgUgo+PgplbmRvYmoKNyAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwovTmFtZSAvRjEKL1N1YnR5cGUgL1R5cGUxCi9UeXBlIC9Gb250Cj4+CmVuZG9iago4IDAgb2JqCjw8Ci9CYXNlRm9udCAvVGltZXMtQm9sZAovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwovTmFtZSAvRjIKL1N1YnR5cGUgL1R5cGUxCi9UeXBlIC9Gb250Cj4+CmVuZG9iago5IDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhLUJvbGQKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKL05hbWUgL0YzCi9TdWJ0eXBlIC9UeXBlMQovVHlwZSAvRm9udAo+PgplbmRvYmoKMTAgMCBvYmoKPDwKL0Jhc2VGb250IC9UaW1lcy1Sb21hbgovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwovTmFtZSAvRjQKL1N1YnR5cGUgL1R5cGUxCi9UeXBlIC9Gb250Cj4+CmVuZG9iagoxMSAwIG9iago8PAovQXV0aG9yIChTdWJhbml0aGkgTSkKL0NyZWF0aW9uRGF0ZSAoRFwwNzIyMDI2MTAyOTE4MzMxNFwwNTMwMFwwNDcwMFwwNDcpCi9DcmVhdG9yIChcMDUwdW5zcGVjaWZpZWRcMDUxKQovS2V5d29yZHMgKCkKL01vZERhdGUgKERcMDcyMjAyNjEwMjkxODMzMTRcMDUzMDBcMDQ3MDBcMDQ3KQovUHJvZHVjZXIgKFJlcG9ydExhYiBQREYgTGlicmFyeSBcMDU1IFwwNTBvcGVuc291cmNlXDA1MSkKL1N1YmplY3QgKFwwNTB1bnNwZWNpZmllZFwwNTEpCi9UaXRsZSAoU3ViYW5pdGhpIE0gXDA1NSBSZXN1bWUpCi9UcmFwcGVkIC9GYWxzZQo+PgplbmRvYmoKMTIgMCBvYmoKWyAyMiAwIFIgMjMgMCBSIF0KZW5kb2JqCjEzIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCi9OYW1lIC9GMQovU3VidHlwZSAvVHlwZTEKL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjE0IDAgb2JqCjw8Ci9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0KL0hlaWdodCA3MgovU01hc2sgMTUgMCBSCi9TdWJ0eXBlIC9JbWFnZQovVHlwZSAvWE9iamVjdAovV2lkdGggNzIKL0xlbmd0aCA0ODIxCj4+CnN0cmVhbQpHYiIvKnEsOk1MJ241UV1yPE42JmMjZmhISERbZkdQKHBMMlpsKFtpJkJASDJHYV1kbkNpImEvOF9ENnI1VilzWyQpKj5RP3Q6cyE1U3QnJTVYSWcoQFVKNEM6KV8wNUNXQT88WlssMXVsJllKS21uMG1JKmpMZSxdLy4iaDdPKDFlbEAvSnRvOj4/P3FkPmR1YFwxaWQ2UWNZUD8/RyskY1soIjQqV2UpSjpdOHE3Mi88MScrJ2pSSHEpR1YicT4jPTRJXCI2J0EzcCVNLzRGU2o5PE44PmdiQ0FFKGApP2VuYG9zXGZuRTpXUSZgSkZSclFYTDFLc0B1TFZwT1ZNPC0kYltJV1dYO1dFIi5ZPnM3M2xaMitbPycrOD9wXk8qYVZfcWxhV1U5RTtpK0tPbTc3VC1BLk5nLGZaK05yZDJOWk83Oy9WdUpkPnUoOjM/PyJIVmkxTG4jZSFaUmNSQVtsVTosVysxOUkxQFQ0PSZJQkAtPSkkMWlrUSI4Vm5eLF9mMDlxYlJiVCg8J2AhNShjTV4zPG8pT0JhakdXI29UNC40cjl1XiVCL0wtRiFCRzVfRUAybCtyPj5dbURFbUVAOCRWRF41Uj4kWEA+TEgvP1hQJkBIWVRqTXMjbmQwMl9WLlhEOEdUSDo0RTpTM2xvJUo4MXNTMV5LcF9fakhoPzlRN0VEXkVHaCFnSCIyJTpCMnVJXFMjOGsxO2QjVTFCXEZrPDNtRGkpRiFwSCNTPTMxMChxJXJfPCRKZVxELmdEUStiYjViMTtRJ0pWKlx0JiUpLlg0L2Q0JlZpPCJYNWlpVkZZanJhWDhKUz80UCFuYzg4SWhTUyVdKWhJQ0BrWWdoKjs0Rms6ZzA8RS43aStSJWMnQmVOKFE7J1dQb1lIKCNbT2B0L01FZlwyQiMqNFZJXy8lbHJBUjxWYmo6V2VWMC9nM2VbZ2JrTVFCXGo9Pk0lbV4+aEZSQXBdISxwSDshZ1ctbVREKVdJaFt0IyFfakVSJDo5JUYvMmk+Ii9oK2ZcI2RlYlZCUi45LWkhYlcvPlRIWUdZWjA1S21cZkVCOWc8Uk0pJWhkJjdbMDVxPlQ0LydQWnQ4Nyc6KVJNPj9uJ000IzwpJ2Q1LFJpY0VCPl9jVGtYXmNQcUxIMSlMUDNSUjJwMGVcRjRiPzBBMHVIOWA6MT9jL3NhM1hfT2dLM0ZmRCNjS2ZFcm4mSmw1VlkxTTBBKFI2MzU7LltBdCFpODdjWFcsTz4nUFpNVzFyKVdMQ2RXS3JoPEBaKTYlaHA7X0ppLkA2SCRDSD5dbyMkZjxCUjptTEoudGBhNG5qSUFwVTNoMmA5PGsvYDdPOVNsUGpRQltvLSJ1LCwqRWByLldFWEFqcVlhJShFKClWNmkwRl1FSC1OT2xbZXFVO0deImwiLmZINzAqZSosTlhPc2FNVnFzJWA0bEt1YWpiS0Q1Rz9XYEYlbV1LJ0thMSwocEIwYiU5TC0qKWN0KUw5JlFGOS1GVF1jYzdkUytRPSU6dVQiWUNsQCNISikiZWs7YGpkZjtHRzknM2VZXllkSz9hRlxhQiI7bWJaPGBnUWE1WzxJSUFsLys1Rkg8YXFQVyVfcFNrKVlOJ2U9akNWK2RcU1xnLiwsMElVcig+OHRMO3FFMllNO0BNNT0nRUB0XDs1STlCMHVxSllrUWhvMmswOjdkLkc6ZW91bzlqZ0U9NDBlaUNgY20uTHRjSjc3YktgXUpPUGgybS87VFQmSjNPSFFwWS05VTEkNGRxcVY+ZHRjO1hQPEVuUUtVLzNTWjBcTj1aY0BLSGhTK2tqbjZHSy80YzNyU1JuOmhBNWVBJTk+IlkiQUJPQU1tcSgvTmRaVnJoMjFlbnQpWD4yOVpsc18qQGxSQGFhdC0lNzdSPV8xaTkxRUdsO3I1WVNWPUlMX2VBLnNnV2ZLLERqbCNwcmwzUU9rZkJAZGNFVWNCQWpfYUJjWTg4PDEoLkclVztbSmFIbmQxRDonKUFabm0tZXRhVFM1Lks6Zz1cL2tlPlBuIio6VmVcO2U4THFXP2snXHNPKCc9ZzBJbl8yOFEsYDMsKFkjaCdpbD5KbzZoS11Ba1hTVl0lUy5KNTpnN0VoUl1VKmxLUWRaV2ZQOWQ9Pk1bdWcsOk0+XkdCLFppOmVhP0AhTE9MJig4XUglPlNAL280QlhbQHJDZTVaLUYvX0xmQVY9Oz9DOkN1L2krJTcxJ1JyclkuaUo+am5hN1daOTBONSZXKldtUDU/UVcpTk86Myhcai0zN0BSOEMlVlddIVFtKFxxRGRXW1svNWw2dGAtajliYCNxaSdyZiouRGczMWVbTV0tbTRyaicxKCNXLWYyaThBPGNaIiMuUlInUFZCa14yM0E/RzQnQTFTVktwXGhcUWMuTDp0QT40Lz9GUUtGYl9YO2kzaV1lVzVPPWRNU1lfTyRfTkI3JWJZUSYqQyk3ImdvXjUqaCZePytCUVtEXGU6SGtuS2tKRy5wbyRGXyRQVjs8YCosYDFZOCwxcGctVTQ0XV8ySyw7NnFxSllKPVBhZ21uKVY4aytAP3A5XU9aR3JtRS9cQUZqNVdpYkxcXl4xbFNORG0jWWI4KFg8OVNda3AoaWctcW5MIXIuNFI+LT9hdFlxb0lYNUFWVzp1a1lOXWcqZkEvclZHOTRpOjg5RGErZ1o5L1MxKDFSJyhGTS5iOUMvNHEtWXExNmkqQi9bbGFMYkMzRnB0YSdUdEZxNTsjVCtGMks8XDlkRylGRm8uTjNuZzFpZzBIKypNWichdTA6bGcjNTVLJFFPbyxHMiZXSixcMiVNZE8uJjApYVEsU29XN2peIik8NFVUYywwI2EpaCosbT4nbTB1aGstbVUsTHBYPDgxW1dpSU9VTEpXPzVbJys6MDJhKFgpRmZAVEFZRVswLHQiJDgpYmdmSVxmcCkySCJWKmIkUDwsc2RnMG8ocFBlRSE4SmNTNTlBQC9JXWhsX083YCYoLUUlbSlZTmNsRGMnbUxCRTspKDdSKzlkSVBcNitkbjwkOVxPYDc9J19gcG5mMF5CNiskOGtsLCUhcnFINlpwU0clJDljViJWOlFTISJQUTE2Z2QtKis1dSEkWlk4SEVSWU89TVFVJmVcW1xEMy1xQyosTCY2YE5bUSVbX1xMZUMhVWFYPGNFPT51KSV1WCJmOT05KD0takA1QzVkbV1qJ0FMNUhHLTMpJVEhVSJrMU1wUUB1JzVpUmtWSlBgPl1HJk84LENAaE4hXT1sJCJpai0jU1E9W0p0XT5QcTNPXShvZShIQyIuMigyLk1XRT9vVSUxUU06Xz9CbXQsKmFnYj4kJDEzNTg5SCFvSFI1JkwlYD1fIkU1QC0hMFwqOFVgVlFhIkpnSExxIid0UC5JM2MpWTZtcVJUPzdJKWdFUSo2WkJNKik4MmYlTjolZWwtQ0xXWyNxUW42UFBZOipHUloxN3QoQ1hRS14saTFoay5fWHREZGdudFI3WzZERmJbZyMwYGA5QmNlZmhpYWEzVWNDNzBbKSRQWE1YRmRLMUdGL242XTwhPFBOUWkmQ2AsSVcoPDYzK0o3Yj5uPz5NP1k6LFA/TmpFTFYwO05WNG9nMV1oajBRKTticEI0Rj89aV9bcD5gXG47Lj9dcT5pcnMyZms1Y29WQVtnSy1UX2hbdFJ0MkAvVVtFSDZxbVA6XDYzZjxQYWlEKixYZWxDJWNvcSNaSCUtN0csUiMxb2daQkI7ZVQhYVImKzg3V1QtPydsTW83VjgqQjVSZUkvJU1ZRUhGYzY7YTgtWWRyUmlsTWQ8MShbZD0xIyxDN0ZyPEhDYiVfN1VVYTBQKGg+NFAnWjleXUlQZWthZmIic1BgNWgra1VtXklScScra0YsSkJ1K1lzTTJFa2FuXkFSYic+PzJHRkIpWCpGPSJhcSZENk5ydGo1cU5qVC8pVFVhPWRRLT5bRHNFVCthKC9lT1Y3Xl4vZFh1QVdPdTElcWUhdGk4W1tDaV1dT0JTLityKkVVNzNEckdSYylnM2pSSzFLcDprLFJVaGI8LDAmRTh0VXVCbUtgJGgwZGNGQDNAazZoPUE0RCFoVV9jI0BOVT9kSms2b08iLydsPyQiTHE4NUVjK3FKJzg2SDlvaj5JPDhEbkFGOVtxbGNeMVVtVi0pSz02YXFBL10vPlVNI1UjZC86MmBgJiYwJ0deR1daVk5pMzQodCFIbjdOQCFPMVNIcjcqJ1ojRyxAWmIhWConP2xdPUwrQ2w/TUZSWGNxVDs9YjwwVjolSypcYV5DaSFfY1lka3JpS0pROF9YOEpJaF04byJyUDw6KTh1NClncSJgZ0grVUdGVTNBPTpsJkFARldSdV5rblk7XVBcMmxIXyI+dHMkS0Q3KytAUCZMY11gcUdoUUxgRyk3YChrUmJKQGcpZVdjZEsvX19fSF4nZWI7ZTMoQihWY0VBZ205L1FqTF8hRTpkaChDIyUrKCo/STZbLjo3PE0rSj4zTmNtJVgtT0s8RTc1aDdBOWZxU1pRKUFBLmU1R20yPi4uLS4mVjFTRGNEbFhxZ0RJSzFjVStlKShUVTVrcGFaRWtKYDZsUj41SU4sWSw9WzpAUCtzaidHcD5aSGxIUWZYXCsjPE9QW0E1Zjs/QDY4L10ndENHWidlZm9qXWFQM0dVUVpaTjtfPyhTKTtlJ104bm5mZWo2aVwsI1FoInJyJik9IlJeP0FoM1VFcyRxSVlxOFI4UHM0RytKLGM1UWllSmRDMGFdbG5gOCpJYEksNjZiREdTVDZXNWwuSVJZXTs1P0ViM3VxWmNnJ0BFUFpPNDlqSDhHWi8kMTFdXi1IQ2JmT3M2b1VhdEg0R2MlPVhtXGooO2cyOUAyUGRCR0dEYTxrOVJHQ0IuP20/M1xIcUNoOVxqNy07VWwvZlUzZnJFTiNXbCwlPC9TMzs7ckVzRDxBITdeJExpST8+V01HbEFgPEFNUWxTa2UxMSZxNmArVDdsPW8jQFBTdUZTYyVtRGJgSS4kMFQ5MF46UU1qTkgtL2lrQTUxI3QnJWpYWHIkNm9bYUQ/Z2JvMlQhKlxsP1dVTHBXSzdOK2lkXSdfRSVFRC4xKm46cm46az9bYF1CNm80VDRIOF8lZzZ0OidrNDtZWDZcJV1vWkZIXyg4JSFmSzZHWCdVM3IpbWpMPjRsWWtsKy5CdSN0LVJwPExBImEvdUVQWlNXZzNNbUE0aDo4JzwiXWY6TW82O1wiWk02SzxJNC4sNStGbFhgVDVXMU5bSigqKDhJbTxsamskdCdwUGlmXUVmcCMuMTBmKSpyWz0pWyEkO3Q3U2FNJ2c0cnA2SyVEXWIiVSZNbzxZR2I7KVZHdT8kZEhGJ3FsTVYlYGE2J0gvZypxJVxFW0NZYlcoYTxCRl5AQ2dIZEI8ZztmZWpwSUZiWmFTR0JgRj1dQCFULkFmcSVVKWoiI2BaZSFqbi1xW1FVOU9nSk4mRXVbO1NQXl0mK1I9NCNqWkpfajRTbFpFRDw0blVGNChVRSNxU1gqaFQicDEmZSsjUVcuNjVMbVE7JTsrSFdoOChxaV89WDYvXj5vOGlQWiQlZGdlJig8Z1c6WmElQSxrOFRRU2dZLz8hLVlJKF5UKmZ1Q2hDUGZkI2JsOGJtI3F1TFRcbjpxL0xRX19WLSNaa2EnMy0pKCRDUGshdWAjN2xgZUEhVTBJazdzMyciKGtVUEU8KFc5TWw4Kk1YS1liTXJmVj9kRSxQOTRZaEBjUTxhN3VYOnBEb0InbC5FUmE4XkpcOXE0PEZnWkpkJDgyIzxbQW86KjJna1RGcl5tW25CIS9CdDRvb2YzPVJ1cWVkNlk+PkxkNE9sOT1jSUJBQ1lrT0cscj48OCpgSjdRI3I0WV4qKCtwUTdtYChcYzJhb1leI01FLlcvWzRCZFhWNk4lT2sucmhISzJLO1B0QkkkcTQ4NUVAcytaUTBJWk9gR2QtJzgyRz9tUiU8Z1lPRlxXWVxhIm8+WiFuVk9IYGZSby8qZ11GUSlMSm5gXClmNTRgWlQwTVEmLSNhKlA5M0k/a21GaVQ8NEhWLS85NzVhb1I/O1tJaExuYkkuMUoyJyRuJVUsYSo9KjwyZ0c5U2YzOVlcZHI7NzJNWyVhdTBBWTBdNEFOS3FXKzojaFU7WTdoUWVzJUNlbyI7XHBfUj4kNm8jPzNRK1FpSiU3PktvTjFKQW9TSCE4KygwRUUhNjgsYWExZkQ9Um5SPiY4KSkjPGolakpwZFRAVmxZQTUyWkNMMj1KYiE7Mig6VVo0I15Db3JvJUYjSlFPPyopRV9SM0xscSUvMT1sZ21yLGdOJ3FeTltBUkxZaS1yMW10SllyOlk1aWFcanMnJj04NTRsOEBeQk9XSiZjRkpWTFtkVDQ6SCRyfj4KZW5kc3RyZWFtCmVuZG9iagoxNSAwIG9iago8PAovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VHcmF5Ci9EZWNvZGUgWyAwIDEgXQovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0KL0hlaWdodCA3MgovU3VidHlwZSAvSW1hZ2UKL1R5cGUgL1hPYmplY3QKL1dpZHRoIDcyCi9MZW5ndGggMTU3NQo+PgpzdHJlYW0KR2IhPE9eTWFmVidaXStWbG5wczwtcUZPS04rOEo1JmVrWEMoKEokQSMuaUhhNVpELVVhT1dZLk9nI08oRWQsa3E+VGNcKiYtYkVFLm1qLkdpKT5sI19ObmJSMzRURixMcDFdKGZ0clZiQjNvMV9CRDBDNWdsRlVlakU4J3JxakkzQGMyNWZAIm8nL1lUdFhbJTVkQTQuUGRFc25uJFNkV0daTDFeYmZ1MD44SUpFSDUjSGpqJidGK2pAX1EoJzlUMiIwQkV1cjRgWGsqImwsNFxPIiJTdT8hZTZTaTMuRVwkYUooQUM9TV5zKyQ+cypCIVlVa18xNTdOKWNxKzUjUWpWSSgwT14hVV9UY0QjMUIxYmtHQzNLJW5uPCJaQmUnJm9VWVpXV11wZm8rczdaPXNoQCQzbjxQXmFrNzQnXnRLPzYmIiVYPkhFLUNHK3VDcVtgJCoqRXRTNHA+PytgP2JsUF9Oa0ZJMF0xTlYuJk5BX1BhXCY6QCI6Jy0hVFFoYlhUZzpUTCQ4cT9TOllJPlgzVEBTN0xsdHI5JCFMa0UnYiY6YWlHSTdmbWs7J1YwQ144Vko3ckFrT1BVKU82XmxCQF05J2hUJ0YvQWFza1ZvXGY7KFVfOmxQWUBEbTtcXTptMFw2OVBnYCVeJHVgMFIhLD5BaV0/SzdFJiFYXDhfcy1jSEE2Z1JpWlhcTi9JLixTS2M4SSZNITtcNS07cUhHUFhaWz0uSFVlOFcqby47YzxVUmYmRE0/XWVeYkAmZE9HOFZuUysoRT0sMWI1L2FjYjMjIlJWYVZQNi9bWFwzK1dcWk9RckxpR01aa25bRDYvZzhMOyYnZlFNQDNkSEI7TFw9SEoqQ1pkY2NdblJkbW0nTV07IlRPRiU9PyRIKE90ZXRlK25DYDBWdDBDK0hERjtJcnIzLWE/QTowQEpFcVxtV1BjPXEzLykzajs9X2oxMCkpJS1nQD9xZFY5QnFNSEYnUkksRlM/X1lpR04nR0UtW3RoMnJWRiNPP0YkOWZOUSxvVzEuPmFaKG9FWW8jLitpQ1gjOSJuPWc7bW1OJl03K0IkPGRPaXRWYTM6KG9VbVRRPkxJXl9fTHE2L2Y0cnE3O3NaSlBhUSRsK2pHZyllPCUjVCkvbyxyWD1DaT80NFktQiI4U3RTQjQ/KFpOPjVLJGZnYE5gXTFAW2YwWWlHK0VxdSgvMCJcUklkS1NEb1pAS2EvSkVrKjo6QzomW1NpNEM8azxrSl9laj9bRGZIaz9nUGQiOipZTT1TZ3BzPzNLIixvPCo1ZCwuQExSKW9MJUVNIVdbUUVELDVYdVlvJy8hMEtkIyVIKCVrPkA1R25kV2hVKUpnMylOQitmT1JtaW4hQD1iNC9nMEJMZkhMczYjMGo2QUBJcTBlKnU9M19cSGNdJjAocGJjVTIsPWs7W2VfZ0AxKE1YcFU0ZmVoM0E1ZTpQQFtbSEJebk5AJ2lVcXBbaTFtYF05WWI0L1Y/NHNTU19OLU9CYFdPSmZAVDc8QnFYa0EsJChtU005SUckdWYyOT9UNEZIMUBrMUhrQkUlci0nVFdXUitsWnBkcD9xMi1dWUUvbWY1I2JVXWRxKGxcJU5hR2srRkFNXy4/QlwkVVRLJUFpY3BSKj1FOm1WUFFFaFFlTC4nUC1yV1xBLSRhaTEvbEY2dC89YDxPM05dJCs2Klw1UC09UjI6QzBvYyc3JDkuJ1NOYmFDbzhYOEonJEVFKWRHWzY4UUkiSj5HMyQkazJvJ2w+KGBbRE41WmBNdFVXXDQnM1xDOF9LX00lYmlOYSE8T2NNcGooKStLRUlhMUEvZio4K2tYR09yVyZBalZJQmNsS20hYDpsS0dmQE41SG8uRDxRQiVgJzI3PFhCRi0iWkA0J1VgXE9qIW5PLFZFUFIkcFo4P1dQJG0oZC9pbEhSQXIvMlNaazY7N1Y0cUgrSW02YWgzP1M6TD9RIVA5UVUqW0krY2UqYUxjXlktXCtDJTFdKDppMjVOTi1qPlBTcFZnSCVsdCk0ZD5xbUZUNF1NMCYnLFsoKFtMYVJqWTYnW0ouODcvanN0Ik5sNTByV1czRDlpRH4+CmVuZHN0cmVhbQplbmRvYmoKMTYgMCBvYmoKPDwKL0JpdHNQZXJDb21wb25lbnQgOAovQ29sb3JTcGFjZSAvRGV2aWNlUkdCCi9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXQovSGVpZ2h0IDcyCi9TTWFzayAxNyAwIFIKL1N1YnR5cGUgL0ltYWdlCi9UeXBlIC9YT2JqZWN0Ci9XaWR0aCA3MgovTGVuZ3RoIDIyNjAKPj4Kc3RyZWFtCkdiIi9qQmklYDAnWlZsbzJlVyEnWXRRWiJbTl5XX1lpVEZAJjQvcSksKVYwXChdZWkjVGlzQVxYJi9vTiJJSFEjRkJXQXJYW1trRlEnIk1PVjJCRG9vaDRVRUQuZmwtVjpITGZLJ18/Y3BGYTkxUm8ialtGN1BxWkRhRmxGbzZZLF5wT1daUkFDMWNuMFdmTDBBKSI4bjheSD4tRC5QVEtCNS8uZ1hJaDItYF4vTyVzKGQ1bG10VDJjZ3N0QVJWcGVkJkpLcWg7bGc8OichTmFtS0lRNmhZNyZcYm9pTU1FXGhvaV5cZ0IuXShFM004Mm9ZUD5MZWsiYWdMS2E3RjYyYC1PLyo+KSVoWyUmMGRJI24oMF9uYSZHJ1A+TGk0MiQyPihdbjFvWWNPWURARC81ZkJQQkI2S0tlSl9EW1lyI0MsMm1mYjhrX24pIUk9KzU8STFNSXA4ITNSNSktQUY7RUpMNmksO0RAWi1jN0dzdDQkcy1vW09hLFdUcC8kJTg7VWhFUltKR2VwXmBfO1Q1SDw1aCpfZWdUaV9RaFc2UEcsZVQiS0R1LiNqRS1KW10/LTk0LzA3Q3QvU2pjZnUoOjtKOSRkXy0xT2RGX2A2bFtIK29kTy1qcnRTIzAhIlA8cFkvXlo/Lj5uYGVePDdSTSNzZTslT09KPGdvJlpZJEA7LjNgJDhSZixcJGU3LEFnOSwlbjJOaTpBKCo5MWtlKTFWTTByTG4kKjQ5Zk8jT1ZxNSVbJi1oSDFvZU9XQkonNUNCLkRXWGdtRWIqNChvbUEybDFtQStSTkRQTG0rVGdLRUBvKUYmPy9HYmlvKCldTSoiNWg+bGVJRV4/I2lxajtZPENeRCImRlMwXj4xXD82QUJdYE03aWwlTjhgS1hSc1wsbmtsOSFIT2VUVCoxaVxmYiVbT1RhdGRSMl0xImdFVnUqYHU+NDRKViFCPTIkOyk0M2I0OkBxVHI8KmxYWGVNO1RRcFJeTkgkbmpAPT5CN0BiclxSNVI2Ql1aZCUnK0Y1SklKWy1ldFg+TFEwZHNAXzJvMEJKcD9gSkonUzA+RVVbSSlvW1VMSWFeJmkrLVpHSiUvbTkwSnAmb1YtakAnZXBccC91IUVsSD0tZ3BSUzNRQDVsLltJNkRjJ142dXQqN0xDKyZFaElab3BjTSk9SCVxOm8sRU5gLTwmYjhhRW1hYXF0Yjw8YyJJMFsjU0BZQloyVlpDLG5PQz5zKiF1SWsnQDlrLzcncW5MIzcublJHTFxIZS47L2o+WVVnNVFpO0djOT9tI1lxLDJYdCQob0VuVmtGIm5vPUNVJ2FMaDdWcFQxQWlFIUNLWSVMSjk0YywsJFpnbVQuNU8yLiFlLHQtRzRJNFh1O1EkaVRiS3VRIl5fRjYhZUNIJC9QT2FTJWcyZzktbz1YRSNHOG8vZ2c2MUkwRTpjUmYiUFhKVUk5Pk5GSy1nUCEmNEs3LChDJlhPSidYLFZLSXBUbDc7dTR0YWJGSDBDI1gkNmBsWisjNykmN0QsNEJFVFZpWGVLQ1whJDxXXidqSF5iUFZEbEJdZFJfQ2RORiMzXEdaPi4oZ291bjtoWSRUODgrVXRFT1gzLik9MWpNJS5uU0M2YEU0a1BuVlAjWkszOV0lSWtHdDZPUD5UWWgnS1cvRlYsX25CY1lJcipHRVxrQWM6VEpUcTQ6Wy5aPCw4O3A4NE0yNyEyckZ0OFo2VVJdMjU6dVk2WGpKZm9YVzNbXlhAcilVM3AoZnR0KyYtWzxkcWNwZ2Q3NFlvJiJrc0BPckU6cXBqbWF0QG9bXEBFaS1ZPzZbQlVpLFZxMmdCV290YmtXcW8yLHA8U3FLTUk/alo1UC5OOlBRUk00aDU0LzdMQkBdIyheL1dkS1tPPS0zTzslWSpRalVucl1SNlskcjwzNmVLQnE5YDo1X2lTYW8sJTMxKks8WW07JEAzKUQ3MW4xUjgvYTdmKV5JQVFtSUI5NVA5SDgrcjVhKmohazBjJm4jLDd0Z1c9aDBUbkZfMXEtZ1hZOlosMixPNU5cc1teYyg2cTVPK1ElczBfL0RucjhDR2JPZS1gOkw3Zm0vUThNJFtzWmAiUitPJyRATG9ZRT1WKVU7aihPQHRIW1IhdV9YQ0ciNz1MZiotJUhTQ0InRE9kOkZWWnI7VypmOGpUayNUaSZxNjsuKDRvXGZWUitiLzdzW1Y6YXBgUic2PzhLRitqQWxQVipudV83Vz9FOWQ+UjlJY2M1LlNuV20iXG0wR2IwIidfXFwmPCotUERZOS5nVVhTSWpQZkhdUTJJRj9mN1tzaDZGUFlCSUZAYVNgLSFbN0lJOGs/RikoTEwnJ10sJ2lqP1MkVS9OS2dXbzs0NFUqQCVaKW5RQVc5UFI9Lzc9RDIwLU06cEJoTVpTNWI6YiojRjZXQSpFKlpbZTM7XClPN2V1LylaSElOWSVELDZ1Y2w5Zy9ZMkhATk1PVjYjbEA6OnRsPVVMVlVtNlhsPkkmM2Y5LDktdGFobCJLPWgodTwyaks8ZjtraGFIR0Z1UypjXXU/RkkxInJdREZyKThGMDFNKFo2QjFZJF0qaEpqTTVKNEhAP1hnLl1cMl09QnMtO0E0Zl5aJD1mTVRBbnVqOWFrPGE7SWJbcSxSc0YvXV9APVcuJ01AZjlNWVJxXjlhP2FCP0ZbRExaa2hrN2RzISQ4LihMaTEnL0pDa25pYk9NJCNBIWI8LFRjKzVyOUM1OjNkKSxeNllvSGg5ZSUqbEVlZ21mTk5DRlJgRGBRcEFbRXQ2RFRYLVV1dUI8SWpNOnVASXAyUWFBZEFSKD8jVSdxcnMsPihDT3RxVmoqXUFGOl5JWTdIdTlaQyVvb1ldJWkxODJCPW83OVpiQ2pPZCs8OjEkQihzMFo9Z0ctUi50O0ghMVguRkcoOWVTREkxYz44J0BHYkIoPzcmczg5WGI8KTVDVTJrUDFJZTYsJU5JRyM3PkkzXks3MkFWKXJXQms9RCpKfj4KZW5kc3RyZWFtCmVuZG9iagoxNyAwIG9iago8PAovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VHcmF5Ci9EZWNvZGUgWyAwIDEgXQovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0KL0hlaWdodCA3MgovU3VidHlwZSAvSW1hZ2UKL1R5cGUgL1hPYmplY3QKL1dpZHRoIDcyCi9MZW5ndGggODA2Cj4+CnN0cmVhbQpHYiIvZmJBMSRCJ1pTSkNna3JIPishbExMIjtNaFBGPFBCMkpoQklIXDhsI3NpXis+SiYvNU9BS0dKc29fTXQzNFhxXTksOz5eT09cXUNNJCwuXlU0OHU3RSRmXC1cLFFvZkBPUEZKTGYxPXBnLDc+NixORSM0b2FoamVWKmM8UG8iOHJTWnIvOzFtWlRCRCNXSFxwc21EWFo5TWs6UmApL2dSRz1NLGwybTFcKFZdXXRVbGg1bD50L0sqNFNqVCpQdVVVOFF0JSM9dVosJlY8UFJvLTdiISc+O1s2IVNdaEs+X2FUKSs6XEJxJEJFJGQwNylHSi4+YXNuKi0mRk4lRT5fLyJIJTEwMzJGUlE3XGNHZlEuNFBOWk5eYSJRRXQ9KT0sYEw1R0svVGpaWCRRP2FjRlZdR0srKEFadGFKSylgaE1GOEFJTlQqVEYiJnAzcG0vLD1nYHEjTT5SaiVWPkxJNW1qTyQvLkhURE9pRU1QYjV1Wy5RR1FNL2JGOCNiTk1DWiFGMzxYWCdNXUdxbFFiPWs+JGR1a1E/YGNyT0VRJ1dtRWEsJC46W3A8WnU5T1htTVolM2xAI1NsW1dNRSJwc10iZm1zIXUrIWozQzomJik8LGNyaDc0NGA4c2FWOzE9ZD1DTFUvN1JwQTkuPlNydClSTm9tLmwwTGonaVpLP182YDg5TkxLX0E7TmVJS2cjRmRtM09HJjhCRUhjIV4+RThhMjQzWFgvaEs2Yj10QGtNZVAxTWFTUG1xWyRKL3U7QSVDN05JR151ZCJTQUZpaSNURS5HWjFzUDVINl8yQFU5PS89NiwyIiRwcl1SaT5nLiFGJCgrMiI7YGY8S1FGLTNCbFI9SDNSLzRVWkomQnQzQl1zKyYqLl1eVT5NOjUqUU5KWShiRClKZ1dEXysmYm0vVHJZKWxaQ2lhbEtDRlRBJlc0b0E+ayFYO0tfY0prYTQvKD9SJCxoVE0nTFNESCcoOlJwVjFcNlorRWVkWGlecFtGMWo3LFgrMyFbK1w6PzpsMW5HNTw5LGwlOEstQSE0UjhDMypmXWEyTkNnPjN+PgplbmRzdHJlYW0KZW5kb2JqCjE4IDAgb2JqCjw8Ci9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZVJHQgovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0KL0hlaWdodCA3MgovU01hc2sgMTkgMCBSCi9TdWJ0eXBlIC9JbWFnZQovVHlwZSAvWE9iamVjdAovV2lkdGggNzIKL0xlbmd0aCAyMjM3Cj4+CnN0cmVhbQpHYiIvKXFmPEVOJ0xyJ2NRI1JaPV8vVTptW0JyWSQkTyckc01GXzptPipPJGYwYWBNIVNZQi1mTFBALU1kXjFIT0BTOktAPjk0TkBkWGdhSFJxLGxUXTlnNHQxc1woQCMyRCFyUkVhUTdjaFk7JWNmPUcnaClcVkJFUSZZbz5dSV50PSdXaW9jJWBMJlVaMk09ISZ1PlQsRUcjJy4vQ1otclVXW2NbQnNqM0deYCQnS2g9UT5TZC8zcGM5ZUc+ZnFjOWNtN0thJURzMHVDSEtEX1ddWVkyMCJCNUAqQ2VETW1uNUIxdUgwZjlVPUtFIz8vTjoyQ0RbTlRrNjxhVThKLVYwZCRHXzAkbjxBYF1RYUtwYzA3UFpsR2w1cmIjNUV0KiRFKUVzVUdATiciJVlaXEApKXRrOG45cmNmJDpqX0VjRlEwMlxpQ2UxT2gjJzliI1pOM0M8NjkqXkJjViEhPi1wQkIkPXVbRjVkZDQoXWR0cUs1UWlsPUktVFFBSU4lMTpVMHUhIVtaSk0vclkkbHFMVy5lT0B1R2RoM047XUg/JVonZzREdCQ7JydQISw7VzpeXTUhdCE/UHFbaTQ7JHFbRWhCQ2FqPU1mXWwpc3RLUllDYkImZCZsWjp0RSpeXTUhdDszOjAkLylaLHMsYm82Pzs8ZTciNl1gPTZTMFRIKF1QYzQ9ISEhNT0hInBIT1lEU1pUOldOVThtZCZvQkgncDEsQUJpTS4jLDEwZSk/OWE+P3RmRztHc1BFcWpHQnJZKVdXaSQ3OEheOEklajxuN1NMVDtONUBDTyEhXC1WKz46VkVZXGctOm9YPjVtVDxvNW5kaUdVPkBhLThvVmwkWCFILXNCOSZsVS9wbk9CITcqL1dKI1NqYWM1LnRlM0dKaU9ZXy9RLTpbJ3VKLnVpdGpvS2RuSyxhbFYqOyFyVj5vTD4zcDJRV2g6LU1AMDIwa05gXGsxO0E8RzRidWFBVFc6ZTZAYSk/aS8+VXBSSVUnKGdzKDxVJWVMNmU1WyJZWlVCPlJLPWBlRyQxWkZXOTklZmc8VDkicigkRmI2UEZPJU1KdDotRkg7Jzc+K18vYFpWbkxhIyFxL0o2aStUNiZjQSomdV4sa1J0NGFVamlvY2hmWSIwJV5SY25zTDpPbDpbYkFkL2NidSIjbzFPPzlsJjowMSVPRnJaNUpnLktQckg9PkpmIXNJUiVlKSNqNjl1ckwiSWpzZGxKdD8mc0ZcI2JxPiJuTHVELzNDPlZhUyE3WCtmUF8+Q1JpVSE/Q1woTVguQ10nLjM+LidGZ3E8PWY3T1luYSI4Ij87MEwxIkRrVDw3Y0I0K2dBSEwqJWIkWzksKSZbSil0XVdnYi5eRl5lVDwzQTA7RSosLm9uJTlPZEc4SW9aKzJnISVOJS9hXkJDYD0qJFhfPDoyN3ExbSpnWiVjSj5PLWNgJ3RfaElKQFMsUyNDJjUoVT9VUmwxNyZPPTxCZywzbDFFcSghdCQncSVAbzNWIicmV2ZgcT1iLkxmVUNtY1E0Iz88JVpecihIXXFuXHBlYGg1XmZYI0BKOT42TWlwW2U/YVMwKFRqXDdmTkpgY0NtSjAiTyNvW2ZfYjAjKHBOJDVQdGd1VDZvJ2I2Pm1cZjRHOVE0aV4zPFxEX0FuMypGMjlbVldhOClTLWlGVlZaWXMxcTRJS1VpOWNLImt1cCpSTDJlSW9cYFMsblhwYzxZby5WVVktOGlkSW5NWyxEXlVCZXInNT5LVUM1a1pZSilvZk1HblpYPTFMNjpKIU5iQF1jcV0jb3VubzAyX0RzXVN1TyNVbkwjXV06IzdxJ1FKV0Rgak5MLjREc1RGN0BpIi9WYlNSUSktXGtzMlkmLSEscTNmLzRIXF1dOTRMV1oua2IpYV00V0g6b0xCZlsyXGYhP1hdVzVsanRmcEs2JFItMmU4cjFkKjJAbi1LPE1UVz5BO2wnTFZJTkBWMlQpaT9SMkFsInBNKUJEJUFedUBJSSZRMDs5K2siXUdrVExQSCNjJENOSGVNQDtlW246U1skJDBncGpOcnBkKTk/KFI4I1VKIkVeJFAuSD91XkJEXStpXmxiblw8WFMwUDwtJVtnQCpNY2UqLURRYFZwWmJyVTNGOVVPcmpkO0Zib09WYU8mNzM8LiZ0NDhbNm0ubVhNW1FBNEIwVGVPRCxwQ01xX15HPSZiI0RMPkZ0TnJpQzNEOklUbi5HTTRxbyRGdVtHUkBdM2VmXVRePSFoSyhmZC4+L01iMFAqNkgnKDZvZGRPMmlZJCFoJCxlJGFLPWAmNylsYnVedCs3NkNnIVlQVFJCPGNAV3NQUVY0RXMmMzgrU2tHSThFTj5HOjBIRHFWaiRiQUhjOSM9YSZJRUc3QHNvbzkmMSR1Uls0LFh0JTR1dC5pJ2ZPZk9haVNMWHRzMWBXMTUzWlE7ZC4qY2NQUTwoM2QmXWEnSVBaR1QjKWVWOGFYNXJVc08qLDJTJSRvWE9eI29ZZTg4WUZIRT8tVCdrQUAwJ01FbHVESVYkdFUoUiI4aSxDPnVCTHJaUjc1Sm5mbU9aT1AmSSkoOzdHRGolYztsNkFtOzgxXWhORjJdWD8+cEkpRmZsSy5pb0QtIz9QQVVeLnVwOzNiO0JVTTMoIVYqUUZiVl9uODc1SFJAYF1YNFFHXHE5YWdfIUNZOlBeK2NGKVhINzJxQkdaQWYnR2twTlJHTVgnYiNNYzhrQWxaTEUyIzhFWlFmVVVvMy1EYmNtWj0wKXNQX2kiaDspInBKMFZCS0daPk1BaTZrMnVjSypic1RfKzBRMzMjOXJPKVludT1bTFRlXk5WQF9jQl5ONUxiSWNtclxyWTRPdDFdPDxINj1WOyIkLVchV3JSamFgTFYuQ0ZmcE1USSdXOFRTaFtwSEdBYztJcUk0QSdQNE1MXS1JTW9vTEYyXGtxPl1JXnQ9J1RiLElrTGElMUFmcjR+PgplbmRzdHJlYW0KZW5kb2JqCjE5IDAgb2JqCjw8Ci9CaXRzUGVyQ29tcG9uZW50IDgKL0NvbG9yU3BhY2UgL0RldmljZUdyYXkKL0RlY29kZSBbIDAgMSBdCi9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXQovSGVpZ2h0IDcyCi9TdWJ0eXBlIC9JbWFnZQovVHlwZSAvWE9iamVjdAovV2lkdGggNzIKL0xlbmd0aCAxNjcKPj4Kc3RyZWFtCkdiIjBRXSspT3UkcTQjJS5vRmNuTXFBOGs8QUdwRGtHSlQjIiY4RSpjXVJJLlYlPnQvZG1ma3EoYEpnOUlyLCc5YmhNaD8kOVYuWHBNMzVZMCJEODJMIyMwWzo4Z2BKOjkqOG8sJW5ITTNQcD1MIzdfXzVFOFxQLVI1OFInZ25zR083IS1NakJtXVcnK0FCPFIjNChba1JXTEozS1UtXV0yL2Q9UX4+CmVuZHN0cmVhbQplbmRvYmoKMjAgMCBvYmoKPDwKL0JpdHNQZXJDb21wb25lbnQgOAovQ29sb3JTcGFjZSAvRGV2aWNlUkdCCi9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXQovSGVpZ2h0IDcyCi9TTWFzayAyMSAwIFIKL1N1YnR5cGUgL0ltYWdlCi9UeXBlIC9YT2JqZWN0Ci9XaWR0aCA3MgovTGVuZ3RoIDI0NzkKPj4Kc3RyZWFtCkdiIi9qPVxmYDknU1IoRDRJQUE+LFQqZCJMJzMsYWZgRW9lMzF0ZVJhQ0tvc2F0LSJaS00xRCtwYTxhXkM1KF40V3A2PktHMkdKI3BIdGRoVzJlXz9tKE0hbGw8cWhDcTRtJEtyOzpdP1Bac24sI2Jbbj4uazMlSiEtQTtGIio4TylIW0MrW2EyX0NnPlAlSVgzcmU2XE83RmRvSFNSRTdgLFRnPEVjI1tcaThFT2M1Z0lbIzovNFJYcFwyX0thJV1zT0VpWElDT2RnSzlGXl5pO1Y1PDs4alVXRnNJKDlnOElKV1NNRmBsNkpwcHMhR1BvOlZeKiNmaDkqWmNAQypJW1lKZyNEI05tZEJOK2NfJDhZTmtUcj1HJ1xIQVU3NClbUmQxJ1hZLStxQl5dMkU+LVIwaVxSNlgkWEJAKCdLcjomYWVPI29FYktIIj1KbCpTUk0wYEhsL146MVFmOmdhPGRLZExuREUrKjBgST02TiQmNCszRE5ROUJLV2tIK0VuYC5bKlJAOVJqb0IkS20jU21lQjBQPiQyMmA8UmUnVks7XUR0Q0I6V2xlT05hUi5gayNxSWlmJC4wYSlDaTQuKUdrIiwvRjQmN1ZialxcIl9eREBbVmlAJG8tQysjVl5RNVdCTVJSTl04blhDL0UkOEklKVZEVFQvKVMqa08nLkkvaFVwSzVCVDhob2lYIWo0MUQ7LSRAbDhlViwlK0hBW1xwJSRnYFVYVS1FS151KmFvdThRR1I5R0FWRG9tRltRQm09cCtvTzJmSCdeIT1HbjFSNEVIUDVDWGFJNVpkXzJbPi1qW1BAN10yLlw7SDhUYjknXTFtR3BiME9aXmIkT25uKypINFBoXipiN2spSF1WQWNrJj5uMjNudHBfLiszbmo/RFQ1L3MyT0wva1EwUDRsKkpmV1E/XUJGRVZnR0RmQThXMWBRbCs+U0lwcEZRIVIuQFUrLzFdMzhFQ2JEa1lOPUJvPU1DYzRwPS1KU3NIYEtkNSdVNj04ajpGU3VJcVlMJWY2Jj88YTJcbWImN2NpYSg1Q1x0PGJxQlldNjo4NmlwVjlKXFxuKEYvcUtkNTFOVlhrWEolPDZhSlYlSURPa1Y9XWIpSVdQOnAzLG5RWEhBXjpTNlhbYF1tKyFXTWxib1ktJmZfKGwvciZIclhOZkFOMTdUYlpDdVNFRCppYjpEMTJeRDZjTFAiYmZnSDd1ZmhdUmVULiU6Q1RsbzhdITc+QT8vZ3BEWU5TVEY3JHBPQCV0PSQsMVZzP2kmRihoQDUkWkcnOk9pVCIicVs+UC5XQV5AZy4zbi5jaklDTUE8LGJuRFFhZCgmPU1SN1AkMFwnXVY+L1twKmkiOzpKLTY+Y1JVNjlLX0pJLmxCMUErXWRbQWlvNEZLYVRzVU4uLSE3L1IsI143YEtlYltuKHRiLGA4NVE6UGRJZylcRWtBUEZ1VSViN1ttJ3ExWTlRVSVqIWlQQ0ZWTzs8P3JbKiJhYE0xPDRyMzdOQjEsM0gnXmQmXjNnZjYxNUplYWxyb2RYXT1VLW1wbUdPZCdTUms4UkAnP3FJY2tBWG4zQU5aO0ZFcj5YVF1GRkwoYnUtVHVnaGhuKG5MMlFqTVY/VFdQO3NpNFstV0xHVCRfS0lVQ1VbSzZJSmhGT01aQ01QX1Q2XEZCOWg3PT1GJjJqSDFGckNmSDEnM2xcR1JWaW9CbjNdJ00pUSZcKVc4WmEsTERtSlJaLiFmZGNramU2aV0nV1NxcmdkIlJXdE5MaiJpRC1uWEc8JTFOYz8zXjgwXz5cRyx1KlRqZ2g3Nz1CcEk6bjdfLCpiYzcrPDlbRGFpTGE2J1BlRVw+XDhIOkNBOkEtP1hJX2kwKzRnOmBIPyEyYFN0Tl4hRTxiLzBmTSVYY1k+XnRANzorWEpKQGxgLzBIZU06RVhsLllrKzdkXVE8N3IuPF5ePGM1OEBKT29QcWc/Q1JDUEVoQU9rMW9wY249TFBdSm9lJz5XZyJHJyNCIV9EXSZPRXJXbCE4LVErcGg6OzJnJHQsQWdZaDYubz9Fa1JbXWYqLXFLM1dMYmtMJkJYQGglU3FIIiVXaUBbV1UrOyk/ZTMsclhkOkFnN09DQWpYOFVbT2NnLyZwQ1s7XjkjKyU/PnEkRyNFY0JlPj5gJDRJLmBRRkBSVGVBdCN1MTRfcF1KbEBsa1FEJ1ltZT1vZEJoU0ZvRThhLWlwRV03KGhRMCwjSVRXR04vW1w/PzBYP2xqT0pdJ244I1ctQFFAYkYiWUFuRiRLJmBrZ1o0KDZwYkVuIjtPUm4lXSlqXFFQdVQ/MXBVIkJJS3MyM3NUIy0rNF8zZDonWWg1aTwhMDF1NjhsVkROJXJSayshSlphNyE0JixQQT5OSyZvQ1FgL0hxM0E+aEVUPSFlblkoOUlYSG84XU41WytWPiVpdWY3SixmTT1lTUYkTmZMLXQzalgiJC1yIkdgKz5kN0w/JmUlOEVBKidKXCxHOSRVJmgsRmlcW1U6XDlRInQ5MU1lRSInOy9kaC8lcVMnKiFxZ0M1Tk04I1hzcTFcOUZPTUdZOC9JXFRtUkslYTlSXDVGbTg9XC1uXXQpQi0mKjhJZjktOW9eaWo8MEk/M1hYVktMbydYOWhOX2VEXl9NbFVlbkcuRjdhU2QpUWNQN3JwMTkrYmEkOGJCOzsnNEddNkpOUWRwWUBDZj1cWi1iKmplPENHQnItOGdWMzpNa04+bVA/MTJLbyclSyYoIyhIUlQoWGFuTjRtLUAoTFUuTC8nVmZdRlI7KzZfcUUjZUJsSm1wPWE+dW5KS0tTPV5cJV5dKSZxJnIvJmBoaGtJMEBOJ21cQ2c6SiJmVSVHImJQX2gvPz47RGNBbVsxT1lhRVwuT2QiMS89ZVknbSlHaCZbb01XSUQobm03VU1YXi1QQ1YxU3BBXllXZ1lcX20mTlwtW1YoRW07OCdkMDxcMGtyRjFzX3RgMVpdR2JmakNoX1hiQlIvKDZrJ1AtKThwcmEyYzU1QjRsKGhXU00sJkxhUSNEVmMnTSJKO1UnR2tnSl8mUk9tJzxkO0ReJTUhWWMmMjltPygzP1tFaWJaJV9KQyZBZzs+QkReN0ZBTEUxIStiMiY1bzhRUG44QVReSl0mLkVKV1lbZF41Ji0rPCNYKj4tYjpoYGYlL0YvaE4iVUhFczg0RU1KI0QiS2FYaWEyOC9OXFUnIjJtY2stUStnXStcXipVQ0w0QFpxKSpwUWUyLldzTUI2KltCODw7K1AjIy1LUzp0WUVWWlkiZDNPSWRKfj4KZW5kc3RyZWFtCmVuZG9iagoyMSAwIG9iago8PAovQml0c1BlckNvbXBvbmVudCA4Ci9Db2xvclNwYWNlIC9EZXZpY2VHcmF5Ci9EZWNvZGUgWyAwIDEgXQovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0KL0hlaWdodCA3MgovU3VidHlwZSAvSW1hZ2UKL1R5cGUgL1hPYmplY3QKL1dpZHRoIDcyCi9MZW5ndGggMTE3NQo+PgpzdHJlYW0KR2IhJEY5MVk6RSdaXFA1R0dcVzQ9UyxRO1BBJDw1Y0VwPCgjZysyIl10ZzVfT0dLVypPZlE/JlxXUk11LWpcIU9ZW1hWLDs1NzUpUjImUyw7Km91KFJYcENwXjNgWj06LFJMKHE4UmM4a1xMSWNuYmA9S0onVTpAJSlAPzM+aixRb2ByKClzO29NXkM4Wi9jQy09QkgvJmxBJWtOYjwsLmxwMVxmOmNVLTNXWztWUylpKDczUS1BSDMtL1A1KSQwIVolMj8kPlk4Sl8jY0FSLjUkLUJlLE5fLykrK0M0UWdiXmVsYVNLLHRiSUEkXDEiMWFvMmVLQiU0MGdgY2MzWmZYcTBnMkVEdFJKXUxxIShZLl47Rj9PcmJvIkNHblJKPiZBY2c4Vj9zNGdIb2JYIkdbPUQ1dFNkX1U8OVRYZS04LktNbGopQjVdYEROWVg8KTctMGEyLEsoVloqQy8qL1FtPSlQP283JjRiYUNvcWwiY15vOEdIYWNUM1xDbzNeYzYmcGw4K0RIV1QoUkMsXyEyZF87TkdjYGxoWUFkWTtNLEBGPFZwTSU+bXBzOjxkZHVgNStgbDRTIWVQKmc3XCFrPCpoXi4oQTtEUWxnUTdgQF0tR0VvOUBsY0RkbD11L0A6bF9YS14lKiZSREtJKWRpX0JHWTpvbmxcLClEZCI3cU9MSmhJKjYhSFdMNSFgcV5nbmtfS2A2Kmk1JWMrTi1lRFJzPy9mcUAhK2lYb0lxcCZOWls4bkNOPkNEKmYpSHBhPClNYWVHT01oWkAyQl45XEorSzZwNiRsND81UVoqNFwhTlthNDQkRUdLNjklIl9KSTRcPmUrb1ZnYCRDMD07NGcuXTBLbDdAaCtkPGxfLVVtVHUiUGY9Z2JmTytEdFVgXl5mSC81WFJAPVxhTVZMaFUkPEBaJnM/KjouYCR1STl1NSVPKlFwW19FKiE5NU83VjlhUCFEV0o8bXUpUDZ1NS4mMVIyYS90ZkxXcEorMDMwalo/UFIyXVk7NFpGMCYlTlFsWD08XiUrZVVASUVJMGZSVElMS29EPyE6PF5cXDEmMjciO2VYKSpQSEoqLilgW09XN3RVIzxeRnFgcGAwY2sxJFYxZHAmZmIxTGlcVlQqLkcuaDVpSSpKYU9lKVNzazBpVz1Ya0I7NWlFYiVRPEZPLDdgMUBURy4vcjwiT0lQKi9MNlk0LTs9KEhwMF07NGprXSowayo1KiJEcnQqK1ooY29OZVU4Y2pCUkxWL2xeTFNIUj1yR01kPmpJLktSTk8wdSJ1OEZtIUlePCsnays7ISljPl86RiEuUEIqXzZOcSFpTEt0L101RV5DO2pxQ1tkUjsmdStMTl5HRCJXKnFDT0RgZyhbcFQjWiUkS3ReVTlyJVE+S2dcY0tIRlwuRyc4OVxDZGM1N2cnIUFcUm9bVVc2Y1hfOTk7VVAydVomR20+NVREYyMlLzdOXCphR3RabT5XS286WG5YUmYxOzNBZCJOdW5UNUsoRUlbai5qRE9NTStfZFwzKl5ERCg6bksxYUVAOEhcOG5JJSwxVm1afj4KZW5kc3RyZWFtCmVuZG9iagoyMiAwIG9iago8PAovTGVuZ3RoIDk1NzUKPj4Kc3RyZWFtCnEKMSAwIDAgMSAwIDAgY20gIEJUIC9GMSAxMiBUZiAxNC40IFRMIEVUCnEKMSAwIDAgMSA1MS4zNTQzMyA3ODIuODc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDMgVG0gL0YyIDE2IFRmIDE5IFRMIDE5MS44MzU1IDAgVGQgKFNVQkFOSVRISSBNKSBUaiBUKiAtMTkxLjgzNTUgMCBUZCBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDc2Ny44NzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMyBUbSAvRjIgMTIgVGYgMTUgVEwgMTczLjEwNzUgMCBUZCAoU09GVFdBUkUgREVWRUxPUEVSKSBUaiBUKiAtMTczLjEwNzUgMCBUZCBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDc1NS44NzQgY20KcQoKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA3MzYuODc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNSBUbSAvRjIgMTAuNSBUZiAxMyBUTCAoUFJPRkVTU0lPTkFMIFNVTU1BUlkpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNzM1LjA3NCBjbQpxCi44IHcKMSBKCjAgMCAwIFJHCm4gMCAwIG0gNDkyLjU2NjkgMCBsIFMKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA2ODUuNjc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDM3LjYgVG0gL0YxIDguOCBUZiAxMS42IFRMIChNb3RpdmF0ZWQgRWxlY3Ryb25pY3MgYW5kIENvbW11bmljYXRpb24gRW5naW5lZXJpbmcgc3R1ZGVudCB3aXRoIGEgc3Ryb25nIGZvdW5kYXRpb24gaW4gSmF2YSwgSFRNTCwgYW5kIENTUy4gSGFuZHMtb24pIFRqIFQqIChleHBlcmllbmNlIGdhaW5lZCB0aHJvdWdoIGludGVybnNoaXBzIGFuZCB0ZWNobmljYWwgdHJhaW5pbmcgaW4gc29mdHdhcmUgZGV2ZWxvcG1lbnQgYW5kIGVtYmVkZGVkIHN5c3RlbXMuIEFkZXB0IGF0KSBUaiBUKiAocHJvYmxlbS1zb2x2aW5nIGFuZCBsb2dpY2FsIHRoaW5raW5nLCB3aXRoIGEga2VlbiBpbnRlcmVzdCBpbiBjb250cmlidXRpbmcgdG8gaW5ub3ZhdGl2ZSBwcm9qZWN0cyBhbmQgb3JnYW5pemF0aW9uYWwgZ3Jvd3RoIGluIHRoZSkgVGogVCogKElUIGFuZCBlbmdpbmVlcmluZyBkb21haW5zLikgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA2NjYuNjc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNSBUbSAvRjIgMTAuNSBUZiAxMyBUTCAoRURVQ0FUSU9OKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDY2NC44NzQgY20KcQouOCB3CjEgSgowIDAgMCBSRwpuIDAgMCBtIDQ5Mi41NjY5IDAgbCBTClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNjQ5LjM3NCBjbQpxCjAgMCAwIHJnCkJUIC9GMSAxMCBUZiAxMiBUTCBFVApxCjEgMCAwIDEgMCAwIGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNSBUbSAvRjIgMTAgVGYgMTIuNSBUTCAoQi5FIFwyMjYgRWxlY3Ryb25pY3MgYW5kIENvbW11bmljYXRpb24gRW5naW5lZXJpbmcpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgMzU2LjUwMzkgMCBjbQpRCnEKUQpRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDYzNi44NzQgY20KcQowIDAgMCByZwpCVCAvRjEgMTAgVGYgMTIgVEwgRVQKcQoxIDAgMCAxIDAgMCBjbQpxCkJUIDEgMCAwIDEgMCAzLjcgVG0gMTIuNSBUTCAvRjEgOC44IFRmIDAgMCAwIHJnIChHb3Zlcm5tZW50IENvbGxlZ2Ugb2YgRW5naW5lZXJpbmctU3JpcmFuZ2FtIHwgKSBUaiAvRjMgOC44IFRmIChDR1BBOiA3Mi41JSkgVGogVCogRVQKUQpRCnEKMSAwIDAgMSAzNTYuNTAzOSAwIGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDMuNyBUbSAvRjEgOC44IFRmIDEyLjUgVEwgODcuMTM0OTkgMCBUZCAoMjAyMiBcMjI2IDIwMjYpIFRqIFQqIC04Ny4xMzQ5OSAwIFRkIEVUClEKUQpxClEKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA2MzQuODc0IGNtClEKcQoxIDAgMCAxIDUxLjM1NDMzIDYyMi4zNzQgY20KcQowIDAgMCByZwpCVCAvRjEgMTAgVGYgMTIgVEwgRVQKcQoxIDAgMCAxIDAgMCBjbQpxCkJUIDEgMCAwIDEgMCAzLjcgVG0gMTIuNSBUTCAvRjEgOC44IFRmIDAgMCAwIHJnIChTcmVlIEFtYmFhbHMgTWF0cmljIEhyLlNlYy5TY2hvb2wsIFBhZGFsdXIgfCApIFRqIC9GMyA4LjggVGYgKFNTTEM6IDgwJSB8IEhTTEM6IDY5LjMlKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDM1Ni41MDM5IDAgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMy43IFRtIC9GMSA4LjggVGYgMTIuNSBUTCA4Ny4xMzQ5OSAwIFRkICgyMDE5IFwyMjYgMjAyMikgVGogVCogLTg3LjEzNDk5IDAgVGQgRVQKUQpRCnEKUQpRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDYwMy4zNzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMC41IFRmIDEzIFRMIChJTlRFUk5TSElQKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDYwMS41NzQgY20KcQouOCB3CjEgSgowIDAgMCBSRwpuIDAgMCBtIDQ5Mi41NjY5IDAgbCBTClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNTg2LjA3NCBjbQpxCjAgMCAwIHJnCkJUIC9GMSAxMCBUZiAxMiBUTCBFVApxCjEgMCAwIDEgMCAwIGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNSBUbSAvRjIgMTAgVGYgMTIuNSBUTCAoSmF2YSBGdWxsIFN0YWNrIERldmVsb3BlciBJbnRlcm4gfCBUSEUgTUlORCBJVCwgVHJpY2h5KSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDM1Ni41MDM5IDAgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMCBUZiAxMi41IFRMIDQwLjUwMjk5IDAgVGQgKFwoSnVuIDIwMjUgXDIyNiBBdWcgMjAyNVwpKSBUaiBUKiAtNDAuNTAyOTkgMCBUZCBFVApRClEKcQpRClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNTc0LjY3NCBjbQpCVCAvRjEgOCBUZiA5LjYgVEwgRVQKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuOSBUbSAoXDE3NykgVGogVCogRVQKUQpxCjEgMCAwIDEgNjMuMzU0MzMgNTc0LjY3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjYgVG0gL0YxIDguOCBUZiAxMS40IFRMIChCdWlsdCBhbmQgZGVwbG95ZWQgd2ViIGFwcGxpY2F0aW9ucyB1c2luZyBKYXZhLCBTcHJpbmcgQm9vdCwgSFRNTCwgQ1NTLCBhbmQgSmF2YVNjcmlwdC4pIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNTYzLjI3NCBjbQpCVCAvRjEgOCBUZiA5LjYgVEwgRVQKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuOSBUbSAoXDE3NykgVGogVCogRVQKUQpxCjEgMCAwIDEgNjMuMzU0MzMgNTYzLjI3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjYgVG0gL0YxIDguOCBUZiAxMS40IFRMIChEZXNpZ25lZCByZWxhdGlvbmFsIGRhdGFiYXNlIHNjaGVtYXMgaW4gTXlTUUwsIGltcHJvdmluZyBxdWVyeSBwZXJmb3JtYW5jZSBmb3IgZGF0YS1oZWF2eSBtb2R1bGVzLikgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA1NTEuODc0IGNtCkJUIC9GMSA4IFRmIDkuNiBUTCBFVAowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi45IFRtIChcMTc3KSBUaiBUKiBFVApRCnEKMSAwIDAgMSA2My4zNTQzMyA1NTEuODc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNiBUbSAvRjEgOC44IFRmIDExLjQgVEwgKEltcGxlbWVudGVkIFJFU1RmdWwgQVBJIGVuZHBvaW50cyB3aXRoIFNwcmluZyBCb290LCBpbnRlZ3JhdGluZyBmcm9udC1lbmQgYW5kIGJhY2stZW5kIHNlYW1sZXNzbHkuKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDU0MC40NzQgY20KQlQgL0YxIDggVGYgOS42IFRMIEVUCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjkgVG0gKFwxNzcpIFRqIFQqIEVUClEKcQoxIDAgMCAxIDYzLjM1NDMzIDU0MC40NzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi42IFRtIC9GMSA4LjggVGYgMTEuNCBUTCAoQ29sbGFib3JhdGVkIHdpdGggYSB0ZWFtIG9mIGRldmVsb3BlcnMgdG8gZGVsaXZlciBmZWF0dXJlIHVwZGF0ZXMgb24gc2NoZWR1bGUuKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDUyMS40NzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMC41IFRmIDEzIFRMIChQUk9KRUNUUykgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA1MTkuNjc0IGNtCnEKLjggdwoxIEoKMCAwIDAgUkcKbiAwIDAgbSA0OTIuNTY2OSAwIGwgUwpRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDUwNC4xNzQgY20KcQowIDAgMCByZwpCVCAvRjEgMTAgVGYgMTIgVEwgRVQKcQoxIDAgMCAxIDAgMCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjUgVG0gL0YyIDEwIFRmIDEyLjUgVEwgKFpPTE9UTyBcMjI2IEUtQ09NTUVSQ0UgV0VCIEFQUExJQ0FUSU9OKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDM1Ni41MDM5IDAgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMCBUZiAxMi41IFRMIDQ1LjUxMjk5IDAgVGQgKFwoSnVsIDIwMjYgXDIyNiBPY3QgMjAyNlwpKSBUaiBUKiAtNDUuNTEyOTkgMCBUZCBFVApRClEKcQpRClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNDkyLjc3NCBjbQpCVCAvRjEgOCBUZiA5LjYgVEwgRVQKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuOSBUbSAoXDE3NykgVGogVCogRVQKUQpxCjEgMCAwIDEgNjMuMzU0MzMgNDkyLjc3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjYgVG0gL0YxIDguOCBUZiAxMS40IFRMIChEZXZlbG9wZWQgYSBmdWxsLXN0YWNrIGUtY29tbWVyY2UgYXBwbGljYXRpb24gdXNpbmcgSmF2YSwgSlNQLCBTZXJ2bGV0cywgSkRCQywgYW5kIE15U1FMLikgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyA0ODEuMzc0IGNtCkJUIC9GMSA4IFRmIDkuNiBUTCBFVAowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi45IFRtIChcMTc3KSBUaiBUKiBFVApRCnEKMSAwIDAgMSA2My4zNTQzMyA0ODEuMzc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNiBUbSAvRjEgOC44IFRmIDExLjQgVEwgKEltcGxlbWVudGVkIGRhdGFiYXNlIG9wZXJhdGlvbnMgdXNpbmcgdGhlIERBTyBwYXR0ZXJuIGFuZCBDUlVEIGZ1bmN0aW9uYWxpdHkuKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDQ2OS45NzQgY20KQlQgL0YxIDggVGYgOS42IFRMIEVUCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjkgVG0gKFwxNzcpIFRqIFQqIEVUClEKcQoxIDAgMCAxIDYzLjM1NDMzIDQ2OS45NzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi42IFRtIC9GMSA4LjggVGYgMTEuNCBUTCAoQnVpbHQgdXNlciBhdXRoZW50aWNhdGlvbiwgcHJvZHVjdCBicm93c2luZywgc2hvcHBpbmcgY2FydCwgd2lzaGxpc3QsIGFkZHJlc3MgbWFuYWdlbWVudCwgYW5kIG9yZGVyIHdvcmtmbG93cy4pIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgNDQ3LjE3NCBjbQpCVCAvRjEgOCBUZiA5LjYgVEwgRVQKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDE0LjMgVG0gKFwxNzcpIFRqIFQqIEVUClEKcQoxIDAgMCAxIDYzLjM1NDMzIDQ0Ny4xNzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMTQgVG0gL0YxIDguOCBUZiAxMS40IFRMIChDb25maWd1cmVkIGNsb3VkIGRhdGFiYXNlIGNvbm5lY3Rpdml0eSBhbmQgZGVwbG95ZWQgdGhlIGFwcGxpY2F0aW9uIHVzaW5nIERvY2tlciBhbmQgUmVuZGVyOyBtYW5hZ2VkIHNvdXJjZSBjb2RlKSBUaiBUKiAodXNpbmcgR2l0IGFuZCBHaXRIdWIuKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDQzNS43NzQgY20KQlQgL0YxIDggVGYgOS42IFRMIEVUCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjkgVG0gKFwxNzcpIFRqIFQqIEVUClEKcQoxIDAgMCAxIDYzLjM1NDMzIDQzNS43NzQgY20KcQouMTAxOTYxIC4wNTA5OCAuNjcwNTg4IFJHCm4gNDMuNTI0OCAxLjUgbSAxNDMuNzkyIDEuNSBsIFMKbiAxOTAuNTczIDEuNSBtIDMwNi40OTUgMS41IGwgUwpCVCAxIDAgMCAxIDAgMi42IFRtIDExLjQgVEwgL0YzIDguOCBUZiAwIDAgMCByZyAoTGl2ZSBMaW5rOikgVGogL0YxIDguOCBUZiAoICkgVGogLjEwMTk2MSAuMDUwOTggLjY3MDU4OCByZyAoem9sb3RvLXU1dDkub25yZW5kZXIuY29tKSBUaiAwIDAgMCByZyAoICApIFRqICh8KSBUaiAoICApIFRqIC9GMyA4LjggVGYgKEdpdEh1YjopIFRqIC9GMSA4LjggVGYgKCApIFRqIC4xMDE5NjEgLjA1MDk4IC42NzA1ODggcmcgKGh0dHBzOi8vZ2l0aHViLmNvbS9TdWJhbml0aGlNKSBUaiAwIDAgMCByZyBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDQzMS43NzQgY20KUQpxCjEgMCAwIDEgNTEuMzU0MzMgNDE4LjI3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjUgVG0gL0YyIDEwIFRmIDEyLjUgVEwgKEFSUCBTUE9PRklORyBERVRFQ1RJT04gU1lTVEVNIFdJVEggRU1BSUwgQUxFUlQgVVNJTkcgUFlUSE9OIEFORCBTQ0FQWSkgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAzOTUuNDc0IGNtCkJUIC9GMSA4IFRmIDkuNiBUTCBFVAowIDAgMCByZwpCVCAxIDAgMCAxIDAgMTQuMyBUbSAoXDE3NykgVGogVCogRVQKUQpxCjEgMCAwIDEgNjMuMzU0MzMgMzk1LjQ3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAxNCBUbSAvRjEgOC44IFRmIDExLjQgVEwgKERldmVsb3BlZCBhIHJlYWwtdGltZSBBUlAgc3Bvb2ZpbmcgZGV0ZWN0aW9uIHN5c3RlbSB1c2luZyBQeXRob24gYW5kIFNjYXB5IHRvIG1vbml0b3IgQVJQIHBhY2tldHMgYW5kIHZlcmlmeSBJUFwyMjZNQUMpIFRqIFQqIChhZGRyZXNzIG1hcHBpbmdzLikgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAzODQuMDc0IGNtCkJUIC9GMSA4IFRmIDkuNiBUTCBFVAowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi45IFRtIChcMTc3KSBUaiBUKiBFVApRCnEKMSAwIDAgMSA2My4zNTQzMyAzODQuMDc0IGNtCnEKMCAwIDAgcmcKQlQgMSAwIDAgMSAwIDIuNiBUbSAvRjEgOC44IFRmIDExLjQgVEwgKERldGVjdGVkIHN1c3BpY2lvdXMgTUFDIGFkZHJlc3MgY2hhbmdlcyBhc3NvY2lhdGVkIHdpdGggQVJQIHNwb29maW5nIGF0dGFja3MgdGhyb3VnaCBjb250aW51b3VzIHBhY2tldCBtb25pdG9yaW5nLikgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAzNjEuMjc0IGNtCkJUIC9GMSA4IFRmIDkuNiBUTCBFVAowIDAgMCByZwpCVCAxIDAgMCAxIDAgMTQuMyBUbSAoXDE3NykgVGogVCogRVQKUQpxCjEgMCAwIDEgNjMuMzU0MzMgMzYxLjI3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAxNCBUbSAvRjEgOC44IFRmIDExLjQgVEwgKEFjaGlldmVkIHJlYWwtdGltZSBkZXRlY3Rpb24gd2l0aCBib3RoIHRlcm1pbmFsIGFuZCBlbWFpbCBhbGVydHMsIHByb3ZpZGluZyBhIGxpZ2h0d2VpZ2h0IGFuZCBjb3N0LWVmZmVjdGl2ZSBzb2x1dGlvbiBmb3IgTEFOKSBUaiBUKiAoc2VjdXJpdHkuKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDM0Mi4yNzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMC41IFRmIDEzIFRMIChDRVJUSUZJQ0FURSkgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAzNDAuNDc0IGNtCnEKLjggdwoxIEoKMCAwIDAgUkcKbiAwIDAgbSA0OTIuNTY2OSAwIGwgUwpRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDMyNC45NzQgY20KcQowIDAgMCByZwpCVCAxIDAgMCAxIDAgMi41IFRtIC9GMiAxMCBUZiAxMi41IFRMIChGVUxMU1RBQ0sgV0VCIERFVkVMT1BNRU5UIC0gVEFQIEFDQURFTVkgXCgyMDI0XCkpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjc4LjU3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAzNy42IFRtIC9GMSA4LjggVGYgMTEuNiBUTCAoTWFzdGVyZWQgQ29yZSBKYXZhLCBBZHZhbmNlZCBKYXZhIFwoSkRCQywgSjJFRSwgU2VydmxldHNcKSwgU3ByaW5nLCBIaWJlcm5hdGUsIE15U1FMLCBhbmQgRnJvbnRlbmQgRGV2ZWxvcG1lbnQuIEdhaW5lZCkgVGogVCogKGhhbmRzLW9uIGV4cGVyaWVuY2UgaW4gT09QLCBDb2xsZWN0aW9ucywgTXVsdGl0aHJlYWRpbmcsIEV4Y2VwdGlvbiBIYW5kbGluZywgYW5kIEphdmEgOCBmZWF0dXJlcyBcKExhbWJkYSBFeHByZXNzaW9ucywpIFRqIFQqIChTdHJlYW0gQVBJXCkuIEFwcGxpZWQgc2tpbGxzIGluIG11bHRpcGxlIHByb2plY3RzLCBpbmNsdWRpbmcgYSBjYXBzdG9uZSBPbmxpbmUgRm9vZCBEZWxpdmVyeSBhcHBsaWNhdGlvbiwgc2hvd2Nhc2luZyBmdWxsLXN0YWNrKSBUaiBUKiAoZGV2ZWxvcG1lbnQgZnJvbSBkYXRhYmFzZSBpbnRlZ3JhdGlvbiB0byByZXNwb25zaXZlIFVJIGRlc2lnbi4pIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjU5LjU3NCBjbQpxCjAgMCAwIHJnCkJUIDEgMCAwIDEgMCAyLjUgVG0gL0YyIDEwLjUgVGYgMTMgVEwgKFRFQ0hOSUNBTCBTS0lMTFMpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjU3Ljc3NCBjbQpxCi44IHcKMSBKCjAgMCAwIFJHCm4gMCAwIG0gNDkyLjU2NjkgMCBsIFMKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAyNDIuMzc0IGNtCnEKQlQgMSAwIDAgMSAwIDIuOCBUbSAxMi40IFRMIC9GMiA5LjYgVGYgMCAwIDAgcmcgKFByb2dyYW1taW5nIExhbmd1YWdlczopIFRqIC9GNCA5LjYgVGYgKCBKYXZhLCBTUUwpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjI5Ljk3NCBjbQpxCkJUIDEgMCAwIDEgMCAyLjggVG0gMTIuNCBUTCAvRjIgOS42IFRmIDAgMCAwIHJnIChGcm9udGVuZDopIFRqIC9GNCA5LjYgVGYgKCBIVE1MNSwgQ1NTMywgSmF2YVNjcmlwdCwgUmVhY3QpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjE3LjU3NCBjbQpxCkJUIDEgMCAwIDEgMCAyLjggVG0gMTIuNCBUTCAvRjIgOS42IFRmIDAgMCAwIHJnIChCYWNrZW5kOikgVGogL0Y0IDkuNiBUZiAoIEphdmEgU2VydmxldHMsIEpTUCwgSkRCQywgU3ByaW5nIEJvb3QpIFRqIFQqIEVUClEKUQpxCjEgMCAwIDEgNTEuMzU0MzMgMjA1LjE3NCBjbQpxCkJUIDEgMCAwIDEgMCAyLjggVG0gMTIuNCBUTCAvRjIgOS42IFRmIDAgMCAwIHJnIChEYXRhYmFzZTopIFRqIC9GNCA5LjYgVGYgKCBNeVNRTCkgVGogVCogRVQKUQpRCnEKMSAwIDAgMSA1MS4zNTQzMyAxOTIuNzc0IGNtCnEKQlQgMSAwIDAgMSAwIDIuOCBUbSAxMi40IFRMIC9GMiA5LjYgVGYgMCAwIDAgcmcgKENvcmUgQ29uY2VwdHM6KSBUaiAvRjQgOS42IFRmICggT09QLCBFeGNlcHRpb24gSGFuZGxpbmcsIE11bHRpdGhyZWFkaW5nLCBDb2xsZWN0aW9ucywgRGF0YSBTdHJ1Y3R1cmVzIGFuZCBBbGdvcml0aG1zKSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDE2Ny45NzQgY20KcQpCVCAxIDAgMCAxIDAgMTUuMiBUbSAxMi40IFRMIC9GMiA5LjYgVGYgMCAwIDAgcmcgKFRvb2xzIGFuZCBEZXBsb3ltZW50OikgVGogL0Y0IDkuNiBUZiAoIEdpdCwgR2l0SHViLCBNYXZlbiwgQXBhY2hlIFRvbWNhdCwgRG9ja2VyLCBSZW5kZXIsIEFpdmVuIENsb3VkIE15U1FMLCBFY2xpcHNlLCBWUyBDb2RlLCkgVGogVCogKEFudGlncmF2aXR5KSBUaiBUKiBFVApRClEKcQoxIDAgMCAxIDUxLjM1NDMzIDE1NS41NzQgY20KcQpCVCAxIDAgMCAxIDAgMi44IFRtIDEyLjQgVEwgL0YyIDkuNiBUZiAwIDAgMCByZyAoT3RoZXIgVGVjaG5vbG9naWVzOikgVGogL0Y0IDkuNiBUZiAoIFB5dGhvbiwgU2NhcHksIFJFU1QgQVBJcykgVGogVCogRVQKUQpRCiAKClEKCmVuZHN0cmVhbQplbmRvYmoKMjMgMCBvYmoKPDwKL0xlbmd0aCA4NDgKPj4Kc3RyZWFtCnEKMC4wIDAuMCA1OTUuMjc1NiA4NDEuODg5OCByZQpXCm4KMSAwIDAgMSAwIDAgY20KQlQKL0YxLTAgMTIgVGYKMTQuNCBUTApFVApCVAovRjEtMCA5IFRmCjEwLjggVEwKRVQKcQoxMC41IDAgMCAxMC41IDY4LjcyNSA3NTYuNjc0IGNtCi9Gb3JtWG9iLjhkZTUxM2ExNDIyYWFkZTQzY2RlOTQ5ZDZiNmZkNjAyIERvClEKQlQKMSAwIDAgMSA4Mi4yMjUgNzU4Ljg3NCBUbQooc3ViYW5pdGhpNDZcMTAwZ21haWxcMDU2Y29tKSBUagpUKgpFVApCVAoxIDAgMCAxIDE3OC4zOSA3NTguODc0IFRtCiggICBcMTc0ICAgKSBUagpUKgpFVApxCjEwLjUgMCAwIDEwLjUgMTk1Ljc0MiA3NTYuNjc0IGNtCi9Gb3JtWG9iLmM1MjM2N2FjODIyOWRmMzE1MmJiY2IxNjE3NzJlZTI5IERvClEKQlQKMSAwIDAgMSAyMDkuMjQyIDc1OC44NzQgVG0KKDgwOTgyMzg4MjcpIFRqClQqCkVUCkJUCjEgMCAwIDEgMjU5LjI4MiA3NTguODc0IFRtCiggICBcMTc0ICAgKSBUagpUKgpFVApxCjEwLjUgMCAwIDEwLjUgMjc2LjYzNCA3NTYuNjc0IGNtCi9Gb3JtWG9iLjhiOTIyZGM2NTQ2MjBiMzdlNTg2NTgwY2FlNDY2ZThlIERvClEKQlQKMSAwIDAgMSAyOTAuMTM0IDc1OC44NzQgVG0KKFBlcmFtYmFsdXJcMDU0IFRhbWlsIE5hZHUpIFRqClQqCkVUCkJUCjEgMCAwIDEgMzg3LjY1OCA3NTguODc0IFRtCiggICBcMTc0ICAgKSBUagpUKgpFVApxCjEwLjUgMCAwIDEwLjUgNDA1LjAxIDc1Ni42NzQgY20KL0Zvcm1Yb2IuMjBjMzkxMDYxOTc4NDhjOTY5MDM3Y2M2MGNhMzhiZDUgRG8KUQpCVAoxIDAgMCAxIDQxOC41MSA3NTguODc0IFRtCihsaW5rZWRpblwwNTZjb21cMDU3aW5cMDU3c3ViYW5pdGhpNDYpIFRqClQqCkVUClEKCmVuZHN0cmVhbQplbmRvYmoKMjQgMCBvYmoKPDwKL1R5cGUgL0Fubm90Ci9TdWJ0eXBlIC9MaW5rCi9SZWN0IFsgNjguNzI1IDc1Ni4zNzQgMTc4LjM5IDc2Ny44NzQgXQovQm9yZGVyIFsgMCAwIDAgXQovQSA8PAovUyAvVVJJCi9UeXBlIC9BY3Rpb24KL1VSSSAobWFpbHRvXDA3MnN1YmFuaXRoaTQ2XDEwMGdtYWlsXDA1NmNvbSkKPj4KL1AgMyAwIFIKPj4KZW5kb2JqCjI1IDAgb2JqCjw8Ci9UeXBlIC9Bbm5vdAovU3VidHlwZSAvTGluawovUmVjdCBbIDE5NS43NDIgNzU2LjM3NCAyNTkuMjgyIDc2Ny44NzQgXQovQm9yZGVyIFsgMCAwIDAgXQovQSA8PAovUyAvVVJJCi9UeXBlIC9BY3Rpb24KL1VSSSAodGVsXDA3MlwwNTM5MTgwOTgyMzg4MjcpCj4+Ci9QIDMgMCBSCj4+CmVuZG9iagoyNiAwIG9iago8PAovVHlwZSAvQW5ub3QKL1N1YnR5cGUgL0xpbmsKL1JlY3QgWyAyNzYuNjM0IDc1Ni4zNzQgMzg3LjY1OCA3NjcuODc0IF0KL0JvcmRlciBbIDAgMCAwIF0KL0EgPDwKL1MgL1VSSQovVHlwZSAvQWN0aW9uCi9VUkkgKGh0dHBzXDA3MlwwNTdcMDU3d3d3XDA1Nmdvb2dsZVwwNTZjb21cMDU3bWFwc1wwNTdzZWFyY2hcMDU3XDA3N2FwaVwwNzUxXDA0NnF1ZXJ5XDA3NVBlcmFtYmFsdXJcMDQ1MkNcMDUzVGFtaWxcMDUzTmFkdSkKPj4KL1AgMyAwIFIKPj4KZW5kb2JqCjI3IDAgb2JqCjw8Ci9UeXBlIC9Bbm5vdAovU3VidHlwZSAvTGluawovUmVjdCBbIDQwNS4wMSA3NTYuMzc0IDUyNi41NTUgNzY3Ljg3NCBdCi9Cb3JkZXIgWyAwIDAgMCBdCi9BIDw8Ci9TIC9VUkkKL1R5cGUgL0FjdGlvbgovVVJJIChodHRwc1wwNzJcMDU3XDA1N3d3d1wwNTZsaW5rZWRpblwwNTZjb21cMDU3aW5cMDU3c3ViYW5pdGhpNDYpCj4+Ci9QIDMgMCBSCj4+CmVuZG9iagoyOCAwIG9iago8PAovVHlwZSAvQW5ub3QKL1N1YnR5cGUgL0xpbmsKL1JlY3QgWyAyNTMuOTI2OCA0MzUuNzc0IDM2OS44NDkyIDQ0Ny4xNzQgXQovQm9yZGVyIFsgMCAwIDAgXQovQSA8PAovUyAvVVJJCi9UeXBlIC9BY3Rpb24KL1VSSSAoaHR0cHNcMDcyXDA1N1wwNTdnaXRodWJcMDU2Y29tXDA1N1N1YmFuaXRoaU0pCj4+Ci9QIDMgMCBSCj4+CmVuZG9iagp4cmVmCjAgMjkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwODMgMDAwMDAgbiAKMDAwMDAwMDE0MiAwMDAwMCBuIAowMDAwMDAwNjA2IDAwMDAwIG4gCjAwMDAwMDA4MDYgMDAwMDAgbiAKMDAwMDAwNDIwOSAwMDAwMCBuIAowMDAwMDA0Mjg0IDAwMDAwIG4gCjAwMDAwMDQzOTEgMDAwMDAgbiAKMDAwMDAwNDQ5OSAwMDAwMCBuIAowMDAwMDA0NjExIDAwMDAwIG4gCjAwMDAwMDQ3MjEgMDAwMDAgbiAKMDAwMDAwNTA0NiAwMDAwMCBuIAowMDAwMDA1MDgwIDAwMDAwIG4gCjAwMDAwMDUxODggMDAwMDAgbiAKMDAwMDAxMDIxMSAwMDAwMCBuIAowMDAwMDExOTkxIDAwMDAwIG4gCjAwMDAwMTQ0NTMgMDAwMDAgbiAKMDAwMDAxNTQ2MyAwMDAwMCBuIAowMDAwMDE3OTAyIDAwMDAwIG4gCjAwMDAwMTgyNzMgMDAwMDAgbiAKMDAwMDAyMDk1NCAwMDAwMCBuIAowMDAwMDIyMzM0IDAwMDAwIG4gCjAwMDAwMzE5NjIgMDAwMDAgbiAKMDAwMDAzMjg2MiAwMDAwMCBuIAowMDAwMDMzMDU1IDAwMDAwIG4gCjAwMDAwMzMyMzYgMDAwMDAgbiAKMDAwMDAzMzUxMSAwMDAwMCBuIAowMDAwMDMzNzI4IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgMjkKL1Jvb3QgMSAwIFIKL0luZm8gMTEgMCBSCi9JRCBbIDxhODllOTk2YjE1MTU3NGJmNDY0NjgyYjY1MGY3NTIxND4gPGE4OWU5OTZiMTUxNTc0YmY0NjQ2ODJiNjUwZjc1MjE0PiBdCj4+CnN0YXJ0eHJlZgozMzkzMgolJUVPRgo=';
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
