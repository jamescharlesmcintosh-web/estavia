import { chromium } from "playwright";

const BASE = "http://127.0.0.1:5174";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE + "/?intro=skip", { waitUntil: "domcontentloaded" });

const files = process.argv.slice(2);

const analyze = async (src) =>
  await page.evaluate(async (url) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    await img.decode();
    const W = 160,
      H = 100;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d");
    x.drawImage(img, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data;

    let r = 0, g = 0, b = 0, lum = 0, n = 0;
    let topL = 0, botL = 0, topN = 0, botN = 0;
    let topB = 0, botB = 0, topR = 0, botR = 0;
    let gold = 0, goldN = 0;

    // brightest horizontal band = where the waterline crest is
    const rows = new Array(H).fill(0);
    for (let y = 0; y < H; y++) {
      let s = 0;
      for (let i = 0; i < W; i++) {
        const k = (y * W + i) * 4;
        s += (d[k] + d[k + 1] + d[k + 2]) / 3;
      }
      rows[y] = s / W;
    }

    for (let y = 0; y < H; y++) {
      for (let i = 0; i < W; i++) {
        const k = (y * W + i) * 4;
        const R = d[k], G = d[k + 1], B = d[k + 2];
        const L = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 255;
        r += R; g += G; b += B; lum += L; n++;
        if (y < H * 0.25) { topL += L; topB += B; topR += R; topN++; }
        if (y > H * 0.75) { botL += L; botB += B; botR += R; botN++; }
        if (L > 0.35 && R > B + 18 && G > B) { gold++; goldN++; }
        if (L > 0.02) goldN++;
      }
    }

    let brightY = 0;
    for (let y = 1; y < H - 1; y++) if (rows[y] > rows[brightY]) brightY = y;

    const band = rows.slice(Math.max(0, brightY - 6), Math.min(H, brightY + 7));
    const bandAvg = band.reduce((a, v) => a + v, 0) / band.length;

    return {
      avg: `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`,
      lum: +(lum / n).toFixed(3),
      blueness: +(((b - r) / n) / 255).toFixed(3),
      topLum: +(topL / topN).toFixed(3),
      botLum: +(botL / botN).toFixed(3),
      topWarm: +((topR - topB) / topN / 255).toFixed(3),
      botWarm: +((botR - botB) / botN / 255).toFixed(3),
      goldPx: +((gold / goldN) * 100).toFixed(1),
      crestY: +((brightY / H) * 100).toFixed(0),
      crestSharp: +bandAvg.toFixed(1),
    };
  }, `${BASE}/${src}`);

console.log(
  "file".padEnd(24),
  "avg".padEnd(17),
  "lum".padEnd(6),
  "blue".padEnd(6),
  "topL".padEnd(6),
  "botL".padEnd(6),
  "topWarm".padEnd(8),
  "botWarm".padEnd(8),
  "gold%".padEnd(6),
  "crestY%",
);
for (const f of files) {
  const a = await analyze(f);
  console.log(
    f.replace("shots/descent/", "").padEnd(24),
    a.avg.padEnd(17),
    String(a.lum).padEnd(6),
    String(a.blueness).padEnd(6),
    String(a.topLum).padEnd(6),
    String(a.botLum).padEnd(6),
    String(a.topWarm).padEnd(8),
    String(a.botWarm).padEnd(8),
    String(a.goldPx).padEnd(6),
    a.crestY,
  );
}

await browser.close();
