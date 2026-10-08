import { Fade, Reveal, Rule } from '../components/Reveal'
import { Heart, IconPhone } from '../components/Icons'
import { GoldDivider } from '../components/Gold'

export function Contact() {
  return (
    <section
      className="contact"
      id="contact"
      data-scene="contact"
      data-label="Contact"
      data-rail-n="05"
      data-accent="#d4a86a"
    >
      <div className="contact__head">
        <Fade>
          <span className="section-index">05</span>
          <span className="section-name">Begin</span>
        </Fade>
      </div>

      <div className="contact__lockup">
        <Reveal as="h2" className="contact__title" lines={['Let’s create', 'something', 'beautiful']} step={110} />
        <Fade delay={350} className="contact__heart-wrap">
          <Heart className="contact__heart" />
        </Fade>
      </div>

      <Rule />

      <div className="contact__actions">
        <Fade delay={100}>
          <a className="contact__phone" href="tel:6076974118">
            <span className="contact__phone-icon">
              <IconPhone />
            </span>
            <span className="contact__phone-num">607 697 4118</span>
          </a>
        </Fade>
        <Fade delay={220}>
          <p className="contact__cta-text">
            Call or text today
            <br />
            to start planning!
          </p>
        </Fade>
        <Fade delay={320}>
          <p className="script-md contact__script">Plan · Decorate · Celebrate</p>
        </Fade>
      </div>

      <GoldDivider />

      <footer className="footer">
        <Fade delay={0}>
          <span className="meta-caps">Extravagant Events by Estavia</span>
        </Fade>
        <Fade delay={80}>
          <span className="footer__motto">
            People <Heart className="inline-heart" /> Parties <Heart className="inline-heart" /> Beautiful moments
          </span>
        </Fade>
        <Fade delay={160}>
          <a className="footer__top" href="#arrival">
            Back to top
          </a>
        </Fade>
      </footer>
    </section>
  )
}
