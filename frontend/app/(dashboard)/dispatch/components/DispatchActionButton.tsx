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
  const variantClass = {
    primary: "dispatch-btn-primary",
    secondary: "dispatch-btn-secondary",
    success: "dispatch-btn-success",
    outline: "dispatch-btn-outline",
    ghost: "dispatch-btn-ghost",
  }[variant] ?? "dispatch-btn-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`dispatch-btn ${variantClass} ${className}`}
    >
      {Icon && <Icon className={`dispatch-btn-icon${loading ? " animate-spin" : ""}`} />}
      <span>{label}</span>
    </button>
  );
}
