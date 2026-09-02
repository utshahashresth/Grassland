/* The one status vocabulary shared by badges across the app. */
export type Tone = 'paid' | 'partial' | 'pending' | 'onsite' | 'denied'

/* Seed data ported from the prototype `Retreat Ops Dashboard.dc.html`
 * (Component state + constants). In production this is the shape the
 * Django API should return; here it stands in as fixtures. */

export interface BookingRow {
  name: string
  phone: string
  code: string
  nights: string
  villa: string
  guests: number
  status: string
  tone: Tone
  passes: boolean
  total: number
}

export type VillaState = 'occupied' | 'arriving' | 'free'

export interface LogEntry {
  time: string
  guest: string
  villa: string
  code: string
  event: string
  tone: Tone
  kind: 'in' | 'out' | 'flag'
}

/* [name, sleeps, nightly rate] */
export const VILLA_SPEC: [string, number, number][] = [
  ['Lotus Villa', 10, 12000],
  ['Bamboo Villa', 6, 8400],
  ['Frangipani Villa', 4, 6200],
  ['Tamarind Villa', 8, 9800],
  ['Jasmine Villa', 2, 4600],
  ['Banyan Villa', 10, 12000],
  ['Lemongrass Villa', 6, 8400],
  ['Papaya Villa', 4, 6200],
  ['Champaka Villa', 8, 9800],
  ['Rain Tree Villa', 2, 4600],
  ['Ginger Villa', 6, 8400],
  ['Teak Villa', 10, 12000],
]

export const DOT: Record<VillaState, string> = {
  occupied: 'var(--matcha-600)',
  arriving: 'var(--turmeric-500)',
  free: 'var(--stone-400)',
}

/* Ops rules — the full rules screen is out of scope; the flags the
 * dashboard and the new-booking form read are kept at their defaults
 * (see README "Booking rules"). */
export const RULES = {
  requireDeposit: true,
  blockOverCapacity: true,
  allowPartialPasses: false,
  autoSendPasses: true,
}

export const SOURCE_OPTIONS = ['Phone call', 'WhatsApp', 'Walk-in', 'Returning guest', 'Agent referral']
export const METHOD_OPTIONS = ['Bank transfer', 'PromptPay', 'Card over phone', 'Cash on arrival']

/** "฿12,000" — the one money shape used everywhere. */
export function baht(n: number): string {
  return '฿' + Math.round(n).toLocaleString('en-US')
}

/** Digits-only parse of a free-typed number field. */
export function num(v: string): number {
  const n = parseInt(String(v).replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? 0 : n
}

export function rateOf(name: string): number {
  const r = VILLA_SPEC.find((v) => v[0] === name)
  return r ? r[2] : 0
}

export const VILLA_STATES: Record<string, [VillaState, string]> = {
  'Lotus Villa': ['occupied', 'Wattana · 6/10'],
  'Bamboo Villa': ['occupied', 'Lindqvist · 4/6'],
  'Frangipani Villa': ['arriving', '14:00 · 2 guests'],
  'Tamarind Villa': ['occupied', 'Okonkwo · 8/8'],
  'Jasmine Villa': ['free', 'Free from today'],
  'Banyan Villa': ['occupied', 'Reyes · 9/10'],
  'Lemongrass Villa': ['arriving', '16:30 · 5 guests'],
  'Papaya Villa': ['free', 'Free from today'],
  'Champaka Villa': ['occupied', 'Sato · 7/8'],
  'Rain Tree Villa': ['occupied', 'Bianchi · 2/2'],
  'Ginger Villa': ['free', 'Deep clean to 15:00'],
  'Teak Villa': ['occupied', 'Adeyemi · 6/10'],
}

export const ARRIVALS: BookingRow[] = [
  { name: 'Ram Kailash', phone: '080 656 9812', code: 'GZR-4475', nights: '3', villa: 'Frangipani Villa', guests: 2, status: 'Partial · ฿9,300 due', tone: 'partial', passes: false, total: 18600 },
  { name: 'Samira Karki', phone: '085 536 5235', code: 'GZR-4474', nights: '4', villa: 'Lemongrass Villa', guests: 5, status: 'Paid', tone: 'paid', passes: true, total: 33600 },
  { name: 'Jeevan Rai', phone: '098 532 8452', code: 'GZR-4473', nights: '1', villa: 'Jasmine Villa', guests: 3, status: 'Pending', tone: 'pending', passes: false, total: 4600 },
  { name: 'Bindu Sharma', phone: '098 562 5124', code: 'GZR-4472', nights: '3', villa: 'Papaya Villa', guests: 2, status: 'Paid', tone: 'paid', passes: false, total: 18600 },
  { name: 'Ana Reyes', phone: '084 909 3321', code: 'GZR-4470', nights: '3', villa: 'Banyan Villa', guests: 10, status: 'Paid', tone: 'paid', passes: true, total: 36000 },
]

export const DEPARTURES: BookingRow[] = [
  { name: 'Chidi Okonkwo', phone: '081 220 4471', code: 'GZR-4463', nights: '5', villa: 'Tamarind Villa', guests: 8, status: 'Checked out', tone: 'paid', passes: true, total: 49000 },
  { name: 'Giulia Bianchi', phone: '082 771 0043', code: 'GZR-4459', nights: '2', villa: 'Rain Tree Villa', guests: 2, status: 'Checked out', tone: 'paid', passes: true, total: 9200 },
  { name: 'Malee Chaiyo', phone: '089 445 1180', code: 'GZR-4461', nights: '4', villa: 'Ginger Villa', guests: 4, status: 'Checked out', tone: 'paid', passes: true, total: 33600 },
  { name: 'Haruki Sato', phone: '086 330 7712', code: 'GZR-4466', nights: '6', villa: 'Champaka Villa', guests: 7, status: 'Due 11:00', tone: 'pending', passes: true, total: 58800 },
]

export const LOG: LogEntry[] = [
  { time: '09:12', guest: 'Anong Srisai', villa: 'Lotus Villa', code: 'GZR-4471-03', event: 'Checked in', tone: 'onsite', kind: 'in' },
  { time: '08:54', guest: 'Lars Lindqvist', villa: 'Bamboo Villa', code: 'GZR-4468-02', event: 'Duplicate', tone: 'partial', kind: 'flag' },
  { time: '08:40', guest: 'Chidi Okonkwo', villa: 'Tamarind Villa', code: 'GZR-4463-01', event: 'Checked out', tone: 'paid', kind: 'out' },
  { time: '08:36', guest: 'Amara Okonkwo', villa: 'Tamarind Villa', code: 'GZR-4463-02', event: 'Checked out', tone: 'paid', kind: 'out' },
  { time: '08:21', guest: 'Unknown', villa: '—', code: '—', event: 'Denied', tone: 'denied', kind: 'flag' },
  { time: '08:04', guest: 'Kwame Mensah', villa: 'Banyan Villa', code: 'GZR-4470-08', event: 'Checked in', tone: 'onsite', kind: 'in' },
  { time: '08:04', guest: 'Ingrid Solberg', villa: 'Banyan Villa', code: 'GZR-4470-07', event: 'Checked in', tone: 'onsite', kind: 'in' },
  { time: '07:58', guest: 'Ella Novak', villa: 'Banyan Villa', code: 'GZR-4470-09', event: 'Checked in', tone: 'onsite', kind: 'in' },
  { time: '07:52', guest: 'Ana Reyes', villa: 'Banyan Villa', code: 'GZR-4470-01', event: 'Checked in', tone: 'onsite', kind: 'in' },
  { time: '07:44', guest: 'Malee Chaiyo', villa: 'Ginger Villa', code: 'GZR-4461-01', event: 'Checked out', tone: 'paid', kind: 'out' },
  { time: '07:31', guest: 'Giulia Bianchi', villa: 'Rain Tree Villa', code: 'GZR-4459-01', event: 'Checked out', tone: 'paid', kind: 'out' },
]

export const TONE_ORDER: Record<string, number> = { pending: 0, partial: 1, paid: 2 }

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || '')
      .join('')
      .toUpperCase() || '—'
  )
}

export function capacityOf(name: string): number {
  const r = VILLA_SPEC.find((v) => v[0] === name)
  return r ? r[1] : 0
}

/* Gate-activity dot colour by log tone (prototype `feed` mapping). */
export function feedColor(tone: Tone): string {
  return tone === 'onsite'
    ? 'var(--matcha-600)'
    : tone === 'partial'
      ? 'var(--turmeric-600)'
      : tone === 'denied'
        ? 'var(--clay-600)'
        : 'var(--slate-600)'
}
