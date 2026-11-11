// Builds the site from src/ (page templates) and content/ (the text and photos Pat edits in Pages CMS).
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CONTENT = ["settings", "home", "house", "area", "services", "booking", "gallery"];
const LARGE = 2000; // longest side for full-size photos
const SMALL = 800; // longest side for thumbnails

// Every image under images/, keyed by its public path ("/images/x.jpg"), with the
// URLs and sizes of the full-size and thumbnail versions the pages use.
const images = {};

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);

const isImage = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const smName = (f) => f.replace(/\.[^.]+$/, "-sm.jpg");
const upright = (m) => (m.orientation >= 5 ? [m.height, m.width] : [m.width, m.height]);

async function processImages(outDir) {
  const files = walk("images").filter(isImage);
  const have = new Set(files);
  for (const file of files) {
    const out = path.join(outDir, file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const meta = await sharp(file).metadata();
    const [w, h] = upright(meta);
    const isSm = /-sm\.jpg$/i.test(file);
    let full = { url: file, w, h };
    // Photos straight off a phone: shrink, turn the right way up, and strip
    // hidden details such as GPS location before they go on the website.
    if (!isSm && (Math.max(w, h) > LARGE || meta.exif)) {
      const info = await sharp(file).rotate().resize(LARGE, LARGE, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true }).toFile(out.replace(/\.[^.]+$/, ".jpg"));
      full = { url: file.replace(/\.[^.]+$/, ".jpg"), w: info.width, h: info.height };
    } else {
      fs.copyFileSync(file, out);
    }
    let small = full;
    if (!isSm) {
      const smFile = smName(file);
      if (have.has(smFile)) {
        const [sw, sh] = upright(await sharp(smFile).metadata());
        small = { url: smFile, w: sw, h: sh };
      } else {
        const info = await sharp(file).rotate().resize(SMALL, SMALL, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(outDir, smFile));
        small = { url: smFile, w: info.width, h: info.height };
      }
    }
    images["/" + file] = { full, small };
  }
}

const img = (p) => {
  const key = !p ? "" : p.startsWith("/") ? p : "/" + p;
  const found = images[key];
  if (!found) throw new Error(`Photo not found: ${p}`);
  return found;
};

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Plain text with a few simple marks: *italic*, **bold**, [link text](page.html) and [[placeholder]]
const inline = (s) => escapeHtml(s)
  .replace(/\[\[(.+?)\]\]/g, '<span class="todo">$1</span>')
  .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.+?)\*/g, "<em>$1</em>");

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Gallery: place each photo in its chosen column (Left, Centre, Right). Photos with no
// column go wherever the columns are shortest. `i` is the photo's place in the lightbox.
function arrange(sections) {
  let i = 0;
  const cols = (photos) => {
    const out = [[], [], []];
    const height = [0, 0, 0];
    for (const p of photos || []) {
      if (!p.image) continue;
      const { small } = img(p.image);
      let c = { Left: 0, Centre: 1, Right: 2 }[p.column];
      if (c === undefined) c = height.indexOf(Math.min(...height));
      out[c].push({ ...p, i: i++ });
      height[c] += small.h / small.w;
    }
    return out;
  };
  return (sections || []).map((s) => ({
    ...s,
    id: s.id || slug(s.title),
    columns: s.photos && s.photos.length ? cols(s.photos) : null,
    groups: (s.groups || []).map((g) => ({ ...g, columns: cols(g.photos) })),
  }));
}

export default function (eleventyConfig) {
  for (const name of CONTENT) {
    eleventyConfig.addGlobalData(name, () => JSON.parse(fs.readFileSync(`content/${name}.json`, "utf8")));
  }
  eleventyConfig.on("eleventy.before", async ({ directories }) => processImages(directories.output));

  eleventyConfig.addFilter("full", (p) => img(p).full.url);
  eleventyConfig.addFilter("small", (p) => img(p).small.url);
  eleventyConfig.addFilter("size", (p, which = "small") => {
    const v = img(p)[which];
    return `width="${v.w}" height="${v.h}"`;
  });
  eleventyConfig.addFilter("inline", inline);
  eleventyConfig.addFilter("arrange", arrange);

  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("script.js");
  eleventyConfig.addPassthroughCopy("register.html");
  eleventyConfig.addWatchTarget("content/");
  eleventyConfig.addWatchTarget("images/");

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    htmlTemplateEngine: "njk",
  };
}
