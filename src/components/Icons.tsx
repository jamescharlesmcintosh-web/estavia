type IconProps = { className?: string }

export function IconGlasses({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M14 8h8l-1.5 12c.5 3 2 5 3.5 6v10h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M22 8h8l-1.5 12c.5 3 2 5 3.5 6v10h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 8v12M32 8v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="18" cy="38" rx="5" ry="1.5" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="26" cy="38" rx="5" ry="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 8h8M22 8h8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 14h5M24 14h5" stroke="currentColor" strokeWidth="1.2" opacity=".6" />
    </svg>
  )
}

export function IconParty({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="24" cy="24" rx="5" ry="12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 24h24M13.5 18h21M13.5 30h21" stroke="currentColor" strokeWidth="1.2" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 11l2.5 2.5M34.5 34.5L37 37M37 11l-2.5 2.5M13.5 34.5L11 37" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function IconRings({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="19" cy="26" r="10" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="29" cy="26" r="10" stroke="currentColor" strokeWidth="1.4" />
      <path d="M29 16l2.5-4h-5L29 16z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M27 12.5h4" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function IconCake({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M12 28h24v8H12z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M15 20h18v8H15z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M18 14h12v6H18z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24 8v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24 8c-1.5 0-2.5-1-2.5-2.5S24 4 24 6c0-2 2.5-1.5 2.5 0S25.5 8 24 8z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 32c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0 4-1.5 6 0" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function IconPhone({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M16 10h-4c-2 0-3 1.5-3 3.5 0 12 10 22 22 22 2 0 3.5-1 3.5-3v-4l-6-2-2.5 3c-4-2-7.5-5.5-9.5-9.5l3-2.5-2-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Heart({ className = '' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}
