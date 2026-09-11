// Mock notifications per mock-data.md — approved cast, run/build/test-case
// names, k-format — laid out per notification-center.md §3.7: 14-day window,
// newest first, exactly 3 unread at load. Times/dates use the panel-local
// short formats from the brief (unpadded "2:34 PM" / "Sep 2" — a recorded
// use-case exception; every other surface keeps mock-data.md formats).

export const TODAY = '2026-09-11'
export const PAGE_SIZE = 20 // the default page size for every list (guidelines/ltpagination.md)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/* "Sep 10", "Sep 2" — unpadded day, no year; safe only inside the 14-day
   window (notification-center.md §5 decision 7). */
export function shortDate(day) {
  const [, m, d] = day.split('-')
  return `${MONTHS[+m - 1]} ${+d}`
}

/* Initials per mock-data.md: two-word → first letters; three-word → first and
   LAST; single-word → one letter. Uppercase always. */
export function initialsOf(name) {
  const w = name.trim().split(/\s+/)
  return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase()
}

function tsOf(day, time) {
  const [hhmm, ap] = time.split(' ')
  let [h, m] = hhmm.split(':').map(Number)
  if (ap === 'PM' && h !== 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  const [Y, M, D] = day.split('-').map(Number)
  return Date.UTC(Y, M - 1, D, h, m)
}

/* Title fragments: [text, bold] — actor and object bold, verb phrase regular
   (notification-center.md §3.4). */
const b = t => [t, true]
const r = t => [t, false]

let seq = 0
function n(day, time, actor, frags, product, opts = {}) {
  seq += 1
  return {
    id: `n${seq}`, day, time, ts: tsOf(day, time), read: true,
    actor, frags, product, ...opts,
  }
}
const person = name => ({ name, initials: initialsOf(name) })
const system = glyph => ({ system: glyph }) // 'passed' | 'failed' | 'completed'

/* ---- Today, Sep 11 ---- */
const rows = [
  n(TODAY, '2:34 PM', person('Mahendra Damodardas Baahubali'),
    [b('Mahendra Damodardas Baahubali'), r(' invited you to project '), b('Internal HRMS')],
    'Test Manager', { read: false, actions: { secondary: 'Decline', primary: 'Accept' } }),
  n(TODAY, '1:05 PM', system('failed'),
    [r('HyperExecute job '), b('#3861'), r(' failed')], 'HyperExecute', { read: false }),
  n(TODAY, '11:48 AM', person('Ritika Sharma'),
    [b('Ritika Sharma'), r(' assigned you the test run '), b('Regression Suite - Release 8.4')],
    'Test Manager', { read: false }),
  n(TODAY, '10:27 AM', person('Darth Vader'),
    [b('Darth Vader'), r(' rejected 3 screenshots in '), b('Mobile web')], 'SmartUI'),
  n(TODAY, '9:12 AM', person('George Orwell'),
    [b('George Orwell'), r(' shared the report '), b('Payments Regression - Safari 27 backlog.pdf')],
    'Automation', { attachment: { name: 'Payments Regression - Safari 27 backlog.pdf' } }),
  n(TODAY, '8:02 AM', person('Darth Vader'),
    [b('Darth Vader'), r(' approved 12 screenshots in '), b('Web app')], 'SmartUI'),
  n(TODAY, '7:33 AM', system('passed'),
    [r('Test run '), b('Smoke - Sprint 42 Nightly'), r(' passed')], 'Test Manager'),
  n(TODAY, '6:58 AM', person('Mehmed Dracul'),
    [b('Mehmed Dracul'), r(' copied 18 test cases to '), b('Payments / Regression')], 'Test Manager'),

  /* ---- Sep 10 ---- */
  n('2026-09-10', '6:40 PM', person('Oppenheimer'),
    [b('Oppenheimer'), r(' moved 24 test cases to '), b('Internal HRMS / Archive')], 'Test Manager'),
  n('2026-09-10', '4:15 PM', system('completed'),
    [r('KaneAI finished generating '), b('KaneAI Generated Run - Login and Signup Flows')], 'KaneAI'),
  n('2026-09-10', '2:03 PM', person('Gabbar Singh'),
    [b('Gabbar Singh'), r(' invited you to project '), b('Watch app')],
    'Test Manager', { resolvedNote: 'Accepted' }),
  n('2026-09-10', '11:22 AM', system('failed'),
    [r('Test run '), b('Checkout Revamp - UAT Round 2'), r(' failed')], 'Test Manager'),
  n('2026-09-10', '9:05 AM', person('Ritika Sharma'),
    [b('Ritika Sharma'), r(' shared the report '), b('Regression Suite - Release 8.4.pdf')],
    'Automation', { attachment: { name: 'Regression Suite - Release 8.4.pdf' } }),

  /* ---- Sep 9 ---- */
  n('2026-09-09', '5:12 PM', system('passed'),
    [r('Automation build '), b('Schedule King || 2026-09-03 07:33:26'), r(' succeeded')], 'Automation'),
  n('2026-09-09', '1:48 PM', person('Kokushibo'),
    [b('Kokushibo'), r(' imported 96 test cases from '), b('qTest')], 'Test Manager'),
  n('2026-09-09', '10:30 AM', person('Darth Vader'),
    [b('Darth Vader'), r(' approved 5 screenshots in '), b('Desktop website')], 'SmartUI'),

  /* ---- Sep 8 ---- */
  n('2026-09-08', '3:40 PM', system('passed'),
    [r('Automation build '), b('8338d2e4-f880-4bfb-96dd-8767c347e7eb'), r(' succeeded')], 'Automation'),
  n('2026-09-08', '12:16 PM', person('Mahendra Damodardas Baahubali'),
    [b('Mahendra Damodardas Baahubali'), r(' assigned you the test run '), b('Payments Regression - Safari 27 backlog')],
    'Test Manager'),
  n('2026-09-08', '9:00 AM', system('completed'),
    [r('HyperExecute job '), b('#3859'), r(' completed')], 'HyperExecute'),

  /* ---- Sep 7 ---- */
  n('2026-09-07', '4:22 PM', person('George Orwell'),
    [b('George Orwell'), r(' moved 12 test runs to '), b('Archive')], 'Test Manager'),
  n('2026-09-07', '11:10 AM', system('passed'),
    [r('Test run '), b('Release Candidate 12.1 - Full Regression'), r(' passed')], 'Test Manager'),
  n('2026-09-07', '8:45 AM', person('Ritika Sharma'),
    [b('Ritika Sharma'), r(' imported 300 test cases from '), b('Katalon')], 'Test Manager'),

  /* ---- Sep 6 ---- */
  n('2026-09-06', '2:58 PM', person('Oppenheimer'),
    [b('Oppenheimer'), r(' rejected 2 screenshots in '), b('TV app')], 'SmartUI'),
  n('2026-09-06', '10:04 AM', system('completed'),
    [r('KaneAI finished generating '), b('Verify account lock after multiple failed login attempts')], 'KaneAI'),

  /* ---- Sep 5 ---- */
  n('2026-09-05', '6:15 PM', person('Gabbar Singh'),
    [b('Gabbar Singh'), r(' copied 61 test cases to '), b('Regression / Checkout')], 'Test Manager'),
  n('2026-09-05', '1:27 PM', system('failed'),
    [r('Automation build '), b('778320016'), r(' failed')], 'Automation'),
  n('2026-09-05', '9:52 AM', person('Mehmed Dracul'),
    [b('Mehmed Dracul'), r(' approved 7 screenshots in '), b('Blog website')], 'SmartUI'),

  /* ---- Sep 4 ---- */
  n('2026-09-04', '3:33 PM', person('Darth Vader'),
    [b('Darth Vader'), r(' shared the report '), b('Cross-browser Sanity || 2026-09-03 07:33:26.pdf')],
    'Automation', { attachment: { name: 'Cross-browser Sanity || 2026-09-03 07:33:26.pdf' } }),
  n('2026-09-04', '10:41 AM', person('Kokushibo'),
    [b('Kokushibo'), r(' assigned you the test run '), b('Smoke - Sprint 42 Nightly')], 'Test Manager'),

  /* ---- Sep 3 ---- */
  n('2026-09-03', '5:09 PM', system('passed'),
    [r('Test run '), b('Cross-browser Sanity || 2026-09-03 07:33:26'), r(' passed')], 'Test Manager'),
  n('2026-09-03', '12:24 PM', person('Mahendra Damodardas Baahubali'),
    [b('Mahendra Damodardas Baahubali'), r(' imported 1.24k test cases from '), b('CSV')], 'Test Manager'),
  n('2026-09-03', '8:18 AM', person('Oppenheimer'),
    [b('Oppenheimer'), r(' moved 5 test runs to '), b('Internal HRMS / Release Archive')], 'Test Manager'),

  /* ---- Sep 2 ---- */
  n('2026-09-02', '4:47 PM', person('Gabbar Singh'),
    [b('Gabbar Singh'), r(' exported 482 test cases from '), b('Web app')], 'Test Manager'),
  n('2026-09-02', '11:36 AM', system('completed'),
    [r('HyperExecute job '), b('#2214'), r(' completed')], 'HyperExecute'),

  /* ---- Sep 1 ---- */
  n('2026-09-01', '2:52 PM', person('Ritika Sharma'),
    [b('Ritika Sharma'), r(' approved 9 screenshots in '), b('iPad app')], 'SmartUI'),
  n('2026-09-01', '9:29 AM', person('George Orwell'),
    [b('George Orwell'), r(' copied 8 test runs to '), b('Archive')], 'Test Manager'),

  /* ---- Aug 31 ---- */
  n('2026-08-31', '6:03 PM', system('failed'),
    [r('Test run '), b('Payments Regression - Safari 27 backlog'), r(' failed')], 'Test Manager'),
  n('2026-08-31', '10:57 AM', person('Darth Vader'),
    [b('Darth Vader'), r(' imported 120 test cases from '), b('Zephyr')], 'Test Manager'),

  /* ---- Aug 30 ---- */
  n('2026-08-30', '3:20 PM', person('Mehmed Dracul'),
    [b('Mehmed Dracul'), r(' deleted 8 test runs')], 'Test Manager'),
  n('2026-08-30', '9:44 AM', system('passed'),
    [r('Automation build '), b('shell-entry-repro-1785646201'), r(' succeeded')], 'Automation'),

  /* ---- Aug 29 — the window floor (14 days incl. today) ---- */
  n('2026-08-29', '1:11 PM', person('Kokushibo'),
    [b('Kokushibo'), r(' moved 45 test cases to '), b('Payments / Regression')], 'Test Manager'),
  n('2026-08-29', '8:36 AM', system('completed'),
    [r('KaneAI finished generating '), b('Validate cart total after applying two coupon codes')], 'KaneAI'),
]

export const initialNotifications = [...rows].sort((a, z) => z.ts - a.ts)

/* Prepended live at ~18s to demonstrate an arrival while the page is open:
   badge and counter tick, the row lands on top (notification-center.md §3.5). */
export const liveArrival = n(TODAY, '2:41 PM', system('failed'),
  [r('Test run '), b('Smoke - Sprint 42 Nightly'), r(' failed')], 'Test Manager', { read: false })

/* Plain-text title for announcements and accessible names. */
export const titleOf = row => row.frags.map(f => f[0]).join('')

/* The minimal page behind the panel: the Test Manager project listing shape,
   relative timestamps per the ≤30-days rule in mock-data.md. */
export const PROJECTS = [
  { name: 'Web app', meta: 'Updated 2 days ago' },
  { name: 'Mobile app', meta: 'Updated 4 days ago' },
  { name: 'iPad app', meta: 'Updated 9 days ago' },
  { name: 'Desktop website', meta: 'Updated 12 days ago' },
  { name: 'Internal HRMS', meta: 'Updated 22 days ago' },
  { name: 'Watch app', meta: 'Updated 28 days ago' },
]
