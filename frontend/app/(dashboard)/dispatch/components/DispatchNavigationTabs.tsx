"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  Truck,
  MapPin,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export type DispatchTabKey = "orders" | "in-transit" | "delivery" | "replacements" | "history";

interface DispatchNavigationTabsProps {
  activeTab: DispatchTabKey;
  counts?: {
    orders?: number;
    inTransit?: number;
    delivery?: number;
    replacements?: number;
    history?: number;
  };
}

export function DispatchNavigationTabs({ activeTab, counts }: DispatchNavigationTabsProps) {
  const pathname = usePathname();
  const isDispatch2 = pathname?.startsWith("/dispatch-2");
  const basePath = isDispatch2 ? "/dispatch-2" : "/dispatch";

  const tabs = [
    {
      key: "orders" as const,
      label: "Pending Orders",
      href: `${basePath}/orders`,
      icon: Package,
      count: counts?.orders,
    },
    {
      key: "in-transit" as const,
      label: "In-Transit",
      href: `${basePath}/in-transit`,
      icon: Truck,
      count: counts?.inTransit,
    },
    {
      key: "delivery" as const,
      label: "Delivery Run",
      href: `${basePath}/delivery`,
      icon: MapPin,
      count: counts?.delivery,
    },
    {
      key: "replacements" as const,
      label: "Replacements",
      href: `${basePath}/replacements`,
      icon: RefreshCw,
      count: counts?.replacements,
    },
    {
      key: "history" as const,
      label: "History",
      href: `${basePath}/history`,
      icon: CheckCircle2,
      count: counts?.history,
    },
  ];

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs mb-6 overflow-x-auto scrollbar-thin">
      <nav className="flex items-center gap-1 min-w-max" aria-label="Dispatch Sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
