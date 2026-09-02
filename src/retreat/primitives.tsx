import type { CSSProperties, ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Tone } from './data'

/* Thin retreat-flavoured wrappers over shadcn primitives.
 * The design tokens (src/retreat/tokens.css) carry the exact values;
 * the shadcn components carry the structure and behaviour. */

/** A shadcn <Card> restyled as the retreat's flat, 1px-bordered panel. */
export function Panel({
  children,
  className,
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <Card
      className={cn(
        'gap-0 rounded-[var(--radius-card)] border border-border bg-card py-0 text-card-foreground shadow-none ring-0',
        className,
      )}
      style={style}
    >
      {children}
    </Card>
  )
}

const TONE_STYLE: Record<Tone, { bg: string; fg: string }> = {
  paid: { bg: 'var(--status-ok-bg)', fg: 'var(--status-ok-fg)' },
  partial: { bg: 'var(--status-warn-bg)', fg: 'var(--status-warn-fg)' },
  pending: { bg: 'var(--status-idle-bg)', fg: 'var(--status-idle-fg)' },
  onsite: { bg: 'var(--status-info-bg)', fg: 'var(--status-info-fg)' },
  denied: { bg: 'var(--status-deny-bg)', fg: 'var(--status-deny-fg)' },
}

/** The one status badge — a shadcn <Badge> in the retreat's mono/pill style. */
export function StatusBadge({
  tone = 'pending',
  children,
  dot = true,
}: {
  tone?: Tone
  children: ReactNode
  dot?: boolean
}) {
  const t = TONE_STYLE[tone] ?? TONE_STYLE.pending
  return (
    <Badge
      className="h-auto gap-1.5 rounded-full border-0 px-2.5 py-[5px] font-mono text-[11.5px] font-semibold tracking-[0.06em] uppercase"
      style={{ background: t.bg, color: t.fg }}
    >
      {dot && (
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: 'currentColor' }} />
      )}
      {children}
    </Badge>
  )
}

/** Delta pill on the stat tiles ("▲ 24%"). */
export function DeltaBadge({
  children,
  bg,
  fg,
}: {
  children: ReactNode
  bg: string
  fg: string
}) {
  return (
    <Badge
      className="h-auto gap-1 rounded-full border-0 px-[9px] py-1 font-mono text-[11px] font-semibold"
      style={{ background: bg, color: fg }}
    >
      {children}
    </Badge>
  )
}
