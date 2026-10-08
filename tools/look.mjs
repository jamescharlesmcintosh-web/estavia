import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5174";
const OUT = "shots/look";
const browser = await chromium.launch();

const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push("CONSOLE " + m.text());
});

// --- intro first (this is the first 10 seconds) ---
await page.goto(BASE, { waitUntil: "domcontentloaded" });
let prev = 0;
for (const m of [
  { t: 700, name: "i0-tilt" },
  { t: 1900, name: "i1-pour" },
  { t: 3500, name: "i2-fill" },
  { t: 5200, name: "i3-approach" },
  { t: 6000, name: "i4-clink" },
  { t: 6700, name: "i5-bloom" },
  { t: 8000, name: "i6-reveal" },
]) {
  await page.waitForTimeout(m.t - prev);
  prev = m.t;
  await page.screenshot({ path: `${OUT}/${m.name}.png` });
}

// --- the body ---
await page.goto(`${BASE}/?intro=skip`, { waitUntil: "networkidle" });
await page.waitForFunction(() => document.documentElement.dataset.intro === "done", null, {
  timeout: 10000,
});
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const scenes = [...document.querySelectorAll("[data-scene]")].map((el) => ({
    scene: el.dataset.scene,
    label: el.dataset.label,
    h: Math.round(el.offsetHeight),
  }));
  return {
    scrollH: document.documentElement.scrollHeight,
    viewH: window.innerHeight,
    max: document.documentElement.scrollHeight - window.innerHeight,
    scenes,
    hasScrollTo: typeof window.__scrollTo === "function",
  };
});
console.log(JSON.stringify(info, null, 1));

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/s00-hero.png` });

const max = info.max;
const stops = [0.1, 0.2, 0.3, 0.42, 0.54, 0.66, 0.78, 0.9, 1.0];
let i = 1;
for (const s of stops) {
  await page.evaluate((y) => {
    if (window.__scrollTo) window.__scrollTo(y);
    else window.scrollTo(0, y);
    window.dispatchEvent(new Event("scroll"));
  }, Math.round(max * s));
  await page.waitForTimeout(1300);
  const pos = await page.evaluate(() => {
    const act = [...document.querySelectorAll("[data-scene]")].find((el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.55;
    });
    return {
      scene: act?.dataset.scene ?? null,
      rail: document.querySelector("[data-rail-index]")?.textContent,
      label: document.querySelector("[data-rail-label]")?.textContent,
    };
  });
  console.log(`p${Math.round(s * 100)}  scene=${pos.scene}  rail=${pos.rail}  "${pos.label}"`);
  await page.screenshot({ path: `${OUT}/s${String(i).padStart(2, "0")}-p${Math.round(s * 100)}.png` });
  i++;
}

const overflow = await page.evaluate(() => ({
  sw: document.documentElement.scrollWidth,
  cw: document.documentElement.clientWidth,
}));
console.log("overflow", JSON.stringify(overflow));
console.log("errors:", errors.length ? errors.join(" | ") : "none");

await browser.close();
