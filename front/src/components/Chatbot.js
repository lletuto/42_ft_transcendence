'use client';

import { useState, useRef, useEffect } from 'react';

// Chatbot component that provides a floating button to open a chat interface with Ousmane, the football chatbot. It handles user input, displays messages, and communicates with the backend API to get responses from the chatbot.
export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I am Ousmane, I serve as a chatbot now, because football has changed. Ask me anything about the game.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // envoie le cookie JWT automatiquement
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        throw new Error('Erreur serveur');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, i am not available for the moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* floating button */}
      <button
        className="cb-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f4857a, #d94535)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(217, 69, 53, 0.5)',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(217, 69, 53, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(217, 69, 53, 0.5)';
        }}
        aria-label="Ouvrir le chatbot"
      >
        {isOpen ? (
          // Icône X
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <img src="/OUSMANE.png" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="chatbot" />
        )}
      </button>

      {/* popup */}
      {isOpen && (
        <div
          className="cb-panel"
          style={{
            background: '#0f0f14',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            zIndex: 999,
            overflow: 'hidden',
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          {/* le header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #fd4a0e, #fd4a0e)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              🐐
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                Ousmane
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                Rules and stuffs
              </div>
            </div>
          </div>

          {/*bloc messageee*/}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(99, 102, 241, 0.3) transparent',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.07)',
                    color: 'white',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* loading */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        animation: `bounce 1.2s infinite ${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-end',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your question..."
              rows={1}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '13px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.4',
                maxHeight: '80px',
                overflowY: 'auto',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.8)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(99, 102, 241, 0.3)';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: input.trim() && !loading
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/*  CSS */}
      <style>{`
        /* Floating button — desktop default */
        .cb-fab {
          position: fixed;
          bottom: 24px;
          left: 24px;
          width: 84px;
          height: 84px;
        }
        /* Chat panel — desktop default (floating box, bottom-left) */
        .cb-panel {
          position: fixed;
          bottom: 116px;
          left: 24px;
          width: 360px;
          height: 480px;
        }
        /* Mobile: bigger tappable button + near full-screen chat */
        @media (max-width: 600px) {
          .cb-fab {
            bottom: 16px;
            left: 16px;
            width: 64px;
            height: 64px;
          }
          .cb-panel {
            /* fill the screen with small margins, but leave the button visible to close */
            top: 16px;
            left: 12px;
            right: 12px;
            bottom: 92px;
            width: auto;
            height: auto;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}