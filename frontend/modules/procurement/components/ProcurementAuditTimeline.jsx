import React from 'react';
import { User, Clock, FileText } from 'lucide-react';
const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
import { ProcurementStatusBadge } from './ProcurementStatusBadge';

export function ProcurementAuditTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-gray-500 py-4">No audit history available.</p>;
  }

  return (
    <div className="flow-root mt-4">
      <ul className="-mb-8">
        {logs.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp)).map((log, logIdx) => {
          const timestamp = log.createdAt || log.timestamp;
          const actorName = log.actor?.name || log.actorName || 'System';
          const actorRole = log.actor?.role || log.actorRole || 'User';
          const remarks = log.metadata?.remarks || log.remarks;
          return (
            <li key={log.id}>
              <div className="relative pb-8">
                {logIdx !== logs.length - 1 ? (
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                      <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{actorName} ({actorRole})</span>
                        {' '}{log.action.replace(/_/g, ' ')}{' '}
                        {log.newStatus && (
                          <span className="ml-2">
                            <ProcurementStatusBadge status={log.newStatus} />
                          </span>
                        )}
                      </p>
                      {remarks && (
                        <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100 flex items-start gap-2">
                          <FileText size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <span className="italic">"{remarks}"</span>
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-sm text-gray-500 flex items-center gap-1">
                      <Clock size={14} />
                      <time dateTime={timestamp}>{formatDate(new Date(timestamp))}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
