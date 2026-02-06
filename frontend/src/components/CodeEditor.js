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
// ║  FILE: frontend/src/components/CodeEditor.js                      ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, onSave, filename }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Ctrl+S to save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {filename && (
            <div style={{
                padding: '8px 14px',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(123, 44, 191, 0.04))',
                color: '#c8d0dc',
                fontSize: '12px',
                fontWeight: '500',
                letterSpacing: '0.3px',
                borderBottom: '1px solid rgba(0, 212, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <span style={{ color: '#00d4ff', fontSize: '10px' }}>●</span>
                {filename}
            </div>
        )}
        <div style={{ flex: 1 }}>
            <Editor
            height="100%"
            theme="vs-dark"
            path={filename}
            defaultLanguage={language || 'plaintext'}
            value={code}
            onChange={onChange}
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: true },
                automaticLayout: true,
                fontSize: 14,
            }}
            />
        </div>
    </div>
  );
};

export default CodeEditor;
