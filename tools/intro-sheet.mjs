import fs from "node:fs";

const OUT = "shots/intro-ref";
const files = fs
  .readdirSync(OUT)
  .filter((f) => f.endsWith(".png"))
  .sort();

const msOf = (n) => {
  const map = {
    "00-opening": 200, "01-glass-tilts": 550, "02-tilt-deep": 900,
    "03-pour-begins": 1300, "04-pour": 1700, "05-pour-flow": 2100,
    "06-filling": 2500, "07-fill-rising": 2950, "08-fill-full": 3400,
    "09-approach": 3900, "10-approach-close": 4400, "11-nearly-touch": 4900,
    "12-clink": 5350, "13-clink-peak": 5700, "14-bloom": 6100,
    "15-bloom-wide": 6550, "16-reveal": 7100, "17-reveal-settled": 7800,
    "18-site-arrives": 8800,
  };
  const key = n.replace(/\.png$/, "");
  return map[key] ?? 0;
};

const cards = files
  .map((f, i) => {
    const label = f.replace(/^\d+-/, "").replace(/\.png$/, "").replace(/-/g, " ");
    return `
    <figure class="card">
      <a href="${f}" target="_blank"><img src="${f}" alt="${f}" loading="lazy" /></a>
      <figcaption>
        <b>${String(i).padStart(2, "0")}</b>
        <span>${label}</span>
        <em>${msOf(f)} ms</em>
      </figcaption>
    </figure>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<title>Estavia intro — reference frames</title>
<style>
  :root { --bg:#12100e; --ink:#f3e8d8; --dim:#a3947f; --gold:#d4a86a; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink);
         font:13px/1.5 "SFMono-Regular",Consolas,monospace; padding:32px 28px 80px; }
  h1 { font:600 32px/1.1 Georgia,serif; margin:0 0 8px; letter-spacing:.01em; }
  h1 span { color:var(--gold); }
  .sub { color:var(--dim); margin:0 0 34px; letter-spacing:.1em;
         text-transform:uppercase; font-size:11px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(460px,1fr)); gap:24px; }
  .card { margin:0; background:#1b1815; border:1px solid #2c2620; border-radius:10px; overflow:hidden; }
  .card img { display:block; width:100%; height:auto; background:#000; }
  .card a { display:block; }
  figcaption { display:flex; align-items:baseline; gap:12px; padding:12px 15px 14px;
               border-top:1px solid #2c2620; }
  figcaption b { color:var(--gold); font-size:15px; }
  figcaption span { text-transform:capitalize; letter-spacing:.06em; }
  figcaption em { margin-left:auto; color:var(--dim); font-style:normal; font-size:11px; }
  .note { margin:36px 0 0; padding:18px 20px; background:#1b1815;
          border-left:2px solid var(--gold); color:var(--dim); max-width:74ch; line-height:1.7; }
  .note b { color:var(--ink); }
</style></head>
<body>
  <h1>Estavia <span>intro</span> — reference frames</h1>
  <p class="sub">${files.length} frames · 1600×1000 · captured off the live site · click any frame for the full file</p>
  <div class="grid">${cards}</div>
  <p class="note">
    <b>Pour</b> runs roughly 1.3–3.4s · <b>approach</b> 3.9–5.2s ·
    <b>clink</b> lands at 5.35–5.7s · <b>bloom</b> from 6.1s.
    <br /><br />
    Each frame was frozen with a virtual clock, so these are exact moments in the sequence
    rather than guesses at the right time. The PNGs are in <b>estavia/shots/intro-ref/</b>.
  </p>
</body></html>`;

fs.writeFileSync(`${OUT}/index.html`, html);
console.log(`${files.length} frames indexed → ${OUT}/index.html`);
console.log(files.join("\n"));
