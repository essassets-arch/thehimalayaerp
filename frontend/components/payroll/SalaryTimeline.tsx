import React from 'react';

export function SalaryTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500">No history available.</p>;
  }

  return (
    <div className="space-y-4">
      {history.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
            {index < history.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-1"></div>}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-slate-900">{event.action.replace(/_/g, ' ')}</p>
              <p className="text-xs text-slate-500">{new Date(event.at || event.performedAt).toLocaleString()}</p>
            </div>
            <p className="text-xs text-slate-600 mt-1">By {event.by || event.performedBy}</p>
            {event.remarks && (
              <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                {event.remarks}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
