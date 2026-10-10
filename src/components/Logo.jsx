import { Link } from '@tanstack/react-router'

export function Logo({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
        <rect width="64" height="64" rx="14" fill={dark ? '#e9c46a' : '#1c1a17'} />
        <path
          d="M18 33l9 9 19-20"
          fill="none"
          stroke={dark ? '#1c1a17' : '#e9c46a'}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-display text-2xl font-extrabold tracking-tight ${dark ? 'text-paper' : 'text-ink'}`}>
        Rollcall
      </span>
    </Link>
  )
}
