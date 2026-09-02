import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icon } from './Icon'
import { ManagerShell } from './Shell'
import { VILLA_SPEC, type BookingRow, type VillaState } from './data'
import {
  AVAIL_SETS,
  MONTHS,
  SOURCE_COLORS,
  SOURCE_SETS,
  SOURCE_TOTALS,
  TODAY,
  availabilityMonth,
  chartSeries,
  tonightAvail,
  type AvailRange,
  type SourceRange,
} from './dashboardData'

/* Dashboard redesigned to the design system's `Retreat Ops Dashboard.dc.html`:
 * a KPI row, a villa-availability bar, an arrivals/departures chart, a
 * bookings-by-source donut, and a guest-profile panel. Styling is driven
 * entirely by the retreat tokens (src/retreat/tokens.css). */

const mono = 'var(--font-mono)'
const display = 'var(--font-display)'

const CARD = 'rounded-[12px] border border-border bg-card'
const CARD_TITLE = 'm-0 text-[17px] font-semibold text-[var(--text-heading)]'

/* ---- segmented range toggle ------------------------------------------- */

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}) {
  return (
    <span className="flex w-fit items-center gap-0.5 rounded-md bg-[var(--stone-100)] p-0.5">
      {options.map(([v, label]) => {
        const on = v === value
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="rounded-[4px] border px-[9px] py-[5px] text-[10.5px] font-semibold tracking-[0.06em] uppercase transition-colors"
            style={{
              fontFamily: mono,
              background: on ? 'var(--surface-card)' : 'transparent',
              borderColor: on ? 'var(--border-default)' : 'transparent',
              boxShadow: on ? 'var(--shadow-card)' : 'none',
              color: on ? 'var(--action-secondary-text)' : 'var(--text-secondary)',
            }}
          >
            {label}
          </button>
        )
      })}
    </span>
  )
}

/* ---- KPI tiles ------------------------------------------------------- */

function StatTile({
  label,
  value,
  delta,
  deltaTone,
  foot,
}: {
  label: string
  value: string
  delta: string
  deltaTone: 'ok' | 'deny'
  foot: ReactNode
}) {
  const tone =
    deltaTone === 'deny'
      ? { bg: 'var(--status-deny-bg)', fg: 'var(--status-deny-fg)' }
      : { bg: 'var(--status-ok-bg)', fg: 'var(--status-ok-fg)' }
  return (
    <div className={`${CARD} px-[18px] py-4`}>
      <span className="block text-[12.5px] font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
        {label}
      </span>
      <div className="mt-3 flex items-center gap-[9px]">
        <span
          className="text-[27px] leading-none font-semibold text-[var(--text-heading)]"
          style={{ fontFamily: mono }}
        >
          {value}
        </span>
        <span
          className="inline-flex flex-none items-center rounded-full px-2 py-[3px] text-[10.5px] font-semibold whitespace-nowrap"
          style={{ fontFamily: mono, background: tone.bg, color: tone.fg }}
        >
          {delta}
        </span>
      </div>
      <span className="mt-[11px] block border-t border-border pt-[11px] text-[12.5px] text-[var(--text-secondary)]">
        {foot}
      </span>
    </div>
  )
}

/* ---- villa availability -------------------------------------------- */

const AV_RANGES: [AvailRange, string][] = [
  ['tonight', 'Tonight'],
  ['tomorrow', 'Tomorrow'],
  ['week', 'Week'],
]

function VillaAvailabilityCard({
  villaStates,
}: {
  villaStates: Record<string, [VillaState, string]>
}) {
  const [range, setRange] = useState<AvailRange>('tonight')
  const av = range === 'tonight' ? tonightAvail(villaStates) : AVAIL_SETS[range]
  const cells = [
    { label: 'Occupied', value: av.occupied, color: 'var(--matcha-600)' },
    { label: 'Reserved', value: av.reserved, color: 'var(--matcha-300)' },
    { label: 'Available', value: av.available, color: 'var(--matcha-100)' },
    { label: 'Not ready', value: av.notready, color: 'var(--stone-200)' },
  ]
  const seg = [
    { flex: av.occupied || 0.001, background: 'var(--matcha-600)', radius: '6px 0 0 6px' },
    { flex: av.reserved || 0.001, background: 'var(--matcha-300)', radius: '0' },
    { flex: av.available || 0.001, background: 'var(--matcha-100)', radius: '0' },
    { flex: av.notready || 0.001, background: 'var(--stone-200)', radius: '0 6px 6px 0' },
  ]

  return (
    <div className={`${CARD} flex h-full flex-col px-5 pt-[18px] pb-4`}>
      <h2 className={CARD_TITLE} style={{ fontFamily: display }}>
        Villa availability
      </h2>
      <div className="mt-3">
        <Segmented value={range} options={AV_RANGES} onChange={setRange} />
      </div>
      <div className="mt-4 flex gap-[3px]">
        {seg.map((s, i) => (
          <span key={i} className="h-[34px]" style={{ flex: s.flex, background: s.background, borderRadius: s.radius }} />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-[var(--border-default)]">
        {cells.map((c) => (
          <div key={c.label} className="bg-card px-[13px] py-[11px]">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase">
              <span className="size-[7px] rounded-full" style={{ background: c.color }} />
              {c.label}
            </span>
            <span
              className="mt-1.5 block text-[21px] font-semibold text-[var(--text-heading)]"
              style={{ fontFamily: mono }}
            >
              {c.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- arrivals and departures chart -------------------------------- */

const CHART_RANGES: [string, string][] = [
  ['7', '7 days'],
  ['14', '14 days'],
  ['30', '30 days'],
]

function ArrivalsDeparturesCard() {
  const [range, setRange] = useState('7')
  const [hover, setHover] = useState(-1)

  const n = parseInt(range, 10)
  const series = chartSeries(n)
  const peak = Math.max(...series.map((p) => Math.max(p.a, p.d)))
  const every = n <= 7 ? 1 : n <= 14 ? 2 : 5
  const totalA = series.reduce((t, p) => t + p.a, 0)
  const totalD = series.reduce((t, p) => t + p.d, 0)
  const hov = hover >= 0 ? series[hover] : null

  return (
    <div className={`${CARD} h-full px-5 pt-[18px] pb-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 className={CARD_TITLE} style={{ fontFamily: display }}>
          Arrivals and departures
        </h2>
        <Segmented value={range} options={CHART_RANGES} onChange={setRange} />
      </div>

      <div className="mt-3 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <span className="size-[9px] rounded-[2px]" style={{ background: 'var(--matcha-600)' }} />
          Arrivals
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
          <span className="size-[9px] rounded-[2px]" style={{ background: 'var(--matcha-200)' }} />
          Departures
        </span>
        <span className="flex-1" />
        <span
          className="text-[11px] tracking-[0.06em] text-[var(--text-secondary)] uppercase"
          style={{ fontFamily: mono }}
        >
          {totalA} arrivals · {totalD} departures
        </span>
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <div
          className="flex h-[172px] w-[26px] flex-none flex-col items-end justify-between text-[10px] text-[var(--text-secondary)]"
          style={{ fontFamily: mono }}
        >
          <span>{peak}</span>
          <span>{Math.round(peak / 2)}</span>
          <span>0</span>
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="flex h-[172px] items-end gap-[3px] border-b border-border">
            {series.map((p, i) => (
              <span
                key={i}
                className="flex h-full min-w-0 flex-1 items-end justify-center gap-[2px] rounded-t-[4px] transition-colors"
                style={{ background: hover === i ? 'var(--stone-100)' : 'transparent' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
              >
                <span
                  className="w-2/5 max-w-[16px] rounded-t-[3px]"
                  style={{ height: `${Math.round((p.a / peak) * 100)}%`, background: 'var(--matcha-600)' }}
                />
                <span
                  className="w-2/5 max-w-[16px] rounded-t-[3px]"
                  style={{ height: `${Math.round((p.d / peak) * 100)}%`, background: 'var(--matcha-200)' }}
                />
              </span>
            ))}
          </div>
          {hov && (
            <div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg px-3 py-[9px] whitespace-nowrap"
              style={{
                left: `${((hover + 0.5) / series.length) * 100}%`,
                background: 'var(--surface-nav)',
                color: 'var(--matcha-50)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <span
                className="block text-[10.5px] tracking-[0.06em] uppercase"
                style={{ fontFamily: mono, color: 'var(--matcha-300)' }}
              >
                {hov.label}
              </span>
              <span className="mt-[5px] block text-[12.5px] font-semibold" style={{ fontFamily: mono }}>
                {hov.a} in · {hov.d} out
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 ml-9 flex gap-[3px]">
        {series.map((p, i) => (
          <span
            key={i}
            className="min-w-0 flex-1 overflow-hidden text-center text-[10px] whitespace-nowrap"
            style={{
              fontFamily: mono,
              color: hover === i ? 'var(--matcha-700)' : 'var(--text-secondary)',
            }}
          >
            {i % every === 0 ? (n <= 7 ? p.label : p.short) : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---- bookings by source ------------------------------------------ */

const SOURCE_RANGES: [SourceRange, string][] = [
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['year', 'Year'],
]

function BookingsBySourceCard() {
  const [range, setRange] = useState<SourceRange>('30d')
  const [hover, setHover] = useState(-1)

  const set = SOURCE_SETS[range]
  const total = SOURCE_TOTALS[range]

  let acc = 0
  const stops = set.map(([, pct], i) => {
    const from = acc
    acc += pct
    const c = SOURCE_COLORS[i][hover === -1 || hover === i ? 0 : 1]
    return `${c} ${from}% ${acc}%`
  })
  const donutGradient = `conic-gradient(${stops.join(', ')})`
  const donutValue = hover >= 0 ? `${set[hover][1]}%` : String(total)
  const donutCaption = hover >= 0 ? set[hover][0] : 'bookings in range'

  return (
    <div className={`${CARD} px-5 pt-[18px] pb-5`}>
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <h2 className={CARD_TITLE} style={{ fontFamily: display }}>
          Bookings by source
        </h2>
        <Segmented value={range} options={SOURCE_RANGES} onChange={setRange} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div
          className="relative size-[164px] flex-none rounded-full"
          style={{ background: donutGradient }}
        >
          <div className="absolute inset-[34px] flex flex-col items-center justify-center gap-[3px] rounded-full bg-card">
            <span
              className="text-[23px] leading-none font-semibold text-[var(--text-heading)]"
              style={{ fontFamily: mono }}
            >
              {donutValue}
            </span>
            <span className="max-w-[76px] text-center text-[10.5px] leading-[1.2] text-pretty text-[var(--text-secondary)]">
              {donutCaption}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-0.5">
          {set.map(([label, pct], i) => (
            <span
              key={label}
              className="flex cursor-pointer items-center gap-2.5 rounded-md px-[9px] py-[7px] transition-colors"
              style={{ background: hover === i ? 'var(--surface-tint)' : 'transparent' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(-1)}
            >
              <span
                className="size-[9px] flex-none rounded-[2px]"
                style={{ background: SOURCE_COLORS[i][0] }}
              />
              <span className="min-w-0 flex-1 truncate text-[13.5px] text-[var(--text-primary)]">
                {label}
              </span>
              <span className="text-[12px] text-[var(--text-secondary)]" style={{ fontFamily: mono }}>
                {Math.round((pct / 100) * total)}
              </span>
              <span
                className="w-[42px] text-right text-[13px] font-semibold text-[var(--text-heading)]"
                style={{ fontFamily: mono }}
              >
                {pct}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ---- availability calendar ------------------------------------- */

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Colour a day by how many villas are still free that night. */
function dayFill(free: number): { bg: string; fg: string; border: string } {
  if (free === 0)
    return { bg: 'var(--matcha-600)', fg: 'var(--matcha-50)', border: 'var(--matcha-600)' }
  if (free <= 3)
    return { bg: 'var(--matcha-200)', fg: 'var(--matcha-800)', border: 'var(--matcha-200)' }
  return { bg: 'var(--surface-card)', fg: 'var(--text-primary)', border: 'var(--border-default)' }
}

const LEGEND: [string, string, boolean][] = [
  ['Open', 'var(--surface-card)', true],
  ['Few left', 'var(--matcha-200)', false],
  ['Booked out', 'var(--matcha-600)', false],
]

function AvailabilityCalendarCard() {
  const cells = availabilityMonth(TODAY.getFullYear(), TODAY.getMonth())
  const monthLabel = `${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`
  const upcoming = cells.filter((c) => c.inMonth && !c.past)
  const openNights = upcoming.filter((c) => c.free > 0).length

  return (
    <div className={`${CARD} flex flex-col px-5 pt-[18px] pb-5`}>
      <div className="flex items-baseline justify-between gap-2.5">
        <h2 className={CARD_TITLE} style={{ fontFamily: display }}>
          Booking calendar
        </h2>
        <span
          className="text-[10.5px] tracking-[0.06em] text-[var(--text-secondary)] uppercase"
          style={{ fontFamily: mono }}
        >
          {monthLabel}
        </span>
      </div>

      <p className="mt-1.5 text-[12.5px] text-[var(--text-secondary)]">
        {openNights} of {upcoming.length} nights left still have a villa free.
      </p>

      <div className="mt-3.5 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            className="text-center text-[10px] font-semibold tracking-[0.04em] text-[var(--text-secondary)] uppercase"
            style={{ fontFamily: mono }}
          >
            {w}
          </span>
        ))}
      </div>

      <div
        className="mt-1.5 grid grid-cols-7 gap-1.5"
        style={{ gridAutoRows: '46px' }}
      >
        {cells.map((c, i) => {
          if (!c.inMonth)
            return (
              <span
                key={i}
                className="flex items-start justify-center pt-1.5 text-[12px] text-[var(--text-placeholder)]"
                style={{ fontFamily: mono }}
              >
                {c.date}
              </span>
            )
          const t = dayFill(c.free)
          return (
            <span
              key={i}
              className="flex items-center justify-center rounded-[7px] border text-[13px] font-semibold"
              style={{
                background: t.bg,
                color: t.fg,
                borderColor: c.today ? 'var(--matcha-700)' : t.border,
                boxShadow: c.today ? 'inset 0 0 0 1.5px var(--matcha-700)' : 'none',
                opacity: c.past ? 0.4 : 1,
                fontFamily: mono,
              }}
              title={`${c.date} ${monthLabel} — ${c.free} of ${c.total} villas free`}
            >
              {c.date}
            </span>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3">
        {LEGEND.map(([label, color, outlined]) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-secondary)]"
          >
            <span
              className="size-[10px] rounded-[3px] border"
              style={{
                background: color,
                borderColor: outlined ? 'var(--border-strong)' : color,
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---- screen -------------------------------------------------- */

export interface DashboardProps {
  arrivals: BookingRow[]
  villaStates: Record<string, [VillaState, string]>
  confirmation: string
  onGenerate: (code: string) => void
  onDismissConfirmation: () => void
  onAddBooking: () => void
  onViewBooking?: () => void
}

export function Dashboard({
  arrivals,
  villaStates,
  confirmation,
  onDismissConfirmation,
  onAddBooking,
}: DashboardProps) {
  const tonight = tonightAvail(villaStates)
  const occupancyPct = `${Math.round((tonight.occupied / VILLA_SPEC.length) * 100)}%`
  const occupancyFoot = `${tonight.occupied} of ${VILLA_SPEC.length} villas held`
  const unsettled = arrivals.filter((r) => r.tone !== 'paid').length

  return (
    <ManagerShell title="Dashboard" active="dashboard">
      <div className="flex flex-col gap-4 px-[30px] pt-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <p className="m-0 text-[14.5px] text-[var(--text-secondary)]">
            Thu 12 Mar · 09:14 · 6 arrivals expected today
          </p>
          <span className="flex items-center gap-3.5">
            <span
              className="text-[12px] tracking-[0.06em] text-[var(--text-secondary)] uppercase"
              style={{ fontFamily: mono }}
            >
              Week 11 · 2026
            </span>
            <Button
              onClick={onAddBooking}
              className="h-[38px] rounded-[18px] px-4 text-[14px] font-semibold [&_svg:not([class*='size-'])]:size-[17px]"
            >
              <Icon name="plus" size={17} />
              Add Booking
            </Button>
          </span>
        </div>

        {confirmation && (
          <Alert className="flex items-center gap-3 rounded-[12px] border border-[var(--border-tinted)] bg-[var(--surface-tint)] px-[18px] py-3.5 text-[var(--matcha-700)]">
            <Icon name="check" size={18} />
            <AlertDescription className="flex-1 text-[14.5px] text-[var(--text-primary)]">
              {confirmation}
            </AlertDescription>
            <button
              type="button"
              onClick={onDismissConfirmation}
              className="text-[11px] tracking-[0.06em] text-[var(--text-secondary)] uppercase"
              style={{ fontFamily: mono }}
            >
              Dismiss
            </button>
          </Alert>
        )}

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
        >
          <StatTile
            label="Occupancy tonight"
            value={occupancyPct}
            delta="▲ 6 pts"
            deltaTone="ok"
            foot={occupancyFoot}
          />
          <StatTile
            label="Arrivals today"
            value={String(arrivals.length)}
            delta="▲ 24%"
            deltaTone="ok"
            foot={
              <>
                Previous week · <span style={{ fontFamily: mono }}>59</span>
              </>
            }
          />
          <StatTile
            label="Guests on site"
            value="24"
            delta="▲ 9%"
            deltaTone="ok"
            foot={
              <>
                Across <span style={{ fontFamily: mono }}>7</span> villas
              </>
            }
          />
          <StatTile
            label="Balance due"
            value="रु 86,400"
            delta="▼ 12%"
            deltaTone="deny"
            foot={`${unsettled} bookings unsettled`}
          />
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 flex-col gap-4" style={{ flex: '3 1 640px' }}>
            <div className="flex flex-wrap items-stretch gap-4">
              <div className="min-w-0" style={{ flex: '1 1 262px' }}>
                <VillaAvailabilityCard villaStates={villaStates} />
              </div>
              <div className="min-w-0" style={{ flex: '2 1 400px' }}>
                <ArrivalsDeparturesCard />
              </div>
            </div>

            <BookingsBySourceCard />
          </div>

          <div className="min-w-0" style={{ flex: '1 1 296px' }}>
            <AvailabilityCalendarCard />
          </div>
        </div>
      </div>
    </ManagerShell>
  )
}
