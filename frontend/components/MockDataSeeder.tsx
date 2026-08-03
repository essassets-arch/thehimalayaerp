'use client';

import { useEffect } from 'react';
import { useERPStore } from '@/store/erpStore';
import { INITIAL_MATERIALS } from '@/shared/initialMaterials';

export default function MockDataSeeder() {
  const setState = useERPStore(s => s.setState);
  const state = useERPStore(s => s.state);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    // Generate 5 generic entries
    const generateGenericEntries = (prefix: string) => {
      return Array.from({ length: 5 }).map((_, i) => ({
        id: `${prefix}-${1000 + i}`,
        orderId: `ORD-${5000 + i}`,
        customerName: `Customer ${i + 1}`,
        customer: `Customer ${i + 1}`,
        name: `Item Name ${i + 1}`,
        material: `Material ${i + 1}`,
        product: `Product ${i + 1}`,
        productName: `Product ${i + 1}`,
        unit: 'Units',
        quantity: (i + 1) * 10,
        remarks: 'Test remark for CSS',
        status: i % 2 === 0 ? 'Pending' : 'QC Passed',
        orderStatus: i % 2 === 0 ? 'Pending' : 'QC Passed',
        workflowStatus: i % 2 === 0 ? 'Pending' : 'QC Passed',
        date: new Date().toISOString(),
        amount: (i + 1) * 100,
        totalValue: (i + 1) * 100,
        vendor: `Vendor ${i + 1}`,
        productionStatus: 'Running',
        driver: `Driver ${i + 1}`,
        vehicle: `Vehicle ${i + 1}`,
        qcStatus: 'Pending',
        stock: 50,
        reorderLevel: 20
      }));
    };

    // Seed LocalStorage
    const seedLocal = (key: string, dataFunc: () => any) => {
      const version = localStorage.getItem('mock_version_1');
      if (!version) {
        // Force wipe old data on first run of this new version
        localStorage.removeItem(key);
      }
      
      const existing = localStorage.getItem(key);
      if (!existing || existing === '[]') {
        localStorage.setItem(key, JSON.stringify(dataFunc()));
      }
    };

    let shouldSeedAnalysisRequests = false;
    if (!localStorage.getItem('mock_version_2')) {
      // Clear old persisted analysis requests so the new seeds are picked up
      localStorage.removeItem('erp_analysis_requests_v1');
      localStorage.setItem('mock_version_2', 'true');
      shouldSeedAnalysisRequests = true;
    }

    let shouldSeedMaterials = false;
    if (!localStorage.getItem('mock_version_materials_v3')) {
      // Clear old persisted raw materials so the new 136 items are loaded
      localStorage.removeItem('erp_inventory');
      localStorage.setItem('mock_version_materials_v3', 'true');
      shouldSeedMaterials = true;
    }

    const keysToSeed = [
      'erp_return_requests', 'erp_replacement_requests', 'erp_delivered_orders',
      'erp_active_transit', 'erp_dispatch_orders', 'erp_qc_pending', 'erp_qc_approved',
      'himalaya_work_orders', 'himalaya_rework_items', 'himalaya_manual_testing_items',
      'erp_purchase_orders', 'erp_goods_receipts'
    ];
    keysToSeed.forEach(key => seedLocal(key, () => generateGenericEntries(key.split('_').pop()?.toUpperCase() || 'KEY')));

    // Seed Zustand Store
    // Canonical workflow collections must remain genuinely empty until their
    // domain actions create records. Generic rows corrupt status transitions.
    const protectedWorkflowKeys = new Set(['payrollRuns']);
    const emptyKeys = Object.keys(state).filter(
      k => Array.isArray(state[k]) && state[k].length === 0 && !protectedWorkflowKeys.has(k)
    );
    
    // Force reseed of analysisRequests if version bumped, even if Zustand already hydrated old data
    if (shouldSeedAnalysisRequests && !emptyKeys.includes('analysisRequests')) {
      emptyKeys.push('analysisRequests');
    }

    // Force reseed of rawInventory with the 136 real materials list
    if (shouldSeedMaterials && !emptyKeys.includes('rawInventory')) {
      emptyKeys.push('rawInventory');
    }

    if (emptyKeys.length > 0) {
      const newState = { ...state };
      emptyKeys.forEach(k => {
        if (k === 'purchaseIndents') {
          newState[k] = [
            { id: 'PI-2026-001', material: 'Cement 53 Grade', quantity: 200, unit: 'Bags', reason: 'Low Stock', priority: 'High', requiredDate: '2026-07-20', status: 'PENDING_PLANT_HEAD_APPROVAL', createdBy: 'Store Executive', createdAt: new Date().toISOString() },
            { id: 'PI-2026-002', material: 'Sulfuric Acid', quantity: 1000, unit: 'Liters', reason: 'Quarterly Replenishment', priority: 'Medium', requiredDate: '2026-07-22', status: 'PLANT_HEAD_APPROVED', createdBy: 'Store Executive', plantHeadApprovedAt: new Date().toISOString() },
          ];
        } else if (k === 'purchaseOrders') {
          newState[k] = [
            { id: 'PO-DRAFT-2026-003', indentId: 'PI-2026-003', vendorName: 'Steel & Co.', subtotal: 245000, grandTotal: 289100, status: 'PENDING_SUPER_ADMIN_APPROVAL', createdAt: new Date().toISOString(), items: [{ name: 'Steel TMT 12mm', quantity: 5, unit: 'Tons', unitRate: 49000 }] },
            { id: 'PO-DRAFT-2026-004', indentId: 'PI-2026-004', vendorName: 'PackWell Solutions', subtotal: 45000, grandTotal: 53100, status: 'SUPER_ADMIN_APPROVED', approvedBy: 'Super Admin User', createdAt: new Date().toISOString(), items: [{ name: 'Packing Bags', quantity: 5000, unit: 'Nos', unitRate: 9 }] },
            { id: 'PO-2026-005', indentId: 'PI-2026-005', vendorName: 'ABC Cement Suppliers', subtotal: 76000, grandTotal: 89680, status: 'PO_ISSUED', poNumber: 'PO-2026-005', issuedAt: new Date().toISOString(), deliveryDate: '2026-07-25', items: [{ name: 'Cement 43 Grade', quantity: 200, unit: 'Bags', unitRate: 380 }] },
            { id: 'PO-2026-006', indentId: 'PI-2026-006', vendorName: 'Chemicals India Ltd', subtotal: 150000, grandTotal: 177000, status: 'VENDOR_ACCEPTED', poNumber: 'PO-2026-006', issuedAt: new Date().toISOString(), deliveryDate: '2026-07-28', items: [{ name: 'Admixture', quantity: 1000, unit: 'Liters', unitRate: 150 }] },
          ];
        } else if (k === 'goodsReceipts') {
          newState[k] = [
            { id: 'GRN-2026-001', purchaseOrderId: 'PO-2026-007', indentId: 'PI-2026-007', status: 'PENDING_QC', createdAt: new Date().toISOString(), items: [{ name: 'River Sand', quantity: 100, unit: 'Tons', acceptedQty: 100 }] },
            { id: 'GRN-2026-002', purchaseOrderId: 'PO-2026-008', indentId: 'PI-2026-008', status: 'QC_APPROVED', createdAt: new Date().toISOString(), items: [{ name: 'Aggregate 20mm', quantity: 150, unit: 'Tons', acceptedQty: 150 }] },
          ];
        } else if (k === 'vendorPayments') {
          newState[k] = [
            { id: 'VP-2026-001', purchaseOrderId: 'PO-2026-009', status: 'PAYMENT_PENDING', grandTotal: 350000, vendorName: 'Global Suppliers', createdAt: new Date().toISOString() },
          ];
        } else if (k === 'analysisRequests') {
          const d = (days: number) => new Date(Date.now() - 86400000 * days).toISOString();
          const baseReport = (product: string, brand: string, issue: string, priority: string, occurrences: number, affectedQty: number, unit: string, alt: string) => ({
            productCode: `RM-${Math.floor(Math.random() * 900) + 100}`,
            productName: product,
            brand,
            issueType: issue,
            priority,
            problemTitle: `${brand} ${product} — recurring ${issue.toLowerCase()}`,
            description: `${brand} ${product} has shown ${issue.toLowerCase()} issues ${occurrences} times over the past month. Immediate review recommended.`,
            firstObservedDate: d(occurrences + 2).split('T')[0],
            occurrenceCount: occurrences,
            affectedQuantity: affectedQty,
            unit,
            currentStock: affectedQty * 4,
            observation: `Store has isolated affected stock. Suggest technical trial with ${alt || 'alternative brand'}.`,
            suggestedAlternativeBrand: alt || '',
            attachments: []
          });
          newState[k] = [
            // 1. DRAFT
            {
              id: 'AR-010', requestNumber: 'AR-DRAFT-010', status: 'DRAFT',
              createdAt: d(1), updatedAt: d(1), createdBy: 'Store User',
              storeReport: baseReport('River Sand', 'Shiv Sand Co.', 'Poor Performance', 'LOW', 1, 8, 'Tons', 'Bharat Sand'),
              history: [{ action: 'DRAFT_SAVED', fromStatus: 'NONE', toStatus: 'DRAFT', performedBy: 'Store User', performedAt: d(1), remarks: 'Draft saved.' }]
            },
            // 2. PENDING_FINANCE_REVIEW
            {
              id: 'AR-011', requestNumber: 'AR-738291', status: 'PENDING_FINANCE_REVIEW',
              createdAt: d(3), updatedAt: d(3), createdBy: 'Store User', submittedAt: d(3),
              storeReport: baseReport('Aggregate 20mm', 'Rocky Quarry Ltd', 'Physical Damage', 'MEDIUM', 2, 12, 'Tons', 'Durastone Aggregates'),
              history: [{ action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(3), remarks: 'Submitted to Finance.' }]
            },
            // 3. FINANCE_UNDER_REVIEW
            {
              id: 'AR-012', requestNumber: 'AR-840192', status: 'FINANCE_UNDER_REVIEW',
              createdAt: d(5), updatedAt: d(2), createdBy: 'Store User', submittedAt: d(5),
              storeReport: baseReport('Admixture', 'ChemPro Ltd', 'Quality Issue', 'HIGH', 4, 200, 'Liters', 'BaseChem Pro'),
              history: [
                { action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(5), remarks: 'Submitted.' },
                { action: 'FINANCE_REVIEW_STARTED', fromStatus: 'PENDING_FINANCE_REVIEW', toStatus: 'FINANCE_UNDER_REVIEW', performedBy: 'Finance Auditor', performedAt: d(2), remarks: 'Finance commenced commercial audit.' }
              ]
            },
            // 4. RETURNED_TO_STORE (existing AR-001 scenario)
            {
              id: 'AR-001', requestNumber: 'AR-582718', status: 'RETURNED_TO_STORE',
              createdAt: d(4), updatedAt: d(1), createdBy: 'Store User', submittedAt: d(4),
              returnRemarks: 'Please provide physical inspection photos and batch number from the affected cement bags.',
              storeReport: {
                productCode: 'RM-001', productName: 'Cement 53 Grade', brand: 'Ultra Cement',
                issueType: 'Quality Issue', priority: 'HIGH',
                problemTitle: 'Premature hardening of cement bags in storage bay',
                description: 'Bags from the latest batch are absorbing moisture and hardening prematurely.',
                firstObservedDate: d(6).split('T')[0], occurrenceCount: 3, affectedQuantity: 45, unit: 'Bags',
                currentStock: 200, observation: 'Request alternate ACC brand trial.',
                suggestedAlternativeBrand: 'ACC Cement', attachments: []
              },
              financeReview: {
                relatedVendor: 'ABC Cement Suppliers', relatedPoIds: ['PO-2026-005'], relatedGrnIds: ['GRN-2026-002'],
                commercialAnalysis: 'Purchased 200 bags @ ₹380/bag. Moisture damage on 45 bags = ₹17,100 loss.',
                costComparison: 'Ultra Cement ₹380/bag vs ACC Cement ₹395/bag (+3.9%).', financialImpact: '₹17,100 loss',
                vendorPerformance: 'Good delivery speed but high damage rate in monsoon.',
                recommendation: 'Switch if ACC trial passes.', reviewedBy: 'Finance Auditor', reviewedAt: d(2)
              },
              history: [
                { action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(4), remarks: 'Submitted.' },
                { action: 'FINANCE_REVIEW_STARTED', fromStatus: 'PENDING_FINANCE_REVIEW', toStatus: 'FINANCE_UNDER_REVIEW', performedBy: 'Finance Auditor', performedAt: d(3), remarks: 'Review started.' },
                { action: 'RETURNED_TO_STORE', fromStatus: 'FINANCE_UNDER_REVIEW', toStatus: 'RETURNED_TO_STORE', performedBy: 'Finance Auditor', performedAt: d(1), remarks: 'Please provide physical inspection photos and batch number from the affected cement bags.' }
              ]
            },
            // 5. PENDING_SUPER_ADMIN_APPROVAL (existing AR-002)
            {
              id: 'AR-002', requestNumber: 'AR-192837', status: 'PENDING_SUPER_ADMIN_APPROVAL',
              createdAt: d(6), updatedAt: d(1), createdBy: 'Store User', submittedAt: d(6),
              storeReport: {
                productCode: 'RM-003', productName: 'Steel TMT 12mm', brand: 'Apex Steel',
                issueType: 'Quality Issue', priority: 'CRITICAL',
                problemTitle: 'TMT bars cracking during rebar cage bend test',
                description: 'During cage bending, Apex Steel bars cracked — fails mechanical bend test.',
                firstObservedDate: d(8).split('T')[0], occurrenceCount: 5, affectedQuantity: 3.5, unit: 'Tons',
                currentStock: 15, observation: 'Highly critical structural hazard.',
                suggestedAlternativeBrand: 'Prime Steel', attachments: []
              },
              financeReview: {
                relatedVendor: 'Steel & Co.', relatedPoIds: ['PO-DRAFT-2026-003'], relatedGrnIds: ['GRN-2026-001'],
                commercialAnalysis: '₹49,000/ton. Quarantined 3.5 tons = ₹1,71,500 exposed value.',
                costComparison: 'Apex Steel ₹49,000/ton vs Prime Steel ₹51,000/ton.', financialImpact: '₹1,71,500 exposed value',
                vendorPerformance: 'Good overall, but structural failure is unacceptable.',
                recommendation: 'Blacklist Apex Steel.', reviewedBy: 'Finance Auditor', reviewedAt: d(1)
              },
              history: [
                { action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(6), remarks: 'Submitted.' },
                { action: 'SUBMITTED_TO_SUPER_ADMIN', fromStatus: 'FINANCE_UNDER_REVIEW', toStatus: 'PENDING_SUPER_ADMIN_APPROVAL', performedBy: 'Finance Auditor', performedAt: d(1), remarks: 'Commercial analysis done.' }
              ]
            },
            // 6. TRIAL_IN_PROGRESS
            {
              id: 'AR-020', requestNumber: 'AR-901823', status: 'TRIAL_IN_PROGRESS',
              createdAt: d(14), updatedAt: d(3), createdBy: 'Store User', submittedAt: d(14),
              storeReport: baseReport('Packing Bags', 'FlexPack Ltd', 'Quality Issue', 'MEDIUM', 6, 500, 'Nos', 'SecurePack India'),
              financeReview: {
                relatedVendor: 'PackWell Solutions', relatedPoIds: ['PO-DRAFT-2026-004'], relatedGrnIds: [],
                commercialAnalysis: '₹9/bag, frequent tear complaints post-filling.', costComparison: 'FlexPack ₹9/bag vs SecurePack ₹10/bag.',
                financialImpact: '~₹4,500 in wasted product spills', vendorPerformance: 'Inconsistent quality across batches.',
                recommendation: 'Approve SecurePack trial for 200 bags.', reviewedBy: 'Finance Auditor', reviewedAt: d(6)
              },
              adminDecision: {
                decisionType: 'APPROVE_TECHNICAL_TRIAL', decidedBy: 'Super Admin', decidedAt: d(3),
                remarks: 'Trial approved. Evaluate SecurePack India 200 bags for 2 weeks.'
              },
              trial: {
                required: true, trialBrand: 'SecurePack India', trialQuantity: 200, unit: 'Nos',
                expectedCompletionDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
                performanceCriteria: 'Zero tear rate under normal filling load.',
                status: 'IN_PROGRESS', startedAt: d(3), submittedAt: null
              },
              history: [
                { action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(14), remarks: 'Submitted.' },
                { action: 'SUBMITTED_TO_SUPER_ADMIN', fromStatus: 'FINANCE_UNDER_REVIEW', toStatus: 'PENDING_SUPER_ADMIN_APPROVAL', performedBy: 'Finance Auditor', performedAt: d(7), remarks: 'Ready for decision.' },
                { action: 'TRIAL_APPROVED', fromStatus: 'PENDING_SUPER_ADMIN_APPROVAL', toStatus: 'TRIAL_APPROVED', performedBy: 'Super Admin', performedAt: d(3), remarks: 'Trial approved.' },
                { action: 'TRIAL_STARTED', fromStatus: 'TRIAL_APPROVED', toStatus: 'TRIAL_IN_PROGRESS', performedBy: 'Store User', performedAt: d(3), remarks: 'Trial commenced. 200 bags received from SecurePack.' }
              ]
            },
            // 7. TRIAL_REPORT_SUBMITTED
            {
              id: 'AR-021', requestNumber: 'AR-102938', status: 'TRIAL_REPORT_SUBMITTED',
              createdAt: d(20), updatedAt: d(1), createdBy: 'Store User', submittedAt: d(20),
              storeReport: baseReport('Cement 43 Grade', 'Shree Cement', 'Quality Issue', 'HIGH', 4, 100, 'Bags', 'ACC Cement'),
              financeReview: {
                relatedVendor: 'ABC Cement Suppliers', relatedPoIds: ['PO-2026-005'], relatedGrnIds: [],
                commercialAnalysis: 'Shree Cement batches showing inconsistent setting times.', costComparison: 'Shree ₹355/bag vs ACC ₹378/bag.',
                financialImpact: '₹23,000 estimated rework costs', vendorPerformance: 'Moderate; 2 complaints in 6 months.',
                recommendation: 'Switch to ACC if trial outcome is positive.', reviewedBy: 'Finance Auditor', reviewedAt: d(10)
              },
              adminDecision: {
                decisionType: 'APPROVE_TECHNICAL_TRIAL', decidedBy: 'Super Admin', decidedAt: d(8),
                remarks: '50-bag trial approved. Report within 5 days.'
              },
              trial: {
                required: true, trialBrand: 'ACC Cement', trialQuantity: 50, unit: 'Bags',
                expectedCompletionDate: d(2).split('T')[0],
                performanceCriteria: 'Setting time and compressive strength must meet IS 8112.',
                status: 'REPORT_SUBMITTED', startedAt: d(8), submittedAt: d(1),
                result: 'SUCCESSFUL', successfulQuantity: 48, failedQuantity: 2,
                reportText: 'ACC Cement performed excellently. 48/50 bags met strength requirements. Minor variance in 2 bags — acceptable within tolerance.',
                observations: 'Consistent colour, setting time 30–35 minutes, compressive strength above 53MPa. No premature hardening observed.',
                reportedBy: 'Store User'
              },
              history: [
                { action: 'TRIAL_REPORT_SUBMITTED', fromStatus: 'TRIAL_IN_PROGRESS', toStatus: 'TRIAL_REPORT_SUBMITTED', performedBy: 'Store User', performedAt: d(1), remarks: 'Trial complete. Report submitted. ACC Cement recommended.' }
              ]
            },
            // 8. COMPLETED
            {
              id: 'AR-030', requestNumber: 'AR-555123', status: 'COMPLETED',
              createdAt: d(30), updatedAt: d(5), createdBy: 'Store User', submittedAt: d(30),
              storeReport: baseReport('M-Sand', 'K.R. Sand Works', 'Slow Moving', 'LOW', 2, 30, 'Tons', 'River Sand'),
              financeReview: {
                relatedVendor: 'K.R. Sand Works', relatedPoIds: [], relatedGrnIds: [],
                commercialAnalysis: 'M-Sand stock has been sitting for 90 days with no production usage. River Sand continues to be preferred.',
                costComparison: 'M-Sand ₹1,200/ton vs River Sand ₹980/ton.', financialImpact: '₹36,000 dead inventory value',
                vendorPerformance: 'Reliable, but product is incompatible with current mix design.',
                recommendation: 'Switch to River Sand. Stop M-Sand purchasing.', reviewedBy: 'Finance Auditor', reviewedAt: d(20)
              },
              adminDecision: {
                decisionType: 'STOP_FUTURE_PURCHASE', decidedBy: 'Super Admin', decidedAt: d(15),
                remarks: 'Approved. No further M-Sand POs. Existing stock to be liquidated or returned.'
              },
              closedAt: d(5), closedBy: 'Super Admin', closureRemarks: 'Vendor notified. PO frozen. Inventory reconciled.',
              history: [
                { action: 'APPROVED_BY_ADMIN', fromStatus: 'PENDING_SUPER_ADMIN_APPROVAL', toStatus: 'APPROVED', performedBy: 'Super Admin', performedAt: d(15), remarks: 'Stop future purchase approved.' },
                { action: 'COMPLETED', fromStatus: 'APPROVED', toStatus: 'COMPLETED', performedBy: 'Super Admin', performedAt: d(5), remarks: 'Policy implemented and request closed.' }
              ]
            },
            // 9. FINANCE_REJECTED
            {
              id: 'AR-040', requestNumber: 'AR-661829', status: 'FINANCE_REJECTED',
              createdAt: d(7), updatedAt: d(4), createdBy: 'Store User', submittedAt: d(7),
              storeReport: baseReport('Fly Ash', 'Ashoka Fly Ash', 'Poor Performance', 'LOW', 1, 5, 'Tons', ''),
              history: [
                { action: 'CREATED_AND_SUBMITTED', fromStatus: 'NONE', toStatus: 'PENDING_FINANCE_REVIEW', performedBy: 'Store User', performedAt: d(7), remarks: 'Submitted.' },
                { action: 'REJECTED_BY_FINANCE', fromStatus: 'PENDING_FINANCE_REVIEW', toStatus: 'FINANCE_REJECTED', performedBy: 'Finance Auditor', performedAt: d(4), remarks: 'Issue reported is within acceptable tolerance per IS 3812. No commercial action warranted.' }
              ]
            },
            // 10. SUPER_ADMIN_REJECTED
            {
              id: 'AR-041', requestNumber: 'AR-771938', status: 'SUPER_ADMIN_REJECTED',
              createdAt: d(12), updatedAt: d(5), createdBy: 'Store User', submittedAt: d(12),
              storeReport: baseReport('Shuttering Oil', 'Rapid Lubes', 'Quality Issue', 'MEDIUM', 2, 40, 'Liters', 'DuraOil'),
              financeReview: {
                relatedVendor: 'Rapid Lubes', relatedPoIds: [], relatedGrnIds: [],
                commercialAnalysis: 'Minor quality variance. Cost impact < ₹5,000. Not significant.',
                costComparison: 'Rapid Lubes ₹85/L vs DuraOil ₹92/L.', financialImpact: 'Negligible',
                vendorPerformance: 'Consistent supplier for 3 years.', recommendation: 'Continue with Rapid Lubes.',
                reviewedBy: 'Finance Auditor', reviewedAt: d(8)
              },
              adminDecision: {
                decisionType: 'CONTINUE_CURRENT_BRAND', decidedBy: 'Super Admin', decidedAt: d(5),
                remarks: 'Issue is within normal manufacturing variance. Continue Rapid Lubes. No brand switch warranted.'
              },
              history: [
                { action: 'SUBMITTED_TO_SUPER_ADMIN', fromStatus: 'FINANCE_UNDER_REVIEW', toStatus: 'PENDING_SUPER_ADMIN_APPROVAL', performedBy: 'Finance Auditor', performedAt: d(8), remarks: 'Submitted for decision.' },
                { action: 'REJECTED_BY_SUPER_ADMIN', fromStatus: 'PENDING_SUPER_ADMIN_APPROVAL', toStatus: 'SUPER_ADMIN_REJECTED', performedBy: 'Super Admin', performedAt: d(5), remarks: 'Issue within tolerance. Continue current brand.' }
              ]
            }
          ];
        } else if (k === 'rawInventory') {
          newState[k] = INITIAL_MATERIALS;
        } else {
          newState[k] = generateGenericEntries(k.toUpperCase());
        }
      });
      setState(newState);
    }
  }, [setState, state]);

  return null;
}
