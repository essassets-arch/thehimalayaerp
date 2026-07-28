import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield, AlertCircle, Info } from 'lucide-react';

const typeConfigs = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    buttonText: 'Delete'
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    buttonText: 'Confirm'
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'OK'
  },
  critical: {
    icon: Shield,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
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
      setTimeout(onClose, 300);
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className={`relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-6 transform transition-transform duration-300 ${
        isVisible ? 'scale-100' : 'scale-95'
      }`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`mx-auto w-14 h-14 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto px-6 py-2 text-white rounded-lg transition ${config.buttonBg} disabled:opacity-50 flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText || config.buttonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for using confirm dialog
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

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolve) {
      resolve(true);
      setResolve(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolve) {
      resolve(false);
      setResolve(null);
    }
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      {...config}
    />
  );

  return { confirm, ConfirmDialogComponent };
};
