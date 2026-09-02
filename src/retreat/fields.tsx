import type { ReactNode } from 'react'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/* Retreat form fields, composed from shadcn's Field / Input / Select /
 * Textarea. The design tokens (src/retreat/tokens.css) carry the exact
 * 42px control height, 6px radius, inset shadow and focus ring. */

const LABEL_CLASS =
  'mb-[7px] block text-[11px] font-semibold tracking-[0.06em] text-[var(--text-secondary)] uppercase'

const CONTROL_CLASS =
  'flex h-[42px] items-center gap-2 rounded-[6px] border border-[var(--border-strong)] bg-[var(--stone-0)] px-3 ' +
  'transition-[box-shadow,border-color] duration-[120ms] ' +
  'focus-within:border-[var(--matcha-500)] focus-within:shadow-[var(--ring-focus)]'

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  mono,
  prefix,
  disabled,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  error?: string
  mono?: boolean
  prefix?: string
  disabled?: boolean
  type?: string
}) {
  return (
    <Field data-invalid={!!error} className="gap-0">
      <FieldLabel className={LABEL_CLASS}>{label}</FieldLabel>
      <span
        className={cn(
          CONTROL_CLASS,
          error && 'border-[var(--clay-500)] focus-within:border-[var(--clay-500)]',
          disabled && 'bg-[var(--stone-100)]',
          !error && 'shadow-[var(--shadow-inset-field)]',
        )}
      >
        {prefix && (
          <span className="text-[13px] text-[var(--text-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>
            {prefix}
          </span>
        )}
        <Input
          type={type}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'h-auto rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:border-0 focus-visible:ring-0',
            mono
              ? 'text-[14px] font-medium'
              : 'text-[15px] font-normal',
          )}
          style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)' }}
        />
      </span>
      {error ? (
        <FieldError className="mt-1.5 text-[12.5px] font-normal text-[var(--clay-600)]">
          {error}
        </FieldError>
      ) : (
        hint && (
          <FieldDescription className="mt-1.5 text-[12.5px] text-[var(--text-secondary)]">
            {hint}
          </FieldDescription>
        )
      )}
    </Field>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  hint?: string
}) {
  return (
    <Field className="gap-0">
      <FieldLabel className={LABEL_CLASS}>{label}</FieldLabel>
      <Select value={value} onValueChange={(v) => onChange(v as string)}>
        <SelectTrigger className="h-[42px] w-full rounded-[6px] border-[var(--border-strong)] bg-[var(--stone-0)] px-3 text-[15px] text-[var(--text-primary)] shadow-[var(--shadow-inset-field)] focus-visible:border-[var(--matcha-500)] focus-visible:shadow-[var(--ring-focus)] data-[popup-open]:border-[var(--matcha-500)]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o} className="text-[14px]">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && (
        <FieldDescription className="mt-1.5 text-[12.5px] text-[var(--text-secondary)]">
          {hint}
        </FieldDescription>
      )}
    </Field>
  )
}

export function NoteField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Field className="mt-[18px] gap-0">
      <FieldLabel className={LABEL_CLASS}>{label}</FieldLabel>
      <Textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[88px] resize-y rounded-[6px] border-[var(--border-strong)] bg-[var(--stone-0)] px-3 py-[11px] text-[15px] leading-[1.5] text-[var(--text-primary)] shadow-[var(--shadow-inset-field)] focus-visible:border-[var(--matcha-500)] focus-visible:shadow-[var(--ring-focus)] focus-visible:ring-0"
        style={{ fontFamily: 'var(--font-ui)' }}
      />
    </Field>
  )
}

/** Read-only payment-status tile that sits alongside the payment fields. */
export function PaymentStatusTile({ status }: { status: ReactNode }) {
  return (
    <div className="flex items-end">
      <div className="w-full rounded-[6px] border border-[var(--border-tinted)] bg-[var(--surface-tint)] px-3.5 py-[11px]">
        <span className="block text-[11px] font-semibold tracking-[0.06em] text-[var(--matcha-600)] uppercase">
          Payment Status
        </span>
        <span
          className="mt-[5px] block text-[14px] font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {status}
        </span>
      </div>
    </div>
  )
}
