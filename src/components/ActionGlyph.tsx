type Glyph = 'previous' | 'next' | 'up' | 'down' | 'phone' | 'email' | 'expand' | 'pin'

/** Small, functional symbols. Text links carry their own visual emphasis. */
export function ActionGlyph({ name, className }: { name: Glyph; className?: string }) {
  const paths: Record<Glyph, string> = {
    previous: 'M15 6l-6 6 6 6',
    next: 'M9 6l6 6-6 6',
    up: 'M6 15l6-6 6 6',
    down: 'M6 9l6 6 6-6',
    phone: 'M8 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-3l-5-2-2 2a13 13 0 0 1-6-6l2-2-2-5Z',
    email: 'M4 5h16v14H4V5Zm0 1 8 7 8-7',
    expand: 'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5',
    pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  }

  return <svg className={className} viewBox="0 0 24 24" width="24" height="24"
    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true" focusable="false">
    <path d={paths[name]} />
  </svg>
}
