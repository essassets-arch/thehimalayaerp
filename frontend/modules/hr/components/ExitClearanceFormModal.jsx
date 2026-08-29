'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Send, Download, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToExcel } from '../../../services/export.service';

export default function ExitClearanceFormModal({ isOpen, onClose, onSubmit, employees = [], initialData = null, readOnly = false }) {
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empDetails, setEmpDetails] = useState({
    name: '',
    id: '',
    designation: '',
    department: '',
    dateOfJoining: '',
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkingDay: '',
    noticePeriod: '30',
    noticeServed: '30',
    reportingManager: ''
  });

  const [clearance, setClearance] = useState({
    workHandover: 'Pending', // Completed | Pending
    assetsReturned: 'No', // Yes | No
    financeDues: 'Pending', // Cleared | Pending
    adminClearance: 'Pending', // Cleared | Pending
    managerClearance: 'Pending', // Cleared | Pending
    exitInterview: 'Pending', // Done | Pending
    leaveBalance: '0',
    fullAndFinal: 'Pending' // Completed | Pending
  });

  const [assets, setAssets] = useState({
    laptopPc: false,
    monitor: false,
    keyboardMouse: false,
    mobileCharger: false,
    idCard: false,
    keys: false,
    headsetDisk: false,
    documentsFiles: false,
    other: ''
  });

  const [approval, setApproval] = useState({
    remarks: '',
    empSignature: '',
    empSigDate: new Date().toISOString().split('T')[0],
    mgrSignature: '',
    mgrSigDate: '',
    hrSignature: '',
    hrSigDate: new Date().toISOString().split('T')[0],
    finalHrStatus: 'Pending', // Cleared | Pending
    hrSignOff: '',
    hrSignOffDate: '',
    companyStamp: 'Himalaya Enterprises - HR Seal'
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.empDetails) setEmpDetails(initialData.empDetails);
      if (initialData.clearance) setClearance(initialData.clearance);
      if (initialData.assets) setAssets(initialData.assets);
      if (initialData.approval) setApproval(initialData.approval);
      if (initialData.empId) setSelectedEmpId(initialData.empId);
    } else if (employees.length > 0) {
      const first = employees[0];
      setSelectedEmpId(first.id);
      populateFromEmp(first);
    }
  }, [initialData, employees]);

  const populateFromEmp = (emp) => {
    if (!emp) return;
    setEmpDetails((prev) => ({
      ...prev,
      id: emp.id || prev.id,
      name: emp.name || prev.name,
      designation: emp.designation || emp.role || 'Executive',
      department: emp.department || 'Operations',
      dateOfJoining: emp.joinedAt ? emp.joinedAt.split('T')[0] : '2023-01-15',
      reportingManager: emp.reportingManager || 'Plant Head / HR Manager'
    }));
  };

  const handleEmpSelect = (e) => {
    const id = e.target.value;
    setSelectedEmpId(id);
    const emp = employees.find((x) => x.id === id);
    if (emp) {
      populateFromEmp(emp);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const exportData = [
      { Section: 'Employee Details', Field: 'Employee Name', Value: empDetails.name },
      { Section: 'Employee Details', Field: 'Employee ID', Value: empDetails.id },
      { Section: 'Employee Details', Field: 'Designation', Value: empDetails.designation },
      { Section: 'Employee Details', Field: 'Department', Value: empDetails.department },
      { Section: 'Employee Details', Field: 'Date of Joining', Value: empDetails.dateOfJoining },
      { Section: 'Employee Details', Field: 'Resignation Date', Value: empDetails.resignationDate },
      { Section: 'Employee Details', Field: 'Last Working Day', Value: empDetails.lastWorkingDay },
      { Section: 'Employee Details', Field: 'Notice Period (Days)', Value: empDetails.noticePeriod },
      { Section: 'Employee Details', Field: 'Notice Served (Days)', Value: empDetails.noticeServed },
      { Section: 'Employee Details', Field: 'Reporting Manager', Value: empDetails.reportingManager },
      
      { Section: 'Exit Clearance', Field: 'Work Handover', Value: clearance.workHandover },
      { Section: 'Exit Clearance', Field: 'Assets Returned', Value: clearance.assetsReturned },
      { Section: 'Exit Clearance', Field: 'Finance / Dues', Value: clearance.financeDues },
      { Section: 'Exit Clearance', Field: 'Admin Clearance', Value: clearance.adminClearance },
      { Section: 'Exit Clearance', Field: 'Manager Clearance', Value: clearance.managerClearance },
      { Section: 'Exit Clearance', Field: 'Exit Interview', Value: clearance.exitInterview },
      { Section: 'Exit Clearance', Field: 'Leave Balance (Days)', Value: clearance.leaveBalance },
      { Section: 'Exit Clearance', Field: 'Full & Final Settlement', Value: clearance.fullAndFinal },

      { Section: 'Company Assets', Field: 'Laptop / PC', Value: assets.laptopPc ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Monitor', Value: assets.monitor ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Keyboard / Mouse', Value: assets.keyboardMouse ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Mobile / SIM / Charger', Value: assets.mobileCharger ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'ID / Access Card', Value: assets.idCard ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Keys', Value: assets.keys ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Headset / USB / Hard Disk', Value: assets.headsetDisk ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Documents / Files', Value: assets.documentsFiles ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Other Assets', Value: assets.other || 'N/A' },

      { Section: 'Final Approval', Field: 'Remarks', Value: approval.remarks || 'None' },
      { Section: 'Final Approval', Field: 'Employee Signature', Value: approval.empSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'Manager Signature', Value: approval.mgrSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'HR Signature', Value: approval.hrSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'Final HR Status', Value: approval.finalHrStatus },
      { Section: 'Final Approval', Field: 'HR Sign-Off', Value: approval.hrSignOff || 'Pending' },
      { Section: 'Final Approval', Field: 'Sign-Off Date', Value: approval.hrSignOffDate || approval.hrSigDate },
      { Section: 'Final Approval', Field: 'Company Stamp', Value: approval.companyStamp || 'N/A' },
    ];

    exportToCSV(exportData, `exit-clearance-${empDetails.id || 'employee'}.csv`);
  };

  const handleExportExcel = () => {
    const exportData = [
      { Section: 'Employee Details', Field: 'Employee Name', Value: empDetails.name },
      { Section: 'Employee Details', Field: 'Employee ID', Value: empDetails.id },
      { Section: 'Employee Details', Field: 'Designation', Value: empDetails.designation },
      { Section: 'Employee Details', Field: 'Department', Value: empDetails.department },
      { Section: 'Employee Details', Field: 'Date of Joining', Value: empDetails.dateOfJoining },
      { Section: 'Employee Details', Field: 'Resignation Date', Value: empDetails.resignationDate },
      { Section: 'Employee Details', Field: 'Last Working Day', Value: empDetails.lastWorkingDay },
      { Section: 'Employee Details', Field: 'Notice Period (Days)', Value: empDetails.noticePeriod },
      { Section: 'Employee Details', Field: 'Notice Served (Days)', Value: empDetails.noticeServed },
      { Section: 'Employee Details', Field: 'Reporting Manager', Value: empDetails.reportingManager },
      
      { Section: 'Exit Clearance', Field: 'Work Handover', Value: clearance.workHandover },
      { Section: 'Exit Clearance', Field: 'Assets Returned', Value: clearance.assetsReturned },
      { Section: 'Exit Clearance', Field: 'Finance / Dues', Value: clearance.financeDues },
      { Section: 'Exit Clearance', Field: 'Admin Clearance', Value: clearance.adminClearance },
      { Section: 'Exit Clearance', Field: 'Manager Clearance', Value: clearance.managerClearance },
      { Section: 'Exit Clearance', Field: 'Exit Interview', Value: clearance.exitInterview },
      { Section: 'Exit Clearance', Field: 'Leave Balance (Days)', Value: clearance.leaveBalance },
      { Section: 'Exit Clearance', Field: 'Full & Final Settlement', Value: clearance.fullAndFinal },

      { Section: 'Company Assets', Field: 'Laptop / PC', Value: assets.laptopPc ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Monitor', Value: assets.monitor ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Keyboard / Mouse', Value: assets.keyboardMouse ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Mobile / SIM / Charger', Value: assets.mobileCharger ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'ID / Access Card', Value: assets.idCard ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Keys', Value: assets.keys ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Headset / USB / Hard Disk', Value: assets.headsetDisk ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Documents / Files', Value: assets.documentsFiles ? 'Returned' : 'Not Returned' },
      { Section: 'Company Assets', Field: 'Other Assets', Value: assets.other || 'N/A' },

      { Section: 'Final Approval', Field: 'Remarks', Value: approval.remarks || 'None' },
      { Section: 'Final Approval', Field: 'Employee Signature', Value: approval.empSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'Manager Signature', Value: approval.mgrSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'HR Signature', Value: approval.hrSignature || 'Pending' },
      { Section: 'Final Approval', Field: 'Final HR Status', Value: approval.finalHrStatus },
      { Section: 'Final Approval', Field: 'HR Sign-Off', Value: approval.hrSignOff || 'Pending' },
      { Section: 'Final Approval', Field: 'Sign-Off Date', Value: approval.hrSignOffDate || approval.hrSigDate },
      { Section: 'Final Approval', Field: 'Company Stamp', Value: approval.companyStamp || 'N/A' },
    ];

    exportToExcel(exportData, `exit-clearance-${empDetails.id || 'employee'}.xls`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const record = {
      empId: selectedEmpId || empDetails.id,
      name: empDetails.name,
      department: empDetails.department,
      effectiveDate: empDetails.lastWorkingDay || empDetails.resignationDate,
      empDetails,
      clearance,
      assets,
      approval,
      checkpoints: {
        IT: clearance.adminClearance === 'Cleared',
        Finance: clearance.financeDues === 'Cleared',
        Store: clearance.assetsReturned === 'Yes',
        HR: clearance.managerClearance === 'Cleared' && clearance.workHandover === 'Completed'
      },
      status: approval.finalHrStatus === 'Cleared' ? 'Cleared' : 'In Progress'
    };
    if (onSubmit) onSubmit(record);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active exit-clearance-modal-overlay" style={{ zIndex: 10000, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          .exit-clearance-printable-area,
          .exit-clearance-printable-area * {
            visibility: visible !important;
          }
          .exit-clearance-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .exit-clearance-card-box {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          table.printable-table {
            display: table !important;
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 12px !important;
            table-layout: auto !important;
          }
          table.printable-table thead {
            display: table-header-group !important;
          }
          table.printable-table tbody {
            display: table-row-group !important;
          }
          table.printable-table tr {
            display: table-row !important;
            page-break-inside: avoid !important;
          }
          table.printable-table th,
          table.printable-table td {
            display: table-cell !important;
            border: 1px solid #000000 !important;
            padding: 5px 8px !important;
            vertical-align: middle !important;
            text-align: left !important;
            font-size: 9.5pt !important;
            color: #000000 !important;
            background: transparent !important;
          }
          table.printable-table th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
          }
          .exit-clearance-printable-area input[type="text"],
          .exit-clearance-printable-area input[type="number"],
          .exit-clearance-printable-area input[type="date"],
          .exit-clearance-printable-area select,
          .exit-clearance-printable-area textarea {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #000000 !important;
            font-size: 9.5pt !important;
            font-weight: 600 !important;
            outline: none !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            width: auto !important;
          }
          .print-flex-row {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 12px !important;
          }
          .print-asset-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 6px !important;
            border: 1px solid #000000 !important;
            padding: 8px 12px !important;
            background: #ffffff !important;
          }
        }

        @media screen and (max-width: 768px) {
          .exit-clearance-card-box {
            width: min(900px, calc(100vw - 20px)) !important;
            max-width: calc(100vw - 20px) !important;
            padding: 16px 14px !important;
            box-sizing: border-box !important;
          }
          .exit-modal-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .exit-modal-header-buttons {
            flex-wrap: wrap !important;
            width: 100% !important;
            gap: 6px !important;
          }
          .exit-modal-header-buttons button {
            flex: 1 1 calc(50% - 6px) !important;
            min-height: 38px !important;
            justify-content: center !important;
          }
          .exit-asset-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .exit-clearance-card-box .print-flex-row {
            flex-wrap: wrap !important;
            gap: 6px !important;
            width: 100% !important;
          }
          .exit-clearance-card-box input[type="text"],
          .exit-clearance-card-box input[type="number"],
          .exit-clearance-card-box input[type="date"],
          .exit-clearance-card-box select,
          .exit-clearance-card-box textarea {
            min-width: 0 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
        @media screen and (max-width: 480px) {
          .exit-clearance-card-box {
            width: calc(100vw - 12px) !important;
            max-width: calc(100vw - 12px) !important;
            padding: 14px 10px !important;
          }
          .exit-modal-header-buttons button {
            flex: 1 1 100% !important;
          }
          .exit-asset-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        className="modal-box exit-clearance-card-box exit-clearance-printable-area"
        style={{
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: '#1e293b',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions (No Print) */}
        <div className="no-print exit-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText style={{ color: '#2563eb' }} size={24} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Initiate & Review Exit Process</h3>
                {readOnly && (
                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    🔒 Read-Only Audit View
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Complete official employee resignation & clearance documentation</p>
            </div>
          </div>
          <div className="exit-modal-header-buttons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print / PDF
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export CSV
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Main Title Block */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#475569' }}>
              HIMALAYA ENTERPRISES • HUMAN RESOURCES DEPARTMENT
            </div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
              EMPLOYEE RESIGNATION & EXIT CLEARANCE FORM
            </h1>
          </div>

          {/* Employee Selection Dropdown (No print) */}
          {employees.length > 0 && !initialData && (
            <div className="no-print" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                Select Employee from Roster to Auto-populate:
              </label>
              <select
                value={selectedEmpId}
                onChange={handleEmpSelect}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: '#ffffff'
                }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) — {emp.department} ({emp.designation || emp.role || 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SECTION 1: EMPLOYEE DETAILS */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Employee Details
            </h3>
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '35%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Field</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: '#334155' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Employee Name / ID</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        required
                        value={empDetails.name}
                        onChange={(e) => setEmpDetails({ ...empDetails, name: e.target.value })}
                        placeholder="Employee Full Name"
                        style={{ flex: '1 1 auto', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span style={{ fontWeight: 'bold' }}>/</span>
                      <input
                        type="text"
                        required
                        value={empDetails.id}
                        onChange={(e) => setEmpDetails({ ...empDetails, id: e.target.value })}
                        placeholder="EMP ID"
                        style={{ width: '110px', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}
                      />
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Designation / Department</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={empDetails.designation}
                        onChange={(e) => setEmpDetails({ ...empDetails, designation: e.target.value })}
                        placeholder="Designation"
                        style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span style={{ fontWeight: 'bold' }}>/</span>
                      <input
                        type="text"
                        value={empDetails.department}
                        onChange={(e) => setEmpDetails({ ...empDetails, department: e.target.value })}
                        placeholder="Department"
                        style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Date of Joining</td>
                  <td style={{ padding: '4px 10px' }}>
                    <input
                      type="date"
                      value={empDetails.dateOfJoining}
                      onChange={(e) => setEmpDetails({ ...empDetails, dateOfJoining: e.target.value })}
                      style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Resignation Date</td>
                  <td style={{ padding: '4px 10px' }}>
                    <input
                      type="date"
                      required
                      value={empDetails.resignationDate}
                      onChange={(e) => setEmpDetails({ ...empDetails, resignationDate: e.target.value })}
                      style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Last Working Day</td>
                  <td style={{ padding: '4px 10px' }}>
                    <input
                      type="date"
                      required
                      value={empDetails.lastWorkingDay}
                      onChange={(e) => setEmpDetails({ ...empDetails, lastWorkingDay: e.target.value })}
                      style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Notice Period / Served</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="number"
                        value={empDetails.noticePeriod}
                        onChange={(e) => setEmpDetails({ ...empDetails, noticePeriod: e.target.value })}
                        placeholder="30"
                        style={{ width: '60px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span>Days /</span>
                      <input
                        type="number"
                        value={empDetails.noticeServed}
                        onChange={(e) => setEmpDetails({ ...empDetails, noticeServed: e.target.value })}
                        placeholder="30"
                        style={{ width: '60px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span>Days</span>
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Reporting Manager</td>
                  <td style={{ padding: '4px 10px' }}>
                    <input
                      type="text"
                      value={empDetails.reportingManager}
                      onChange={(e) => setEmpDetails({ ...empDetails, reportingManager: e.target.value })}
                      placeholder="Manager Name / Title"
                      style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: EXIT CLEARANCE */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Exit Clearance
            </h3>
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '45%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Particular</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: '700', color: '#334155' }}>Status / Details</th>
                </tr>
              </thead>
              <tbody>
                {/* Work Handover */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Work Handover</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="workHandover" checked={clearance.workHandover === 'Completed'} onChange={() => setClearance({ ...clearance, workHandover: 'Completed' })} />
                        <span>Completed</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="workHandover" checked={clearance.workHandover === 'Pending'} onChange={() => setClearance({ ...clearance, workHandover: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Assets Returned */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Assets Returned</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="assetsReturned" checked={clearance.assetsReturned === 'Yes'} onChange={() => setClearance({ ...clearance, assetsReturned: 'Yes' })} />
                        <span>Yes</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="assetsReturned" checked={clearance.assetsReturned === 'No'} onChange={() => setClearance({ ...clearance, assetsReturned: 'No' })} />
                        <span>No</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Finance / Dues */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Finance / Dues</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="financeDues" checked={clearance.financeDues === 'Cleared'} onChange={() => setClearance({ ...clearance, financeDues: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="financeDues" checked={clearance.financeDues === 'Pending'} onChange={() => setClearance({ ...clearance, financeDues: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Admin Clearance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Admin Clearance</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="adminClearance" checked={clearance.adminClearance === 'Cleared'} onChange={() => setClearance({ ...clearance, adminClearance: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="adminClearance" checked={clearance.adminClearance === 'Pending'} onChange={() => setClearance({ ...clearance, adminClearance: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Manager Clearance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Manager Clearance</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="managerClearance" checked={clearance.managerClearance === 'Cleared'} onChange={() => setClearance({ ...clearance, managerClearance: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="managerClearance" checked={clearance.managerClearance === 'Pending'} onChange={() => setClearance({ ...clearance, managerClearance: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Exit Interview */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Exit Interview</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="exitInterview" checked={clearance.exitInterview === 'Done'} onChange={() => setClearance({ ...clearance, exitInterview: 'Done' })} />
                        <span>Done</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="exitInterview" checked={clearance.exitInterview === 'Pending'} onChange={() => setClearance({ ...clearance, exitInterview: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Leave Balance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Leave Balance</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={clearance.leaveBalance}
                        onChange={(e) => setClearance({ ...clearance, leaveBalance: e.target.value })}
                        style={{ width: '70px', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                      />
                      <span>Days</span>
                    </div>
                  </td>
                </tr>

                {/* Full & Final Settlement */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 10px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Full & Final Settlement</td>
                  <td style={{ padding: '4px 10px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="fullAndFinal" checked={clearance.fullAndFinal === 'Completed'} onChange={() => setClearance({ ...clearance, fullAndFinal: 'Completed' })} />
                        <span>Completed</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <input type="radio" name="fullAndFinal" checked={clearance.fullAndFinal === 'Pending'} onChange={() => setClearance({ ...clearance, fullAndFinal: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 3: COMPANY ASSETS */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Company Assets
            </h3>
            <div className="print-asset-grid" style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', background: '#fafafa' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '10px', fontSize: '13px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.laptopPc} onChange={(e) => setAssets({ ...assets, laptopPc: e.target.checked })} />
                  <span>Laptop / PC</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.monitor} onChange={(e) => setAssets({ ...assets, monitor: e.target.checked })} />
                  <span>Monitor</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.keyboardMouse} onChange={(e) => setAssets({ ...assets, keyboardMouse: e.target.checked })} />
                  <span>Keyboard / Mouse</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.mobileCharger} onChange={(e) => setAssets({ ...assets, mobileCharger: e.target.checked })} />
                  <span>Mobile / SIM / Charger</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.idCard} onChange={(e) => setAssets({ ...assets, idCard: e.target.checked })} />
                  <span>ID / Access Card</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.keys} onChange={(e) => setAssets({ ...assets, keys: e.target.checked })} />
                  <span>Keys</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.headsetDisk} onChange={(e) => setAssets({ ...assets, headsetDisk: e.target.checked })} />
                  <span>Headset / USB / Hard Disk</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={assets.documentsFiles} onChange={(e) => setAssets({ ...assets, documentsFiles: e.target.checked })} />
                  <span>Documents / Files</span>
                </label>
              </div>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: '600' }}>Other:</span>
                <input
                  type="text"
                  value={assets.other}
                  onChange={(e) => setAssets({ ...assets, other: e.target.value })}
                  placeholder="Additional equipment or inventory notes..."
                  style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINAL APPROVAL */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Final Approval
            </h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Remarks:
              </label>
              <textarea
                rows={2}
                value={approval.remarks}
                onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
                placeholder="Enter exit clearance handover remarks, pending dues notes, or HR observations..."
                style={{ width: '100%', padding: '6px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>

            {/* Signatures Table */}
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Employee</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Manager</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155' }}>HR</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.empSignature}
                        onChange={(e) => setApproval({ ...approval, empSignature: e.target.value })}
                        placeholder="Employee Signature / Name"
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontStyle: 'italic' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.empSigDate}
                        onChange={(e) => setApproval({ ...approval, empSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.mgrSignature}
                        onChange={(e) => setApproval({ ...approval, mgrSignature: e.target.value })}
                        placeholder="Manager Signature / Name"
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontStyle: 'italic' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.mgrSigDate}
                        onChange={(e) => setApproval({ ...approval, mgrSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.hrSignature}
                        onChange={(e) => setApproval({ ...approval, hrSignature: e.target.value })}
                        placeholder="HR Signature / Name"
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', fontStyle: 'italic' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.hrSigDate}
                        onChange={(e) => setApproval({ ...approval, hrSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* HR Status & Sign Off block */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
                <strong style={{ color: '#0f172a' }}>Final HR Status:</strong>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="finalHrStatus"
                    checked={approval.finalHrStatus === 'Cleared'}
                    onChange={() => setApproval({ ...approval, finalHrStatus: 'Cleared' })}
                  />
                  <span style={{ fontWeight: '700', color: '#16a34a' }}>Cleared</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="finalHrStatus"
                    checked={approval.finalHrStatus === 'Pending'}
                    onChange={() => setApproval({ ...approval, finalHrStatus: 'Pending' })}
                  />
                  <span style={{ fontWeight: '700', color: '#eab308' }}>Pending</span>
                </label>
              </div>

              <div className="print-flex-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: '600', display: 'block', marginBottom: '2px' }}>HR Sign-Off:</span>
                  <input
                    type="text"
                    value={approval.hrSignOff}
                    onChange={(e) => setApproval({ ...approval, hrSignOff: e.target.value })}
                    placeholder="Authorized HR Representative Name"
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <span style={{ fontWeight: '600', display: 'block', marginBottom: '2px' }}>Date:</span>
                  <input
                    type="date"
                    value={approval.hrSignOffDate || approval.hrSigDate}
                    onChange={(e) => setApproval({ ...approval, hrSignOffDate: e.target.value })}
                    style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="print-flex-row" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '600' }}>Company Stamp:</span>
                <input
                  type="text"
                  value={approval.companyStamp}
                  onChange={(e) => setApproval({ ...approval, companyStamp: e.target.value })}
                  placeholder="Company Seal / Digital Stamp Text"
                  style={{ flex: 1, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Form Action Footer (No Print) */}
          {readOnly ? (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ℹ️ Super Admin Read-Only Mode — Form data verified and locked for editing</span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 20px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close Audit Window
              </button>
            </div>
          ) : (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} /> Save & Initiate Exit Process
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
