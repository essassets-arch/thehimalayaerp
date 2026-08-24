"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function SalesOrderNumberBadge({
  orderNumber,
  href,
}: {
  orderNumber: string;
  href?: string;
}) {
  const content = (
    <span
      className="font-semibold text-indigo-700 text-sm px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 inline-flex items-center gap-1.5 whitespace-nowrap hover:bg-indigo-100 transition-colors cursor-pointer select-all max-w-full overflow-hidden"
      title={`#${orderNumber}`}
      style={{ minWidth: 0 }}
    >
      <span className="truncate">#{orderNumber}</span>
      {href && <ExternalLink className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function DispatchTypeBadge({ type }: { type: "MFG" | "TRADING" | string }) {
  const isTrading = String(type || "").toUpperCase() === "TRADING";
  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase whitespace-nowrap ${
        isTrading
          ? "bg-sky-50 text-sky-700 border border-sky-200"
          : "bg-purple-50 text-purple-700 border border-purple-200"
      }`}
    >
      {isTrading ? "TRADING" : "MFG"}
    </span>
  );
}

export function DispatchQuantityBadge({ quantity }: { quantity: string | number }) {
  return (
    <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-semibold text-xs px-3 py-1 rounded-lg border border-emerald-200 whitespace-nowrap">
      {quantity}
    </span>
  );
}

export function DispatchStatusBadge({ status }: { status: string }) {
  const normalized = String(status || "").toUpperCase().replace(/ /g, "_");

  const getStyle = () => {
    switch (normalized) {
      case "IN_TRANSIT":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "READY_FOR_DISPATCH":
      case "READY":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "DELAYED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const label = normalized.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border whitespace-nowrap ${getStyle()}`}
    >
      {label}
    </span>
  );
}
