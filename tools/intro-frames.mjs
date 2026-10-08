import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "shots/intro-ref";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// key beats of the pour, in virtual milliseconds
const marks = [
  [200, "00-opening"],
  [550, "01-glass-tilts"],
  [900, "02-tilt-deep"],
  [1300, "03-pour-begins"],
  [1700, "04-pour"],
  [2100, "05-pour-flow"],
  [2500, "06-filling"],
  [2950, "07-fill-rising"],
  [3400, "08-fill-full"],
  [3900, "09-approach"],
  [4400, "10-approach-close"],
  [4900, "11-nearly-touch"],
  [5350, "12-clink"],
  [5700, "13-clink-peak"],
  [6100, "14-bloom"],
  [6550, "15-bloom-wide"],
  [7100, "16-reveal"],
  [7800, "17-reveal-settled"],
  [8800, "18-site-arrives"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// freeze the clock so the intro only advances when we say so
await page.clock.install();
await page.goto("http://127.0.0.1:5174/", { waitUntil: "domcontentloaded" });

let virtual = 0;
const saved = [];
for (const [t, name] of marks) {
  await page.clock.runFor(t - virtual);
  virtual = t;
  const f = `${OUT}/${name}.png`;
  const t0 = Date.now();
  try {
    await page.screenshot({ path: f, timeout: 30000 });
    saved.push({ t, name, f });
    console.log(`· ${name} @ ${t}ms   (${Date.now() - t0}ms)`);
  } catch (e) {
    console.log(`✗ ${name} @ ${t}ms  ${String(e).split("\n")[0]}`);
    try {
      await page.screenshot({ path: f, timeout: 30000, scale: "css" });
      saved.push({ t, name, f });
      console.log(`  ↳ recovered at css scale`);
    } catch {
      console.log(`  ↳ skipped`);
    }
  }
}

await browser.close();

// ── contact sheet ─────────────────────────────────────────
const cards = saved
  .map(
    (s, i) => `
    <figure class="card">
      <a href="${s.name}.png" target="_blank">
        <img src="${s.name}.png" alt="${s.name}" loading="lazy" />
      </a>
      <figcaption>
        <b>${String(i).padStart(2, "0")}</b>
        <span>${s.name.replace(/^\d+-/, "").replace(/-/g, " ")}</span>
        <em>${s.t} ms</em>
      </figcaption>
    </figure>`,
  )
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
  <p class="sub">${saved.length} frames · 1600×1000 @ 2× · captured off the live site · click any frame for the full file</p>
  <div class="grid">${cards}</div>
  <p class="note">
    <b>Pour</b> runs roughly 1.3–3.4s · <b>approach</b> 3.9–5.2s ·
    <b>clink</b> lands at 5.35–5.7s · <b>bloom</b> 6.1–6.6s · the site reveals from 7.1s.
    <br /><br />
    Frames were frozen with a virtual clock, so each one is an exact moment in the sequence
    rather than a guess at the right time.
  </p>
</body></html>`;

fs.writeFileSync(`${OUT}/index.html`, html);
console.log(`\n${saved.length} frames + contact sheet → ${OUT}`);
console.log("errors:", errors.length ? errors.join(" | ") : "none");

