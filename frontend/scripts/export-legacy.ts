import fs from 'fs';
import path from 'path';

// Import everything from mockData for a robust baseline export
import { mockCustomers, mockLeads, mockQuotations, mockOrders, mockProducts, defaultUsers } from '../lib/mockData';

const exportData = {
  format: 'himalaya-zustand-export',
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  frontendCommit: '5ad9b40',
  localStorageKey: 'himalaya-erp-store',
  data: {
    sales: {
      customers: mockCustomers || [],
      leads: mockLeads || [],
      quotations: mockQuotations || [],
      orders: mockOrders || [],
    },
    inventory: {
      products: mockProducts || [],
    },
    users: defaultUsers || []
  }
};

const exportPath = path.join('d:', 'exports', 'erp-state.json');

// Ensure directory exists
if (!fs.existsSync(path.dirname(exportPath))) {
  fs.mkdirSync(path.dirname(exportPath), { recursive: true });
}

fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
console.log(`Successfully exported legacy snapshot to ${exportPath}`);
