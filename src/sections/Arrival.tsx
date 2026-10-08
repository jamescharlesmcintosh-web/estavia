import { CircleFrame } from '../components/CircleFrame'
import { Fade, Reveal, Rule } from '../components/Reveal'
import { Heart } from '../components/Icons'
import { GoldDivider } from '../components/Gold'

export function Arrival() {
  return (
    <section className="arrival" id="arrival" data-scene="arrival" data-label="Arrival" data-rail-n="01" data-accent="#d4a86a">
      <div className="arrival__glow" aria-hidden="true" />
      <div className="arrival__meta">
        <Fade delay={0}>
          <span className="meta-caps">Est. celebrations</span>
        </Fade>
        <Fade delay={80}>
          <span className="meta-caps">Plan · Decorate · Celebrate</span>
        </Fade>
      </div>

      <div className="arrival__brand">
        <Reveal
          as="h1"
          className="brand-title"
          lines={[<span key="e">Extravagant</span>]}
          step={0}
        />
        <Reveal as="div" className="brand-script" lines={[<span key="ev">Events</span>]} step={0} start={120} />
        <Fade delay={220} className="brand-by">
          <span className="brand-by__rule" />
          <span>By Estavia</span>
          <span className="brand-by__rule" />
        </Fade>
        <Reveal
          as="p"
          className="brand-tag"
          lines={['Making your special moments', 'extraordinary']}
          step={110}
          start={300}
        />
      </div>

      <div className="arrival__visuals">
        <CircleFrame variant="candles" size={340} className="arrival__c1" delay={200} />
        <CircleFrame variant="florals" size={235} className="arrival__c2" delay={350} />
        <CircleFrame variant="champagne" size={190} className="arrival__c3" delay={500} />
      </div>

      <div className="arrival__script-aside">
        <Fade delay={400}>
          <p className="script-lg">Plan</p>
          <p className="script-lg">Decorate</p>
          <p className="script-lg">Celebrate</p>
          <Heart className="arrival__heart" />
        </Fade>
      </div>

      <div className="arrival__foot">
        <Fade delay={500}>
          <span className="meta-caps">People</span>
          <Heart className="foot-heart" />
          <span className="meta-caps">Parties</span>
          <Heart className="foot-heart" />
          <span className="meta-caps">Beautiful moments</span>
        </Fade>
      </div>

      <div className="arrival__scroll">
        <Fade delay={700}>
          <span className="meta-caps">Scroll</span>
          <span className="arrival__scroll-line" />
        </Fade>
      </div>

      <Rule />
      <GoldDivider />
    </section>
  )
}
