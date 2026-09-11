// Notification center — working prototype of the pattern in
// notification-center.md: a bell in every product's top bar, and the
// org-scoped, cross-product panel it opens.
//
// The page behind it is Test Manager's project listing, built from
// design-context/patterns/project-listing.md — the real page shape rather than
// a placeholder, so the panel is judged against the surface it actually floats
// over. The panel is still the subject; nothing on this page opens it.
import React, { useCallback, useMemo, useState } from 'react'
import { PROJECTS } from './data.js'
import { PlatformSidebar, TopBar } from './shell.jsx'
import { NotificationCenter } from './panel.jsx'
import { Avatar, BlankSlate, Btn, CounterPill, MoreIcon, SearchInput, Tag, Tip } from './lt.jsx'

function ProjectRow({ p }) {
  return (
    <div className="pl-row">
      <div className="pl-main">
        <div className="pl-titleline">
          {/* The title navigates, so it is a link — never bold text and never a
              button (guidelines/README.md §5). project-listing.md delta 5 calls
              this page the one that gets it right and asks the three listing
              pages to follow it. */}
          <a className="pl-name" href="#project" onClick={e => e.preventDefault()}>{p.name}</a>
          {/* Optional provenance tag. Read-only, outline (guidelines/lttag.md). */}
          {p.tag && <Tag text={p.tag} />}
        </div>

        {/* Counts then the updated date, dot-separated, no leading dot on the
            first item. Relative under 30 days, absolute MMM DD, YYYY beyond
            (mock-data.md) — the last three rows cross that boundary. */}
        <p className="pl-meta">
          <span>{p.testCases} test cases</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>{p.testRuns} test runs</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>{p.updated}</span>
        </p>
      </div>

      {/* Owner: one avatar, not a stack. Initials only, never an image. */}
      <Avatar initials={p.owner.initials} name={p.owner.name} size={24} />

      {/* The pattern carries a row overflow menu but leaves LTActionMenu's
          props unextracted, so what it opens is unconfirmed — rendered and
          named here, opening nothing, the same treatment the top bar gives the
          Credits caret. Tooltip and accessible name match, per
          guidelines/lticonbutton.md. */}
      <Tip label={`More actions for ${p.name}`}>
        <button type="button" className="btn iconbtn invisible"
          aria-label={`More actions for ${p.name}`}>
          <MoreIcon />
        </button>
      </Tip>
    </div>
  )
}

export default function App() {
  const mode = useMemo(() => new URLSearchParams(window.location.search).get('state'), [])
  const [live, setLive] = useState('')
  const [q, setQ] = useState('')

  /* One polite live region for the whole surface: mark-as-read, mark-all,
     arrivals, action outcomes (notification-center.md §3.5, README §8). */
  const announce = useCallback(msg => {
    setLive('')
    window.setTimeout(() => setLive(msg), 30)
  }, [])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return PROJECTS
    return PROJECTS.filter(p =>
      p.name.toLowerCase().includes(needle) || p.owner.name.toLowerCase().includes(needle))
  }, [q])

  return (
    <div className="app">
      <PlatformSidebar activeProduct="test-manager" />
      <div className="main">
        {/* Shell surfaces from design-context/patterns — both on the subtle
            grey chrome (canvas.subtle), page content white. The bell arrives
            fully wired: trigger, badge and panel live in panel.jsx. */}
        <TopBar
          crumbs={[{ label: 'Test Manager' }]}
          user={{ initials: 'RS', name: 'Ritika Sharma' }}
          credits="20k"
          bellSlot={<NotificationCenter mode={mode} announce={announce} />}
        />

        {/* Test Manager's root page: no project is selected yet, so there is no
            project nav and no folder pane — which is exactly the case where the
            centred-column rule applies (guidelines/README.md §2). */}
        <main className="page">
          {/* The count sits beside the heading as its own counter rather than
              baked into the title string — project-listing.md delta 3. It
              tracks what is listed, so searching updates it. */}
          <div className="pl-head">
            <h1>Projects</h1>
            <CounterPill count={shown.length} />
          </div>
          <p className="page-desc">All your test cases information stored in projects</p>

          {/* Filter bar. No select-all checkbox: project rows are deliberately
              not selectable (project-listing.md §7). Search flexes; the three
              filters are LTButton dropdowns with the applied count in the
              button's own counter slot, not LTSelect (README §5). Only search
              is wired here — the pattern does not enumerate what the three
              filter menus contain, so their contents are not invented. */}
          <div className="pl-filters">
            <SearchInput value={q} onChange={setQ}
              placeholder="Search Projects" ariaLabel="Search projects" />
            <Btn caret>Owners</Btn>
            <Btn caret>Tags</Btn>
            <Btn caret counter={1}>Products</Btn>
            <Btn variant="primary" caret>Create Project</Btn>
          </div>

          {/* One bordered container, rows separated by hairlines — the
              treatment settled across Projects, Test Runs and Test Instances
              (project-listing.md delta 4).

              No LTPagination: the approved project names in mock-data.md number
              nine, well under the 20-per-page default, and pagination is never
              rendered when everything fits on one page
              (guidelines/ltpagination.md). The pattern includes it because the
              live page holds 38. */}
          {shown.length > 0 ? (
            <div className="pl-list">
              {shown.map(p => <ProjectRow key={p.name} p={p} />)}
            </div>
          ) : (
            /* Filtered-empty: the user has projects, the search hid them, so
               there is no create action here (project-listing.md §4). */
            <div className="pl-list">
              <BlankSlate heading="No results" description="No projects match these filters." />
            </div>
          )}

          <p className="protonote">
            Design prototype · mock data only · hand-rolled look-alikes of lt-components, not the
            real library. The subject is the notifications bell in the top bar — click it.
          </p>
        </main>
      </div>

      <div aria-live="polite" className="vh">{live}</div>
    </div>
  )
}
