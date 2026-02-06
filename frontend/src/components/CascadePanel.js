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
// ║  FILE: frontend/src/components/CascadePanel.js                    ║
// ║  LAYER: ui/frontend                                               ║
// ╚══════════════════════════════════════════════════════════════════╝
// HEADY_BRAND:END

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CascadePanel = ({ contextFile, onCodeApply }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I am Cascade, your AI assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('admin_token') || 'default_insecure_token';

  useEffect(() => {
    axios.get('/api/mcp/servers', { headers: { 'X-Admin-Token': token } })
      .then(res => setServers(res.data.servers || []))
      .catch(err => console.error("Failed to load MCP servers", err));
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/chat', {
        messages: [...messages, newMsg],
        context: contextFile ? `Current File: ${contextFile.path}\nContent:\n${contextFile.content}` : ''
      }, { headers: { 'X-Admin-Token': token } });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI." }]);
    } finally {
      setLoading(false);
    }
  };

  const executeTool = async (server, tool, args = {}) => {
      setMessages(prev => [...prev, { role: 'user', content: `Run tool ${tool} on ${server}` }]);
      setLoading(true);
      try {
        const res = await axios.post('/api/mcp/tool', {
            server, tool, arguments: args
        }, { headers: { 'X-Admin-Token': token } });

        let output = JSON.stringify(res.data, null, 2);
        if (res.data.result) output = res.data.result;

        setMessages(prev => [...prev, { role: 'assistant', content: `Tool Output:\n\`\`\`\n${output}\n\`\`\`` }]);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Tool execution failed." }]);
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="cascade-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '12px', background: 'transparent', color: '#c8d0dc' }}>
       <div style={{
         fontWeight: '800',
         marginBottom: '12px',
         fontSize: '12px',
         letterSpacing: '2px',
         background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
         WebkitBackgroundClip: 'text',
         WebkitTextFillColor: 'transparent',
         borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
         paddingBottom: '8px',
         display: 'flex',
         alignItems: 'center',
         gap: '8px'
       }}>
         <span style={{ fontSize: '14px', WebkitTextFillColor: 'initial' }}>🧠</span>
         CASCADE AI
       </div>

       <div className="messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', paddingRight: '5px' }}>
          {messages.map((m, i) => (
             <div key={i} style={{
               marginBottom: '10px',
               background: m.role === 'user' ? 'rgba(123, 44, 191, 0.12)' : 'rgba(0, 212, 255, 0.06)',
               padding: '8px 10px',
               borderRadius: '10px',
               borderLeft: m.role === 'user' ? '3px solid #7b2cbf' : '3px solid #00d4ff',
               transition: 'all 0.2s ease'
             }}>
                <strong style={{
                  color: m.role === 'user' ? '#7b2cbf' : '#00d4ff',
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>{m.role === 'user' ? 'You' : 'Cascade'}</strong>
                <div style={{ whiteSpace: 'pre-wrap', marginTop: '4px', fontSize: '13px', lineHeight: '1.5' }}>{m.content}</div>
             </div>
          ))}
          {loading && <div style={{
            fontStyle: 'italic',
            color: '#00d4ff',
            padding: '8px',
            background: 'rgba(0, 212, 255, 0.06)',
            borderRadius: '8px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>Thinking...</div>}
          <div ref={messagesEndRef} />
       </div>

       <div className="mcp-tools" style={{ marginBottom: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {servers.includes('git') && (
             <button
                onClick={() => executeTool('git', 'git_status')}
                style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.25)',
                  color: '#00d4ff',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
             >
                Git Status
             </button>
          )}
          {/* Add other quick actions */}
       </div>

       <div className="input-area" style={{ display: 'flex', borderTop: '1px solid #333', paddingTop: '10px' }}>
          <textarea
             style={{
               flex: 1,
               backgroundColor: 'rgba(15, 12, 41, 0.6)',
               color: '#c8d0dc',
               border: '1px solid rgba(0, 212, 255, 0.15)',
               padding: '8px 12px',
               borderRadius: '10px',
               resize: 'none',
               height: '60px',
               fontFamily: 'inherit',
               outline: 'none',
               transition: 'border-color 0.2s ease'
             }}
             value={input}
             onChange={e => setInput(e.target.value)}
             onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
             placeholder="Ask Cascade or type a command..."
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: '8px',
              background: 'linear-gradient(135deg, #00d4ff, #7b2cbf)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              padding: '0 14px',
              fontWeight: '600',
              fontSize: '12px',
              letterSpacing: '0.5px',
              boxShadow: '0 0 12px rgba(0, 212, 255, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
       </div>
    </div>
  );
};

export default CascadePanel;
