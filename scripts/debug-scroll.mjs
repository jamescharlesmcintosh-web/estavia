import { chromium } from 'playwright'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await ctx.newPage()
page.on('console', (m) => {
  if (m.type() === 'error') console.log('ERR', m.text())
})

await page.goto('http://127.0.0.1:5174/?intro=skip', { waitUntil: 'networkidle' })
await page.waitForFunction(() => document.documentElement.dataset.intro === 'done', null, {
  timeout: 8000,
})
await page.waitForTimeout(800)

const info = await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const sections = [...document.querySelectorAll('[data-scene]')].map((el) => {
    const r = el.getBoundingClientRect()
    return {
      name: el.getAttribute('data-scene'),
      top: Math.round(r.top + window.scrollY),
      height: Math.round(el.offsetHeight),
      bottom: Math.round(r.top + window.scrollY + el.offsetHeight),
      topPct: +(((r.top + window.scrollY) / max) * 100).toFixed(1),
    }
  })
  return { max, scrollHeight: document.documentElement.scrollHeight, vh: window.innerHeight, sections }
})
console.log(JSON.stringify(info, null, 2))

const stops = [0, 0.08, 0.16, 0.26, 0.34, 0.42, 0.52, 0.62, 0.74, 0.86, 1]
for (const s of stops.slice(1)) {
  const y = Math.round(info.max * s)
  await page.evaluate((yy) => {
    if (window.__scrollTo) window.__scrollTo(yy)
    else window.scrollTo(0, yy)
    window.dispatchEvent(new Event('scroll'))
  }, y)
  await page.waitForTimeout(400)
  const sample = await page.evaluate(() => {
    const els = [...document.querySelectorAll('[data-scene]')]
    const active = els.find((el) => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.55
    })
    return {
      scrollY: Math.round(window.scrollY),
      activeScene: active?.getAttribute('data-scene') ?? null,
      railIndex: document.querySelector('[data-rail-index]')?.textContent ?? null,
      railLabel: document.querySelector('[data-rail-label]')?.textContent ?? null,
      navActive: [...document.querySelectorAll('[data-nav-link].is-active')].map((a) =>
        a.getAttribute('data-nav-link'),
      ),
      ctaActive: document.querySelector('[data-nav-cta]')?.classList.contains('is-active') ?? null,
    }
  })
  console.log(`p${Math.round(s * 100)}`, JSON.stringify(sample))
}

await browser.close()
