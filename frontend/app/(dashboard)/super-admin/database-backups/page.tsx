import DatabaseBackupsPage from '@/modules/super-admin/pages/DatabaseBackupsPage';

export const metadata = {
  title: 'Database Backups & Disaster Recovery | Super Admin — Himalaya ERP',
  description: 'Enterprise PostgreSQL Automated Backup, AES-256-GCM Encryption, and Daily Email Delivery Console',
};

export default function Page() {
  return <DatabaseBackupsPage />;
}
