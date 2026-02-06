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
// ║  FILE: frontend/src/components/Layout.js                          ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React from 'react';
import './Layout.css';

const Layout = ({ sidebar, editor, cascade, bottom }) => {
  return (
    <div className="ide-layout">
      <div className="ide-header">
        <span className="ide-header-brand">∞ HEADY ADMIN IDE</span>
        <span className="ide-header-dot"></span>
        <span style={{marginLeft: '10px', fontSize: '11px', color: 'var(--heady-text-dim, #8892a4)', letterSpacing: '1px'}}>Sacred Geometry</span>
        <div style={{marginLeft: 'auto'}}>
          {/* Settings button placeholder */}
        </div>
      </div>
      <div className="ide-body">
        <div className="ide-sidebar">{sidebar}</div>
        <div className="ide-main">
          <div className="ide-editor-area">{editor}</div>
          <div className="ide-bottom-panel">{bottom}</div>
        </div>
        <div className="ide-cascade">{cascade}</div>
      </div>
    </div>
  );
};

export default Layout;
