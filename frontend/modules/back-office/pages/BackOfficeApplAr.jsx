'use client';

import React from 'react';
import BackOfficeArSheetView from '../components/BackOfficeArSheetView';
import {
  fetchApplArRegister,
  createApplArInvoice,
  updateApplArInvoice,
  deleteApplArInvoice
} from '../services/backOfficeArService';

export default function BackOfficeApplAr() {
  return (
    <BackOfficeArSheetView
      entity="APPL"
      sheetTitle="APPL Sheet"
      subtitle="APPL Accounts Receivable 21-Column Register"
      invoicePrefix="APPL/2627/"
      fetchRegister={fetchApplArRegister}
      createInvoice={createApplArInvoice}
      updateInvoice={updateApplArInvoice}
      deleteInvoice={deleteApplArInvoice}
      brandColor="#0284c7"
      brandBg="#e0f2fe"
    />
  );
}
