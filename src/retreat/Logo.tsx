import type { SVGProps } from 'react'

/* Grassland Zen Retreat brand mark — a front-facing lotus, two rings of
 * petals fanned wide over a seated, meditating figure. Self-contained
 * colour (yellow-green → deep-green gradient) with pale petal outlines so
 * the layers stay legible down to favicon size. */

const OUTER = [-120, -80, -40, 0, 40, 80, 120]
const INNER = [-100, -60, -20, 20, 60, 100]

export function Logo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-8 -6 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Grassland Zen Retreat"
      style={{ display: 'block', flex: 'none' }}
      {...props}
    >
      <defs>
        <linearGradient id="gzLight" x1="32" y1="2" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#AEDA74" />
          <stop offset="1" stopColor="#4C8A2B" />
        </linearGradient>
        <linearGradient id="gzMid" x1="32" y1="12" x2="32" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CBE44" />
          <stop offset="1" stopColor="#2C6A1C" />
        </linearGradient>
        <linearGradient id="gzDeep" x1="32" y1="34" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2E7D32" />
          <stop offset="1" stopColor="#1B5E20" />
        </linearGradient>
        <path id="gzPetal" d="M32 5C26 15 26 30 32 40C38 30 38 15 32 5Z" />
        <path id="gzPetalIn" d="M32 14C28 22 28 33 32 40C36 33 36 22 32 14Z" />
      </defs>

      {/* back ring — the widest petals splay out as leaves */}
      <g fill="url(#gzLight)" stroke="#EAF4D8" strokeWidth="1.1" strokeLinejoin="round">
        {OUTER.map((d) => (
          <use key={d} href="#gzPetal" transform={`rotate(${d} 32 40)`} />
        ))}
      </g>

      {/* front ring */}
      <g fill="url(#gzMid)" stroke="#CFE7AF" strokeWidth="1" strokeLinejoin="round">
        {INNER.map((d) => (
          <use key={d} href="#gzPetalIn" transform={`rotate(${d} 32 40)`} />
        ))}
      </g>

      {/* base mound */}
      <ellipse cx="32" cy="42" rx="13" ry="5" fill="url(#gzDeep)" />

      {/* seated figure */}
      <g fill="#FFFFFF">
        <circle cx="32" cy="24" r="4.8" />
        <path d="M32 29c-6.5 0-10.8 6.4-12 13.6 7.4 2.6 16.6 2.6 24 0-1.2-7.2-5.5-13.6-12-13.6Z" />
      </g>
    </svg>
  )
}
