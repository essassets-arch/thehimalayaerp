import React from 'react';
import { useAbility } from '../context/AbilityContext';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const ability = useAbility();
  
  let subject = 'all';
  let action = permission;

  if (permission && (permission.includes(':') || permission.includes('.'))) {
    const delimiter = permission.includes(':') ? ':' : '.';
    const parts = permission.split(delimiter);
    subject = parts[0].trim().toLowerCase();
    action = parts[1].trim().toLowerCase();
  } else if (permission) {
    action = permission.trim().toLowerCase();
  }
  
  if (ability.can(action, subject)) {
    return <>{children}</>;
  }
  
  return fallback;
}
