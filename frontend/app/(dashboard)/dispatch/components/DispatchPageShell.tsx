"use client";

import React from "react";
import styles from "../dispatch-responsive.module.css";

interface DispatchPageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DispatchPageShell({ children, className = "" }: DispatchPageShellProps) {
  return (
    <div className={`${styles.page} ${className}`}>
      <div className={styles.stack}>
        {children}
      </div>
    </div>
  );
}
