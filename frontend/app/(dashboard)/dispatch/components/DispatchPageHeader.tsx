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
    <div
      style={{
        position: "relative",
        width: "100%",
        minWidth: 0,
        minHeight: 118,
        background: "#fff",
        border: "1px solid #dce5f0",
        borderRadius: 16,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Background Watermark Icon */}
      {HeaderIcon && (
        <div
          style={{
            position: "absolute",
            right: -24,
            bottom: -24,
            color: "rgba(79,70,229,0.05)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0,
          }}
        >
          <HeaderIcon size={200} />
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          padding: "22px 24px",
          flexWrap: "wrap",
        }}
      >
        {/* Left: eyebrow + title + subtitle */}
        <div style={{ minWidth: 0, flex: 1 }}>
          {eyebrow && (
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#4f46e5",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </p>
          )}
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              maxWidth: 700,
              fontSize: 14,
              lineHeight: 1.5,
              color: "#64748b",
            }}
          >
            {description}
          </p>
        </div>

        {/* Right: Stats + Refresh */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 48,
                  minWidth: 155,
                  padding: "7px 14px",
                  background: "#fff",
                  border: "1px solid #dce5f0",
                  borderRadius: 12,
                }}
              >
                {StatIcon && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 8,
                      borderRadius: 10,
                      background: "#ede9fe",
                      color: "#4f46e5",
                      flexShrink: 0,
                    }}
                  >
                    <StatIcon size={18} />
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 10,
                      lineHeight: 1.15,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#64748b",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stat.label}
                  </div>
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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 40,
                padding: "0 14px",
                fontSize: 13,
                fontWeight: 600,
                color: "#475569",
                background: "#fff",
                border: "1px solid #dce5f0",
                borderRadius: 10,
                cursor: "pointer",
                opacity: isRefreshing ? 0.5 : 1,
                transition: "background 0.15s",
              }}
            >
              <RefreshCw
                size={15}
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
