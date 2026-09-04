/* Dashboard analytics fixtures + helpers.
 *
 * Ported from the design prototype (`Retreat Ops Dashboard.dc.html` — Component
 * state, the `chartSeries` generator and the dashboard branch of `renderVals`).
 * In production these are API responses; here they stand in as fixtures so the
 * redesigned dashboard matches the design system's `.dc.html` layout and copy.
 */

import NepaliDate from 'nepali-date-converter'
import { VILLA_SPEC, type VillaState } from './data'

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/* ---- Bikram Sambat helpers (booking calendar only) ------------------- */

export const NEPALI_MONTHS = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन',
  'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुण', 'चैत्र',
]

/** Short weekday labels, Sunday-first — matches Nepali calendar convention. */
export const NEPALI_WEEKDAYS = ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श']

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

/** Renders an integer with Devanagari (Nepali) digits. */
export function toNepaliDigits(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => NEPALI_DIGITS[Number(d)])
}

/* ---- bookings by source --------------------------------------------------- */

export type SourceRange = '30d' | '90d' | 'year'

export const SOURCE_SETS: Record<SourceRange, [string, number][]> = {
  '30d': [['Direct booking', 46], ['Returning guest', 21], ['WhatsApp', 16], ['Agent referral', 11], ['Walk-in', 6]],
  '90d': [['Direct booking', 42], ['Returning guest', 19], ['WhatsApp', 18], ['Agent referral', 14], ['Walk-in', 7]],
  year: [['Direct booking', 38], ['Returning guest', 24], ['WhatsApp', 15], ['Agent referral', 15], ['Walk-in', 8]],
}

export const SOURCE_TOTALS: Record<SourceRange, number> = { '30d': 248, '90d': 731, year: 2864 }

/** [solid, washed] — the washed tint is used when another legend row is hovered. */
export const SOURCE_COLORS: [string, string][] = [
  ['var(--matcha-700)', 'var(--matcha-200)'],
  ['var(--matcha-600)', 'var(--matcha-200)'],
  ['var(--matcha-500)', 'var(--matcha-100)'],
  ['var(--matcha-300)', 'var(--matcha-100)'],
  ['var(--stone-300)', 'var(--stone-200)'],
]

/* ---- villa availability -------------------------------------------------- */

export type AvailRange = 'tonight' | 'tomorrow' | 'week'

export interface AvailBreak {
  occupied: number
  reserved: number
  available: number
  notready: number
}

export const AVAIL_SETS: Record<'tomorrow' | 'week', AvailBreak> = {
  tomorrow: { occupied: 6, reserved: 4, available: 2, notready: 0 },
  week: { occupied: 8, reserved: 3, available: 1, notready: 0 },
}

/** Tonight's breakdown, derived live from villa states like the prototype. */
export function tonightAvail(
  villaStates: Record<string, [VillaState, string]>,
): AvailBreak {
  const b: AvailBreak = { occupied: 0, reserved: 0, available: 0, notready: 0 }
  for (const [name] of VILLA_SPEC) {
    const [st, detail] = villaStates[name] ?? (['free', ''] as [VillaState, string])
    if (st === 'occupied') b.occupied++
    else if (st === 'arriving') b.reserved++
    else if (/clean/i.test(detail || '')) b.notready++
    else b.available++
  }
  return b
}

/* ---- guest profile ----------------------------------------------------- */

/** Per-booking identity facts: [dob, gender, nationality, passport, email]. */
export const PROFILES: Record<string, [string, string, string, string, string]> = {
  'GZR-4475': ['12 Feb 1991', 'Male', 'Nepali', 'N8841207', 'ram.kailash@example.com'],
  'GZR-4474': ['03 Sep 1986', 'Female', 'Nepali', 'N7712540', 'samira.karki@example.com'],
  'GZR-4473': ['27 Jun 1994', 'Male', 'Nepali', 'N9930118', 'jeevan.rai@example.com'],
  'GZR-4472': ['19 Nov 1982', 'Female', 'Indian', 'M4408173', 'bindu.sharma@example.com'],
  'GZR-4470': ['14 Aug 1988', 'Female', 'Filipino', 'P4471882', 'ana.reyes@example.com'],
}

/* ---- availability calendar (Bikram Sambat) --------------------------- */

export interface CalDay {
  /** day-of-month, 1-based, in the Bikram Sambat calendar */
  date: number
  /** BS month index (0 = Baisakh .. 11 = Chaitra) this cell falls in */
  month: number
  /** false for the spill-over days of the neighbouring BS months */
  inMonth: boolean
  /** villas free that night, 0..total */
  free: number
  /** total villas */
  total: number
  /** true for the dashboard's "today" */
  today: boolean
  /** true once the night is in the past */
  past: boolean
}

/** The dashboard's fixed "today" (AD). */
export const TODAY = new Date(2026, 2, 12)

/** `TODAY` expressed in the Bikram Sambat calendar. */
export const TODAY_BS = NepaliDate.fromAD(TODAY)

function freeOn(cur: Date, total: number): number {
  /* Cheap deterministic hash → 0..1, so the calendar never shuffles. */
  let s = (cur.getFullYear() * 10000 + (cur.getMonth() + 1) * 100 + cur.getDate()) * 2654435761
  s = (s ^ (s >>> 13)) >>> 0
  const r = (s % 1000) / 1000
  const weekend = cur.getDay() === 5 || cur.getDay() === 6 ? 3 : 0
  const booked = Math.min(total, 3 + weekend + Math.round(r * 8))
  return total - booked
}

/**
 * Deterministic villa-availability for the 6-week grid around one Bikram
 * Sambat month, so the calendar reads the same on every render. In
 * production this is a single API call returning free-room counts per
 * night; `bsYear`/`bsMonth` are BS fields (bsMonth: 0 = Baisakh).
 */
export function availabilityMonth(bsYear: number, bsMonth: number): CalDay[] {
  const total = VILLA_SPEC.length
  /* Sunday-first, matching Nepali calendar convention. */
  const lead = new NepaliDate(bsYear, bsMonth, 1).getDay()

  return Array.from({ length: 42 }, (_, i) => {
    const cur = new NepaliDate(bsYear, bsMonth, 1 - lead + i)
    const curAD = cur.toJsDate()
    return {
      date: cur.getDate(),
      month: cur.getMonth(),
      inMonth: cur.getMonth() === bsMonth,
      free: freeOn(curAD, total),
      total,
      today:
        cur.getYear() === TODAY_BS.getYear() &&
        cur.getMonth() === TODAY_BS.getMonth() &&
        cur.getDate() === TODAY_BS.getDate(),
      past: curAD.getTime() < TODAY.getTime(),
    }
  })
}

/* ---- arrivals / departures chart -------------------------------------- */

export interface ChartDay {
  label: string
  short: string
  a: number
  d: number
}

const chartCache: Record<number, ChartDay[]> = {}

/** Deterministic arrivals/departures series for the last `n` days to 12 Mar 2026. */
export function chartSeries(n: number): ChartDay[] {
  const cached = chartCache[n]
  if (cached) return cached
  const out: ChartDay[] = []
  let seed = 4477 + n
  const end = new Date(2026, 2, 12)
  for (let i = n - 1; i >= 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const r = seed / 233280
    const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i)
    out.push({
      label: `${day.getDate()} ${MONTHS[day.getMonth()]}`,
      short: String(day.getDate()),
      a: 4 + Math.round(r * 10),
      d: 3 + Math.round((((seed >> 7) % 100) / 100) * 8),
    })
  }
  chartCache[n] = out
  return out
}
