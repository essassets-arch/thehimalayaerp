"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, Truck, Navigation, CheckCircle2, Factory, RotateCcw, Repeat, FileSpreadsheet } from "lucide-react";

export function DispatchNavigationTabs() {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const tabs = [
    { href: `${basePath}/orders`, label: "Pending Orders", icon: Package },
    { href: `${basePath}/in-transit`, label: "In Transit", icon: Navigation },
    { href: `${basePath}/delivery`, label: "Out for Delivery", icon: Truck },
    { href: `${basePath}/history`, label: "Delivery History", icon: CheckCircle2 },
    { href: `${basePath}/finished-goods`, label: "Finished Stock", icon: Factory },
    { href: `${basePath}/returns`, label: "Returns", icon: RotateCcw },
    { href: `${basePath}/replacements`, label: "Replacements", icon: Repeat },
    { href: `${basePath}/daily-report`, label: "Daily Report", icon: FileSpreadsheet },
  ];

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        overflowX: "auto",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        padding: "4px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "max-content",
          minWidth: "100%",
          padding: "6px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          boxSizing: "border-box",
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href.endsWith("/orders") && pathname === basePath);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: 36,
                padding: "0 12px",
                flex: "0 0 auto",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "background 0.12s, color 0.12s",
                background: isActive ? "#4f46e5" : "transparent",
                color: isActive ? "#fff" : "#475569",
              }}
            >
              <Icon
                size={14}
                style={{
                  flexShrink: 0,
                  color: isActive ? "#fff" : "#94a3b8",
                }}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
