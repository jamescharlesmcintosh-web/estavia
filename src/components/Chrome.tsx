export function Nav() {
  return (
    <header className="nav" data-nav>
      <a className="nav__logo" href="#arrival">
        <span className="nav__logo-mark" aria-hidden="true" />
        <span className="nav__logo-text">Estavia</span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#arrival" data-nav-link="arrival">
          Arrival
        </a>
        <a href="#details" data-nav-link="details">
          Details
        </a>
        <a href="#celebration" data-nav-link="celebration">
          Celebration
        </a>
        <a href="#memory" data-nav-link="memory">
          Memory
        </a>
      </nav>
      <a className="nav__cta" href="tel:6076974118" data-nav-cta>
        607 697 4118
      </a>
    </header>
  )
}

export function Rail() {
  return (
    <aside className="rail" aria-hidden="true">
      <span className="rail__index" data-rail-index>
        01
      </span>
      <div className="rail__track">
        <div className="rail__fill" data-rail-fill />
      </div>
      <span className="rail__label" data-rail-label>
        Arrival
      </span>
    </aside>
  )
}
