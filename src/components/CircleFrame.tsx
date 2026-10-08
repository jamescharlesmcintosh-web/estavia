import { useInView } from '../lib/hooks'

type CircleFrameProps = {
  variant: 'candles' | 'ceremony' | 'florals' | 'table' | 'balloons' | 'champagne'
  size?: number
  className?: string
  delay?: number
}

const SATELLITES = [
  { s: 0.16, o: 0.9, r: 0.62, a: '14deg', fx: -150, fy: -340 },
  { s: 0.1, o: 0.7, r: 1.15, a: '-20deg', fx: 118, fy: -470 },
  { s: 0.07, o: 0.55, r: 1.28, a: '34deg', fx: -62, fy: -250 },
]

export function CircleFrame({ variant, size = 280, className = '', delay = 0 }: CircleFrameProps) {
  const { ref, inView } = useInView<HTMLElement>(0.15)
  const floatDur = 6.5 + ((size % 7) * 0.9)
  return (
    <figure
      ref={ref}
      className={`circle-frame circle-frame--${variant} ${inView ? 'is-in' : ''} ${className}`}
      style={
        {
          '--size': `${size}px`,
          '--d': delay,
          '--float-dur': `${floatDur.toFixed(1)}s`,
          '--float-delay': `${(-(delay / 1000) % floatDur).toFixed(2)}s`,
        } as React.CSSProperties
      }
    >
      <div className="circle-frame__float">
        <div className="circle-frame__img">
          <span className="circle-frame__orb circle-frame__orb--a" aria-hidden="true" />
          <span className="circle-frame__orb circle-frame__orb--b" aria-hidden="true" />
          <span className="circle-frame__orb circle-frame__orb--c" aria-hidden="true" />
        </div>
        <div className="circle-frame__ring" aria-hidden="true" />
        <div className="circle-frame__glint" />
        {SATELLITES.map((sat, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="circle-frame__satwrap"
            style={
              {
                '--sat-i': i,
                '--sat-fx': `${sat.fx}px`,
                '--sat-fy': `${sat.fy}px`,
              } as React.CSSProperties
            }
          >
            <span
              className={`circle-frame__sat ${i === 1 ? 'is-blush' : ''}`}
              style={
                {
                  '--sat-size': `${sat.s * 100}%`,
                  '--sat-op': sat.o,
                  '--sat-orbit': sat.r,
                  '--sat-spin': sat.a,
                  '--sat-i': i,
                } as React.CSSProperties
              }
            />
          </span>
        ))}
      </div>
    </figure>
  )
}
