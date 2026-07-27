import React from 'react';
import { ShieldCheck, UserCircle2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export function ProcurementStatusBadge({ status, type = 'PO' }) {
  const getStatusConfig = () => {
    switch (status) {
      // General
      case 'DRAFT': return { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock, label: 'Draft' };
      case 'CANCELLED':
      case 'PO_CANCELLED': return { bg: 'bg-gray-100', text: 'text-gray-600', icon: XCircle, label: 'Cancelled' };

      // Indent
      case 'PENDING_PLANT_HEAD_APPROVAL': return { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Pending PH Approval' };
      case 'PLANT_HEAD_CORRECTION_REQUIRED': return { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle, label: 'Needs Correction' };
      case 'PLANT_HEAD_APPROVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'PH Approved' };
      case 'FINANCE_ACCEPTED': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: ShieldCheck, label: 'Finance Accepted' };
      case 'CONVERTED_TO_PO': return { bg: 'bg-purple-100', text: 'text-purple-800', icon: ShieldCheck, label: 'PO Created' };
      case 'PLANT_HEAD_REJECTED': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' };

      // PO
      case 'PENDING_SUPER_ADMIN_APPROVAL': return { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Pending SA Approval' };
      case 'SUPER_ADMIN_APPROVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: ShieldCheck, label: 'SA Approved' };
      case 'SUPER_ADMIN_REJECTED': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'SA Rejected' };
      case 'PO_ISSUED': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: UserCircle2, label: 'Issued to Vendor' };
      case 'DELIVERY_PENDING': return { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Clock, label: 'Delivery Pending' };
      case 'PARTIALLY_RECEIVED': return { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: Clock, label: 'Partially Received' };
      case 'FULLY_RECEIVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Fully Received' };
      case 'PO_CLOSED': return { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle2, label: 'Closed' };

      // GRN
      case 'SUBMITTED_FOR_FINANCE_AUDIT': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: ShieldCheck, label: 'Pending Audit' };
      case 'FINANCE_CORRECTION_REQUIRED': return { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle, label: 'Needs Correction' };
      case 'FINANCE_APPROVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Finance Approved' };
      case 'FINANCE_REJECTED': return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' };

      // Rejection
      case 'MATERIAL_REJECTION_SUBMITTED': return { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle, label: 'Rejection Submitted' };
      case 'FINANCE_VENDOR_DISCUSSION': return { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock, label: 'Vendor Discussion' };
      case 'REPLACEMENT_APPROVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Replacement Approved' };
      case 'NO_REPLACEMENT': return { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'No Replacement' };
      case 'RESOLVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Resolved' };
      case 'CLOSED': return { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle2, label: 'Closed' };
      
      // Connected Procurement Canonical Statuses
      case 'CORRECTION_REQUIRED': return { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle, label: 'Needs Correction' };
      case 'DRAFT_PO_CREATED': return { bg: 'bg-purple-100', text: 'text-purple-800', icon: ShieldCheck, label: 'PO Drafted' };
      case 'PROCUREMENT_IN_PROGRESS': return { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Clock, label: 'In Progress' };
      case 'PROCUREMENT_COMPLETED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Completed' };
      case 'DELIVERY_VERIFIED': return { bg: 'bg-teal-100', text: 'text-teal-800', icon: CheckCircle2, label: 'Delivery Verified' };
      case 'PENDING_FINANCE_AUDIT': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Pending Audit' };
      case 'FINANCE_AUDIT_APPROVED': return { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2, label: 'Audit Approved' };
      case 'RETURNED_TO_STORE': return { bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle, label: 'Returned to Store' };
      case 'VENDOR_DISPUTE': return { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Vendor Dispute' };

      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: status || 'Unknown' };
    }
  };

  const { bg, text, icon: Icon, label } = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}
