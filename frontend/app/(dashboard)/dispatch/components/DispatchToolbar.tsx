"use client";

import React from "react";
import { Search, X, Download } from "lucide-react";

interface DispatchToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onExportCsv?: () => void;
  exportCsvLabel?: string;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function DispatchToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search order number, customer, product or delivery address...",
  onExportCsv,
  exportCsvLabel = "Export CSV",
  children,
  title,
  subtitle,
}: DispatchToolbarProps) {
  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        background: "#fff",
        border: "1px solid #dce5f0",
        borderRadius: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Toolbar Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          minHeight: 72,
          padding: "14px 20px",
          borderBottom: "1px solid #e8eef6",
          flexWrap: "wrap",
        }}
      >
        {/* Title & Subtitle */}
        {(title || subtitle) && (
          <div style={{ minWidth: 0, flexShrink: 0 }}>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.25,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "#64748b",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Search + Export Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flex: "0 1 620px",
            minWidth: 0,
          }}
        >
          {onSearchChange && (
            <div
              style={{
                flex: 1,
                minWidth: 260,
                height: 42,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 14px",
                border: "1px solid #d6e2f0",
                borderRadius: 11,
                background: "#f8fafc",
                position: "relative",
                boxSizing: "border-box",
              }}
            >
              <Search
                size={15}
                style={{ color: "#94a3b8", flexShrink: 0 }}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                style={{
                  flex: 1,
                  width: "100%",
                  minWidth: 0,
                  border: 0,
                  outline: 0,
                  background: "transparent",
                  fontSize: 13,
                  lineHeight: "normal",
                  color: "#334155",
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    border: 0,
                    borderRadius: 6,
                    background: "transparent",
                    color: "#94a3b8",
                    cursor: "pointer",
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                height: 42,
                padding: "0 14px",
                border: "1px solid #dce5f0",
                borderRadius: 10,
                background: "#fff",
                color: "#475569",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              <Download size={14} style={{ color: "#94a3b8" }} />
              <span>{exportCsvLabel}</span>
            </button>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
