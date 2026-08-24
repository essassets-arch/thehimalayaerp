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
    <div className="dispatch-header-card">
      {/* Background Watermark Icon */}
      {HeaderIcon && (
        <div className="dispatch-header-watermark">
          <HeaderIcon size={180} />
        </div>
      )}

      {/* Main Content Row */}
      <div className="dispatch-header-content">
        {/* Left: eyebrow + title + description */}
        <div className="dispatch-header-left">
          {eyebrow && (
            <p className="dispatch-header-eyebrow">{eyebrow}</p>
          )}
          <h1 className="dispatch-header-title">{title}</h1>
          <p className="dispatch-header-desc">{description}</p>
        </div>

        {/* Right: Stats + Actions */}
        <div className="dispatch-header-right">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="dispatch-stat-box">
                {StatIcon && (
                  <div className="dispatch-stat-icon-wrap">
                    <StatIcon size={18} />
                  </div>
                )}
                <div>
                  <div className="dispatch-stat-value">{stat.value}</div>
                  <div className="dispatch-stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}

          {children}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="dispatch-refresh-btn"
            >
              <RefreshCw
                size={14}
                style={{
                  color: isRefreshing ? "#4f46e5" : "#94a3b8",
                  animation: isRefreshing ? "spin 1s linear infinite" : undefined,
                }}
              />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
