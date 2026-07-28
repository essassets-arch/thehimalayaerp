import 'server-only';

function envFlag(name: string): boolean {
  return process.env[name] === 'true';
}

export const backendFeatureConfig = {
  customersRead: envFlag('NEXT_PUBLIC_BACKEND_CUSTOMERS_READ'),
  customersWrite: envFlag('NEXT_PUBLIC_BACKEND_CUSTOMERS_WRITE'),
  leadsRead: envFlag('NEXT_PUBLIC_BACKEND_LEADS_READ'),
  leadsWrite: envFlag('NEXT_PUBLIC_BACKEND_LEADS_WRITE'),
};

if (backendFeatureConfig.customersWrite && !backendFeatureConfig.customersRead) {
  throw new Error('Customer backend writes require Customer backend reads.');
}

if (backendFeatureConfig.leadsWrite && !backendFeatureConfig.leadsRead) {
  throw new Error('Lead backend writes require Lead backend reads.');
}
