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
// ║  FILE: frontend/src/components/SettingsModal.js                   ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SettingsModal = ({ onClose }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('admin_token') || 'default_insecure_token';

  useEffect(() => {
    axios.get('/api/settings', { headers: { 'X-Admin-Token': token } })
      .then(res => {
        setSettings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      remote_gpu: {
        ...prev.remote_gpu,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('/api/settings', settings, { headers: { 'X-Admin-Token': token } });
      onClose();
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 12, 41, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #1a1a2e, #16213e)',
        padding: '24px',
        borderRadius: '16px',
        width: '420px',
        color: '#c8d0dc',
        border: '1px solid rgba(0, 212, 255, 0.15)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 212, 255, 0.08)'
      }}>
        <h3 style={{
          marginTop: 0,
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '18px',
          fontWeight: '800',
          letterSpacing: '1px'
        }}>Settings</h3>

        <div style={{ marginBottom: '15px' }}>
            <h4 style={{ marginBottom: '10px', color: '#00d4ff', fontWeight: '600' }}>Remote GPU</h4>
            <label style={{ display: 'block', marginBottom: '5px' }}>
                <input
                    type="checkbox"
                    checked={settings?.remote_gpu?.enabled || false}
                    onChange={e => handleChange('enabled', e.target.checked)}
                /> Enable Remote GPU
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label>
                    Host:
                    <input
                        type="text"
                        value={settings?.remote_gpu?.host || ''}
                        onChange={e => handleChange('host', e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(15, 12, 41, 0.6)',
                          color: '#e8e8e8',
                          border: '1px solid rgba(0, 212, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          outline: 'none'
                        }}
                    />
                </label>
                <label>
                    Port:
                    <input
                        type="number"
                        value={settings?.remote_gpu?.port || 8000}
                        onChange={e => handleChange('port', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(15, 12, 41, 0.6)',
                          color: '#e8e8e8',
                          border: '1px solid rgba(0, 212, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          outline: 'none'
                        }}
                    />
                </label>
            </div>
            <label style={{ display: 'block', marginTop: '10px' }}>
                Memory Limit:
                <input
                    type="text"
                    value={settings?.remote_gpu?.memory_limit || ''}
                    onChange={e => handleChange('memory_limit', e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(15, 12, 41, 0.6)',
                      color: '#e8e8e8',
                      border: '1px solid rgba(0, 212, 255, 0.15)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      outline: 'none'
                    }}
                />
            </label>
             <label style={{ display: 'block', marginTop: '5px' }}>
                <input
                    type="checkbox"
                    checked={settings?.remote_gpu?.use_rdma || false}
                    onChange={e => handleChange('use_rdma', e.target.checked)}
                /> Use GPUDirect RDMA
            </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={onClose} style={{
              padding: '8px 18px',
              background: 'rgba(255,255,255,0.08)',
              color: '#c8d0dc',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease'
            }}>Cancel</button>
            <button onClick={handleSave} style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '13px',
              boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
