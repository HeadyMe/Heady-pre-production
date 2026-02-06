// HEADY_BRAND:BEGIN
// ╔══════════════════════════════════════════════════════════════════╗
// ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
// ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
// ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
// ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
// ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
// ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
// ║                                                                  ║
// ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
// ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
// ║  FILE: desktop-overlay/src/App.js                                 ║
// ║  LAYER: root                                                      ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'

const App = () => {
  return (
    <div className="overlay">
      <div className="companion-ui">
        <div className="sacred-orb"></div>
        <div className="companion-header">
          <div className="companion-avatar">🧠</div>
          <div>
            <div className="companion-title">HeadyBuddy</div>
            <div className="companion-subtitle">SACRED GEOMETRY COMPANION</div>
          </div>
        </div>
        <div className="companion-body">
          <div className="companion-status">
            <span className="companion-status-dot"></span>
            System Active — Ready to assist
          </div>
          <div className="companion-actions">
            <button className="companion-action-btn">
              <span className="companion-action-icon">🔄</span>
              Sync
            </button>
            <button className="companion-action-btn">
              <span className="companion-action-icon">🔨</span>
              Build
            </button>
            <button className="companion-action-btn">
              <span className="companion-action-icon">🚀</span>
              Deploy
            </button>
          </div>
        </div>
        <div className="companion-footer">
          Sacred Geometry :: Organic Systems :: Breathing Interfaces
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
