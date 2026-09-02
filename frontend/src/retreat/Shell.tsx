import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon, type IconName } from './Icon'
import { Logo } from './Logo'
import { useTheme } from './theme'

const mono = 'var(--font-mono)'
const display = 'var(--font-display)'

/** Light / dark switch for the profile menu. */
function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const opt = (value: 'light' | 'dark', label: string, icon: IconName) => {
    const on = theme === value
    return (
      <button
        type="button"
        onClick={() => setTheme(value)}
        aria-pressed={on}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-[5px] border px-2 py-1.5 text-[12.5px] font-semibold transition-colors"
        style={{
          background: on ? 'var(--surface-card)' : 'transparent',
          borderColor: on ? 'var(--border-default)' : 'transparent',
          color: on ? 'var(--text-heading)' : 'var(--text-secondary)',
          boxShadow: on ? 'var(--shadow-card)' : 'none',
        }}
      >
        <Icon name={icon} size={14} />
        {label}
      </button>
    )
  }
  return (
    <div className="px-1.5 py-1.5">
      <span
        className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.08em] text-[var(--text-secondary)] uppercase"
        style={{ fontFamily: mono }}
      >
        Appearance
      </span>
      <div className="flex gap-1 rounded-md bg-[var(--surface-page)] p-1">
        {opt('light', 'Light', 'sun')}
        {opt('dark', 'Dark', 'moon')}
      </div>
    </div>
  )
}

type Badge = { count: number; tone: 'warn' | 'ok' }
type SubItem = { key: string; label: string; to?: string; badge?: Badge }
type NavItem = {
  key: string
  label: string
  icon: IconName
  to?: string
  children?: SubItem[]
}

/* Same items the app already carries; Bookings and Activity Log gain the
 * nested sections the reference sidebar shows. */
const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'home', to: '/' },
  {
    key: 'booking',
    label: 'Bookings',
    icon: 'ticket',
    children: [
      { key: 'booking-new', label: 'New booking', to: '/booking' },
      { key: 'booking-all', label: 'All bookings', to: '/' },
      { key: 'booking-arrivals', label: 'Arrivals', badge: { count: 6, tone: 'warn' } },
      { key: 'booking-departures', label: 'Departures', badge: { count: 4, tone: 'ok' } },
      { key: 'booking-drafts', label: 'Drafts' },
    ],
  },

  {
    key: 'log',
    label: 'Activity Log',
    icon: 'clock',
    children: [
      { key: 'log-full', label: 'Full log' },
      { key: 'log-checkins', label: 'Check-ins' },
      { key: 'log-checkouts', label: 'Check-outs' },
      { key: 'log-flagged', label: 'Flagged', badge: { count: 1, tone: 'warn' } },
    ],
  },

]

const BADGE_TONE: Record<Badge['tone'], { bg: string; fg: string }> = {
  warn: { bg: 'var(--status-warn-bg)', fg: 'var(--status-warn-fg)' },
  ok: { bg: 'var(--status-ok-bg)', fg: 'var(--status-ok-fg)' },
}

function CountBadge({ badge }: { badge: Badge }) {
  const t = BADGE_TONE[badge.tone]
  return (
    <span
      className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] font-semibold"
      style={{ background: t.bg, color: t.fg, fontFamily: mono }}
    >
      {badge.count}
    </span>
  )
}

function SubRow({ item, active }: { item: SubItem; active: boolean }) {
  const className =
    'group relative flex h-9 items-center gap-2 rounded-lg pr-2.5 pl-3 text-[13.5px] font-medium transition-colors' +
    (active ? '' : ' hover:bg-[var(--matcha-300)]')
  const style = active
    ? {
      background: 'var(--surface-card)',
      color: 'var(--text-heading)',
      boxShadow: 'var(--shadow-card)',
      border: '1px solid var(--border-default)',
      height: '26px',
    }
    : { color: 'var(--text-secondary)' }
  const body = (
    <>
      {!active && (
        <span
          className="absolute -left-[13px] h-px w-2"
          style={{ background: 'var(--border-strong)' }}
        />
      )}
      <span className="flex-1 truncate group-hover:text-[var(--matcha-900)]">{item.label}</span>
      {item.badge && <CountBadge badge={item.badge} />}
    </>
  )
  return item.to ? (
    <Link to={item.to} className={className} style={style}>
      {body}
    </Link>
  ) : (
    <button type="button" className={className} style={style}>
      {body}
    </button>
  )
}

function NavGroup({ item, active }: { item: NavItem; active: string }) {
  /* Callers pass a top-level key ("dashboard" / "booking"); resolve it to the
   * sub-item that should read as current. */
  const activeSub =
    active === 'booking' ? 'booking-new' : active
  const groupActive =
    item.key === active || !!item.children?.some((c) => c.key === activeSub)
  const [open, setOpen] = useState(groupActive)

  const rowClass =
    'flex h-11 w-full items-center gap-[11px] rounded-md px-3.5 text-[14.5px] font-semibold transition-colors'
  const hoverRow = `${rowClass} text-[var(--text-secondary)] hover:bg-[var(--matcha-300)] hover:text-[var(--matcha-900)]`

  if (!item.children) {
    const on = item.key === active
    if (on) {
      const style = {
        background: 'var(--surface-tint)',
        color: 'var(--action-secondary-text)',
      }
      return item.to ? (
        <Link to={item.to} className={rowClass} style={style}>
          <Icon name={item.icon} size={18} />
          {item.label}
        </Link>
      ) : (
        <button type="button" className={rowClass} style={style}>
          <Icon name={item.icon} size={18} />
          {item.label}
        </button>
      )
    }
    return item.to ? (
      <Link to={item.to} className={hoverRow}>
        <Icon name={item.icon} size={18} />
        {item.label}
      </Link>
    ) : (
      <button type="button" className={hoverRow}>
        <Icon name={item.icon} size={18} />
        {item.label}
      </button>
    )
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={
          groupActive
            ? `${rowClass} text-[var(--text-heading)]`
            : hoverRow
        }
      >
        <Icon name={item.icon} size={18} />
        <span className="flex-1 text-left">{item.label}</span>
        <Icon
          name="chevronDown"
          size={15}
          color="var(--stone-600)"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--dur-fast) var(--ease-standard)',
          }}
        />
      </button>

      {open && (
        <div className="relative mt-1 mb-1 ml-[22px] flex flex-col gap-0.5 pl-[15px]">
          <span
            className="absolute top-1 bottom-1 left-0 w-px"
            style={{ background: 'var(--border-strong)' }}
          />
          {item.children.map((sub) => (
            <SubRow key={sub.key} item={sub} active={sub.key === activeSub} />
          ))}
        </div>
      )}
    </div>
  )
}

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="sticky top-0 box-border flex h-screen w-[236px] flex-none flex-col gap-5 overflow-y-auto border-r border-border bg-card px-[18px] py-[26px]">
      <div className="flex items-center gap-[11px] px-1.5">
        <Logo size={38} />
        <span className="flex flex-col gap-[3px]">
          <span
            className="text-[17px] leading-none font-semibold text-[var(--text-heading)]"
            style={{ fontFamily: display }}
          >
            Grassland Zen
          </span>
          <span
            className="text-[9.5px] tracking-[0.18em] text-[var(--text-secondary)] uppercase"
            style={{ fontFamily: mono }}
          >
            Retreat Ops
          </span>
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavGroup key={item.key} item={item} active={active} />
        ))}
      </nav>

      <span className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex  items-center gap-[11px] rounded-[12px]  bg-card px-1 py-[11px] text-left transition-colors hover:border-[var(--border-tinted)] hover:bg-[var(--surface-tint)]"
            />
          }
        >
          <span
            className="flex size-[38px] flex-none items-center justify-center rounded-[8px] bg-[var(--matcha-100)] text-[14.5px] font-semibold text-[var(--matcha-700)]"
            style={{ fontFamily: display }}
          >
            NP
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="truncate text-[14px] leading-[1.15] font-semibold text-[var(--text-heading)]">
              Nok Prasert
            </span>
            <span
              className="text-[10.5px] tracking-[0.06em] text-[var(--text-secondary)] uppercase"
              style={{ fontFamily: mono }}
            >
              Manager
            </span>
          </span>
          <Icon name="chevronDown" size={15} color="var(--stone-600)" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Nok Prasert · Manager</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ThemeToggle />
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </aside>
  )
}

function Topbar({ title }: { title: string }) {
  const iconBtn =
    'flex size-[42px] items-center justify-center rounded-md border border-border text-[var(--stone-600)] transition-colors hover:bg-[var(--stone-100)]'
  return (
    <header className="flex items-center gap-4 bg-card px-[30px] py-[18px]">
      <h1
        className="m-0 flex-1 text-[23px] font-semibold text-[var(--text-heading)]"
        style={{ fontFamily: display }}
      >
        {title}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex h-[42px] items-center gap-2.5 rounded-md border border-[var(--border-strong)] px-3.5 text-[14px] font-semibold text-[var(--text-primary)]"
            />
          }
        >
          <span className="flex size-[26px] items-center justify-center rounded-md bg-[var(--surface-tint)] text-[var(--action-secondary-text)]">
            <Icon name="bed" size={15} />
          </span>
          Grassland Zen · North Gate
          <Icon name="chevronDown" size={15} color="var(--stone-600)" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Property · gate</DropdownMenuLabel>
            <DropdownMenuItem>
              <Icon name="bed" size={15} />
              Grassland Zen · North Gate
              <Icon name="check" size={14} style={{ marginInlineStart: 'auto' }} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <button type="button" className={iconBtn} aria-label="Search">
        <Icon name="search" size={18} />
      </button>

      <button type="button" className={`relative ${iconBtn}`} aria-label="Alerts">
        <Icon name="alert" size={18} />
        <span
          className="absolute top-[9px] right-[10px] size-[7px] rounded-full"
          style={{ background: 'var(--clay-500)', border: '1.5px solid var(--stone-0)' }}
        />
      </button>
    </header>
  )
}

/** Desk shell: sticky 236px sidebar + header + scrolling content column. */
export function ManagerShell({
  title,
  active,
  children,
}: {
  title: string
  active: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--surface-app)',
        fontFamily: 'var(--font-ui)',
        color: 'var(--text-primary)',
      }}
    >
      <div className="flex min-h-screen items-stretch">
        <Sidebar active={active} />
        <main className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} />
          {children}
        </main>
      </div>
    </div>
  )
}
