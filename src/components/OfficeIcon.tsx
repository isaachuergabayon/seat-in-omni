export default function OfficeIcon({ size = 20 }: { size?: number }) {
  const s = size / 32
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={{ display: 'inline-block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill="#1f2937" transform={`scale(${s / s})`} />
      {/* Top row */}
      <rect x="6" y="7" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="13.5" y="7" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="21" y="7" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      {/* Middle row */}
      <rect x="6" y="14.25" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="13.5" y="14.25" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="21" y="14.25" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      {/* Bottom row */}
      <rect x="6" y="21.5" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="13.5" y="21.5" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      <rect x="21" y="21.5" width="5" height="3.5" rx="1" fill="#ffffff" opacity="0.9" />
      {/* Seat dots */}
      <circle cx="8.5" cy="12.5" r="1.2" fill="#4ade80" />
      <circle cx="16" cy="12.5" r="1.2" fill="#4ade80" />
      <circle cx="23.5" cy="19.75" r="1.2" fill="#f87171" />
    </svg>
  )
}
