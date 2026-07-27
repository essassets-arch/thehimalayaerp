import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export const LoadingOverlay = ({ 
  message = 'Loading...', 
  fullScreen = true,
  className = '' 
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    : 'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};
