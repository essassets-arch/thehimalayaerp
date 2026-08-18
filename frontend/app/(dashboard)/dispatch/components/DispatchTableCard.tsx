"use client";

import React from "react";

interface DispatchTableCardProps {
  children: React.ReactNode;
  className?: string;
  minTableWidth?: string | number;
}

export function DispatchTableCard({
  children,
  className = "",
  minTableWidth = 1100,
}: DispatchTableCardProps) {
  return (
    <div className={`w-full min-w-0 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden ${className}`}>
      <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div style={{ minWidth: typeof minTableWidth === "number" ? `${minTableWidth}px` : minTableWidth }}>
          {children}
        </div>
      </div>
    </div>
  );
}
