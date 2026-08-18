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
  minTableWidth = 960,
}: DispatchTableCardProps) {
  const minWidthPx = typeof minTableWidth === "number" ? `${minTableWidth}px` : minTableWidth;

  return (
    /* Outer card: border + rounded corners. overflow must be visible so inner scroll works */
    <div
      className={`no-mobile-stack ${className}`}
      style={{
        width: "100%",
        minWidth: 0,
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxSizing: "border-box",
        /* Do NOT set overflow:hidden here — it would clip the scroll container */
      }}
    >
      {/* Scroll container: inline style so globals.css cannot override overflow */}
      <div
        className="no-mobile-stack"
        style={{
          width: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {/* Min-width enforcer so table doesn't collapse */}
        <div style={{ minWidth: minWidthPx, width: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
