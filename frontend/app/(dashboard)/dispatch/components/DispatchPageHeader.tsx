"use client";

import React from "react";
import { RefreshCw, LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
  icon?: LucideIcon;
}

interface DispatchPageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  icon?: LucideIcon;
  stats?: StatItem[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  children?: React.ReactNode;
}

export function DispatchPageHeader({
  title,
  description,
  eyebrow = "Logistics Management",
  icon: HeaderIcon,
  stats = [],
  onRefresh,
  isRefreshing = false,
  children,
}: DispatchPageHeaderProps) {
  return (
    <div className="relative w-full min-w-0 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Background Watermark Icon */}
      {HeaderIcon && (
        <div className="absolute -right-6 -bottom-6 text-indigo-600/5 pointer-events-none select-none z-0">
          <HeaderIcon size={180} />
        </div>
      )}

      {/* Main Content Bar */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0 max-w-3xl flex-1">
          {eyebrow && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold tracking-wider uppercase mb-2.5">
              {HeaderIcon && <HeaderIcon className="w-3.5 h-3.5" />}
              <span>{eyebrow}</span>
            </div>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug m-0">
            {title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl m-0">
            {description}
          </p>
        </div>

        {/* Right Section: Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {stats.length > 0 && (
            <div className="flex items-center gap-3 p-2 sm:p-2.5 bg-slate-50/90 border border-slate-200/80 rounded-xl shadow-2xs">
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <React.Fragment key={stat.label}>
                    {idx > 0 && <div className="w-px h-8 bg-slate-200" />}
                    <div className="flex items-center gap-2 px-2 py-0.5">
                      {StatIcon && (
                        <div className={`p-1.5 rounded-lg ${stat.color || "bg-indigo-50 text-indigo-600"}`}>
                          <StatIcon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-lg font-extrabold text-slate-900 leading-none">
                          {stat.value}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 whitespace-nowrap">
                          {stat.label}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {children}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
