import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };

  const colors = {
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
    primary: 'border-indigo-600'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} 
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};
