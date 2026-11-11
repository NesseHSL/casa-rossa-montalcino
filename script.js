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

// Photos, grouped as on the gallery page
const categories = [
  { id: "main-house", title: "The main house", photos: [
    ["kitchen", "The kitchen"],
    ["kitchen-dining", "Kitchen and dining"],
    ["dining-kitchen-arch", "Dining table, with the kitchen through the brick arch"],
    ["kitchen-spices", "Kitchen shelves"],
    ["dining-2", "Formal dining room"],
    ["dining", "Dining room"],
    ["living-area2", "Winter sitting room"],
    ["winter-sitting-sofa", "Winter sitting room, buttoned sofa beneath a gilt mirror"],
    ["living-area", "The lounge"],
    ["lounge-fireplace", "The lounge fireplace"],
    ["lounge-fireplace-chair", "Leather armchair beside the lounge fireplace"],
    ["lounge-games", "TV and games room"],
    ["french-doors-sunset", "Arched glass doors onto the garden at sunset"],
    ["stairwell", "Gallery staircase"],
  ] },
  { id: "bedrooms", title: "Bedrooms", intro: "Five bedrooms, each with its own en-suite bathroom.", groups: [
    { title: "Bedroom one", note: "The principal bedroom, with a chandelier and sweeping vineyard views. En-suite with a freestanding bath, twin basins, walk-in shower and fireplace.",
      // Fixed desktop columns (left, centre, right); narrower screens use the photo order below
      columns: [["01", "04", "09"], ["05", "10", "07", "12"], ["03", "02", "08"]].map((col) => col.map((n) => "bedroom-1-" + n)),
      photos: [
      ["bedroom-1-01", "Bedroom one"],
      ["bedroom-1-05", "Bedroom one en-suite, freestanding bath and fireplace"],
      ["bedroom-1-03", "Bedroom one, beamed ceiling and silk curtains"],
      ["bedroom-1-04", "Bedroom one, the full-length mirror"],
      ["bedroom-1-10", "View of the vineyards from bedroom one"],
      ["bedroom-1-02", "Bedroom one, the carved bed beneath wall lights and a chandelier"],
      ["bedroom-1-09", "Bedroom one en-suite, walk-in shower"],
      ["bedroom-1-07", "Bedroom one en-suite, twin basins"],
      ["bedroom-1-08", "Bedroom one en-suite, twin basins and window"],
      ["bedroom-1-12", "Evening view from bedroom one"],
    ] },
    { title: "Bedroom two", note: "Double-height, with a ladder up to a mezzanine platform. En-suite with a walk-in shower.", photos: [
      ["bedroom-2-01", "Bedroom two"],
      ["bedroom-2-02", "Bedroom two, windows on two sides"],
      ["bedroom-2-03", "Bedroom two, looking up to the mezzanine"],
      ["bedroom-2-04", "Bedroom two, the ladder to the mezzanine"],
      ["bedroom-2-05", "Bedroom two en-suite, walk-in shower"],
      ["bedroom-2-06", "Bedroom two en-suite, stone basin"],
      ["bedroom-2-07", "Bedroom two en-suite, oval mirror"],
      ["bedroom-2-08", "View over the olive trees from bedroom two"],
    ] },
    { title: "Bedroom three", note: "With its own door out onto the loggia. En-suite with a walk-in shower.",
      columns: [["01", "05"], ["03", "08"], ["02", "06", "04"]].map((col) => col.map((n) => "bedroom-3-" + n)),
      photos: [
      ["bedroom-3-01", "Bedroom three, with the door to the loggia"],
      ["bedroom-3-03", "The loggia, seen from the bedroom three doorway"],
      ["bedroom-3-02", "Bedroom three, the door open onto the loggia"],
      ["bedroom-3-05", "Bedroom three en-suite"],
      ["bedroom-3-08", "View through the arched window in bedroom three"],
      ["bedroom-3-06", "Bedroom three en-suite, basin and walk-in shower"],
      ["bedroom-3-04", "View from the loggia"],
    ] },
    { title: "Bedroom four", note: "Carved white bed and a feather pendant light. En-suite with a bath and a step-in shower.", photos: [
      ["bedroom-4-01", "Bedroom four"],
      ["bedroom-4-02", "Bedroom four, the carved white bed"],
      ["bedroom-4-03", "Bedroom four, feather pendant light"],
      ["bedroom-4-04", "Bedroom four, looking through to the en-suite"],
      ["bedroom-4-05", "Bedroom four en-suite, basin and gilt mirror"],
      ["bedroom-4-06", "Bedroom four en-suite, the bath"],
      ["bedroom-4-07", "Bedroom four en-suite, the bath beneath the window"],
      ["bedroom-4-08", "View over the garden and hills from bedroom four"],
    ] },
    { title: "Bedroom five", note: "On the ground floor, with a painted bed and glass doors leading outside. En-suite with a bath and a step-in shower.", 
      columns: [["01", "02", "03"], ["07", "04"], ["06"]].map((col) => col.map((n) => "bedroom-5-" + n)),
      photos: [
      ["bedroom-5-01", "Bedroom five"],
      ["bedroom-5-07", "Bedroom five en-suite, stone basin beneath a gilt mirror and candle sconces"],
      ["bedroom-5-06", "View through the ornamental grasses from bedroom five"],
      ["bedroom-5-02", "Bedroom five, the painted bed"],
      ["bedroom-5-04", "Bedroom five en-suite, the bath"],
      ["bedroom-5-03", "Bedroom five, glass doors leading outside"],
    ] },
  ] },
  { id: "pool-house", title: "The pool house", photos: [
    ["pool-house-room", "The pool house, looking through to the dining table and fireplace"],
    ["pool-house-sitting", "Pool house sitting area with glass doors onto the garden"],
    ["pool-house-dining", "Pool house dining table, with the terrace beyond"],
    ["pool-house-kitchen", "Pool house kitchen"],
    ["pool-house-bread-oven", "The wood-fired bread oven in the pool house"],
    ["pool-house-oven-fire", "Fire burning in the bread oven"],
    ["pool-house-bathroom", "Pool house bathroom"],
  ] },
  { id: "outdoor-dining", title: "Outdoor dining", photos: [] },
  { id: "garden", title: "Garden and pool", photos: [
    ["pool3", "Saltwater pool framed by cypresses"],
    ["pool", "The pool at dusk"],
    ["pool2", "Poolside chairs facing the hills"],
    ["vineyard-cypress", "Cypress trees and vineyards below Casa Rossa"],
    ["olive-groves", "Olive groves"],
    ["outside-wildflowers", "Wildflower garden"],
    ["outside-entrance", "Courtyard entrance"],
    ["pizza-oven", "The old bread oven"],
  ] },
];
const featured = ["vineyard-cypress", "pool3", "kitchen", "living-area2", "outside-wildflowers", "dining-2"];
const photosOf = (c) => c.groups ? c.groups.flatMap((g) => g.photos) : c.photos;
const allPhotos = categories.flatMap(photosOf);

// Thumbnail sizes, so the gallery columns lay out correctly before photos load
const SIZES = {"bedroom-1-01":[600,800],"bedroom-1-02":[600,800],"bedroom-1-03":[600,800],"bedroom-1-04":[572,800],"bedroom-1-05":[800,600],"bedroom-1-06":[600,800],"bedroom-1-07":[800,600],"bedroom-1-08":[800,748],"bedroom-1-09":[600,800],"bedroom-1-10":[600,800],"bedroom-1-11":[600,800],"bedroom-1-12":[600,800],"bedroom-2-01":[600,800],"bedroom-2-02":[800,600],"bedroom-2-03":[600,800],"bedroom-2-04":[600,800],"bedroom-2-05":[600,800],"bedroom-2-06":[600,800],"bedroom-2-07":[600,800],"bedroom-2-08":[600,800],"bedroom-3-01":[800,684],"bedroom-3-02":[800,600],"bedroom-3-03":[600,956],"bedroom-3-04":[800,600],"bedroom-3-05":[600,800],"bedroom-3-06":[600,800],"bedroom-3-07":[600,800],"bedroom-3-08":[600,705],"bedroom-3-09":[600,800],"bedroom-4-01":[600,800],"bedroom-4-02":[600,800],"bedroom-4-03":[600,800],"bedroom-4-04":[600,800],"bedroom-4-05":[600,800],"bedroom-4-06":[600,800],"bedroom-4-07":[600,800],"bedroom-4-08":[600,800],"bedroom-5-01":[800,600],"bedroom-5-02":[800,600],"bedroom-5-03":[800,600],"bedroom-5-04":[600,800],"bedroom-5-05":[600,800],"bedroom-5-06":[600,800],"bedroom-5-07":[600,734],"dining-2":[800,600],"dining-formal":[768,1024],"dining":[800,600],"french-doors":[800,684],"dining-kitchen-arch":[640,480],"lounge-fireplace-chair":[427,640],"winter-sitting-sofa":[640,522],"pool-house-room":[406,640],"pool-house-sitting":[800,600],"pool-house-dining":[800,600],"pool-house-kitchen":[800,679],"pool-house-bread-oven":[600,800],"pool-house-oven-fire":[800,546],"pool-house-bathroom":[493,531],"french-doors-sunset":[480,640],"lounge-fireplace":[800,597],"kitchen-dining":[800,600],"kitchen":[800,560],"kitchen-spices":[800,600],"living-area":[800,600],"living-area2":[800,644],"lounge-games":[800,600],"olive-groves":[800,600],"outside-entrance":[800,600],"outside-wildflowers":[800,600],"pizza-oven":[800,736],"pool":[800,600],"pool2":[800,600],"pool3":[800,600],"stairwell":[800,600],"vineyard-cypress":[800,600],"winter-sitting":[427,640]};
let lightboxList = [];
function thumb(slug, alt) {
  const b = document.createElement("button");
  b.setAttribute("aria-label", "Open photo: " + alt);
  const [w, h] = SIZES[slug] || [];
  b.innerHTML = `<img src="images/${slug}-sm.jpg" alt="${alt}" loading="lazy"${w ? ` width="${w}" height="${h}" style="aspect-ratio: ${w} / ${h}"` : ""}>`;
  b.addEventListener("click", () => openLightbox(lightboxList.findIndex((p) => p[0] === slug)));
  return b;
}

// Home page: a short preview
const grid = document.getElementById("gallery-grid");
if (grid) {
  lightboxList = featured.map((s) => allPhotos.find((p) => p[0] === s));
  lightboxList.forEach(([slug, alt]) => grid.appendChild(thumb(slug, alt)));
}

// Gallery page: headed sections with jump links
const sections = document.getElementById("gallery-sections");
if (sections) {
  lightboxList = allPhotos;
  const tabs = document.getElementById("gallery-tabs");
  categories.forEach((c) => {
    tabs.insertAdjacentHTML("beforeend", `<a href="#${c.id}">${c.title}</a>`);
    const sec = document.createElement("section");
    sec.className = "gallery-section";
    sec.id = c.id;
    sec.innerHTML = `<h2>${c.title}</h2>`;
    const addGrid = (photos, columns) => {
      const g = document.createElement("div");
      g.className = "gallery-grid";
      if (columns) {
        g.classList.add("gallery-cols");
        columns.forEach((col) => {
          const colEl = document.createElement("div");
          colEl.className = "gallery-col";
          col.forEach((slug) => colEl.appendChild(thumb(slug, photos.find((p) => p[0] === slug)[1])));
          g.appendChild(colEl);
        });
      } else {
        photos.forEach(([slug, alt]) => g.appendChild(thumb(slug, alt)));
      }
      sec.appendChild(g);
    };
    if (c.intro) sec.insertAdjacentHTML("beforeend", `<p class="muted gallery-intro">${c.intro}</p>`);
    if (c.groups) {
      c.groups.forEach((group) => {
        sec.insertAdjacentHTML("beforeend", `<h3 class="gallery-group-title">${group.title}</h3><p class="muted gallery-group-note">${group.note}</p>`);
        addGrid(group.photos, group.columns);
      });
    } else if (c.photos.length) {
      addGrid(c.photos);
    } else {
      sec.insertAdjacentHTML("beforeend", `<p class="plan-note">Photographs to come</p>`);
    }
    sections.appendChild(sec);
  });
}

// Lightbox (home and gallery pages only)
const lb = document.getElementById("lightbox");
const lbImg = lb && lb.querySelector("img");
let current = 0;
function show(i) {
  current = (i + lightboxList.length) % lightboxList.length;
  lbImg.src = `images/${lightboxList[current][0]}.jpg`;
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

// Availability weeks (Saturday to Saturday, summer 2027)
const weeks = [
  ["24 July", "31 July"],
  ["31 July", "7 August"],
  ["7 August", "14 August"],
  ["14 August", "21 August"],
  ["21 August", "28 August"],
  ["28 August", "4 September"],
  ["4 September", "11 September"],
];
const weeksEl = document.getElementById("weeks");
const select = document.getElementById("week");
weeks.forEach(([from, to], i) => {
  if (weeksEl) {
    const d = document.createElement("div");
    d.className = "week";
    d.innerHTML = `<small>Week ${i + 1}</small><strong>${from} to ${to}</strong><span>Available</span>`;
    weeksEl.appendChild(d);
  }
});
if (select) {
  select.add(new Option("Choose a week", ""));
  weeks.forEach(([from, to], i) => select.add(new Option(`Week ${i + 1}: ${from} to ${to}`, `Week ${i + 1}`)));
  select.add(new Option("More than one week / flexible", "flexible"));
}

// Enquiry form is not connected yet in this draft
const form = document.getElementById("enquiry-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("form-note").textContent = "Draft only: the enquiry form will be connected before the site goes live.";
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
      note.textContent = "Sorry, something went wrong. Please try again, or email us directly.";
    } finally {
      button.disabled = false;
    }
  });
}
