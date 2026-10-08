import { useEffect, useRef } from 'react'
import { rand, smoothstep, state } from '../lib/state'

const COLORS: [number, number, number][] = [
  [240, 217, 160],
  [212, 168, 106],
  [232, 168, 174],
  [240, 196, 192],
  [247, 239, 226],
]

type Bubble = {
  x: number
  y: number
  r: number
  d: number
  ph: number
  sp: number
  wa: number
  ci: number
  ap: number
}

function makeSprite(rgb: [number, number, number]) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const g = c.getContext('2d')
  if (!g) return c
  const [r, gg, b] = rgb
  const mid = 128
  const grad = g.createRadialGradient(mid, mid, 0, mid, mid, 128)
  grad.addColorStop(0, `rgba(${r}, ${gg}, ${b}, 0.2)`)
  grad.addColorStop(0.45, `rgba(${r}, ${gg}, ${b}, 0.1)`)
  grad.addColorStop(0.72, `rgba(${r}, ${gg}, ${b}, 0.14)`)
  grad.addColorStop(0.88, `rgba(${r}, ${gg}, ${b}, 0.4)`)
  grad.addColorStop(0.95, `rgba(${r}, ${gg}, ${b}, 0.16)`)
  grad.addColorStop(1, `rgba(${r}, ${gg}, ${b}, 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  const core = g.createRadialGradient(mid, mid, 0, mid, mid, 70)
  core.addColorStop(0, 'rgba(255, 250, 240, 0.2)')
  core.addColorStop(1, 'rgba(255, 250, 240, 0)')
  g.fillStyle = core
  g.fillRect(0, 0, 256, 256)
  return c
}

export function BubbleSea() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const count = coarse ? 48 : 88
    const sprites = COLORS.map(makeSprite)
    const bubbles: Bubble[] = []

    for (let i = 0; i < count; i++) {
      const d = 0.2 + Math.sqrt(rand(i * 3 + 1)) * 0.8
      const late = rand(i * 7 + 5)
      bubbles.push({
        x: rand(i * 3 + 2),
        y: rand(i * 3 + 3),
        r: (14 + rand(i * 5 + 7) * 46) * (0.6 + d * 0.7),
        d,
        ph: rand(i * 11 + 13) * Math.PI * 2,
        sp: 0.2 + rand(i * 17 + 19) * 0.5,
        wa: 8 + rand(i * 23 + 29) * 26,
        ci: Math.floor(rand(i * 29 + 31) * COLORS.length),
        ap: late < 0.3 ? 0 : 0.08 + (late - 0.3) * 0.75,
      })
    }

    let W = 0
    let H = 0
    const M = 150

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number, sy: number, px: number, py: number) => {
      const p = state.p
      const sea = smoothstep(0.15, 0.9, p)
      const depth = smoothstep(0.05, 0.42, p) * (1 - smoothstep(0.78, 1, p) * 0.94)
      const grow = 1 + 0.5 * smoothstep(0.45, 1, p)
      const rise = 1 + depth * 5.2
      const span = H + M * 2
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (const b of bubbles) {
        const vis = b.ap === 0 ? 0.45 + 0.55 * sea : smoothstep(b.ap, b.ap + 0.16, p)
        if (vis <= 0.01) continue
        const drift = t * (2 + b.d * 6) * rise
        const y = (((b.y * span - sy * (0.12 + b.d * 0.5) - drift) % span) + span) % span - M
        const x = b.x * W + Math.sin(t * b.sp + b.ph) * b.wa + px * b.d * 42
        const yy = y + Math.cos(t * b.sp * 0.7 + b.ph) * (6 + b.d * 10) + py * b.d * 30
        const r = b.r * grow * (1 + 0.07 * Math.sin(t * 0.9 + b.ph))
        const a = vis * (0.32 + b.d * 0.42) * (0.72 + sea * 0.4)
        ctx.globalAlpha = Math.min(a, 0.88)
        ctx.drawImage(sprites[b.ci], x - r, yy - r, r * 2, r * 2)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
    }

    let raf = 0
    let tx = 0
    let ty = 0

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / Math.max(W, 1) - 0.5
      ty = e.clientY / Math.max(H, 1) - 0.5
    }

    const frame = (now: number) => {
      state.pointerX += (tx - state.pointerX) * 0.05
      state.pointerY += (ty - state.pointerY) * 0.05
      draw(now / 1000, window.scrollY, state.pointerX, state.pointerY)
      raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      resize()
      if (reduced) draw(0, window.scrollY, 0, 0)
    }

    resize()
    if (reduced) {
      draw(0, window.scrollY, 0, 0)
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(frame)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="bubble-sea" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  )
}
