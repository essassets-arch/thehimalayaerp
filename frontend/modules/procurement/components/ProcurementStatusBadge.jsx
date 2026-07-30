import React from 'react';
import { ShieldCheck, UserCircle2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export function ProcurementStatusBadge({ status, type = 'PO' }) {
  const getStyleConfig = () => {
    switch (status) {
      // General
      case 'DRAFT': return { bg: '#f3f4f6', text: '#1f2937', icon: Clock, label: 'Draft' };
      case 'CANCELLED':
      case 'PO_CANCELLED': return { bg: '#f3f4f6', text: '#4b5563', icon: XCircle, label: 'Cancelled' };

      // Indent
      case 'PENDING_PLANT_HEAD_APPROVAL': return { bg: '#fef3c7', text: '#92400e', icon: Clock, label: 'Pending PH Approval' };
      case 'PLANT_HEAD_CORRECTION_REQUIRED': return { bg: '#ffe4e6', text: '#9f1239', icon: AlertCircle, label: 'Needs Correction' };
      case 'PLANT_HEAD_APPROVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'PH Approved' };
      case 'FINANCE_ACCEPTED': return { bg: '#dbeafe', text: '#1e40af', icon: ShieldCheck, label: 'Finance Accepted' };
      case 'CONVERTED_TO_PO': return { bg: '#f3e8ff', text: '#6b21a8', icon: ShieldCheck, label: 'PO Created' };
      case 'PLANT_HEAD_REJECTED': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: 'Rejected' };

      // PO
      case 'PENDING_SUPER_ADMIN_APPROVAL': return { bg: '#fef3c7', text: '#92400e', icon: Clock, label: 'Pending SA Approval' };
      case 'SUPER_ADMIN_APPROVED': return { bg: '#d1fae5', text: '#065f46', icon: ShieldCheck, label: 'SA Approved' };
      case 'SUPER_ADMIN_REJECTED': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: 'SA Rejected' };
      case 'PO_ISSUED': return { bg: '#dbeafe', text: '#1e40af', icon: UserCircle2, label: 'Issued to Vendor' };
      case 'DELIVERY_PENDING': return { bg: '#e0e7ff', text: '#3730a3', icon: Clock, label: 'Delivery Pending' };
      case 'PARTIALLY_RECEIVED': return { bg: '#cffafe', text: '#155e75', icon: Clock, label: 'Partially Received' };
      case 'FULLY_RECEIVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Fully Received' };
      case 'PO_CLOSED': return { bg: '#f3f4f6', text: '#1f2937', icon: CheckCircle2, label: 'Closed' };

      // GRN
      case 'SUBMITTED_FOR_FINANCE_AUDIT': return { bg: '#dbeafe', text: '#1e40af', icon: ShieldCheck, label: 'Pending Audit' };
      case 'FINANCE_CORRECTION_REQUIRED': return { bg: '#ffe4e6', text: '#9f1239', icon: AlertCircle, label: 'Needs Correction' };
      case 'FINANCE_APPROVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Finance Approved' };
      case 'FINANCE_REJECTED': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle, label: 'Rejected' };

      // Rejection
      case 'MATERIAL_REJECTION_SUBMITTED': return { bg: '#ffe4e6', text: '#9f1239', icon: AlertCircle, label: 'Rejection Submitted' };
      case 'FINANCE_VENDOR_DISCUSSION': return { bg: '#fef3c7', text: '#92400e', icon: Clock, label: 'Vendor Discussion' };
      case 'REPLACEMENT_APPROVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Replacement Approved' };
      case 'NO_REPLACEMENT': return { bg: '#f3f4f6', text: '#1f2937', icon: XCircle, label: 'No Replacement' };
      case 'RESOLVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Resolved' };
      case 'CLOSED': return { bg: '#f3f4f6', text: '#1f2937', icon: CheckCircle2, label: 'Closed' };
      
      // Connected Procurement Canonical Statuses
      case 'CORRECTION_REQUIRED': return { bg: '#ffe4e6', text: '#9f1239', icon: AlertCircle, label: 'Needs Correction' };
      case 'DRAFT_PO_CREATED': return { bg: '#f3e8ff', text: '#6b21a8', icon: ShieldCheck, label: 'PO Drafted' };
      case 'PROCUREMENT_IN_PROGRESS': return { bg: '#e0e7ff', text: '#3730a3', icon: Clock, label: 'In Progress' };
      case 'PROCUREMENT_COMPLETED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Completed' };
      case 'DELIVERY_VERIFIED': return { bg: '#ccfbf1', text: '#115e59', icon: CheckCircle2, label: 'Delivery Verified' };
      case 'PENDING_FINANCE_AUDIT': return { bg: '#dbeafe', text: '#1e40af', icon: Clock, label: 'Pending Audit' };
      case 'FINANCE_AUDIT_APPROVED': return { bg: '#d1fae5', text: '#065f46', icon: CheckCircle2, label: 'Audit Approved' };
      case 'RETURNED_TO_STORE': return { bg: '#ffe4e6', text: '#9f1239', icon: AlertCircle, label: 'Returned to Store' };
      case 'VENDOR_DISPUTE': return { bg: '#fee2e2', text: '#991b1b', icon: AlertCircle, label: 'Vendor Dispute' };

      default:
        return { bg: '#f3f4f6', text: '#1f2937', icon: AlertCircle, label: status || 'Unknown' };
    }
  };

  const { bg, text, icon: Icon, label } = getStyleConfig();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: 600,
      background: bg,
      color: text,
      whiteSpace: 'nowrap'
    }}>
      <Icon size={14} />
      {label}
    </span>
  );
}
