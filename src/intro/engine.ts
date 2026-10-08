import gsap from 'gsap'
import { clamp01, rand } from '../lib/state'

export type IntroPhase =
  | 'idle'
  | 'tilt'
  | 'pour'
  | 'fill'
  | 'separate'
  | 'approach'
  | 'clink'
  | 'bloom'
  | 'done'

export type IntroState = {
  t: number
  bottleRot: number
  bottleIn: number
  stream: number
  env: number
  fill: number
  sep: number
  clinkFlash: number
  bloom: number
  siteReveal: number
  phase: IntroPhase
}

export type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  kind: 0 | 1 | 2 | 3 | 4 | 5 | 6
  rot: number
  vr: number
  seed: number
}

const GOLD = '#d4a86a'
const GOLD_HI = '#f0d9a0'
const BLUSH = '#e8a8ae'
const IVORY = '#f7efe2'

function smooth01(x: number) {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

function spawnBurst(particles: Particle[], x: number, y: number, w: number, h: number) {
  const n = Math.min(520, Math.floor((w * h) / 2800))
  for (let i = 0; i < n; i++) {
    const a = rand(i * 3.1) * Math.PI * 2
    const sp = 1.2 + rand(i * 7.7) * (w * 0.0045)
    const kindRoll = rand(i * 11.3)
    let kind: Particle['kind'] = 0
    if (kindRoll < 0.22) kind = 0
    else if (kindRoll < 0.42) kind = 1
    else if (kindRoll < 0.58) kind = 2
    else if (kindRoll < 0.72) kind = 3
    else if (kindRoll < 0.88) kind = 4
    else if (kindRoll < 0.95) kind = 5
    else kind = 6
    particles.push({
      x: x + (rand(i * 13.7) - 0.5) * 30,
      y: y + (rand(i * 17.1) - 0.5) * 30,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.6,
      life: 0,
      max: 1.4 + rand(i * 19.3) * 2.2,
      size:
        kind === 4
          ? 8 + rand(i * 23.9) * 42
          : kind === 1
            ? 3 + rand(i * 5.5) * 10
            : 1.5 + rand(i * 5.5) * 5,
      kind,
      rot: rand(i * 29.1) * Math.PI * 2,
      vr: (rand(i * 31.7) - 0.5) * 0.12,
      seed: rand(i * 37.9),
    })
  }
}

export function runIntro(opts: {
  canvas: HTMLCanvasElement
  overlay: HTMLElement
  reduced: boolean
  onDone: () => void
}) {
  const { canvas, overlay, reduced, onDone } = opts
  const maybeCtx = canvas.getContext('2d')
  if (!maybeCtx) {
    document.documentElement.dataset.intro = 'done'
    overlay.remove()
    onDone()
    return () => {}
  }
  const ctx: CanvasRenderingContext2D = maybeCtx

  const s: IntroState = {
    t: 0,
    bottleRot: -18,
    bottleIn: 0,
    stream: 0,
    env: 0,
    fill: 0,
    sep: 0,
    clinkFlash: 0,
    bloom: 0,
    siteReveal: 0,
    phase: 'idle',
  }
  const particles: Particle[] = []
  let w = 0
  let h = 0
  let dpr = 1
  let raf = 0
  let last = performance.now()
  let finished = false
  let bloomSpawned = false
  let skipped = false

  const bubbles: { x: number; y: number; r: number; sp: number; seed: number }[] = []
  for (let i = 0; i < 46; i++) {
    bubbles.push({
      x: rand(i * 3.3),
      y: rand(i * 5.1),
      r: 1 + rand(i * 7.7) * 3.5,
      sp: 0.15 + rand(i * 9.2) * 0.45,
      seed: rand(i * 11.1),
    })
  }

  const resize = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1)
    w = window.innerWidth
    h = window.innerHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const scale = () => Math.min(w, h) / 900

  const bottlePivot = () => ({ x: w * 0.5, y: -h * 0.12 })

  const mouthLocal = () => h * 0.4

  const bottleMouth = () => {
    const { x, y } = bottlePivot()
    const rad = (s.bottleRot * Math.PI) / 180
    const ly = mouthLocal()
    return {
      x: x - ly * Math.sin(rad),
      y: y + ly * Math.cos(rad),
    }
  }

  const glassPos = () => {
    const cy = h * 0.62
    const base = Math.min(Math.max(w * 0.08, 56), 110)
    const sep = s.sep * base
    return {
      lx: w * 0.5 - base * 0.62 - sep,
      rx: w * 0.5 + base * 0.62 + sep,
      y: cy,
    }
  }

  function drawBottle() {
    const { x: bx, y: by } = bottlePivot()
    const k = scale()
    const ly = mouthLocal()
    ctx.save()
    ctx.translate(bx, by)
    ctx.rotate((s.bottleRot * Math.PI) / 180)
    ctx.globalAlpha = s.bottleIn

    const bw = 70 * k
    const neckW = 15 * k
    const bodyH = ly * 0.55
    const neckH = ly * 0.45

    const grad = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0)
    grad.addColorStop(0, '#0e0906')
    grad.addColorStop(0.3, '#241810')
    grad.addColorStop(0.5, '#322214')
    grad.addColorStop(0.7, '#241810')
    grad.addColorStop(1, '#0e0906')

    ctx.beginPath()
    ctx.moveTo(-bw * 0.42, 0)
    ctx.lineTo(-bw * 0.5, bodyH * 0.1)
    ctx.lineTo(-bw * 0.5, bodyH * 0.85)
    ctx.quadraticCurveTo(-bw * 0.5, bodyH, -bw * 0.3, bodyH)
    ctx.lineTo(bw * 0.3, bodyH)
    ctx.quadraticCurveTo(bw * 0.5, bodyH, bw * 0.5, bodyH * 0.85)
    ctx.lineTo(bw * 0.5, bodyH * 0.1)
    ctx.lineTo(bw * 0.42, 0)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(-bw * 0.48, 0)
    ctx.lineTo(bw * 0.48, 0)
    ctx.lineTo(bw * 0.42, -8 * k)
    ctx.lineTo(-bw * 0.42, -8 * k)
    ctx.closePath()
    ctx.fillStyle = '#1a120c'
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(-bw * 0.5, bodyH * 0.85)
    ctx.quadraticCurveTo(-bw * 0.28, bodyH + neckH * 0.15, -neckW, bodyH + neckH * 0.2)
    ctx.lineTo(-neckW, ly)
    ctx.lineTo(neckW, ly)
    ctx.lineTo(neckW, bodyH + neckH * 0.2)
    ctx.quadraticCurveTo(bw * 0.28, bodyH + neckH * 0.15, bw * 0.5, bodyH * 0.85)
    ctx.quadraticCurveTo(bw * 0.5, bodyH, bw * 0.3, bodyH)
    ctx.lineTo(-bw * 0.3, bodyH)
    ctx.quadraticCurveTo(-bw * 0.5, bodyH, -bw * 0.5, bodyH * 0.85)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    const foilTop = ly - neckH * 0.55
    const fg = ctx.createLinearGradient(-neckW, 0, neckW, 0)
    fg.addColorStop(0, '#8a6a34')
    fg.addColorStop(0.4, GOLD_HI)
    fg.addColorStop(0.55, GOLD)
    fg.addColorStop(1, '#8a6a34')
    ctx.fillStyle = fg
    ctx.fillRect(-neckW - 2 * k, foilTop, (neckW + 2 * k) * 2, ly - foilTop + 3 * k)

    ctx.beginPath()
    ctx.ellipse(0, ly, neckW + 3 * k, 5 * k, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#c9a24b'
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(0, ly, neckW - 1 * k, 3 * k, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#120c08'
    ctx.fill()

    ctx.strokeStyle = 'rgba(240, 217, 160, 0.28)'
    ctx.lineWidth = 1.4 * k
    ctx.beginPath()
    ctx.moveTo(-bw * 0.16, bodyH * 0.2)
    ctx.lineTo(-bw * 0.16, bodyH * 0.75)
    ctx.stroke()

    ctx.fillStyle = 'rgba(247, 239, 226, 0.07)'
    ctx.fillRect(-bw * 0.38, bodyH * 0.22, bw * 0.2, bodyH * 0.5)
    ctx.strokeStyle = 'rgba(212, 168, 106, 0.45)'
    ctx.lineWidth = 1 * k
    ctx.strokeRect(-bw * 0.38, bodyH * 0.22, bw * 0.2, bodyH * 0.5)

    ctx.restore()
  }

  function drawStream(time: number) {
    if (s.stream <= 0.01) return
    const m = bottleMouth()
    const g = glassPos()
    const targetY = g.y - Math.min(w, h) * 0.1
    const tipY = m.y + (targetY - m.y) * s.stream
    const tipX = m.x + (w * 0.5 - m.x) * Math.min(1, s.stream * 2.6)

    const sway = Math.sin(time * 3.2) * 5
    const midX = (m.x + tipX) / 2 + sway

    ctx.save()

    const glowR = 70 + Math.sin(time * 5) * 8
    const glow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, glowR)
    glow.addColorStop(0, `rgba(240, 217, 160, ${0.4 * Math.min(1, s.stream * 3)})`)
    glow.addColorStop(1, 'rgba(240, 217, 160, 0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(tipX, tipY, glowR, 0, Math.PI * 2)
    ctx.fill()

    const widths = [13, 7, 3.5]
    const alphas = [0.22, 0.5, 0.95]
    const colors = ['rgba(212,168,106,', 'rgba(240,217,160,', 'rgba(255,244,220,']
    for (let i = 0; i < 3; i++) {
      const wid = widths[i]
      ctx.beginPath()
      ctx.moveTo(m.x - wid * 0.3, m.y)
      ctx.quadraticCurveTo(midX - wid * 0.3, (m.y + tipY) / 2, tipX - wid * 0.3, tipY)
      ctx.lineTo(tipX + wid * 0.7, tipY)
      ctx.quadraticCurveTo(midX + wid * 0.7, (m.y + tipY) / 2, m.x + wid * 0.7, m.y)
      ctx.closePath()
      ctx.fillStyle = `${colors[i]}${alphas[i]})`
      ctx.fill()
    }

    ctx.strokeStyle = 'rgba(255, 248, 230, 0.9)'
    ctx.lineWidth = 1.6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(m.x - 2, m.y)
    ctx.quadraticCurveTo(midX - 2, (m.y + tipY) / 2, tipX, tipY)
    ctx.stroke()

    const span = tipY - m.y
    if (span > 24) {
      for (const b of bubbles) {
        const local = (b.y + time * b.sp) % 1
        const yy = m.y + local * span
        const kk = local
        const bx = m.x + (tipX - m.x) * kk + Math.sin(time * 4 + b.seed * 20) * (2 + kk * 5)
        ctx.beginPath()
        ctx.arc(bx, yy, b.r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,248,230,0.5)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.fillStyle = 'rgba(255,244,220,0.1)'
        ctx.fill()
      }
    }

    ctx.restore()
  }

  function drawGlass(x: number, y: number, fill: number) {
    const k = scale()
    const gw = 44 * k
    const gh = 158 * k
    ctx.save()
    ctx.translate(x, y)

    ctx.strokeStyle = `rgba(212, 168, 106, ${0.25 + s.fill * 0.65})`
    ctx.lineWidth = 1.6 * k
    ctx.beginPath()
    ctx.moveTo(-gw * 0.42, 0)
    ctx.lineTo(-gw * 0.2, gh * 0.55)
    ctx.lineTo(-gw * 0.2, gh * 0.9)
    ctx.moveTo(gw * 0.42, 0)
    ctx.lineTo(gw * 0.2, gh * 0.55)
    ctx.lineTo(gw * 0.2, gh * 0.9)
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, gh * 0.93, gw * 0.4, 5 * k, 0, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.ellipse(0, 0, gw * 0.42, 8 * k, 0, 0, Math.PI * 2)
    ctx.stroke()

    if (fill > 0.02) {
      const bowlTop = 0
      const bowlBot = gh * 0.55
      const liquidH = (bowlBot - bowlTop) * fill
      const topY = bowlBot - liquidH

      ctx.beginPath()
      ctx.moveTo(-gw * 0.4, topY + 6)
      ctx.quadraticCurveTo(0, topY - 2, gw * 0.4, topY + 6)
      ctx.lineTo(gw * 0.2, bowlBot)
      ctx.lineTo(-gw * 0.2, bowlBot)
      ctx.closePath()
      const lg = ctx.createLinearGradient(0, topY, 0, bowlBot)
      lg.addColorStop(0, 'rgba(245, 225, 170, 0.95)')
      lg.addColorStop(0.5, 'rgba(212, 168, 106, 0.88)')
      lg.addColorStop(1, 'rgba(170, 120, 60, 0.92)')
      ctx.fillStyle = lg
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 248, 230, 0.8)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(-gw * 0.36, topY + 6)
      ctx.quadraticCurveTo(0, topY - 1, gw * 0.36, topY + 6)
      ctx.stroke()

      const t = performance.now() / 1000
      for (let i = 0; i < 9; i++) {
        const travel = (t * (18 + i * 5) + i * 28) % (liquidH + 8)
        const by = bowlBot - travel
        if (by < topY + 2) continue
        const bx = Math.sin(i * 2.4 + t * 3) * gw * 0.18
        ctx.beginPath()
        ctx.arc(bx, by, (1 + (i % 3) * 0.8) * k, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,248,230,0.55)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    ctx.strokeStyle = 'rgba(247, 239, 226, 0.4)'
    ctx.lineWidth = 1.3 * k
    ctx.beginPath()
    ctx.moveTo(-gw * 0.3, gh * 0.08)
    ctx.lineTo(-gw * 0.22, gh * 0.48)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gw * 0.32, gh * 0.12)
    ctx.lineTo(gw * 0.26, gh * 0.4)
    ctx.stroke()

    ctx.restore()
  }

  function drawGlasses() {
    const g = glassPos()
    const flash = s.clinkFlash
    if (flash > 0.01) {
      const cx = (g.lx + g.rx) / 2
      const cy = g.y + 10
      const r = 36 + (1 - flash) * 130
      const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      fg.addColorStop(0, `rgba(255, 248, 230, ${flash * 0.95})`)
      fg.addColorStop(0.35, `rgba(240, 217, 160, ${flash * 0.45})`)
      fg.addColorStop(1, 'rgba(240, 217, 160, 0)')
      ctx.fillStyle = fg
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = `rgba(255, 248, 230, ${flash * 0.75})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, 24 + (1 - flash) * 150, 0, Math.PI * 2)
      ctx.stroke()
    }
    drawGlass(g.lx, g.y, s.fill)
    drawGlass(g.rx, g.y, s.fill)
  }

  function drawEnv(time: number) {
    const a = s.env
    if (a <= 0.01) return
    ctx.save()

    const glows: [number, number, number, number][] = [
      [0.18, 0.35, 150, 0.2],
      [0.82, 0.28, 130, 0.17],
      [0.12, 0.7, 110, 0.15],
      [0.88, 0.65, 140, 0.18],
      [0.5, 0.88, 170, 0.12],
      [0.3, 0.14, 95, 0.13],
      [0.72, 0.12, 85, 0.12],
      [0.06, 0.5, 90, 0.1],
      [0.94, 0.48, 90, 0.1],
    ]
    for (const [gx, gy, gr, ga] of glows) {
      const x = w * gx
      const y = h * gy
      const rad = gr + Math.sin(time * 1.4 + gx * 10) * 8
      const rg = ctx.createRadialGradient(x, y, 0, x, y, rad)
      rg.addColorStop(0, `rgba(230, 167, 86, ${ga * a})`)
      rg.addColorStop(0.5, `rgba(212, 168, 106, ${ga * 0.35 * a})`)
      rg.addColorStop(1, 'rgba(212, 168, 106, 0)')
      ctx.fillStyle = rg
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, Math.PI * 2)
      ctx.fill()
    }

    const florals: [number, number, number, string][] = [
      [0.07, 0.42, 80, '#e8a8ae'],
      [0.92, 0.38, 70, '#f0c4c0'],
      [0.14, 0.82, 60, '#f7efe2'],
      [0.86, 0.8, 72, '#e8a8ae'],
      [0.04, 0.18, 50, '#f0c4c0'],
      [0.96, 0.16, 55, '#f7efe2'],
      [0.2, 0.08, 40, '#e8a8ae'],
      [0.8, 0.9, 45, '#f0c4c0'],
    ]
    ctx.filter = 'blur(16px)'
    ctx.globalAlpha = a * 0.28
    for (const [fx, fy, fr, col] of florals) {
      ctx.fillStyle = col
      ctx.beginPath()
      ctx.arc(w * fx, h * fy, fr, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(w * fx + fr * 0.55, h * fy - fr * 0.3, fr * 0.7, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(w * fx - fr * 0.45, h * fy + fr * 0.35, fr * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.filter = 'none'
    ctx.globalAlpha = a

    for (let i = 0; i < 22; i++) {
      const px = rand(i * 13.1) * w
      const py = rand(i * 17.3) * h
      const pr = 1.5 + rand(i * 19.7) * 3
      const tw = 0.5 + 0.5 * Math.sin(time * 3 + i)
      ctx.fillStyle = `rgba(240, 217, 160, ${0.4 * tw * a})`
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fill()
      if (i % 3 === 0) {
        ctx.strokeStyle = `rgba(255, 248, 230, ${0.55 * tw * a})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(px - pr * 3.5, py)
        ctx.lineTo(px + pr * 3.5, py)
        ctx.moveTo(px, py - pr * 3.5)
        ctx.lineTo(px, py + pr * 3.5)
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  function drawBloom(dt: number) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]
      p.life += dt
      if (p.life > p.max) {
        particles.splice(i, 1)
        continue
      }
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.985
      p.vy = p.vy * 0.985 + (p.kind === 1 ? -0.045 : p.kind === 4 ? 0.008 : 0.055)
      p.rot += p.vr

      const k = p.life / p.max
      const alpha = k < 0.08 ? k / 0.08 : 1 - smooth01((k - 0.5) / 0.5)

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = alpha

      if (p.kind === 0) {
        ctx.fillStyle = GOLD_HI
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size * 1.7, p.size * 0.65, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.beginPath()
        ctx.ellipse(-p.size * 0.35, -p.size * 0.15, p.size * 0.5, p.size * 0.22, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.kind === 1) {
        ctx.strokeStyle = 'rgba(240, 217, 160, 0.75)'
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = 'rgba(240, 217, 160, 0.08)'
        ctx.fill()
      } else if (p.kind === 2) {
        const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        rg.addColorStop(0, 'rgba(240, 217, 160, 0.95)')
        rg.addColorStop(1, 'rgba(240, 217, 160, 0)')
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.kind === 3) {
        ctx.fillStyle = p.seed > 0.4 ? BLUSH : '#f0c4c0'
        ctx.beginPath()
        ctx.roundRect(-p.size, -p.size * 0.45, p.size * 2, p.size * 0.9, p.size * 0.4)
        ctx.fill()
      } else if (p.kind === 4) {
        const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        rg.addColorStop(0, `rgba(255, 236, 200, ${0.55 * alpha})`)
        rg.addColorStop(0.45, `rgba(230, 167, 86, ${0.22 * alpha})`)
        rg.addColorStop(1, 'rgba(230, 167, 86, 0)')
        ctx.fillStyle = rg
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
      } else if (p.kind === 5) {
        ctx.fillStyle = p.seed > 0.5 ? '#f0c4c0' : IVORY
        ctx.beginPath()
        ctx.moveTo(0, -p.size)
        ctx.quadraticCurveTo(p.size * 0.9, -p.size * 0.15, 0, p.size)
        ctx.quadraticCurveTo(-p.size * 0.9, -p.size * 0.15, 0, -p.size)
        ctx.fill()
      } else {
        ctx.strokeStyle = 'rgba(255, 250, 240, 0.95)'
        ctx.lineWidth = 1.3
        const r = p.size * 2.4
        ctx.beginPath()
        ctx.moveTo(-r, 0)
        ctx.lineTo(r, 0)
        ctx.moveTo(0, -r)
        ctx.lineTo(0, r)
        ctx.stroke()
      }
      ctx.restore()
    }
    ctx.globalAlpha = 1
  }

  function draw(time: number, dt: number) {
    ctx.clearRect(0, 0, w, h)

    if (s.siteReveal < 0.99) {
      ctx.fillStyle = `rgba(14, 9, 7, ${1 - s.siteReveal})`
      ctx.fillRect(0, 0, w, h)
    }

    drawEnv(time)
    drawBottle()
    drawStream(time)
    drawGlasses()
    drawBloom(dt)
  }

  const finish = () => {
    if (finished) return
    finished = true
    document.documentElement.dataset.intro = 'done'
    overlay.style.transition = 'opacity 0.6s ease'
    overlay.style.opacity = '0'
    overlay.style.pointerEvents = 'none'
    window.setTimeout(() => {
      overlay.remove()
      cancelAnimationFrame(raf)
    }, 700)
    onDone()
  }

  const skip = () => {
    if (finished || skipped) return
    skipped = true
    tl.progress(1)
  }

  if (reduced) {
    document.documentElement.dataset.intro = 'done'
    overlay.remove()
    onDone()
    return () => {
      window.removeEventListener('resize', resize)
    }
  }

  document.documentElement.dataset.intro = 'running'

  const tl = gsap.timeline({ onComplete: finish })

  tl.to(s, { bottleIn: 1, duration: 0.7, ease: 'power2.out', onStart: () => (s.phase = 'tilt') }, 0)
  tl.to(s, { bottleRot: 16, duration: 1.5, ease: 'power2.inOut' }, 0.4)
  tl.to(
    s,
    {
      stream: 1,
      env: 1,
      duration: 2.5,
      ease: 'power1.inOut',
      onStart: () => (s.phase = 'pour'),
    },
    1.3,
  )
  tl.to(
    s,
    {
      fill: 1,
      duration: 1.15,
      ease: 'power1.inOut',
      onStart: () => (s.phase = 'fill'),
    },
    3.1,
  )
  tl.to(s, { stream: 0, duration: 0.55, ease: 'power2.in' }, 3.7)
  tl.to(s, { bottleIn: 0, duration: 0.7, ease: 'power2.in' }, 4.0)
  tl.to(s, { sep: 1, duration: 0.55, ease: 'power2.inOut', onStart: () => (s.phase = 'separate') }, 4.4)
  tl.to(s, { sep: 0, duration: 0.7, ease: 'power3.in', onStart: () => (s.phase = 'approach') }, 5.1)
  tl.to(
    s,
    {
      clinkFlash: 1,
      duration: 0.07,
      ease: 'power4.out',
      onStart: () => {
        s.phase = 'clink'
        s.sep = 0
        if (!bloomSpawned) {
          bloomSpawned = true
          const g = glassPos()
          spawnBurst(particles, (g.lx + g.rx) / 2, g.y + 8, w, h)
        }
        s.bloom = 1
      },
    },
    5.8,
  )
  tl.to(s, { clinkFlash: 0, duration: 0.7, ease: 'power2.out' }, 5.87)
  tl.to(s, { fill: 0.85, duration: 1.2, ease: 'power1.out' }, 6.0)
  tl.to(
    s,
    {
      siteReveal: 1,
      duration: 1.7,
      ease: 'power2.inOut',
      onStart: () => (s.phase = 'done'),
    },
    6.2,
  )
  tl.to(s, { env: 0.4, duration: 1.2 }, 6.2)
  tl.to({}, { duration: 0.5 }, 7.6)

  tl.eventCallback('onUpdate', () => {
    s.t = tl.progress()
  })

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    draw(now / 1000, dt)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  window.addEventListener('keydown', skip)
  overlay.addEventListener('click', skip)

  return () => {
    window.removeEventListener('resize', resize)
    window.removeEventListener('keydown', skip)
    overlay.removeEventListener('click', skip)
    tl.kill()
    cancelAnimationFrame(raf)
  }
}
