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
// ║  FILE: frontend/src/App.js                                        ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import FileTree from './components/FileTree';
import CodeEditor from './components/CodeEditor';
import CascadePanel from './components/CascadePanel';
import TerminalComponent from './components/Terminal';
import SettingsModal from './components/SettingsModal';

function App() {
  const [currentFile, setCurrentFile] = useState(null); // { path, content }
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState('plaintext');

  const token = localStorage.getItem('admin_token') || 'default_insecure_token';

  const handleFileSelect = async (path) => {
    try {
      const res = await axios.get(`/api/files/${path}`, {
         headers: { 'X-Admin-Token': token }
      });
      setCurrentFile({ path, content: res.data.content });

      // Guess language
      const ext = path.split('.').pop();
      const langMap = {
        'js': 'javascript', 'py': 'python', 'json': 'json', 'html': 'html', 'css': 'css', 'md': 'markdown'
      };
      setLanguage(langMap[ext] || 'plaintext');
    } catch (err) {
      console.error("Failed to load file", err);
    }
  };

  const handleCodeChange = (value) => {
    if (currentFile) {
        setCurrentFile({ ...currentFile, content: value });
    }
  };

  const handleSave = async () => {
    if (!currentFile) return;
    try {
        await axios.post('/api/files', {
            path: currentFile.path,
            content: currentFile.content
        }, { headers: { 'X-Admin-Token': token } });
        console.log("Saved");
        // Could show a toast notification here
    } catch (err) {
        console.error("Failed to save", err);
    }
  };

  return (
    <div className="App">
      <Layout
        sidebar={<FileTree onFileSelect={handleFileSelect} />}
        editor={
            currentFile ? (
                <CodeEditor
                    code={currentFile.content}
                    language={language}
                    onChange={handleCodeChange}
                    onSave={handleSave}
                    filename={currentFile.path}
                />
            ) : (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#8892a4'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>∞</div>
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>Select a file to edit</div>
                  <div style={{ fontSize: '11px', marginTop: '6px', color: '#5a6476', letterSpacing: '1px' }}>Sacred Geometry :: Organic Systems</div>
                </div>
            )
        }
        cascade={<CascadePanel contextFile={currentFile} />}
        bottom={<TerminalComponent />}
      />

      {/* Settings Button in Header (using portal or absolute) */}
      <div style={{ position: 'absolute', top: '5px', right: '10px', zIndex: 100 }}>
         <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.15)',
              color: '#00d4ff',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: '8px',
              fontWeight: '500',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease'
            }}
         >
            ⚙ Settings
         </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
