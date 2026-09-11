// Platform shell — the two surfaces every LT page inherits, carried over from
// the project-actions prototype so the demos read as one product.
// Built from design-context/patterns/platform-sidebar.md and topbar.md.
// Both chrome surfaces sit on the subtle grey (canvas.subtle #f6f8fa); page
// content stays white. Pages never redesign these.
import React, { useCallback, useRef, useState } from 'react'
import {
  Btn, Avatar, Tip, ChevronRight, MegaphoneIcon, ClockIcon, CreditsIcon,
  RailGlyph, NavGlyph,
} from './lt.jsx'

/* Primary nav, in the order recorded in platform-sidebar.md §2. */
const PRIMARY_NAV = [
  { id: 'home', label: 'Home' },
  { id: 'kaneai', label: 'KaneAI', sub: true },
  { id: 'kane-cli', label: 'Kane CLI' },
  { id: 'test-manager', label: 'Test Manager', sub: true },
  { id: 'agent-testing', label: 'Agent Testing' },
  { id: 'real-time', label: 'Real Time', sub: true },
  { id: 'real-device', label: 'Real Device', sub: true },
  { id: 'automation', label: 'Automation', sub: true },
  { id: 'smartui', label: 'SmartUI' },
  { id: 'hyperexecute', label: 'HyperExecute', sub: true },
  { id: 'insights', label: 'Insights', sub: true },
  { id: 'accessibility', label: 'Accessibility', sub: true },
  { id: 'web-scanner', label: 'Web Scanner', sub: true },
  { id: 'more-tools', label: 'More Tools', sub: true },
  { id: 'settings', label: 'Settings', sub: true },
]

const SECONDARY_NAV = [
  { id: 'help', label: 'Help', sub: true },
  { id: 'credentials', label: 'Credentials', sub: true },
  { id: 'quick-actions', label: 'Quick Actions', sub: true },
]

function NavItem({ item, active }) {
  return (
    <li>
      <a className={`navitem${active ? ' active' : ''}`} href="#nav"
        aria-current={active ? 'page' : undefined}
        onClick={e => e.preventDefault()}>
        <span className="navitem-icon" aria-hidden="true"><NavGlyph id={item.id} /></span>
        <span className="navitem-label">{item.label}</span>
        {item.sub && <span className="navitem-caret" aria-hidden="true"><ChevronRight /></span>}
      </a>
    </li>
  )
}

/**
 * Platform sidebar. 56px rail on the subtle grey chrome; expands on hover into
 * a ~320px panel that OVERLAYS the page — content never reflows
 * (platform-sidebar.md §1). Keyboard route via the brand trigger, per the
 * pattern's recorded recommendation.
 */
export function PlatformSidebar({ activeProduct = 'test-manager' }) {
  const [hover, setHover] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const wrapRef = useRef(null)
  const brandRef = useRef(null)
  const open = hover || pinnedOpen

  const close = useCallback(() => {
    setPinnedOpen(false)
    setHover(false)
  }, [])

  const onKeyDown = e => {
    if (e.key === 'Escape' && open) {
      close()
      brandRef.current?.focus()
    }
  }

  const onBlurCapture = e => {
    if (!wrapRef.current?.contains(e.relatedTarget)) setPinnedOpen(false)
  }

  return (
    <>
      <div className="rail-slot" />

      <div ref={wrapRef} className={`rail${open ? ' open' : ''}`}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        onKeyDown={onKeyDown} onBlurCapture={onBlurCapture}>

        <div className="rail-corner">
          <button ref={brandRef} type="button" className="rail-brand"
            aria-expanded={open} aria-label="TestMu AI — open platform navigation"
            onFocus={() => setPinnedOpen(true)}
            onClick={() => setPinnedOpen(v => !v)}>
            <span className="rail-mark" aria-hidden="true">T</span>
          </button>
        </div>

        {open ? (
          <>
            <div className="rail-word">
              <strong>TestMu AI</strong>
              <em>Formerly LambdaTest</em>
            </div>

            <nav className="rail-nav" aria-label="Products">
              <ul>
                {PRIMARY_NAV.map(item => (
                  <NavItem key={item.id} item={item} active={item.id === activeProduct} />
                ))}
              </ul>
            </nav>

            <hr className="rail-div" />

            <nav className="rail-secondary" aria-label="Support">
              <ul>
                {SECONDARY_NAV.map(item => <NavItem key={item.id} item={item} />)}
              </ul>
            </nav>

            <button type="button" className="btn orange rail-upgrade">Upgrade Now</button>
          </>
        ) : (
          <div className="rail-icons">
            <Tip label="Test Manager" side="e">
              <button type="button" className="rail-icon active" aria-label="Test Manager"
                aria-current="page">
                <RailGlyph id="test-manager" />
              </button>
            </Tip>
            {['a', 'b', 'c'].map(k => (
              <span key={k} className="rail-icon" aria-hidden="true"><RailGlyph id={k} /></span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* Left slot: breadcrumb at depth ≥ 2, plain bold label at depth 1
   (topbar.md §1 + guidelines/ltbreadcrumbs.md). */
function Breadcrumb({ crumbs }) {
  if (crumbs.length === 1) return <p className="crumb-single">{crumbs[0].label}</p>
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={c.label}>
              {i > 0 && <span className="crumb-sep" aria-hidden="true">/</span>}
              {last
                ? <span className="crumb current" aria-current="page">{c.label}</span>
                : <a className="crumb" href="#crumb" onClick={e => e.preventDefault()}>{c.label}</a>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/**
 * Platform top bar on the subtle grey chrome. Left slot is the breadcrumb; the
 * right cluster is modular — quota modules, a separator, product buttons, the
 * notifications bell, the avatar, then Upgrade Now, always rightmost
 * (topbar.md §1–§5). The bell arrives fully wired via `bellSlot` — trigger,
 * badge and panel live in panel.jsx, per notifications/notification-center.md.
 */
export function TopBar({ crumbs, user, credits, bellSlot }) {
  return (
    <header className="topbar">
      <Breadcrumb crumbs={crumbs} />

      <div className="topbar-right">
        {/* "Credits: 20k" — lowercase k, no space before the colon (topbar.md
            §6 delta 1). What the caret opens is unconfirmed (§8 q1). */}
        <Btn size="small" leading={<CreditsIcon />} caret>{`Credits: ${credits}`}</Btn>

        {/* Composed 1px rule — LTDivider documents no orientation (§8 q3). */}
        <span className="vsep" aria-hidden="true" />

        <Btn size="small" leading={<ClockIcon />}>Recent Tests</Btn>

        {/* Announcements must not read as a bell (guidelines/lticonbutton.md,
            topbar.md §8 q5). Megaphone intent, pending icons.md. */}
        <Tip label="Announcements">
          <button type="button" className="btn iconbtn outline" aria-label="Announcements">
            <MegaphoneIcon />
          </button>
        </Tip>

        {/* Notifications bell + panel — platform-scoped, constant, between the
            product buttons and the avatar (topbar.md §5). */}
        {bellSlot}

        <Avatar initials={user.initials} name={user.name} size={32} />

        <Btn variant="orange">Upgrade Now</Btn>
      </div>
    </header>
  )
}
