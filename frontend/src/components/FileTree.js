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
// ║  FILE: frontend/src/components/FileTree.js                        ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FileTree = ({ onFileSelect }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('admin_token') || 'default_insecure_token';
        const res = await axios.get('/api/files', {
            headers: { 'X-Admin-Token': token }
        });
        setFiles(res.data.files);
      } catch (err) {
        console.error("Failed to load files", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="file-tree" style={{ padding: '8px' }}>
      <div style={{
        fontWeight: '700',
        marginBottom: '8px',
        fontSize: '11px',
        letterSpacing: '2px',
        background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(0, 212, 255, 0.15)'
      }}>EXPLORER</div>
      {files.sort().map(f => {
        const ext = f.split('.').pop();
        const iconColors = {
          js: '#ffe66d', py: '#4ecdc4', json: '#ff6b6b', md: '#7b2cbf',
          html: '#ff6b6b', css: '#00d4ff', yml: '#4ecdc4', yaml: '#4ecdc4',
          ts: '#00d4ff', tsx: '#00d4ff', jsx: '#ffe66d', ps1: '#7b2cbf'
        };
        const iconColor = iconColors[ext] || '#8892a4';
        return (
          <div
            key={f}
            onClick={() => onFileSelect(f)}
            style={{
              cursor: 'pointer',
              padding: '5px 8px',
              color: '#c8d0dc',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              borderLeft: '2px solid transparent'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 212, 255, 0.08)';
              e.currentTarget.style.borderLeft = '2px solid #00d4ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderLeft = '2px solid transparent';
            }}
          >
            <span style={{ color: iconColor, marginRight: '6px', fontSize: '10px' }}>●</span>
            {f}
          </div>
        );
      })}
    </div>
  );
};

export default FileTree;
