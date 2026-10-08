import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { accent, state } from './state'

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null

export function getLenis() {
  return lenis
}

declare global {
  interface Window {
    __scrollTo?: (y: number) => void
  }
}

if (typeof window !== 'undefined') {
  window.__scrollTo = (y: number) => {
    if (lenis) lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
    ScrollTrigger.update()
    window.dispatchEvent(new Event('scroll'))
  }
}

export function scrollToTarget(target: number | string | HTMLElement, opts?: { offset?: number }) {
  if (lenis) {
    lenis.scrollTo(target as never, { offset: opts?.offset ?? 0, duration: 1.5 })
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
  } else if (typeof target === 'string') {
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function stopScroll() {
  lenis?.stop()
  document.documentElement.classList.add('is-locked')
  document.body.classList.add('is-locked')
}

export function startScroll() {
  document.documentElement.classList.remove('is-locked')
  document.body.classList.remove('is-locked')
  lenis?.start()
  ScrollTrigger.refresh()
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function setAccent(hex: string) {
  const target = hexToRgb(hex)
  gsap.to(accent, {
    ...target,
    duration: 1,
    ease: 'power2.out',
    overwrite: 'auto',
    onUpdate: () => {
      document.documentElement.style.setProperty(
        '--accent',
        `rgb(${Math.round(accent.r)}, ${Math.round(accent.g)}, ${Math.round(accent.b)})`,
      )
    },
  })
}

export function initScroll(reduced: boolean) {
  state.reduced = reduced

  let tickerFn: ((time: number) => void) | null = null

  if (!reduced) {
    lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    })
    lenis.on('scroll', ScrollTrigger.update)
    tickerFn = (time: number) => lenis!.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)
  }

  Array.from(document.querySelectorAll<HTMLElement>('[data-accent]')).forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => setAccent(section.dataset.accent!),
      onEnterBack: () => setAccent(section.dataset.accent!),
    })
  })

  const railLabel = document.querySelector<HTMLElement>('[data-rail-label]')
  const railIndex = document.querySelector<HTMLElement>('[data-rail-index]')
  const railFill = document.querySelector<HTMLElement>('[data-rail-fill]')
  const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'))
  const navCta = document.querySelector<HTMLElement>('[data-nav-cta]')

  const sceneEls = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))

  const applyChrome = () => {
    if (!sceneEls.length) return
    const mid = window.scrollY + window.innerHeight * 0.55
    let active = sceneEls[0]
    for (const el of sceneEls) {
      const top = el.getBoundingClientRect().top + window.scrollY
      const bottom = top + el.offsetHeight
      if (mid >= top && mid < bottom) {
        active = el
        break
      }
      if (mid >= top) active = el
    }
    if (railLabel) railLabel.textContent = active.dataset.label ?? active.dataset.scene ?? ''
    if (railIndex) railIndex.textContent = active.dataset.railN ?? '01'
    navLinks.forEach((l) => {
      l.classList.toggle('is-active', l.dataset.navLink === active.dataset.scene)
    })
    if (navCta) navCta.classList.toggle('is-active', active.dataset.scene === 'contact')
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (railFill && max > 0) {
      railFill.style.transform = `scaleY(${Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4)})`
    }
  }

  applyChrome()

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      state.p = self.progress
      applyChrome()
      if (railFill) railFill.style.transform = `scaleY(${self.progress.toFixed(4)})`
    },
  })

  window.addEventListener('scroll', applyChrome, { passive: true })
  lenis?.on('scroll', applyChrome)

  const onResize = () => {
    applyChrome()
  }
  window.addEventListener('resize', onResize)

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      window.setTimeout(() => {
        applyChrome()
        ScrollTrigger.refresh()
      }, 60)
    })
  }

  applyChrome()
  ScrollTrigger.refresh()

  return () => {
    window.removeEventListener('resize', onResize)
    window.removeEventListener('scroll', applyChrome)
    if (tickerFn) gsap.ticker.remove(tickerFn)
    ScrollTrigger.getAll().forEach((t) => t.kill())
    lenis?.destroy()
    lenis = null
  }
}
