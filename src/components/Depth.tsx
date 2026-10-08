import { useEffect, useRef } from 'react'
import { state, smoothstep } from '../lib/state'

/* ────────────────────────────────────────────────────────────
   The Descent
   A fixed light-field that turns the scroll into a dive.
   The gold surface rises past you as you sink; rays and
   caustics stream down from it; the haze cools and thickens
   with depth; at the end you rise back into the light.
   ──────────────────────────────────────────────────────────── */

function waveY(x: number, t: number, base: number) {
  return (
    base +
    Math.sin(x * 0.0062 + t * 0.55) * 9 +
    Math.sin(x * 0.0131 - t * 0.38) * 5.5 +
    Math.sin(x * 0.0027 + t * 0.21) * 12
  )
}

export function Depth() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    let W = 0
    let H = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1 : 1.35)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number) => {
      const p = state.p
      // 0 = at the surface, 1 = deep. Sinks, then rises back for the CTA.
      const depth = smoothstep(0.05, 0.42, p) * (1 - smoothstep(0.78, 1, p) * 0.94)

      ctx.clearRect(0, 0, W, H)

      const waterY = H * (1.12 - depth * 1.55)
      const onScreen = waterY > -120 && waterY < H + 120

      /* ── god rays streaming down from the surface ───────── */
      const rayStrength =
        smoothstep(0.1, 0.34, depth) * (1 - smoothstep(0.72, 1, depth) * 0.55)
      if (rayStrength > 0.012) {
        ctx.globalCompositeOperation = 'lighter'
        const rays = coarse ? 5 : 8
        for (let i = 0; i < rays; i++) {
          const spread = i / (rays - 1) - 0.5
          const sway = Math.sin(t * 0.1 + i * 1.7) * W * 0.035
          const x0 = W * 0.5 + spread * W * 1.28 + sway
          const w = W * (0.03 + 0.022 * Math.sin(i * 2.3 + 1.1))
          const top = Math.max(waterY, -60)
          const g = ctx.createLinearGradient(0, top, 0, H)
          const a = 0.15 * rayStrength * (0.65 + 0.35 * Math.sin(i * 1.9 + t * 0.22))
          g.addColorStop(0, `rgba(240, 217, 160, ${a})`)
          g.addColorStop(0.45, `rgba(240, 217, 160, ${a * 0.42})`)
          g.addColorStop(1, 'rgba(240, 217, 160, 0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.moveTo(x0 - w * 0.28, top)
          ctx.lineTo(x0 + w * 0.28, top)
          ctx.lineTo(x0 + w * 3.1, H)
          ctx.lineTo(x0 - w * 3.1, H)
          ctx.closePath()
          ctx.fill()
        }
      }

      /* ── caustics drifting across the floor ─────────────── */
      const caus = smoothstep(0.22, 0.55, depth) * (1 - smoothstep(0.86, 1, depth) * 0.5)
      if (caus > 0.012) {
        ctx.globalCompositeOperation = 'lighter'
        const blobs = coarse ? 6 : 11
        for (let i = 0; i < blobs; i++) {
          const ph = i * 1.31
          const cx =
            W * (0.5 + 0.56 * Math.sin(t * 0.07 + ph) * Math.cos(t * 0.041 + ph * 0.7))
          const cy =
            H * (0.62 + 0.3 * Math.cos(t * 0.052 + ph * 1.4) + 0.1 * Math.sin(t * 0.11 + ph))
          const r = (coarse ? 130 : 190) * (0.6 + 0.55 * Math.abs(Math.sin(t * 0.09 + ph)))
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
          const a = 0.11 * caus
          g.addColorStop(0, `rgba(240, 217, 160, ${a})`)
          g.addColorStop(0.55, `rgba(212, 168, 106, ${a * 0.35})`)
          g.addColorStop(1, 'rgba(212, 168, 106, 0)')
          ctx.fillStyle = g
          ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
        }
      }

      /* ── the surface itself ─────────────────────────────── */
      if (onScreen) {
        const steps = coarse ? 26 : 46
        const pts: [number, number][] = []
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * (W + 20) - 10
          pts.push([x, waveY(x, t, waterY)])
        }

        // glow spilling down from the meniscus
        ctx.globalCompositeOperation = 'lighter'
        const glowH = Math.min(H * 0.55, 420)
        const gg = ctx.createLinearGradient(0, waterY - 90, 0, waterY + glowH)
        gg.addColorStop(0, 'rgba(240, 217, 160, 0)')
        gg.addColorStop(0.12, `rgba(255, 236, 196, ${0.3 + depth * 0.16})`)
        gg.addColorStop(0.3, `rgba(226, 186, 122, ${0.13 + depth * 0.07})`)
        gg.addColorStop(1, 'rgba(212, 168, 106, 0)')
        ctx.fillStyle = gg
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
        ctx.lineTo(W + 10, waterY + glowH)
        ctx.lineTo(-10, waterY + glowH)
        ctx.closePath()
        ctx.fill()

        // crest stroke — the specular line of the surface
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
        ctx.strokeStyle = `rgba(255, 242, 214, ${0.52 + 0.1 * Math.sin(t * 0.8)})`
        ctx.lineWidth = 2.6
        ctx.stroke()
        ctx.strokeStyle = 'rgba(255, 226, 170, 0.22)'
        ctx.lineWidth = 14
        ctx.stroke()

        // brighter flecks riding the crest
        for (let i = 2; i < pts.length - 2; i += 4) {
          const [x, y] = pts[i]
          const r = 16 + 13 * Math.abs(Math.sin(t * 0.9 + i * 0.7))
          const fg = ctx.createRadialGradient(x, y, 0, x, y, r)
          fg.addColorStop(0, `rgba(255, 240, 205, ${0.3 + 0.14 * Math.sin(t + i)})`)
          fg.addColorStop(1, 'rgba(255, 240, 205, 0)')
          ctx.fillStyle = fg
          ctx.fillRect(x - r, y - r, r * 2, r * 2)
        }
      }

      /* ── warm overhead light while still at the surface ─── */
      const air = 1 - smoothstep(0.02, 0.3, depth)
      if (air > 0.01) {
        ctx.globalCompositeOperation = 'lighter'
        const ag = ctx.createRadialGradient(W * 0.5, -H * 0.16, 0, W * 0.5, -H * 0.16, H * 1.12)
        ag.addColorStop(0, `rgba(240, 217, 160, ${0.17 * air})`)
        ag.addColorStop(0.55, `rgba(212, 168, 106, ${0.07 * air})`)
        ag.addColorStop(1, 'rgba(212, 168, 106, 0)')
        ctx.fillStyle = ag
        ctx.fillRect(0, 0, W, H)
      }

      ctx.globalCompositeOperation = 'source-over'

      // publish depth so CSS can shift the haze with it
      document.documentElement.style.setProperty('--depth', depth.toFixed(4))
    }

    let raf = 0
    const frame = (now: number) => {
      draw(now / 1000)
      raf = requestAnimationFrame(frame)
    }

    resize()
    draw(0)
    if (!reduced) raf = requestAnimationFrame(frame)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="depth" aria-hidden="true">
      <div className="depth__haze" />
      <canvas ref={ref} />
    </div>
  )
}
