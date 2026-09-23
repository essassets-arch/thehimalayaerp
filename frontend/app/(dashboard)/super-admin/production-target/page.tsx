'use client';

import SuperAdminPortal from '../../../../modules/super-admin/pages/SuperAdminPortal';
import '../[[...slug]]/dashboard.css';

export default function SuperAdminProductionTargetPage() {
  return <SuperAdminPortal initialView="production-target" />;
}
