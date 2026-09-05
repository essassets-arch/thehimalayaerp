const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

const backupsDir = path.resolve(__dirname, '../../backups');
const latestFile = path.join(backupsDir, 'himalaya_erp_backup_20260905_113045.sql.gz');

async function inspectLeadsAndQuotes() {
  const fileStream = fs.createReadStream(latestFile);
  const gunzip = zlib.createGunzip();
  const rl = readline.createInterface({
    input: fileStream.pipe(gunzip),
    crlfDelay: Infinity
  });

  let currentTable = null;
  let currentColumns = [];

  const rawLeads = [];
  const rawQuotes = [];
  const rawOrders = [];
  const workflowStates = {};
  const users = {};

  for await (const line of rl) {
    const copyMatch = line.match(/^COPY public\."?([a-zA-Z0-9_]+)"?\s*\((.*)\)\s*FROM stdin;/i);
    if (copyMatch) {
      currentTable = copyMatch[1];
      currentColumns = copyMatch[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      continue;
    }

    if (line === '\\.' && currentTable) {
      currentTable = null;
      currentColumns = [];
      continue;
    }

    if (currentTable) {
      const row = line.split('\t');
      const obj = {};
      currentColumns.forEach((col, i) => {
        obj[col] = row[i];
      });

      if (currentTable === 'User') {
        users[obj.id] = obj;
      } else if (currentTable === 'WorkflowState') {
        workflowStates[obj.id] = obj;
      } else if (currentTable === 'Lead') {
        rawLeads.push(obj);
      } else if (currentTable === 'Quotation') {
        rawQuotes.push(obj);
      } else if (currentTable === 'SalesOrder') {
        rawOrders.push(obj);
      }
    }
  }

  const ss1UserId = 'b1515d86-b153-406c-93da-5d50748b7e75';

  // Leads for SS1
  const ss1Leads = rawLeads.filter(l => l.createdById === ss1UserId || l.assignedToId === ss1UserId || l.salesExecutiveId === ss1UserId);
  console.log(`Total Leads owned by SS1: ${ss1Leads.length}`);
  
  const leadWorkflowCounts = {};
  const leadDeletedCounts = {};
  ss1Leads.forEach(l => {
    const ws = workflowStates[l.workflowStateId]?.code || workflowStates[l.workflowStateId]?.name || l.workflowStateId || 'None';
    leadWorkflowCounts[ws] = (leadWorkflowCounts[ws] || 0) + 1;
    const isDel = l.deletedAt !== '\\N';
    leadDeletedCounts[isDel ? 'Deleted' : 'Active'] = (leadDeletedCounts[isDel ? 'Deleted' : 'Active'] || 0) + 1;
  });
  console.log('Lead Workflow States for SS1:', leadWorkflowCounts);
  console.log('Lead Deleted Status for SS1:', leadDeletedCounts);

  // Quotes for SS1
  const ss1Quotes = rawQuotes.filter(q => q.createdById === ss1UserId || q.salesExecutiveId === ss1UserId);
  console.log(`\nTotal Quotations owned by SS1: ${ss1Quotes.length}`);
  const quoteWorkflowCounts = {};
  const quoteDeletedCounts = {};
  ss1Quotes.forEach(q => {
    const ws = workflowStates[q.workflowStateId]?.code || workflowStates[q.workflowStateId]?.name || q.workflowStateId || 'None';
    quoteWorkflowCounts[ws] = (quoteWorkflowCounts[ws] || 0) + 1;
    const isDel = q.deletedAt !== '\\N';
    quoteDeletedCounts[isDel ? 'Deleted' : 'Active'] = (quoteDeletedCounts[isDel ? 'Deleted' : 'Active'] || 0) + 1;
  });
  console.log('Quote Workflow States for SS1:', quoteWorkflowCounts);
  console.log('Quote Deleted Status for SS1:', quoteDeletedCounts);

  // Check converted/won/order status
  console.log('\nConverted/Won Leads in SS1:');
  const convertedLeads = ss1Leads.filter(l => l.convertedAt !== '\\N' || l.wonAt !== '\\N' || l.convertedCustomerId !== '\\N');
  console.log(`Leads with convertedAt or wonAt or convertedCustomerId: ${convertedLeads.length} / ${ss1Leads.length}`);

  // Check first 10 leads details
  console.log('\nSample 5 SS1 Leads:');
  console.log(ss1Leads.slice(0, 5).map(l => ({
    leadNumber: l.leadNumber,
    company: l.companyName,
    createdById: l.createdById,
    assignedToId: l.assignedToId,
    workflowState: workflowStates[l.workflowStateId]?.code,
    convertedAt: l.convertedAt,
    wonAt: l.wonAt,
    deletedAt: l.deletedAt
  })));

  console.log('\nSample 5 SS1 Quotes:');
  console.log(ss1Quotes.slice(0, 5).map(q => ({
    quoteNumber: q.quotationNumber,
    createdById: q.createdById,
    leadId: q.leadId,
    workflowState: workflowStates[q.workflowStateId]?.code,
    deletedAt: q.deletedAt
  })));
}

inspectLeadsAndQuotes().catch(console.error);
