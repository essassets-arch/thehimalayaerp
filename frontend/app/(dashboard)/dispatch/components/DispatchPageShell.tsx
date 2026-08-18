"use client";

import React from "react";

interface DispatchPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DispatchPageShell({ children, className = "" }: DispatchPageShellProps) {
  return (
    <div className={`w-full min-w-0 max-w-full min-h-screen bg-slate-50/60 box-border overflow-x-hidden ${className}`}>
      <div className="w-full min-w-0 max-w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 box-border">
        {children}
      </div>
    </div>
  );
}
