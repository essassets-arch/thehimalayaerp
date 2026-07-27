import React from 'react';

export const LoadingSkeleton = ({ 
  type = 'card',
  count = 1,
  className = '' 
}) => {
  const skeletons = Array(count).fill(null);

  const renderCard = () => (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  );

  const renderTableRow = () => (
    <div className={`flex items-center space-x-4 py-3 px-4 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );

  const renderStat = () => (
    <div className={`bg-white rounded-lg shadow p-6 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  const renderers = {
    card: renderCard,
    table: renderTableRow,
    stat: renderStat
  };

  const renderer = renderers[type] || renderers.card;

  return (
    <div className="space-y-4">
      {skeletons.map((_, index) => (
        <div key={index}>{renderer()}</div>
      ))}
    </div>
  );
};
