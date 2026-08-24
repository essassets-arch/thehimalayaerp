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
  searchPlaceholder = "Search...",
  onExportCsv,
  exportCsvLabel = "Export CSV",
  children,
  title,
  subtitle,
}: DispatchToolbarProps) {
  return (
    <div className="dispatch-toolbar-card">
      {/* Title Row */}
      {(title || subtitle) && (
        <div className="dispatch-toolbar-title-row">
          {title && <h3 className="dispatch-toolbar-title">{title}</h3>}
          {subtitle && <p className="dispatch-toolbar-subtitle">{subtitle}</p>}
        </div>
      )}

      {/* Search + Actions Row */}
      <div className="dispatch-toolbar-actions-row">
        {onSearchChange && (
          <div className="dispatch-search-box">
            <Search size={15} className="dispatch-search-icon" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="dispatch-search-input"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="dispatch-search-clear"
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
            className="dispatch-export-btn"
          >
            <Download size={14} />
            <span>{exportCsvLabel}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
