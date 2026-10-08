import { CircleFrame } from '../components/CircleFrame'
import { Fade, Reveal, Rule } from '../components/Reveal'
import { Heart } from '../components/Icons'
import { GoldDivider } from '../components/Gold'

export function Celebration() {
  return (
    <section
      className="celebration"
      id="celebration"
      data-scene="celebration"
      data-label="The Celebration"
      data-rail-n="03"
      data-accent="#d4a86a"
    >
      <div className="celebration__head">
        <Fade>
          <span className="section-index">03</span>
          <span className="section-name">The Celebration</span>
        </Fade>
        <Reveal as="h2" className="t-h2" lines={['The room', 'holds its breath.']} step={100} />
      </div>

      <div className="celebration__stage">
        <CircleFrame variant="balloons" size={400} className="cel__big" delay={0} />
        <CircleFrame variant="candles" size={290} className="cel__mid" delay={150} />
        <CircleFrame variant="ceremony" size={330} className="cel__low" delay={280} />
        <CircleFrame variant="florals" size={215} className="cel__accent" delay={400} />

        <Fade delay={350} className="celebration__badge">
          <span className="script-md">Good</span>
          <span className="script-md">Times</span>
        </Fade>

        <div className="celebration__ring" aria-hidden="true" />
      </div>

      <div className="celebration__copy">
        <Reveal
          as="p"
          className="lede lede--center"
          lines={['Champagne light,', 'florals within reach,', 'everyone you love in one room.']}
          step={90}
        />
        <Rule />
        <Fade delay={200}>
          <p className="body-copy body-copy--center">
            We compose the evening the way a photograph is composed — layered, warm, and a little
            bit undone at the edges.
          </p>
        </Fade>
        <Fade delay={300} className="celebration__tags">
          <span>Events</span>
          <Heart className="inline-heart" />
          <span>Weddings</span>
          <Heart className="inline-heart" />
          <span>Celebrations</span>
        </Fade>
      </div>

      <GoldDivider />
    </section>
  )
}
