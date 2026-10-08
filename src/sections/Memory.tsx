import { CircleFrame } from '../components/CircleFrame'
import { Fade, Reveal, Rule } from '../components/Reveal'
import { Heart } from '../components/Icons'

export function Memory() {
  return (
    <section
      className="memory"
      id="memory"
      data-scene="memory"
      data-label="The Memory"
      data-rail-n="04"
      data-accent="#e8a8ae"
    >
      <div className="memory__grid">
        <div className="memory__copy">
          <Fade>
            <span className="section-index">04</span>
            <span className="section-name">The Memory</span>
          </Fade>
          <Reveal as="h2" className="t-h2" lines={['What remains', 'is the feeling.']} step={100} />
          <Rule />
          <Fade delay={200}>
            <p className="script-lg memory__script">
              From intimate gatherings
              <br />
              to unforgettable celebrations…
            </p>
          </Fade>
          <Fade delay={300}>
            <p className="body-copy">
              The toast that lands. The candle someone refuses to blow out. We plan for the
              photograph — and for the moment just before it.
            </p>
          </Fade>
          <Fade delay={380} className="memory__motto">
            <span className="meta-caps">People</span>
            <Heart className="inline-heart" />
            <span className="meta-caps">Parties</span>
            <Heart className="inline-heart" />
            <span className="meta-caps">Beautiful moments</span>
          </Fade>
        </div>

        <div className="memory__frames">
          <CircleFrame variant="champagne" size={260} className="memory__f1" delay={100} />
          <CircleFrame variant="table" size={355} className="memory__f2" delay={220} />
          <CircleFrame variant="florals" size={210} className="memory__f3" delay={340} />
        </div>
      </div>
    </section>
  )
}
