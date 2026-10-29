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

/* ===== SCROLL REVEAL ===== */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  $$("main section:not(.hero) .wrap > *").forEach(el => {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });
}

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
