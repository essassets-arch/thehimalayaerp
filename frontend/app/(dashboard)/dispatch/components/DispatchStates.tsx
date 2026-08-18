"use client";

import React from "react";
import { Package, Clock, AlertTriangle, RefreshCw } from "lucide-react";

export function DispatchLoadingState({ count = 5 }: { count?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-center gap-3 py-6 text-sm text-slate-500 font-medium">
        <Clock className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Loading dispatch queue...</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-100/80 rounded-xl animate-pulse w-full" />
        ))}
      </div>
    </div>
  );
}

export function DispatchEmptyState({
  title = "No Dispatch Orders Found",
  description = "Orders ready for dispatch will appear here automatically once QC or production passes.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full min-h-[280px] bg-white border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
        <Package className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-900 m-0">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md m-0 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Check Again</span>
        </button>
      )}
    </div>
  );
}

export function DispatchErrorState({
  message = "Failed to load dispatch data. Please verify your connection or role permissions.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full min-h-[240px] bg-red-50/60 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-red-900 m-0">Failed to Load Dispatch Queue</h3>
      <p className="text-xs text-red-600 max-w-md m-0 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-300 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
