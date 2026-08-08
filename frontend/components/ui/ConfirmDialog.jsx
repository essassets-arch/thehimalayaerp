import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield, Info } from 'lucide-react';

const typeConfigs = {
  danger: {
    icon: AlertTriangle,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    buttonBg: '#EF4444',
    buttonText: 'Delete'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    buttonBg: '#F59E0B',
    buttonText: 'Confirm'
  },
  info: {
    icon: Info,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    buttonBg: '#3B82F6',
    buttonText: 'OK'
  },
  critical: {
    icon: Shield,
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
    buttonBg: '#8B5CF6',
    buttonText: 'Confirm'
  }
};

export const ConfirmDialog = ({ 
  isOpen = false,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText,
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const config = typeConfigs[type] || typeConfigs.danger;
  const Icon = config.icon;

  if (!isOpen && !isVisible) return null;

  const handleClose = () => {
    if (!isLoading) {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
      onClick={handleClose}
    >
      {/* Dialog Card */}
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px 24px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E2E8F0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: 'transform 0.2s ease'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* Icon Badge */}
        <div 
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: config.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.iconColor,
            marginBottom: '16px'
          }}
        >
          <Icon size={28} />
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0', lineHeight: 1.3 }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0', lineHeight: 1.5, maxWidth: '380px' }}>
          {message}
        </p>

        {/* Responsive Actions Bar */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            style={{
              flex: '1 1 120px',
              padding: '11px 20px',
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              color: '#334155',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              flex: '1 1 140px',
              padding: '11px 20px',
              background: config.buttonBg,
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            {isLoading ? 'Processing...' : (confirmText || config.buttonText)}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const [resolve, setResolve] = useState(null);

  const confirm = (options) => {
    return new Promise((res) => {
      setConfig({
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure?',
        confirmText: options.confirmText,
        cancelText: options.cancelText || 'Cancel',
        type: options.type || 'danger'
      });
      setResolve(() => res);
      setIsOpen(true);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (resolve) resolve(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolve) resolve(true);
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      {...config}
    />
  );

  return { confirm, ConfirmDialogComponent };
};
