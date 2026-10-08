import { useEffect, useRef } from 'react'
import { runIntro } from './engine'
import { usePrefersReducedMotion } from '../lib/hooks'

export function Intro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('intro') === 'skip') {
      document.documentElement.dataset.intro = 'done'
      overlay.remove()
      if (!doneRef.current) {
        doneRef.current = true
        onDone()
      }
      return
    }
    const cleanup = runIntro({
      canvas,
      overlay,
      reduced,
      onDone: () => {
        if (doneRef.current) return
        doneRef.current = true
        onDone()
      },
    })
    return cleanup
  }, [reduced, onDone])

  return (
    <div className="intro" ref={overlayRef} data-intro-overlay aria-hidden="true">
      <canvas className="intro__canvas" ref={canvasRef} />
      <div className="intro__skip">
        <span>Click to skip</span>
      </div>
      <div className="intro__hint">
        <span className="intro__hint-script">a toast, to begin</span>
      </div>
    </div>
  )
}
