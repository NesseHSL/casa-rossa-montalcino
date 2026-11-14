// Header turns solid once you scroll past the hero (always solid on pages without one)
const header = document.querySelector(".site-header");
const hero = document.querySelector(".hero");
const onScroll = () => header.classList.toggle("solid", !hero || window.scrollY > hero.offsetHeight - header.offsetHeight - 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Close" : "Menu";
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A" && nav.classList.contains("open")) toggle.click();
});

// Gallery lightbox: photos open in the order they are listed in the CMS
const lightboxList = [...document.querySelectorAll(".gallery-grid button")]
  .sort((a, b) => a.dataset.i - b.dataset.i)
  .map((b) => [b.dataset.full, b.querySelector("img").alt]);
document.querySelectorAll(".gallery-grid button").forEach((b) =>
  b.addEventListener("click", () => openLightbox(+b.dataset.i)));
const lb = document.getElementById("lightbox");
const lbImg = lb && lb.querySelector("img");
let current = 0;
function show(i) {
  current = (i + lightboxList.length) % lightboxList.length;
  lbImg.src = lightboxList[current][0];
  lbImg.alt = lightboxList[current][1];
}
function openLightbox(i) { show(i); lb.classList.add("open"); lb.querySelector(".lb-close").focus(); }
function closeLightbox() { lb.classList.remove("open"); }
if (lb) {
  lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
}

// "Come and stay" enquiry form
const form = document.getElementById("enquiry-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("form-note");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    data.page = document.title;
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    note.textContent = "Sending…";
    try {
      const res = await fetch("/api/enquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      form.reset();
      note.textContent = "Thank you. Pat and Mark will be in touch soon.";
    } catch {
      note.innerHTML = 'Sorry, something went wrong. Please email us at <a href="mailto:pat@casarossa.estate">pat@casarossa.estate</a>.';
    } finally {
      button.disabled = false;
    }
  });
}

// Home page hero slideshow
const slides = document.querySelectorAll(".hero-slide");
if (slides.length > 1 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let s = 0;
  setInterval(() => {
    slides[s].classList.remove("active");
    s = (s + 1) % slides.length;
    slides[s].classList.add("active");
  }, 3000);
}

// Fade sections in as they scroll into view
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Guest registration form
const regForm = document.getElementById("register-form");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const note = document.getElementById("register-note");
    if (!regForm.checkValidity()) {
      regForm.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(regForm));
    data.services = new FormData(regForm).getAll("services");
    const button = regForm.querySelector("button[type=submit]");
    button.disabled = true;
    note.textContent = "Sending…";
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      regForm.reset();
      note.textContent = "Thank you. We have your details and will be in touch soon.";
    } catch {
      note.innerHTML = 'Sorry, something went wrong. Please try again, or email us at <a href="mailto:pat@casarossa.estate">pat@casarossa.estate</a>.';
    } finally {
      button.disabled = false;
    }
  });
}
