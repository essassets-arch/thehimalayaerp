'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Send, Download, FileSpreadsheet, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
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
    hrSignOffDate: new Date().toISOString().split('T')[0],
    companyStamp: 'Himalaya Enterprises - HR Seal'
  });

  const calculateLastWorkingDay = (resigDateStr, noticeDaysStr) => {
    try {
      if (!resigDateStr) return '';
      const baseDate = new Date(resigDateStr);
      if (isNaN(baseDate.getTime())) return '';
      const days = parseInt(noticeDaysStr, 10) || 30;
      const targetDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
      return targetDate.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const populateFromEmp = (emp) => {
    if (!emp) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultJoining = emp.joiningDate ? emp.joiningDate.split('T')[0] : (emp.dateOfJoining || (emp.joinedAt ? emp.joinedAt.split('T')[0] : '2023-01-15'));
    const empCode = emp.employeeCode || emp.id || 'EMP-1';
    const empName = emp.name || emp.fullName || 'Staff Member';
    const dept = typeof emp.department === 'object' ? (emp.department?.name || 'Sales Department') : (emp.department || 'Sales Department');
    const desig = emp.designation || emp.jobTitle || emp.role || 'Sales Executive';
    const mgr = emp.reportingManager?.fullName || emp.reportingManagerName || (typeof emp.reportingManager === 'string' ? emp.reportingManager : 'Plant Head / HR Manager');
    const notice = emp.noticePeriod || '30';

    setEmpDetails((prev) => {
      const resigDate = prev.resignationDate || todayStr;
      return {
        ...prev,
        id: empCode,
        name: empName,
        designation: desig,
        department: dept,
        dateOfJoining: defaultJoining,
        resignationDate: resigDate,
        lastWorkingDay: prev.lastWorkingDay || calculateLastWorkingDay(resigDate, notice),
        noticePeriod: notice,
        noticeServed: prev.noticeServed || notice,
        reportingManager: mgr
      };
    });

    setApproval((prev) => ({
      ...prev,
      empSignature: prev.empSignature || empName
    }));
  };

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      if (initialData.empDetails) setEmpDetails(initialData.empDetails);
      if (initialData.clearance) setClearance(initialData.clearance);
      if (initialData.assets) setAssets(initialData.assets);
      if (initialData.approval) setApproval(initialData.approval);
      if (initialData.empId) setSelectedEmpId(initialData.empId);
    } else {
      const targetEmp = (employees && employees.length > 0)
        ? (employees.find(e => e.id === selectedEmpId || e.employeeCode === selectedEmpId) || employees[0])
        : null;

      const todayStr = new Date().toISOString().split('T')[0];

      if (targetEmp) {
        setSelectedEmpId(targetEmp.id || targetEmp.employeeCode);
        populateFromEmp(targetEmp);
      } else {
        setEmpDetails({
          name: 'Sales Eleven',
          id: 'EMP-1',
          designation: 'Sales Executive',
          department: 'Sales Department',
          dateOfJoining: '2023-01-15',
          resignationDate: todayStr,
          lastWorkingDay: calculateLastWorkingDay(todayStr, '30'),
          noticePeriod: '30',
          noticeServed: '30',
          reportingManager: 'Plant Head / HR Manager'
        });
      }

      setClearance({
        workHandover: 'Pending',
        assetsReturned: 'No',
        financeDues: 'Pending',
        adminClearance: 'Pending',
        managerClearance: 'Pending',
        exitInterview: 'Pending',
        leaveBalance: '0',
        fullAndFinal: 'Pending'
      });

      setAssets({
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

      setApproval({
        remarks: '',
        empSignature: targetEmp?.name || 'Sales Eleven',
        empSigDate: todayStr,
        mgrSignature: '',
        mgrSigDate: '',
        hrSignature: 'HR Manager',
        hrSigDate: todayStr,
        finalHrStatus: 'Pending',
        hrSignOff: 'HR Department Lead',
        hrSignOffDate: todayStr,
        companyStamp: 'Himalaya Enterprises - HR Seal'
      });
    }
  }, [isOpen, initialData]);

  const handleEmpSelect = (e) => {
    const id = e.target.value;
    setSelectedEmpId(id);
    const emp = employees.find((x) => x.id === id || x.employeeCode === id);
    if (emp) {
      populateFromEmp(emp);
    }
  };

  const handleResignationDateChange = (date) => {
    setEmpDetails((prev) => {
      const computedLast = calculateLastWorkingDay(date, prev.noticePeriod);
      return {
        ...prev,
        resignationDate: date,
        lastWorkingDay: computedLast || prev.lastWorkingDay
      };
    });
  };

  const handleNoticePeriodChange = (noticeDays) => {
    setEmpDetails((prev) => {
      const computedLast = calculateLastWorkingDay(prev.resignationDate, noticeDays);
      return {
        ...prev,
        noticePeriod: noticeDays,
        lastWorkingDay: computedLast || prev.lastWorkingDay
      };
    });
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
    if (!empDetails.name || !empDetails.id) {
      alert('Please ensure employee name and ID are specified.');
      return;
    }

    const calculatedLastDay = empDetails.lastWorkingDay || calculateLastWorkingDay(empDetails.resignationDate, empDetails.noticePeriod) || empDetails.resignationDate;

    const itCleared = clearance.adminClearance === 'Cleared';
    const finCleared = clearance.financeDues === 'Cleared';
    const storeCleared = clearance.assetsReturned === 'Yes';
    const hrCleared = clearance.managerClearance === 'Cleared' && clearance.workHandover === 'Completed';

    const isFullyCleared = approval.finalHrStatus === 'Cleared' || (itCleared && finCleared && storeCleared && hrCleared);

    const record = {
      empId: selectedEmpId || empDetails.id,
      name: empDetails.name,
      department: empDetails.department,
      effectiveDate: calculatedLastDay,
      empDetails: {
        ...empDetails,
        lastWorkingDay: calculatedLastDay
      },
      clearance,
      assets,
      approval: {
        ...approval,
        finalHrStatus: isFullyCleared ? 'Cleared' : approval.finalHrStatus
      },
      checkpoints: {
        IT: itCleared,
        Finance: finCleared,
        Store: storeCleared,
        HR: hrCleared
      },
      status: isFullyCleared ? 'Cleared' : 'In Progress'
    };
    if (onSubmit) onSubmit(record);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active exit-clearance-modal-overlay" style={{ zIndex: 10000, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, padding: '20px' }}>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 9.5pt !important;
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
            margin-bottom: 10px !important;
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
            border: 1px solid #1e293b !important;
            padding: 4px 8px !important;
            vertical-align: middle !important;
            text-align: left !important;
            font-size: 9pt !important;
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
            font-size: 9pt !important;
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
            gap: 10px !important;
          }
          .print-asset-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 4px !important;
            border: 1px solid #1e293b !important;
            padding: 6px 10px !important;
            background: #ffffff !important;
          }
        }

        @media screen and (max-width: 768px) {
          .exit-clearance-card-box {
            width: 100% !important;
            max-width: 100% !important;
            padding: 18px 14px !important;
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
        }
      `}</style>

      <div
        className="modal-box exit-clearance-card-box exit-clearance-printable-area"
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          color: '#0f172a',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Actions (No Print) */}
        <div className="no-print exit-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>Initiate & Review Exit Process</h3>
                {readOnly && (
                  <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                    🔒 Read-Only Audit View
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>Complete official employee resignation & clearance documentation</p>
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
                padding: '8px 14px',
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                transition: 'all 0.15s ease'
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
                padding: '8px 14px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.15s ease'
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
                padding: '8px 14px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <FileSpreadsheet size={15} /> Export Excel
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#475569',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Title Block */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#475569' }}>
              HIMALAYA ENTERPRISES • HUMAN RESOURCES DEPARTMENT
            </div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.4px' }}>
              EMPLOYEE RESIGNATION & EXIT CLEARANCE FORM
            </h1>
          </div>

          {/* Employee Selection Dropdown (No print) */}
          {employees.length > 0 && !initialData && (
            <div className="no-print" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '12px 16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldCheck size={15} color="#0284c7" /> Select Employee from Roster to Auto-populate:
              </label>
              <select
                value={selectedEmpId}
                onChange={handleEmpSelect}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #94a3b8',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#0f172a',
                  background: '#ffffff',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {employees.map((emp) => (
                  <option key={emp.id || emp.employeeCode} value={emp.id || emp.employeeCode}>
                    {emp.name || emp.fullName} ({emp.employeeCode || emp.id}) — {typeof emp.department === 'object' ? emp.department?.name : emp.department} ({emp.designation || emp.jobTitle || emp.role || 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SECTION 1: EMPLOYEE DETAILS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Employee Details
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Official Service Profile</span>
            </div>
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '7px 12px', textAlign: 'left', width: '32%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Field</th>
                  <th style={{ padding: '7px 12px', textAlign: 'left', fontWeight: '700', color: '#334155' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Employee Name / ID</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        required
                        value={empDetails.name}
                        onChange={(e) => setEmpDetails({ ...empDetails, name: e.target.value })}
                        placeholder="Employee Full Name"
                        style={{ flex: '1 1 auto', padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}
                      />
                      <span style={{ fontWeight: 'bold', color: '#64748b' }}>/</span>
                      <input
                        type="text"
                        required
                        value={empDetails.id}
                        onChange={(e) => setEmpDetails({ ...empDetails, id: e.target.value })}
                        placeholder="EMP-1"
                        style={{ width: '120px', padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', color: '#0284c7' }}
                      />
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Designation / Department</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={empDetails.designation}
                        onChange={(e) => setEmpDetails({ ...empDetails, designation: e.target.value })}
                        placeholder="Designation"
                        style={{ flex: 1, padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                      <span style={{ fontWeight: 'bold', color: '#64748b' }}>/</span>
                      <input
                        type="text"
                        value={empDetails.department}
                        onChange={(e) => setEmpDetails({ ...empDetails, department: e.target.value })}
                        placeholder="Department"
                        style={{ flex: 1, padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                      />
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Date of Joining</td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="date"
                      value={empDetails.dateOfJoining}
                      onChange={(e) => setEmpDetails({ ...empDetails, dateOfJoining: e.target.value })}
                      style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Resignation Date</td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="date"
                      required
                      value={empDetails.resignationDate}
                      onChange={(e) => handleResignationDateChange(e.target.value)}
                      style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Last Working Day</td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="date"
                      required
                      value={empDetails.lastWorkingDay}
                      onChange={(e) => setEmpDetails({ ...empDetails, lastWorkingDay: e.target.value })}
                      style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#0284c7' }}
                    />
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Notice Period / Served</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={empDetails.noticePeriod}
                        onChange={(e) => handleNoticePeriodChange(e.target.value)}
                        placeholder="30"
                        style={{ width: '65px', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}
                      />
                      <span style={{ fontWeight: '600', color: '#475569' }}>Days /</span>
                      <input
                        type="number"
                        value={empDetails.noticeServed}
                        onChange={(e) => setEmpDetails({ ...empDetails, noticeServed: e.target.value })}
                        placeholder="30"
                        style={{ width: '65px', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: '700' }}
                      />
                      <span style={{ fontWeight: '600', color: '#475569' }}>Days</span>
                    </div>
                  </td>
                </tr>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Reporting Manager</td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="text"
                      value={empDetails.reportingManager}
                      onChange={(e) => setEmpDetails({ ...empDetails, reportingManager: e.target.value })}
                      placeholder="Plant Head / HR Manager"
                      style={{ width: '100%', padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: EXIT CLEARANCE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Exit Clearance
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Mandatory Department Checkpoints</span>
            </div>
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '7px 12px', textAlign: 'left', width: '40%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Particular</th>
                  <th style={{ padding: '7px 12px', textAlign: 'left', fontWeight: '700', color: '#334155' }}>Status / Details</th>
                </tr>
              </thead>
              <tbody>
                {/* Work Handover */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Work Handover</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.workHandover === 'Completed' ? '700' : '500', color: clearance.workHandover === 'Completed' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="workHandover" checked={clearance.workHandover === 'Completed'} onChange={() => setClearance({ ...clearance, workHandover: 'Completed' })} />
                        <span>Completed</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.workHandover === 'Pending' ? '700' : '500', color: clearance.workHandover === 'Pending' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="workHandover" checked={clearance.workHandover === 'Pending'} onChange={() => setClearance({ ...clearance, workHandover: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Assets Returned */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Assets Returned</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.assetsReturned === 'Yes' ? '700' : '500', color: clearance.assetsReturned === 'Yes' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="assetsReturned" checked={clearance.assetsReturned === 'Yes'} onChange={() => setClearance({ ...clearance, assetsReturned: 'Yes' })} />
                        <span>Yes</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.assetsReturned === 'No' ? '700' : '500', color: clearance.assetsReturned === 'No' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="assetsReturned" checked={clearance.assetsReturned === 'No'} onChange={() => setClearance({ ...clearance, assetsReturned: 'No' })} />
                        <span>No</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Finance / Dues */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Finance / Dues</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.financeDues === 'Cleared' ? '700' : '500', color: clearance.financeDues === 'Cleared' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="financeDues" checked={clearance.financeDues === 'Cleared'} onChange={() => setClearance({ ...clearance, financeDues: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.financeDues === 'Pending' ? '700' : '500', color: clearance.financeDues === 'Pending' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="financeDues" checked={clearance.financeDues === 'Pending'} onChange={() => setClearance({ ...clearance, financeDues: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Admin Clearance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Admin Clearance</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.adminClearance === 'Cleared' ? '700' : '500', color: clearance.adminClearance === 'Cleared' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="adminClearance" checked={clearance.adminClearance === 'Cleared'} onChange={() => setClearance({ ...clearance, adminClearance: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.adminClearance === 'Pending' ? '700' : '500', color: clearance.adminClearance === 'Pending' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="adminClearance" checked={clearance.adminClearance === 'Pending'} onChange={() => setClearance({ ...clearance, adminClearance: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Manager Clearance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Manager Clearance</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.managerClearance === 'Cleared' ? '700' : '500', color: clearance.managerClearance === 'Cleared' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="managerClearance" checked={clearance.managerClearance === 'Cleared'} onChange={() => setClearance({ ...clearance, managerClearance: 'Cleared' })} />
                        <span>Cleared</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.managerClearance === 'Pending' ? '700' : '500', color: clearance.managerClearance === 'Pending' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="managerClearance" checked={clearance.managerClearance === 'Pending'} onChange={() => setClearance({ ...clearance, managerClearance: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Exit Interview */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Exit Interview</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.exitInterview === 'Done' ? '700' : '500', color: clearance.exitInterview === 'Done' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="exitInterview" checked={clearance.exitInterview === 'Done'} onChange={() => setClearance({ ...clearance, exitInterview: 'Done' })} />
                        <span>Done</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.exitInterview === 'Pending' ? '700' : '500', color: clearance.exitInterview === 'Pending' ? '#eab308' : '#475569' }}>
                        <input type="radio" name="exitInterview" checked={clearance.exitInterview === 'Pending'} onChange={() => setClearance({ ...clearance, exitInterview: 'Pending' })} />
                        <span>Pending</span>
                      </label>
                    </div>
                  </td>
                </tr>

                {/* Leave Balance */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Leave Balance</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={clearance.leaveBalance}
                        onChange={(e) => setClearance({ ...clearance, leaveBalance: e.target.value })}
                        style={{ width: '75px', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '700', textAlign: 'center' }}
                      />
                      <span style={{ fontWeight: '600', color: '#475569' }}>Days</span>
                    </div>
                  </td>
                </tr>

                {/* Full & Final Settlement */}
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 12px', fontWeight: '600', background: '#fafafa', borderRight: '1px solid #cbd5e1' }}>Full & Final Settlement</td>
                  <td style={{ padding: '6px 12px' }}>
                    <div className="print-flex-row" style={{ display: 'flex', gap: '24px' }}>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.fullAndFinal === 'Completed' ? '700' : '500', color: clearance.fullAndFinal === 'Completed' ? '#16a34a' : '#475569' }}>
                        <input type="radio" name="fullAndFinal" checked={clearance.fullAndFinal === 'Completed'} onChange={() => setClearance({ ...clearance, fullAndFinal: 'Completed' })} />
                        <span>Completed</span>
                      </label>
                      <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: clearance.fullAndFinal === 'Pending' ? '700' : '500', color: clearance.fullAndFinal === 'Pending' ? '#eab308' : '#475569' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Company Assets
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Equipment & Inventory Handover</span>
            </div>
            <div className="print-asset-grid" style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px', background: '#f8fafc' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 155px), 1fr))', gap: '12px', fontSize: '13px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.laptopPc ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.laptopPc} onChange={(e) => setAssets({ ...assets, laptopPc: e.target.checked })} />
                  <span>Laptop / PC</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.monitor ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.monitor} onChange={(e) => setAssets({ ...assets, monitor: e.target.checked })} />
                  <span>Monitor</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.keyboardMouse ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.keyboardMouse} onChange={(e) => setAssets({ ...assets, keyboardMouse: e.target.checked })} />
                  <span>Keyboard / Mouse</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.mobileCharger ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.mobileCharger} onChange={(e) => setAssets({ ...assets, mobileCharger: e.target.checked })} />
                  <span>Mobile / SIM / Charger</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.idCard ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.idCard} onChange={(e) => setAssets({ ...assets, idCard: e.target.checked })} />
                  <span>ID / Access Card</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.keys ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.keys} onChange={(e) => setAssets({ ...assets, keys: e.target.checked })} />
                  <span>Keys</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.headsetDisk ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.headsetDisk} onChange={(e) => setAssets({ ...assets, headsetDisk: e.target.checked })} />
                  <span>Headset / USB / Hard Disk</span>
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: assets.documentsFiles ? '700' : '500' }}>
                  <input type="checkbox" checked={assets.documentsFiles} onChange={(e) => setAssets({ ...assets, documentsFiles: e.target.checked })} />
                  <span>Documents / Files</span>
                </label>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ fontWeight: '700', color: '#334155' }}>Other:</span>
                <input
                  type="text"
                  value={assets.other}
                  onChange={(e) => setAssets({ ...assets, other: e.target.value })}
                  placeholder="Additional equipment or inventory notes..."
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: FINAL APPROVAL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Final Approval
              </h3>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Authorizations & Seal</span>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                Remarks:
              </label>
              <textarea
                rows={2}
                value={approval.remarks}
                onChange={(e) => setApproval({ ...approval, remarks: e.target.value })}
                placeholder="Enter exit clearance handover remarks, pending dues notes, or HR observations..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Signatures Table */}
            <table className="printable-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '7px 12px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Employee</th>
                  <th style={{ padding: '7px 12px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155', borderRight: '1px solid #cbd5e1' }}>Manager</th>
                  <th style={{ padding: '7px 12px', textAlign: 'left', width: '33.3%', fontWeight: '700', color: '#334155' }}>HR</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ border: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '10px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'top', background: '#fafafa' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.empSignature}
                        onChange={(e) => setApproval({ ...approval, empSignature: e.target.value })}
                        placeholder="Employee Signature / Name"
                        style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontStyle: 'italic', fontWeight: '600', color: '#1e293b' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.empSigDate}
                        onChange={(e) => setApproval({ ...approval, empSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'top', background: '#fafafa' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.mgrSignature}
                        onChange={(e) => setApproval({ ...approval, mgrSignature: e.target.value })}
                        placeholder="Manager Signature / Name"
                        style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontStyle: 'italic', fontWeight: '600', color: '#1e293b' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.mgrSigDate}
                        onChange={(e) => setApproval({ ...approval, mgrSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', verticalAlign: 'top', background: '#fafafa' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Signature:</span>
                      <input
                        type="text"
                        value={approval.hrSignature}
                        onChange={(e) => setApproval({ ...approval, hrSignature: e.target.value })}
                        placeholder="HR Signature / Name"
                        style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', fontStyle: 'italic', fontWeight: '600', color: '#0284c7' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block', fontWeight: '700', marginBottom: '2px' }}>Date:</span>
                      <input
                        type="date"
                        value={approval.hrSigDate}
                        onChange={(e) => setApproval({ ...approval, hrSigDate: e.target.value })}
                        style={{ width: '100%', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* HR Status & Sign Off block */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="print-flex-row" style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px' }}>
                <strong style={{ color: '#0f172a', fontWeight: '800' }}>Final HR Status:</strong>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="finalHrStatus"
                    checked={approval.finalHrStatus === 'Cleared'}
                    onChange={() => setApproval({ ...approval, finalHrStatus: 'Cleared' })}
                  />
                  <span style={{ fontWeight: '800', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Cleared
                  </span>
                </label>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="radio"
                    name="finalHrStatus"
                    checked={approval.finalHrStatus === 'Pending'}
                    onChange={() => setApproval({ ...approval, finalHrStatus: 'Pending' })}
                  />
                  <span style={{ fontWeight: '800', color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} /> Pending
                  </span>
                </label>
              </div>

              <div className="print-flex-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: '700', display: 'block', marginBottom: '3px', color: '#334155' }}>HR Sign-Off:</span>
                  <input
                    type="text"
                    value={approval.hrSignOff}
                    onChange={(e) => setApproval({ ...approval, hrSignOff: e.target.value })}
                    placeholder="Authorized HR Representative Name"
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                  />
                </div>
                <div>
                  <span style={{ fontWeight: '700', display: 'block', marginBottom: '3px', color: '#334155' }}>Date:</span>
                  <input
                    type="date"
                    value={approval.hrSignOffDate || approval.hrSigDate}
                    onChange={(e) => setApproval({ ...approval, hrSignOffDate: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
                  />
                </div>
              </div>

              <div className="print-flex-row" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', color: '#334155', minWidth: '120px' }}>Company Stamp:</span>
                <input
                  type="text"
                  value={approval.companyStamp}
                  onChange={(e) => setApproval({ ...approval, companyStamp: e.target.value })}
                  placeholder="Company Seal / Digital Stamp Text"
                  style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#0369a1', background: '#fff' }}
                />
              </div>
            </div>
          </div>

          {/* Form Action Footer (No Print) */}
          {readOnly ? (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>ℹ️ Super Admin Read-Only Mode — Form data verified and locked for editing</span>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 22px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Close Audit Window
              </button>
            </div>
          ) : (
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13.5px',
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
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.3)',
                  transition: 'all 0.15s ease'
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
