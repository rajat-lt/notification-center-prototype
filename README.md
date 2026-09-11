# Notification center — prototype

Working prototype of the proposed **in-app notification center** for the LambdaTest / TestMu AI
platform: a bell in every product's top bar, and the org-scoped, cross-product panel it opens —
another user in your org touched your work (a share, an invite, an assignment, an approval), or
the system finished something of yours (a test run, a HyperExecute job, an automation build, a
KaneAI generation), and the bell is where you find out.

The design spec lives in [`notification-center.md`](notification-center.md), written in the
`design-context/patterns/` house format. The prototype implements it: `LTTabNav`-style
**Unread / All** tabs with an `LTCounterLabel`-style count, a 400px panel that hugs its
content up to 60% of the viewport and carries a caret pointing at the bell, a newest-first
feed over a 14-day window with lazy loading, rows that slide in from the left as they
appear, one primary + one secondary action per actionable row (left-aligned under the text,
primary on the right, small), initials-only avatars, and the panel-local short time formats
(`2:34 PM` today, `Sep 10` before that).

**Live demo:** https://rajat-lt.github.io/notification-center-prototype/ — click the bell.

## Run it

```bash
npm install
npm run dev        # http://localhost:5179
npm run build      # static build in dist/
```

## What is simulated

- The panel fetches on first open (brief loader), 20 rows per page; scrolling near the bottom
  loads the next page under a small foot loader, and the feed ends with
  "Showing the last 14 days." Rows slide in from the left, one after another, each time a
  batch appears — on open, on a tab switch, and on every lazy-loaded page.
- A new notification arrives ~18 seconds in: the row slides in at the top, the bell badge and
  the Unread counter tick up, a polite live region announces it, and the scroll position is
  held so an arrival never shoves the feed out from under a reader.
- Opening a row marks it read (the row leaves Unread, keeps its place in All). Navigation to
  the underlying entity is stubbed — announced, not performed.
- **The invite's first Accept deliberately fails**, to exercise the row-level inline error;
  the retry succeeds. Decline succeeds directly. Buttons show the loading treatment in flight.
- Mark all as read empties Unread, clears the badge, and says so only to screen readers —
  the emptied tab is the visible message.

## States

- default — click the bell; the panel opens on Unread (3 unread)
- `?state=empty` — no notifications at all (caught-up Unread, empty All)
- `?state=error` — the feed failed to load (flash inside the panel)
- `?state=loading` — persistent first-load state

The `state` URLs open the panel automatically.

## Honesty notes

- **Mock data only** — fictional cast, orgs, projects, run and build names per `mock-data.md`
  conventions. No real customer data.
- **Not the real component library.** `@lambdatestincprivate/lt-components` is private; this
  prototype hand-rolls visual look-alikes on the Primer foundation, with color values from the
  design-context token extraction (`TOKENS.md`, `colorSchemes.light`) and the panel shadow from
  the `floating/small` composite in the shadow-token handoff. The platform shell (rail + top
  bar, both on the subtle grey chrome) is carried over from the project-actions prototype so
  the two demos read as one product.
- **Virtualization is CSS-level** (`content-visibility: auto`): offscreen rows skip layout and
  paint. Production would use a measuring windowing library (spec §3.6); the lazy-loading
  behaviour above is the part this prototype demonstrates.
- Desktop-only, light theme only, prototyped at the 1512px default width.
