// The notification center: bell trigger + anchored panel, implementing
// notifications/notification-center.md. LTAnchoredOverlay-shaped assembly —
// icon-button anchor with a counter, opening a right-aligned overlay below it.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BellIcon, BellLargeIcon, Badge, Tip, Btn, Avatar, StatusIcon, TabNav,
  BlankSlate, Loader, Flash, InlineError, PaperclipIcon,
} from './lt.jsx'
import { TODAY, PAGE_SIZE, shortDate, initialNotifications, liveArrival, titleOf } from './data.js'

/* Today → "2:34 PM"; yesterday and older → "Sep 10" (panel-local formats,
   notification-center.md §5 decision 7). Viewer-local, no timezone suffix. */
const timeLabel = row => (row.day === TODAY ? row.time : shortDate(row.day))

function RowSlot({ row, state, onAccept, onDecline, announce }) {
  /* At most one of: action pair · attachment · resolved note. Secondary left,
     primary right, hard right — guidelines/README.md §7, and the brief. */
  if (row.actions) {
    const resolved = state === 'accepted' || state === 'declined'
    if (resolved) return <p className="resolved">{state === 'accepted' ? 'Accepted' : 'Declined'}</p>
    return (
      <>
        <div className="nrow-actions">
          <Btn size="small" loading={state === 'loading-decline'} onClick={onDecline}>
            {row.actions.secondary}
          </Btn>
          <Btn variant="primary" size="small" loading={state === 'loading-accept'} onClick={onAccept}>
            {row.actions.primary}
          </Btn>
        </div>
        {state === 'error' && <InlineError>Couldn't accept the invite. Try again.</InlineError>}
      </>
    )
  }
  if (row.resolvedNote) return <p className="resolved">{row.resolvedNote}</p>
  if (row.attachment) {
    return (
      <a className="attach" href="#file" title={row.attachment.name}
        onClick={e => { e.preventDefault(); e.stopPropagation(); announce('Report opening is stubbed in this prototype') }}>
        <PaperclipIcon />
        <span className="attach-name">{row.attachment.name}</span>
      </a>
    )
  }
  return null
}

function NotificationRow({ row, state, onOpen, onAccept, onDecline, announce }) {
  /* The text block is the row's one navigation target; the full row extends
     its hit area. Buttons and the attachment stay separate tab stops
     (notification-center.md §3.4). Navigation itself is stubbed here. */
  const openFromRow = e => {
    if (e.target.closest('button, a')) return
    onOpen(row)
  }
  return (
    <article className={`nrow${row.read ? '' : ' unread'}`} onClick={openFromRow}>
      <span className="nrow-avatar" aria-hidden={row.actor.system ? 'true' : undefined}>
        {row.actor.system
          ? <span className="sys-avatar"><StatusIcon status={row.actor.system} /></span>
          : <Avatar initials={row.actor.initials} name={row.actor.name} size={32} />}
      </span>

      <div className="nrow-main">
        <a className="nrow-title" href="#open"
          onClick={e => { e.preventDefault(); onOpen(row) }}>
          {!row.read && <span className="vh">Unread — </span>}
          {row.frags.map(([t, bold], i) => (bold ? <strong key={i}>{t}</strong> : <span key={i}>{t}</span>))}
        </a>
        <p className="nrow-meta">
          {timeLabel(row)}<span className="dot" aria-hidden="true">·</span>{row.product}
        </p>
        <RowSlot row={row} state={state} onAccept={onAccept} onDecline={onDecline} announce={announce} />
      </div>

      {/* Unread dot — LTNotificationIndicator type="dot". Not interactive in
          v1 (a dot cannot meet the 24px target floor, §5 decision 10). */}
      {!row.read && <span className="ndot" aria-hidden="true" />}
    </article>
  )
}

export function NotificationCenter({ mode, announce }) {
  const [open, setOpen] = useState(Boolean(mode))
  // 'unloaded' → first open fetches → 'loading' → 'ready' | 'error'
  const [phase, setPhase] = useState(mode ? (mode === 'error' ? 'error' : 'loading') : 'unloaded')
  const [items, setItems] = useState(() => (mode === 'empty' ? [] : initialNotifications))
  const [tab, setTab] = useState('unread')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [marking, setMarking] = useState(false)
  const [actionState, setActionState] = useState({})

  const anchorRef = useRef(null)
  const bellRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)

  const unreadCount = items.filter(x => !x.read).length
  /* Badge: hidden at zero; count unknown while the service errors or loads. */
  const badgeCount = mode === 'error' || mode === 'loading' ? 0 : unreadCount

  /* First open fetches; ?state=loading stays loading, ?state=error stays
     error. Deliberately not depending on `phase` (and re-reading it via the
     closure) so StrictMode's mount–cleanup–remount re-arms the timer. */
  useEffect(() => {
    if (!open || phase === 'ready' || phase === 'error') return
    if (mode === 'loading') { setPhase('loading'); return }
    setPhase('loading')
    const t = setTimeout(() => setPhase('ready'), 650)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode])

  /* A live arrival ~18s in: the row lands on top, badge and counter tick
     (notification-center.md §3.5). Default state only. */
  useEffect(() => {
    if (mode) return
    const t = setTimeout(() => {
      setItems(prev => (prev.some(x => x.id === liveArrival.id) ? prev : [liveArrival, ...prev]))
      announce(`New notification: ${titleOf(liveArrival)}`)
    }, 18000)
    return () => clearTimeout(t)
  }, [mode, announce])

  const close = useCallback((refocus = false) => {
    setOpen(false)
    if (refocus) bellRef.current?.focus()
  }, [])

  /* Esc closes and returns focus to the bell; click outside closes.
     Non-modal: no scrim, no focus trap (notification-center.md §3.2). */
  useEffect(() => {
    if (!open) return
    const onDown = e => { if (anchorRef.current && !anchorRef.current.contains(e.target)) close() }
    const onKey = e => { if (e.key === 'Escape') close(true) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  /* Focus moves into the panel on open. */
  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  const list = useMemo(
    () => (tab === 'unread' ? items.filter(x => !x.read) : items),
    [items, tab],
  )
  const shown = list.slice(0, visible)
  const exhausted = visible >= list.length

  const pickTab = id => {
    setTab(id)
    setVisible(PAGE_SIZE)
    if (listRef.current) listRef.current.scrollTop = 0
  }

  /* Lazy loading: the next page of 20 arrives under a small foot loader as
     the user nears the bottom — the newest-first feed idiom
     (hyperexecute-jobs-listing.md; notification-center.md §3.6). */
  const onScroll = () => {
    const el = listRef.current
    if (!el || loadingMore || exhausted || phase !== 'ready') return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setLoadingMore(true)
      setTimeout(() => {
        setVisible(v => v + PAGE_SIZE)
        setLoadingMore(false)
      }, 550)
    }
  }

  const markRead = row => {
    if (row.read) return
    setItems(prev => prev.map(x => (x.id === row.id ? { ...x, read: true } : x)))
  }

  const openRow = row => {
    markRead(row)
    announce(`${titleOf(row)} — marked as read. Navigation is stubbed in this prototype.`)
  }

  const markAll = () => {
    setMarking(true)
    setTimeout(() => {
      setItems(prev => prev.map(x => (x.read ? x : { ...x, read: true })))
      setMarking(false)
      /* No success banner — the emptied tab and the vanished badge are the
         message; the state change still reaches screen readers
         (guidelines/notification-messaging.md, README §8). */
      announce('All notifications marked as read')
    }, 500)
  }

  /* The invite's FIRST Accept deliberately fails, to exercise the row-level
     LTInlineMessage error; the retry succeeds. Decline succeeds directly. */
  const accept = row => {
    const failedOnce = actionState[row.id] === 'error'
    setActionState(s => ({ ...s, [row.id]: 'loading-accept' }))
    setTimeout(() => {
      if (!failedOnce) {
        setActionState(s => ({ ...s, [row.id]: 'error' }))
        announce("Couldn't accept the invite. Try again.")
      } else {
        setActionState(s => ({ ...s, [row.id]: 'accepted' }))
        markRead(row)
        announce('Invite accepted')
      }
    }, 900)
  }
  const decline = row => {
    setActionState(s => ({ ...s, [row.id]: 'loading-decline' }))
    setTimeout(() => {
      setActionState(s => ({ ...s, [row.id]: 'declined' }))
      markRead(row)
      announce('Invite declined')
    }, 900)
  }

  const bellLabel = badgeCount > 0 ? `Notifications, ${badgeCount} unread` : 'Notifications'
  const bellBtn = (
    <button ref={bellRef} type="button" className="btn iconbtn outline bell"
      aria-label={bellLabel} aria-haspopup="dialog" aria-expanded={open}
      onClick={() => (open ? close() : setOpen(true))}>
      <BellIcon />
      <Badge count={badgeCount} />
    </button>
  )

  const tabs = [
    { id: 'unread', label: 'Unread', counter: phase === 'ready' && unreadCount > 0 ? unreadCount : undefined },
    { id: 'all', label: 'All' },
  ]

  return (
    /* The Tip wrapper stays mounted in both states (a remount would drop the
       focus target on close); CSS suppresses the tooltip while open. */
    <div className={`anchor bell-anchor${open ? ' open' : ''}`} ref={anchorRef}>
      <Tip label="Notifications">{bellBtn}</Tip>

      {open && (
        <div className="npanel" role="dialog" aria-label="Notifications" ref={panelRef} tabIndex={-1}>
          <div className="npanel-head">
            <h2>Notifications</h2>
            {phase === 'ready' && unreadCount > 0 && (
              <Btn variant="invisible" size="small" loading={marking} onClick={markAll}>
                Mark all as read
              </Btn>
            )}
          </div>

          <TabNav items={tabs} activeTab={tab} onSelect={pickTab} ariaLabel="Notifications" />

          <div className="npanel-list" ref={listRef} onScroll={onScroll}>
            {phase === 'error' && (
              <div className="npanel-pad">
                <Flash>We could not load notifications. Retry, or check your connection.</Flash>
              </div>
            )}

            {phase === 'loading' && <div className="center tall"><Loader label="Loading notifications" /></div>}

            {phase === 'ready' && tab === 'unread' && list.length === 0 && (
              <BlankSlate visual={<BellLargeIcon />} heading="You're all caught up"
                description="New notifications from your organisation appear here."
                action={<Btn size="small" onClick={() => pickTab('all')}>View all notifications</Btn>} />
            )}

            {phase === 'ready' && tab === 'all' && list.length === 0 && (
              <BlankSlate visual={<BellLargeIcon />} heading="No notifications yet"
                description="Activity that involves you — runs, builds, shares, invites — shows up here." />
            )}

            {phase === 'ready' && shown.map(row => (
              <NotificationRow key={row.id} row={row} state={actionState[row.id]}
                onOpen={openRow} onAccept={() => accept(row)} onDecline={() => decline(row)}
                announce={announce} />
            ))}

            {phase === 'ready' && loadingMore && (
              <div className="center pad8"><Loader small label="Loading older notifications" /></div>
            )}

            {phase === 'ready' && list.length > 0 && exhausted && !loadingMore && (
              <p className="endrow">Showing the last 14 days.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
