'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Info, AlertTriangle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

function ToastItem({ toast, onDismiss }) {
  const navigate = useRouter();
  const [timeLeft, setTimeLeft] = useState(5000);
  const [expanded, setExpanded] = useState(false);
  const isPaused = useRef(false);
  const timerResetRef = useRef(toast.timerReset);

  // Timer logic
  useEffect(() => {
    let lastTime = Date.now();
    const interval = setInterval(() => {
      if (!isPaused.current) {
        setTimeLeft(prev => {
          const next = prev - (Date.now() - lastTime);
          if (next <= 0) {
            clearInterval(interval);
            onDismiss(toast.id);
            return 0;
          }
          return next;
        });
      }
      lastTime = Date.now();
    }, 50);

    return () => clearInterval(interval);
  }, [toast.id, onDismiss]);

  // Handle timer reset on updates (for grouped events)
  useEffect(() => {
    if (toast.timerReset !== timerResetRef.current) {
      setTimeLeft(5000);
      timerResetRef.current = toast.timerReset;
    }
  }, [toast.timerReset]);

  // Accent styling based on type
  const getColors = () => {
    switch (toast.type) {
      case 'success': return { border: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', text: '#10b981', Icon: CheckCircle };
      case 'warning': return { border: '#eab308', bg: 'rgba(234, 179, 8, 0.08)', text: '#eab308', Icon: AlertTriangle };
      case 'error': return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', Icon: AlertTriangle };
      default: return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', text: '#3b82f6', Icon: Info };
    }
  };

  const { border, bg, text, Icon } = getColors();
  const progressPercent = Math.max(0, (timeLeft / 5000) * 100);

  // Shake animation class for high-priority/error toasts
  const isHighPriority = toast.priority === 'High' || toast.type === 'error';
  const toastClass = `toast-message-item ${isHighPriority ? 'toast-shake' : ''}`;

  const handleToastClick = () => {
    // Navigate to department node if specified
    if (toast.department && toast.department !== 'System') {
      const path = `/super-admin/departments/${toast.department.toLowerCase()}`;
      navigate.push(path);
    }
  };

  return (
    <div
      className={toastClass}
      onMouseEnter={() => { isPaused.current = true; }}
      onMouseLeave={() => { isPaused.current = false; }}
      onClick={handleToastClick}
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderLeft: `4px solid ${border}`,
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.20)',
        padding: '16px',
        width: '320px',
        color: '#ffffff',
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ color: text, flexShrink: 0, marginTop: '2px' }}>
          <Icon size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {toast.title}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8893A7',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ fontSize: '12.5px', margin: '4px 0 0 0', color: '#DCE5F0', lineHeight: '1.4', fontWeight: '500' }}>
            {toast.message}
          </p>
        </div>
      </div>

      {/* Grouped Notifications sub-list (Expandable) */}
      {toast.count > 1 && toast.subMessages && (
        <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: text,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
              width: '100%',
              textAlign: 'left'
            }}
          >
            {expanded ? 'Collapse details' : `Show all ${toast.count} alerts`}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          
          {expanded && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '120px',
              overflowY: 'auto',
              marginTop: '6px',
              paddingLeft: '4px'
            }}>
              {toast.subMessages.map((msg, i) => (
                <div key={i} style={{ fontSize: '11.5px', color: '#D6E2F0', borderLeft: '2px solid rgba(255,255,255,0.15)', paddingLeft: '8px', lineHeight: '1.4' }}>
                  {msg}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Progress Bar timer indicator */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '3px',
        background: border,
        width: `${progressPercent}%`,
        transition: 'width 50ms linear'
      }} />
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  // Stacking logic: show max 3 normal toasts, but high-priority/error toasts bypass and are shown immediately.
  const activeToasts = toasts.filter(t => !t.dismissed);
  const highPriorityToasts = activeToasts.filter(t => t.priority === 'High' || t.type === 'error');
  const normalToasts = activeToasts.filter(t => t.priority !== 'High' && t.type !== 'error');

  const normalVisible = normalToasts.slice(0, Math.max(0, 3 - highPriorityToasts.length));
  const visibleToasts = [...highPriorityToasts, ...normalVisible];

  return (
    <>
      <div 
        className="toast-container" 
        id="toastContainer"
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 2200,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'auto' }}>
          {visibleToasts.map((toast) => (
            <ToastItem 
              key={toast.id} 
              toast={toast} 
              onDismiss={onRemove}
            />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toast-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .toast-shake {
          animation: toast-shake 0.15s ease-in-out 2;
        }
        .toast-message-item {
          animation: toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(50px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}} />
    </>
  );
}
