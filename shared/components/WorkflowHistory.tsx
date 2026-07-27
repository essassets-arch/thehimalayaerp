import React from 'react';
import { Clock, User, CheckCircle } from 'lucide-react';

interface TimelineEvent {
    id: string;
    status: string;
    event: string;
    action: string;
    timestamp: string;
    actor: string;
}

interface WorkflowHistoryProps {
    history: TimelineEvent[];
}

export default function WorkflowHistory({ history }: WorkflowHistoryProps) {
    if (!history || history.length === 0) {
        return (
            <div className="p-4 text-slate-500 text-sm">
                No history events found for this order.
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock size={18} /> Order History & Timeline
            </h3>
            <div className="space-y-4">
                {history.map((evt, index) => (
                    <div key={evt.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <CheckCircle size={16} />
                            </div>
                            {index !== history.length - 1 && (
                                <div className="w-[2px] h-full bg-blue-100 my-1"></div>
                            )}
                        </div>
                        <div className="pb-4">
                            <p className="font-semibold text-slate-800 text-sm">{evt.event} <span className="text-slate-400 font-normal">({evt.status})</span></p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <User size={12} /> {evt.actor} • {new Date(evt.timestamp).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Action: {evt.action}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
