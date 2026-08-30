"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Truck,
  Navigation,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

export function DispatchNavigationTabs() {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const tabs = [
    {
      id: "orders",
      label: "Pending Queue",
      href: `${basePath}/orders`,
      icon: Package,
      matcher: (path: string) => path === `${basePath}/orders` || path === `${basePath}/create-dispatch`,
    },
    {
      id: "in-transit",
      label: "In-Transit",
      href: `${basePath}/in-transit`,
      icon: Truck,
      matcher: (path: string) => path === `${basePath}/in-transit`,
    },
    {
      id: "delivery",
      label: "Out for Delivery",
      href: `${basePath}/delivery`,
      icon: Navigation,
      matcher: (path: string) => path === `${basePath}/delivery`,
    },
    {
      id: "history",
      label: "Delivery History",
      href: `${basePath}/history`,
      icon: CheckCircle2,
      matcher: (path: string) => path === `${basePath}/history`,
    },
    {
      id: "sample",
      label: "Sample Dispatch",
      href: `${basePath}/sample-dispatch`,
      icon: FileSpreadsheet,
      matcher: (path: string) => path === `${basePath}/sample-dispatch`,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        marginBottom: "16px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "6px 8px",
        boxSizing: "border-box",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: "max-content",
        }}
        aria-label="Dispatch Navigation"
      >
        {tabs.map((tab) => {
          const isActive = tab.matcher(pathname || "");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 600,
                textDecoration: "none",
                transition: "all 0.15s ease",
                color: isActive ? "#2563eb" : "#64748b",
                background: isActive ? "#eff6ff" : "transparent",
                border: isActive ? "1px solid #bfdbfe" : "1px solid transparent",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <Icon
                style={{
                  width: "16px",
                  height: "16px",
                  color: isActive ? "#2563eb" : "#94a3b8",
                  flexShrink: 0,
                }}
              />
              <span>{tab.label}</span>
              {isActive && (
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#3b82f6",
                    display: "inline-block",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
