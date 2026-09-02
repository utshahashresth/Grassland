import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from './Icon'
import { Panel } from './primitives'
import { TextField, SelectField, NoteField, PaymentStatusTile } from './fields'
import {
  VILLA_SPEC,
  SOURCE_OPTIONS,
  METHOD_OPTIONS,
  RULES,
  baht,
  num,
  rateOf,
  capacityOf,
  type BookingRow,
  type Tone,
} from './data'

const STEPS = ['stay', 'guests', 'payment']

export interface NewBookingResult {
  row: BookingRow
  confirmation: string
  villaName: string
  villaDetail: string
}

const display = 'var(--font-display)'
const mono = 'var(--font-mono)'

const initialDraft = {
  villa: 'Lotus Villa',
  source: 'Phone call',
  checkIn: '',
  checkOut: '',
  booker: '',
  phone: '',
  email: '',
  idNumber: '',
  adults: '2',
  children: '0',
  arrival: '14:00',
  total: '',
  paid: '',
  method: 'Bank transfer',
  notes: '',
}

export function NewBooking({
  seq,
  formFlow = 'sections',
  onCancel,
  onConfirm,
}: {
  seq: number
  formFlow?: 'sections' | 'stepped'
  onCancel: () => void
  onConfirm: (result: NewBookingResult) => void
}) {
  const [d, setD] = useState(initialDraft)
  const [step, setStep] = useState(0)
  const set = <K extends keyof typeof d>(k: K) => (v: string) => setD((s) => ({ ...s, [k]: v }))

  const stepped = formFlow === 'stepped'

  const derived = useMemo(() => {
    const cap = capacityOf(d.villa)
    const guests = num(d.adults) + num(d.children)
    const over = guests > cap
    const total = num(d.total)
    const paid = num(d.paid)
    const balance = Math.max(0, total - paid)

    const complete =
      d.booker.trim() &&
      d.phone.trim() &&
      d.checkIn.trim() &&
      d.checkOut.trim() &&
      total > 0 &&
      (!RULES.requireDeposit || paid > 0)
    const canSubmit = !!complete && !(RULES.blockOverCapacity && over)

    return {
      cap,
      guests,
      over,
      total,
      paid,
      balance,
      canSubmit,
      villaHint: `Sleeps ${cap} · ${baht(rateOf(d.villa))} per night`,
      stayHint: d.checkIn && d.checkOut ? `${d.checkIn} – ${d.checkOut}` : 'Day and month, as the booker says it.',
      capacityHint: `${guests} of ${cap} beds taken`,
      capacityError: over ? `${d.villa} sleeps ${cap} — reduce guests or split the booking` : '',
      arrivalHint:
        num(d.arrival.slice(0, 2)) >= 22
          ? 'After 22:00 — note the late shuttle for the guard'
          : '24h. Note the late shuttle if after 22:00.',
      rateHint: `Rack rate ${baht(rateOf(d.villa))} per night`,
      balanceHint:
        total > 0
          ? balance > 0
            ? `${baht(balance)} due at check-in`
            : 'Paid in full'
          : 'Enter the stay total first.',
      payStatus:
        total > 0 ? (balance > 0 ? `Partial · ${baht(balance)} due` : 'Paid in full') : 'Pending',
    }
  }, [d])

  const submit = () => {
    const code = `GZR-${seq}`
    const guests = num(d.adults) + num(d.children)
    const name = d.booker.trim() || 'Unnamed booker'
    const total = num(d.total)
    const paid = num(d.paid)
    const full = total > 0 && paid >= total
    const tone: Tone = full ? 'paid' : paid > 0 ? 'partial' : 'pending'
    const row: BookingRow = {
      name,
      phone: d.phone.trim() || '—',
      code,
      nights: '—',
      villa: d.villa,
      guests,
      status: full ? 'Paid' : paid > 0 ? `Partial · ${baht(total - paid)} due` : 'Pending',
      tone,
      passes: false,
      total,
    }
    onConfirm({
      row,
      confirmation: `${code} confirmed · ${d.villa} · ${name} · ${guests} guests · ${total ? baht(total) : 'rate to confirm'}`,
      villaName: d.villa,
      villaDetail: `${d.arrival || '—'} · ${guests} guests`,
    })
  }

  const showStay = !stepped || step === 0
  const showGuests = !stepped || step === 1
  const showPayment = !stepped || step === 2
  const onLast = !stepped || step === 2

  const primaryLabel = onLast ? 'Confirm Booking' : 'Continue'
  const primaryDisabled = onLast ? !derived.canSubmit : false
  const primaryAction = onLast ? submit : () => setStep((s) => Math.min(2, s + 1))
  const secondaryLabel = stepped && step > 0 ? 'Back' : 'Cancel'
  const secondaryAction = stepped && step > 0 ? () => setStep((s) => s - 1) : onCancel

  const summaryLine = stepped
    ? `Step ${step + 1} of 3 · ${STEPS[step]}`
    : derived.canSubmit
      ? `${d.villa} · ${derived.guests} guests · ${derived.balance > 0 ? `${baht(derived.balance)} due at check-in` : 'paid in full'}`
      : derived.over
        ? 'Over capacity — reduce guests to continue'
        : 'Booker, phone, dates and payment are required'

  const villaOptions = VILLA_SPEC.map((v) => v[0])
  const lgBtn = 'h-12 rounded-[6px] px-[22px] text-[15px] font-semibold'

  return (
    <div className="px-[30px] pt-6 pb-10">
      <div className="flex max-w-[880px] flex-col gap-5">
        <div className="flex items-end justify-between gap-6">
          <div>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-[7px] text-[11px] tracking-[0.06em] text-[var(--text-secondary)] uppercase transition-colors hover:text-[var(--matcha-700)]"
              style={{ fontFamily: mono }}
            >
              <Icon name="arrowLeft" size={14} />
              Back to dashboard
            </button>
            <h2
              className="mt-2.5 mb-1.5 text-[28px] leading-[1.1] font-semibold text-[var(--text-heading)]"
              style={{ fontFamily: display }}
            >
              New booking — taken by phone
            </h2>
            <p className="m-0 max-w-[58ch] text-[14.5px] leading-[1.5] text-pretty text-[var(--text-secondary)]">
              Enter the stay, then the guests, then record what the booker has paid. Passes generate
              once payment is confirmed.
            </p>
          </div>
          <span
            className="text-[12.5px] font-semibold whitespace-nowrap text-[var(--text-secondary)]"
            style={{ fontFamily: mono }}
          >
            Draft · GZR-{seq}
          </span>
        </div>

        {showStay && (
          <Panel className="p-[26px]">
            <CardHead step="1" title="The stay" blurb="Confirm the villa sleeps the party before quoting a rate." />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
              <SelectField
                label="Villa"
                value={d.villa}
                options={villaOptions}
                onChange={set('villa')}
                hint={derived.villaHint}
              />
              <SelectField
                label="Source Of Booking"
                value={d.source}
                options={SOURCE_OPTIONS}
                onChange={set('source')}
                hint="How the booker reached the retreat."
              />
              <TextField label="Check In" value={d.checkIn} onChange={set('checkIn')} placeholder="12 Mar" mono />
              <TextField
                label="Check Out"
                value={d.checkOut}
                onChange={set('checkOut')}
                placeholder="15 Mar"
                mono
                hint={derived.stayHint}
              />
            </div>
          </Panel>
        )}

        {showGuests && (
          <Panel className="p-[26px]">
            <CardHead step="2" title="Booker and guests" blurb="The booker's phone is how the gate reaches them if a pass fails." />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
              <TextField label="Booker Name" value={d.booker} onChange={set('booker')} placeholder="Full name as on ID" />
              <TextField label="Phone" value={d.phone} onChange={set('phone')} placeholder="081 234 5678" prefix="+66" mono />
              <TextField
                label="Email"
                value={d.email}
                onChange={set('email')}
                placeholder="booker@example.com"
                hint="Passes and receipt are sent here."
              />
              <TextField
                label="Nationality · ID Number"
                value={d.idNumber}
                onChange={set('idNumber')}
                placeholder="TH · 1103700123456"
                mono
                hint="Checked against the ID at the gate."
              />
              <TextField label="Adults" value={d.adults} onChange={set('adults')} mono />
              <TextField
                label="Children"
                value={d.children}
                onChange={set('children')}
                mono
                hint={derived.capacityHint}
                error={derived.capacityError}
              />
              <TextField
                label="Arrival Time"
                value={d.arrival}
                onChange={set('arrival')}
                placeholder="14:00"
                mono
                hint={derived.arrivalHint}
              />
            </div>
          </Panel>
        )}

        {showPayment && (
          <Panel className="p-[26px]">
            <CardHead step="3" title="Payment and notes" blurb="Record only what the booker has actually paid on this call." />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
              <TextField label="Stay Total" value={d.total} onChange={set('total')} prefix="฿" mono hint={derived.rateHint} />
              <TextField label="Deposit Paid" value={d.paid} onChange={set('paid')} prefix="฿" mono hint={derived.balanceHint} />
              <SelectField label="Method" value={d.method} options={METHOD_OPTIONS} onChange={set('method')} />
              <PaymentStatusTile status={derived.payStatus} />
            </div>
            <NoteField
              label="Special Requests · Notes For The Guard"
              value={d.notes}
              onChange={set('notes')}
              placeholder="Late shuttle at 22:40. Two guests arrive separately."
            />
          </Panel>
        )}

        <div className="flex flex-wrap items-center gap-3 pb-2">
          <Button className={lgBtn} disabled={primaryDisabled} onClick={primaryAction}>
            {primaryLabel}
          </Button>
          <Button
            variant="ghost"
            className={`${lgBtn} text-[var(--stone-800)] hover:bg-[var(--stone-100)]`}
            onClick={secondaryAction}
          >
            {secondaryLabel}
          </Button>
          <span className="flex-1" />
          <span
            className="text-right text-[12.5px] text-[var(--text-secondary)]"
            style={{ fontFamily: mono }}
          >
            {summaryLine}
          </span>
        </div>
      </div>
    </div>
  )
}

function CardHead({ step, title, blurb }: { step: string; title: string; blurb: string }) {
  return (
    <>
      <h3
        className="mb-1 text-[19px] font-semibold text-[var(--text-heading)]"
        style={{ fontFamily: display }}
      >
        {step} · {title}
      </h3>
      <p className="mb-5 text-[13.5px] text-[var(--text-secondary)]">{blurb}</p>
    </>
  )
}
