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
    <div className="w-full overflow-x-auto scrollbar-none py-1">
      <div className="inline-flex items-center gap-1.5 p-1.5 bg-white border border-slate-200/90 rounded-2xl shadow-2xs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href.endsWith("/orders") && pathname === basePath);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
