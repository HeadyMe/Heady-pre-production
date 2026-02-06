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
// ║  FILE: frontend/src/components/Terminal.js                        ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
  const termRef = useRef(null);
  const xtermRef = useRef(null);

  useEffect(() => {
    const term = new Terminal({
        theme: {
            background: '#12101e',
            foreground: '#c8d0dc',
            cursor: '#00d4ff',
            cursorAccent: '#1a1a2e',
            selectionBackground: 'rgba(0, 212, 255, 0.2)',
        },
        fontSize: 12,
        fontFamily: 'Consolas, "Courier New", monospace',
        convertEol: true,
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(termRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    term.writeln('\x1b[36m╔══════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[36m║\x1b[0m  \x1b[1;36m∞ HEADY ADMIN CONSOLE\x1b[0m                    \x1b[36m║\x1b[0m');
    term.writeln('\x1b[36m║\x1b[0m  \x1b[35mSacred Geometry :: Organic Systems\x1b[0m      \x1b[36m║\x1b[0m');
    term.writeln('\x1b[36m╚══════════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[90mInitializing log stream...\x1b[0m');

    const token = localStorage.getItem('admin_token') || 'default_insecure_token';

    // Determine WebSocket URL
    let wsHost = window.location.host;
    if (window.location.port === '3000') {
         wsHost = 'localhost:8000'; // Development fallback
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${wsHost}/api/logs?token=${token}`;

    let ws;
    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            term.writeln('\x1b[32mConnected to log stream.\x1b[0m');
        };

        ws.onmessage = (event) => {
            term.writeln(event.data);
        };

        ws.onerror = (e) => {
            term.writeln('\x1b[31mWebSocket connection failed.\x1b[0m');
        };

        ws.onclose = () => {
            term.writeln('WebSocket disconnected.');
        };
    } catch (e) {
        term.writeln(`Error: ${e.message}`);
    }

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    // Fit again after a short delay to ensure container is rendered
    setTimeout(() => fitAddon.fit(), 100);

    return () => {
        if (ws) ws.close();
        term.dispose();
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={termRef} style={{ height: '100%', width: '100%', padding: '5px' }} />;
};

export default TerminalComponent;
