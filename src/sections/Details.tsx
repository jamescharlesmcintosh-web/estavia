import { Fade, Reveal, Rule } from '../components/Reveal'
import { IconCake, IconGlasses, IconParty, IconRings, Heart } from '../components/Icons'
import { CircleFrame } from '../components/CircleFrame'

const services = [
  { key: 'events', label: 'Events', Icon: IconGlasses },
  { key: 'parties', label: 'Parties', Icon: IconParty },
  { key: 'weddings', label: 'Weddings', Icon: IconRings },
  { key: 'celebrations', label: 'Celebrations', Icon: IconCake },
]

const strip = ['Planning', 'Decor', 'Setup', 'Styling', 'Memories']

export function Details() {
  return (
    <section
      className="details"
      id="details"
      data-scene="details"
      data-label="The Details"
      data-rail-n="02"
      data-accent="#e8a8ae"
    >
      <div className="details__head">
        <Fade>
          <span className="section-index">02</span>
          <span className="section-name">The Details</span>
        </Fade>
        <Reveal
          as="h2"
          className="t-h2"
          lines={['Every detail,', 'considered.']}
          step={100}
        />
      </div>

      <ul className="services">
        {services.map((s, i) => (
          <Fade as="li" key={s.key} delay={i * 100} className="services__item">
            <span className="services__icon">
              <s.Icon />
            </span>
            <span className="services__label">{s.label}</span>
          </Fade>
        ))}
      </ul>

      <Fade delay={200} className="service-strip">
        {strip.map((item, i) => (
          <span key={item}>
            {i > 0 && <span className="service-strip__sep" aria-hidden="true">|</span>}
            {item}
          </span>
        ))}
      </Fade>

      <div className="details__body">
        <div className="details__copy">
          <Reveal
            as="p"
            className="lede"
            lines={['From intimate gatherings', 'to unforgettable celebrations…']}
            step={90}
          />
          <Fade delay={200}>
            <p className="script-md details__script">we bring your vision to life</p>
          </Fade>
          <Rule />
          <Fade delay={280}>
            <p className="body-copy">
              Weddings, parties, and the quiet moments in between — styled with candlelight,
              champagne tones, and florals that feel gathered the morning of.
            </p>
          </Fade>
        </div>
        <div className="details__frames">
          <CircleFrame variant="table" size={300} className="details__f1" delay={100} />
          <CircleFrame variant="ceremony" size={235} className="details__f2" delay={250} />
        </div>
      </div>

      <Fade className="details__note" delay={100}>
        <Heart className="inline-heart" />
        <span className="script-sm">Let&apos;s create something beautiful</span>
      </Fade>
    </section>
  )
}
