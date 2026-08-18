"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface DispatchActionButtonProps {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "success" | "outline" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function DispatchActionButton({
  label,
  onClick,
  icon: Icon,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: DispatchActionButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border border-indigo-700";
      case "secondary":
        return "bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white border border-slate-900";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white border border-emerald-700";
      case "outline":
        return "bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200";
      case "ghost":
        return "bg-transparent hover:bg-indigo-50 active:bg-indigo-100 text-indigo-600 hover:text-indigo-900";
      default:
        return "bg-indigo-600 text-white";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 h-9 px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap cursor-pointer transition-all duration-150 shrink-0 select-none disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${className}`}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
