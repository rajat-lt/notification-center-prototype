// Notification center — working prototype of the pattern in
// notification-center.md: a bell in every product's top bar, and the
// org-scoped, cross-product panel it opens. The page behind it is a minimal
// Test Manager project listing; the panel is the subject.
import React, { useCallback, useMemo, useState } from 'react'
import { PROJECTS } from './data.js'
import { PlatformSidebar, TopBar } from './shell.jsx'
import { NotificationCenter } from './panel.jsx'

export default function App() {
  const mode = useMemo(() => new URLSearchParams(window.location.search).get('state'), [])
  const [live, setLive] = useState('')

  /* One polite live region for the whole surface: mark-as-read, mark-all,
     arrivals, action outcomes (notification-center.md §3.5, README §8). */
  const announce = useCallback(msg => {
    setLive('')
    window.setTimeout(() => setLive(msg), 30)
  }, [])

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

        <main className="page">
          <h1>Projects</h1>
          <p className="page-desc">
            Context page only — the subject of this prototype is the bell in the top bar and
            the notification panel it opens. Click the bell.
          </p>

          <div className="plist">
            {PROJECTS.map(p => (
              <div key={p.name} className="prow">
                <span className="prow-name">{p.name}</span>
                <span className="prow-meta">{p.meta}</span>
              </div>
            ))}
          </div>

          <p className="protonote">
            Design prototype · mock data only · hand-rolled look-alikes of lt-components, not the real library
          </p>
        </main>
      </div>

      <div aria-live="polite" className="vh">{live}</div>
    </div>
  )
}
