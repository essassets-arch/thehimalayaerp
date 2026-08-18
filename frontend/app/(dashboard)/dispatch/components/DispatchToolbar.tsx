"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface DispatchToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DispatchToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search order, customer, product or vehicle...",
  children,
  title,
  subtitle,
}: DispatchToolbarProps) {
  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
      {/* Optional Title & Subtitle */}
      {(title || subtitle) && (
        <div className="min-w-0">
          {title && <h3 className="text-base font-bold text-slate-900 m-0">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 m-0 mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1 justify-end">
        {onSearchChange && (
          <div className="relative flex-1 sm:flex-initial min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
