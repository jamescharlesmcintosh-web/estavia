import { chromium } from 'playwright'
import fs from 'node:fs'

const OUT = process.argv[2] || 'shots'
fs.mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'wide', width: 1920, height: 1080 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
]

const stops = [0, 0.08, 0.16, 0.26, 0.34, 0.42, 0.52, 0.62, 0.74, 0.86, 1]

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

async function shootIntro(out) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[intro] console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[intro] pageerror: ${e.message}`))

  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'domcontentloaded' })
  const marks = [
    { t: 600, name: '00-tilt' },
    { t: 1800, name: '01-pour' },
    { t: 3400, name: '02-fill' },
    { t: 5200, name: '03-approach' },
    { t: 5950, name: '04-clink' },
    { t: 6600, name: '05-bloom' },
    { t: 7400, name: '06-reveal' },
  ]
  let prev = 0
  for (const m of marks) {
    await page.waitForTimeout(m.t - prev)
    prev = m.t
    await page.screenshot({ path: `${OUT}/intro-${m.name}.png` })
  }
  await page.waitForTimeout(1500)
  await ctx.close()
}

for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${vp.name}] console: ${m.text()}`)
  })
  page.on('pageerror', (e) => errors.push(`[${vp.name}] pageerror: ${e.message}`))

  await page.goto('http://127.0.0.1:5174/?intro=skip', { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.documentElement.dataset.intro === 'done', null, {
    timeout: 8000,
  })
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${OUT}/${vp.name}-00-hero.png` })

  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  console.log(`[${vp.name}] max=${max}`)
  let i = 1
  for (const s of stops.slice(1)) {
    const target = Math.round(max * s)
    await page.evaluate((y) => {
      if (window.__scrollTo) window.__scrollTo(y)
      else window.scrollTo(0, y)
      window.dispatchEvent(new Event('scroll'))
    }, target)
    await page.waitForTimeout(1400)
    const pos = await page.evaluate(() => {
      const active = [...document.querySelectorAll('[data-scene]')].find((el) => {
        const r = el.getBoundingClientRect()
        return r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.55
      })
      return {
        y: Math.round(window.scrollY),
        scene: active?.getAttribute('data-scene') ?? null,
        rail: document.querySelector('[data-rail-index]')?.textContent ?? null,
        nav: [...document.querySelectorAll('[data-nav-link].is-active')].map((a) => a.getAttribute('data-nav-link')),
      }
    })
    console.log(
      `[${vp.name}] p${Math.round(s * 100)} target=${target} actual=${pos.y} scene=${pos.scene} rail=${pos.rail} nav=${pos.nav.join(',')}`,
    )
    await page.screenshot({ path: `${OUT}/${vp.name}-${String(i).padStart(2, '0')}-p${Math.round(s * 100)}.png` })
    i++
  }

  const overflow = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }))
  if (overflow.sw > overflow.cw + 1) {
    errors.push(`[${vp.name}] horizontal overflow ${overflow.sw} > ${overflow.cw}`)
  }

  await ctx.close()
}

await shootIntro(OUT)

await browser.close()
fs.writeFileSync(`${OUT}/errors.txt`, errors.join('\n') || 'no errors')
console.log(errors.length ? errors.join('\n') : 'no errors')
