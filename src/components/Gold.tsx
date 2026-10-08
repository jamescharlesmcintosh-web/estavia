export function GoldConnector({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`gold-connector ${className}`}
      viewBox="0 0 200 600"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="gold-connector__path"
        d="M100 0 C 100 80, 40 120, 40 200 S 160 300, 160 380 S 60 480, 100 600"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="1.2"
      />
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4a86a" stopOpacity="0" />
          <stop offset="20%" stopColor="#d4a86a" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#f0d9a0" stopOpacity="0.9" />
          <stop offset="80%" stopColor="#d4a86a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d4a86a" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function GoldDivider() {
  return (
    <div className="gold-divider" aria-hidden="true">
      <span className="gold-divider__line" />
      <span className="gold-divider__dot" />
      <span className="gold-divider__line" />
    </div>
  )
}
