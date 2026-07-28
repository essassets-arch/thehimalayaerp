import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const themeStyles = {
  success: {
    accentColor: '#10b981', // green
    bg: 'rgba(15, 23, 42, 0.95)',
    border: 'rgba(16, 185, 129, 0.3)',
    icon: CheckCircle,
    iconBg: 'rgba(16, 185, 129, 0.12)',
    title: 'Success',
    titleColor: '#10b981'
  },
  error: {
    accentColor: '#ef4444', // red
    bg: 'rgba(15, 23, 42, 0.95)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: AlertCircle,
    iconBg: 'rgba(239, 68, 68, 0.12)',
    title: 'Error',
    titleColor: '#ef4444'
  },
  warning: {
    accentColor: '#f59e0b', // yellow
    bg: 'rgba(15, 23, 42, 0.95)',
    border: 'rgba(245, 158, 11, 0.3)',
    icon: AlertTriangle,
    iconBg: 'rgba(245, 158, 11, 0.12)',
    title: 'Warning',
    titleColor: '#f59e0b'
  },
  info: {
    accentColor: '#3b82f6', // blue
    bg: 'rgba(15, 23, 42, 0.95)',
    border: 'rgba(59, 130, 246, 0.3)',
    icon: Info,
    iconBg: 'rgba(59, 130, 246, 0.12)',
    title: 'Notification',
    titleColor: '#3b82f6'
  }
};

export const Toast = ({ id, message, type = 'info', duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose(id);
      }, 400); // Wait for the exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const style = themeStyles[type] || themeStyles.info;
  const Icon = style.icon;

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderLeft: `5px solid ${style.accentColor}`,
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        marginBottom: '12px',
        minWidth: '340px',
        maxWidth: '420px',
        position: 'relative',
        overflow: 'hidden',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        animation: isExiting 
          ? 'toastSlideOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
          : 'toastSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {/* Status Icon */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: style.iconBg,
          color: style.accentColor,
          flexShrink: 0,
          animation: 'iconBounce 1.2s ease-in-out infinite'
        }}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>

      {/* Message & Title */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span style={{ fontSize: '13px', fontWeight: '800', color: style.titleColor, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {style.title}
        </span>
        <span style={{ fontSize: '12.5px', color: '#D6E2F0', lineHeight: '1.45', fontWeight: '500' }}>
          {message}
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            onClose(id);
          }, 400);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#8893A7',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          transition: 'all 0.15s',
          marginTop: '2px',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#ffffff';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#8893A7';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <X size={15} />
      </button>

      {/* Auto-Dismiss Progress Bar indicator */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: style.accentColor,
          opacity: 0.8,
          animation: `progressBarShrink ${duration}ms linear forwards`
        }}
      />
    </div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none'
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes toastSlideIn {
          0% { transform: translateX(120%) scale(0.9); opacity: 0; }
          70% { transform: translateX(-5px) scale(1.02); }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        @keyframes toastSlideOut {
          0% { transform: translateX(0) scale(1); opacity: 1; }
          100% { transform: translateX(120%) scale(0.9); opacity: 0; }
        }
        @keyframes progressBarShrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      ` }} />
    </div>
  );
};
