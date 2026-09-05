/**
 * HIMALAYA COMPOSITE AND PRECAST PVT. LTD.
 * HUMAN RESOURCES FORMS & FORMATS (SOP MASTER DATA)
 * Document No.: HR-FORM-001 | Revision No.: 00
 * Controlled Document -- Uncontrolled When Printed
 */

export const INITIAL_DOCUMENT_CONTROL = {
  company: 'Himalaya Composite and Precast Pvt. Ltd.',
  department: 'Human Resources & Administration',
  documentNo: 'HR-FORM-001',
  documentTitle: 'HUMAN RESOURCES FORMS & FORMATS',
  revisionNo: '00',
  effectiveDate: '2024-04-01',
  reviewDate: '2025-03-31',
  preparedBy: 'HR Department',
  checkedBy: 'Management / Department Head',
  approvedBy: 'Managing Director / Director',
  watermarkText: 'CONTROLLED DOCUMENT -- UNCONTROLLED WHEN PRINTED',
  retentionRequirement: 'Use the applicable form as evidence that the relevant HR process has been completed. Each completed form shall be signed/approved as applicable and retained according to the company record-retention requirements.'
};

export const INITIAL_REVISION_HISTORY = [
  {
    revision: '00',
    date: '2024-04-01',
    description: 'Initial Issue of Standard HR Forms & Formats',
    preparedBy: 'HR Department',
    approvedBy: 'Management'
  },
  {
    revision: '01',
    date: '2024-09-15',
    description: 'Updated ISO & Statutory compliance checklists for audit readiness',
    preparedBy: 'HR Department',
    approvedBy: 'Management'
  }
];

export const INITIAL_HR_FORMS = [
  {
    id: 'HR-F-01',
    formNo: 'HR-F-01',
    title: 'Manpower Requisition Form',
    category: 'Recruitment & Onboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Formal requisition to initiate staffing, vacancy fulfillment, or replacement recruitment.',
    purpose: 'Standardizes justification, budgeting, and authorization of human resource expansion.',
    formType: 'manpower_requisition',
    fields: {
      department: '',
      positionDesignation: '',
      noOfPositions: '1',
      requirementType: 'New', // New / Replacement
      reasonForRequirement: '',
      requiredJoiningDate: '',
      reportingTo: '',
      employmentType: 'Permanent', // Permanent / Contract / Temporary
      requiredQualification: '',
      requiredExperience: '',
      keySkillsCompetencies: '',
      proposedSalaryCtc: '',
      budgetAvailable: 'Yes', // Yes / No
      priority: 'Normal', // Normal / Urgent
      jobDescriptionAttached: 'Yes', // Yes / No
      requestedBy: '',
      justification: ''
    },
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-02',
    formNo: 'HR-F-02',
    title: 'Employee Joining Checklist',
    category: 'Recruitment & Onboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Checklist to verify all statutory, personal, and administrative documents upon new hire joining.',
    purpose: 'Ensures zero documentation defect during employee onboarding.',
    formType: 'joining_checklist',
    employeeInfo: {
      employeeName: '',
      employeeId: '',
      department: '',
      designation: '',
      dateOfJoining: ''
    },
    items: [
      { id: 1, item: 'Employee Joining Form', required: 'Yes', submitted: false, remarks: '' },
      { id: 2, item: 'Offer / Appointment Letter', required: 'Yes', submitted: false, remarks: '' },
      { id: 3, item: 'Photograph', required: 'Yes', submitted: false, remarks: '' },
      { id: 4, item: 'Identity Proof', required: 'As applicable', submitted: false, remarks: '' },
      { id: 5, item: 'Address / Contact Details', required: 'Yes', submitted: false, remarks: '' },
      { id: 6, item: 'Educational Certificates', required: 'As applicable', submitted: false, remarks: '' },
      { id: 7, item: 'Experience / Previous Employment Documents', required: 'As applicable', submitted: false, remarks: '' },
      { id: 8, item: 'Bank Details', required: 'Yes', submitted: false, remarks: '' },
      { id: 9, item: 'Statutory Documents', required: 'As applicable', submitted: false, remarks: '' },
      { id: 10, item: 'Emergency Contact', required: 'Yes', submitted: false, remarks: '' },
      { id: 11, item: 'Nominee Details', required: 'Yes', submitted: false, remarks: '' },
      { id: 12, item: 'Medical / Fitness', required: 'Where required', submitted: false, remarks: '' },
      { id: 13, item: 'Policy Undertakings', required: 'Yes', submitted: false, remarks: '' },
      { id: 14, item: 'Confidentiality Agreement', required: 'Where applicable', submitted: false, remarks: '' },
      { id: 15, item: 'Employee ID Allocated', required: 'Yes', submitted: false, remarks: '' },
      { id: 16, item: 'Attendance Registration', required: 'Yes', submitted: false, remarks: '' },
      { id: 17, item: 'Department Allocation', required: 'Yes', submitted: false, remarks: '' }
    ],
    declaration: 'I confirm that the information/documents submitted by me are true to the best of my knowledge.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-03',
    formNo: 'HR-F-03',
    title: 'Employee Induction Checklist',
    category: 'Recruitment & Onboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Systematic orientation covering company rules, HSE, payroll, and code of conduct.',
    purpose: 'Assures comprehensive orientation for safety, compliance, and cultural alignment.',
    formType: 'induction_checklist',
    employeeInfo: {
      employeeName: '',
      employeeId: '',
      department: '',
      designation: '',
      dateOfJoining: ''
    },
    topics: [
      { id: 1, topic: 'Company introduction & organization', completed: false, trainer: '', dateRemarks: '' },
      { id: 2, topic: 'Job responsibilities', completed: false, trainer: '', dateRemarks: '' },
      { id: 3, topic: 'Working hours / attendance', completed: false, trainer: '', dateRemarks: '' },
      { id: 4, topic: 'Leave rules', completed: false, trainer: '', dateRemarks: '' },
      { id: 5, topic: 'Salary / payroll process', completed: false, trainer: '', dateRemarks: '' },
      { id: 6, topic: 'Code of conduct', completed: false, trainer: '', dateRemarks: '' },
      { id: 7, topic: 'Safety requirements', completed: false, trainer: '', dateRemarks: '' },
      { id: 8, topic: 'PPE requirements', completed: false, trainer: '', dateRemarks: '' },
      { id: 9, topic: 'Emergency procedures', completed: false, trainer: '', dateRemarks: '' },
      { id: 10, topic: 'Factory / site rules', completed: false, trainer: '', dateRemarks: '' },
      { id: 11, topic: 'Quality awareness', completed: false, trainer: '', dateRemarks: '' },
      { id: 12, topic: 'HR policies', completed: false, trainer: '', dateRemarks: '' },
      { id: 13, topic: 'Grievance procedure', completed: false, trainer: '', dateRemarks: '' }
    ],
    acknowledgement: 'I have received and understood the induction topics relevant to my role.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-04',
    formNo: 'HR-F-04',
    title: 'Probation / Confirmation Evaluation',
    category: 'Performance Management',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Formal assessment at the completion of probation period to evaluate permanent employment confirmation.',
    purpose: 'Quantifies new employee competency, behavior, and cultural adherence.',
    formType: 'probation_evaluation',
    fields: {
      employeeName: '',
      employeeId: '',
      department: '',
      designation: '',
      dateOfJoining: '',
      probationEndDate: '',
      reportingManager: '',
      evaluationDate: ''
    },
    criteria: [
      { id: 1, criteria: 'Job knowledge', rating: 4, comments: '' },
      { id: 2, criteria: 'Work quality', rating: 4, comments: '' },
      { id: 3, criteria: 'Attendance', rating: 5, comments: '' },
      { id: 4, criteria: 'Discipline', rating: 4, comments: '' },
      { id: 5, criteria: 'Productivity', rating: 4, comments: '' },
      { id: 6, criteria: 'Safety compliance', rating: 5, comments: '' },
      { id: 7, criteria: 'Teamwork', rating: 4, comments: '' },
      { id: 8, criteria: 'Behaviour', rating: 4, comments: '' },
      { id: 9, criteria: 'Responsibility', rating: 4, comments: '' },
      { id: 10, criteria: 'KRA/KPI achievement', rating: 4, comments: '' }
    ],
    recommendation: 'Confirm', // Confirm / Extend Probation / Other action as per policy
    reasonDevelopmentRequirements: '',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-05',
    formNo: 'HR-F-05',
    title: 'Attendance Register',
    category: 'Attendance & Overtime',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Official monthly roll tracking shift timings, clock in/out, presence status, and overtime hours.',
    purpose: 'Standardizes statutory record of labor hours, payroll inputs, and punctuality.',
    formType: 'attendance_register',
    meta: {
      month: 'April',
      year: '2025',
      department: 'Production & Plant Operations',
      preparedBy: '',
      verifiedBy: '',
      date: ''
    },
    rows: [
      { id: 1, date: '2025-04-01', employeeId: 'EMP-001', employeeName: 'Aarav Sharma', dept: 'Operations', shift: 'A', inTime: '08:30', outTime: '17:30', status: 'Present', otHrs: '1.0', remarks: 'Normal Shift' },
      { id: 2, date: '2025-04-01', employeeId: 'EMP-002', employeeName: 'Ramanathan Swamy', dept: 'Operations', shift: 'A', inTime: '08:25', outTime: '17:30', status: 'Present', otHrs: '0.0', remarks: '' },
      { id: 3, date: '2025-04-01', employeeId: 'EMP-003', employeeName: 'Priya Patel', dept: 'HR', shift: 'General', inTime: '09:00', outTime: '18:00', status: 'Present', otHrs: '0.0', remarks: '' },
      { id: 4, date: '2025-04-01', employeeId: 'EMP-004', employeeName: 'Vikram Singh', dept: 'QC', shift: 'A', inTime: '08:30', outTime: '19:30', status: 'Present', otHrs: '2.0', remarks: 'Batch testing OT' },
      { id: 5, date: '2025-04-01', employeeId: 'EMP-005', employeeName: 'Neha Shah', dept: 'Finance', shift: 'General', inTime: '09:15', outTime: '18:15', status: 'Late', otHrs: '0.0', remarks: 'Permission granted' }
    ],
    statusOptions: ['Present', 'Absent', 'Weekly Off', 'Holiday', 'Leave', 'Half Day', 'Late', 'Unauthorized Absence']
  },
  {
    id: 'HR-F-06',
    formNo: 'HR-F-06',
    title: 'Overtime Approval Form',
    category: 'Attendance & Overtime',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Prior authorization and certification form for extra duty and overtime hours.',
    purpose: 'Prevents unauthorized overtime expenditures and ensures fair compensation.',
    formType: 'overtime_approval',
    fields: {
      employeeName: '',
      employeeId: '',
      department: '',
      date: '',
      shift: 'Shift A',
      otStartEnd: '17:30 - 20:30',
      totalOtHours: '3.0',
      workReason: 'Urgent dispatched order completion',
      normalHolidayOt: 'Normal OT',
      costRate: '',
      reasonWorkDetails: '',
      priorApproval: 'Yes', // Yes / No
      emergency: 'No' // Yes / No
    },
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-07',
    formNo: 'HR-F-07',
    title: 'Training Attendance Register',
    category: 'Training & Development',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Attendance log and participant verification for internal and external skill building sessions.',
    purpose: 'Evidence of training compliance for ISO-9001 and HSE requirements.',
    formType: 'training_attendance',
    fields: {
      trainingTitle: 'Precast Concrete Safety & Crane Rigging SOP',
      trainer: 'Er. Rajesh Verma',
      date: '2025-04-10',
      departmentLocation: 'Plant Workshop 1',
      trainingType: 'Technical & HSE',
      duration: '4 Hours',
      objectiveTopics: 'Safe lifting protocols, sling inspection, hand signals, and precast mould handling precautions.'
    },
    attendees: [
      { sl: 1, employeeId: 'EMP-001', employeeName: 'Aarav Sharma', department: 'Operations', signature: 'A. Sharma', remarks: 'Completed' },
      { sl: 2, employeeId: 'EMP-002', employeeName: 'Ramanathan Swamy', department: 'Operations', signature: 'R. Swamy', remarks: 'Completed' },
      { sl: 3, employeeId: 'EMP-004', employeeName: 'Vikram Singh', department: 'QC', signature: 'V. Singh', remarks: 'Completed' },
      { sl: 4, employeeId: 'EMP-007', employeeName: 'Amit Verma', department: 'Production', signature: 'A. Verma', remarks: 'Completed' },
      { sl: 5, employeeId: 'EMP-008', employeeName: 'Suresh Kumar', department: 'Maintenance', signature: 'S. Kumar', remarks: 'Completed' },
      { sl: 6, employeeId: 'EMP-009', employeeName: 'Ramesh Yadav', department: 'Production', signature: 'R. Yadav', remarks: 'Completed' },
      { sl: 7, employeeId: 'EMP-010', employeeName: 'Dinesh Prasad', department: 'Stores', signature: 'D. Prasad', remarks: 'Completed' },
      { sl: 8, employeeId: 'EMP-011', employeeName: 'Sunil Rao', department: 'Civil/Site', signature: 'S. Rao', remarks: 'Completed' },
      { sl: 9, employeeId: 'EMP-012', employeeName: 'Kunal Joshi', department: 'QC', signature: 'K. Joshi', remarks: 'Completed' },
      { sl: 10, employeeId: 'EMP-013', employeeName: 'Mahesh Patil', department: 'Production', signature: 'M. Patil', remarks: 'Completed' }
    ],
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-08',
    formNo: 'HR-F-08',
    title: 'Training Evaluation Form',
    category: 'Training & Development',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Post-training feedback form to evaluate effectiveness, practical relevance, and trainer competence.',
    purpose: 'Continual improvement of corporate learning & development programs.',
    formType: 'training_evaluation',
    fields: {
      trainingTitle: 'Precast Concrete Safety & Crane Rigging SOP',
      date: '2025-04-10',
      employeeName: 'Aarav Sharma',
      department: 'Operations',
      trainer: 'Er. Rajesh Verma',
      duration: '4 Hours'
    },
    questions: [
      { id: 1, question: 'Understanding of topic', rating: 5, comments: 'Clear explanations and diagrams' },
      { id: 2, question: 'Relevance to job', rating: 5, comments: 'Directly applicable on the factory floor' },
      { id: 3, question: 'Trainer effectiveness', rating: 4, comments: 'Good interactive question session' },
      { id: 4, question: 'Practical usefulness', rating: 5, comments: 'Helps prevent rigging hazards' },
      { id: 5, question: 'Confidence after training', rating: 4, comments: 'Ready to enforce SOP' },
      { id: 6, question: 'Need for further training', rating: 3, comments: 'Refresher required in 6 months' }
    ],
    overallEffectiveness: 'Excellent', // Excellent / Good / Satisfactory / Needs Improvement
    recommendedFollowUp: 'Practical field audit during mould de-shuttering.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-09',
    formNo: 'HR-F-09',
    title: 'Annual Training Matrix',
    category: 'Training & Development',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Master annual schedule mapping roles, training needs, planned dates, and completion status.',
    purpose: 'Systematic scheduling and tracking of organizational capability roadmap.',
    formType: 'annual_training_matrix',
    meta: {
      reviewFrequency: 'Monthly / Quarterly as defined by management',
      preparedBy: '',
      reviewedBy: '',
      date: ''
    },
    matrix: [
      { id: 1, employeeRole: 'Plant Engineers / Supervisors', requiredTraining: 'ISO 9001:2015 Quality Awareness', frequency: 'Annual', plannedDate: '2025-05-15', completedDate: '2025-05-15', status: 'Completed', remarks: '100% Passed' },
      { id: 2, employeeRole: 'Crane & Rigging Operators', requiredTraining: 'Safe Rigging & Crane Operation SOP', frequency: 'Bi-Annual', plannedDate: '2025-06-10', completedDate: '', status: 'Scheduled', remarks: 'Practical demo planned' },
      { id: 3, employeeRole: 'Welding & Fabrication Techs', requiredTraining: 'Arc Welding Safety & Gas Handling', frequency: 'Annual', plannedDate: '2025-07-05', completedDate: '', status: 'Planned', remarks: 'External certification' },
      { id: 4, employeeRole: 'All Factory Staff', requiredTraining: 'Fire Safety & Evacuation Drills', frequency: 'Quarterly', plannedDate: '2025-08-20', completedDate: '', status: 'Planned', remarks: 'Factory-wide drill' },
      { id: 5, employeeRole: 'QC Specialists', requiredTraining: '7 QC Tools & Statistical Process Control', frequency: 'Annual', plannedDate: '2025-09-12', completedDate: '', status: 'Planned', remarks: 'Advanced batch testing' }
    ]
  },
  {
    id: 'HR-F-10',
    formNo: 'HR-F-10',
    title: 'Performance Appraisal -- KRA / KPI',
    category: 'Performance Management',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Structured assessment against Key Result Areas (KRAs) and Key Performance Indicators (KPIs).',
    purpose: 'Objective basis for increments, promotions, and developmental interventions.',
    formType: 'performance_appraisal',
    fields: {
      employeeName: '',
      employeeId: '',
      department: '',
      designation: '',
      appraisalPeriod: 'FY 2024-25',
      reportingManager: ''
    },
    kraList: [
      { id: 1, kraKpi: 'Production Output & Schedule Adherence', weight: '30%', target: '≥ 95% on-time dispatch', achievement: '96.2%', rating: '4', comments: 'Achieved target across all quarters' },
      { id: 2, kraKpi: 'Rejection & Scrap Minimization', weight: '20%', target: '< 1.5% mould scrap', achievement: '1.2%', rating: '5', comments: 'Significant improvement in precast casting' },
      { id: 3, kraKpi: 'Safety Compliance & Zero Lost Time Injuries', weight: '20%', target: '0 Incidents / 100% PPE', achievement: '0 Incidents', rating: '5', comments: 'Strict enforcement on shop floor' },
      { id: 4, kraKpi: 'Team Leadership & Cross-Skilling', weight: '15%', target: 'Train 5 team members', achievement: '5 Trained', rating: '4', comments: 'Mentored junior technicians' },
      { id: 5, kraKpi: 'Cost Reduction & Resource Efficiency', weight: '15%', target: '5% raw material savings', achievement: '4.5%', rating: '4', comments: 'Good optimization of chemical additives' }
    ],
    overallRating: 'Exceeds Expectations', // Outstanding / Exceeds Expectations / Meets Expectations / Needs Improvement / Unsatisfactory
    developmentNeeds: 'Advanced Project Management training and Primavera / ERP scheduling.',
    employeeComments: 'I appreciate the support provided by the plant management team.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-11',
    formNo: 'HR-F-11',
    title: 'Employee Grievance Form / Register',
    category: 'Employee Welfare & Grievance',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Formal redressal mechanism for employee concerns, workplace issues, and dispute resolution.',
    purpose: 'Guarantees transparent, time-bound, and non-retaliatory workplace justice.',
    formType: 'grievance_form',
    fields: {
      grievanceNo: 'GRV-2025-001',
      dateReceived: '',
      employeeName: '',
      employeeId: '',
      department: '',
      receivedBy: ''
    },
    natureOfGrievance: {
      salaryPayroll: false,
      attendance: false,
      leave: false,
      supervisorManager: false,
      workplace: true,
      safety: false,
      behaviour: false,
      welfare: false,
      other: false
    },
    detailsOfGrievance: '',
    factFindingActionTaken: '',
    acknowledgedDate: '',
    targetActualClosureDate: '',
    status: 'Open', // Open / Closed
    outcomeCommunicated: 'Yes', // Yes / No / Not applicable
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-12',
    formNo: 'HR-F-12',
    title: 'Employee Asset Issue & Handover Form',
    category: 'Employee Welfare & Grievance',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Chain-of-custody tracking for company assets, IT hardware, vehicles, PPE, and tools.',
    purpose: 'Maintains asset accountability and smooth handover during internal transfers or exit.',
    formType: 'asset_handover',
    assets: [
      { id: 1, assetItem: 'Dell Latitude 3420 Laptop', assetIdSerial: 'DL-LP-2024-08', qty: '1', condition: 'Good', issueDate: '2024-04-05', returnDate: '', remarks: 'Charger and bag provided' },
      { id: 2, assetItem: 'CUG SIM & Mobile Device', assetIdSerial: 'SIM-9876543210', qty: '1', condition: 'New', issueDate: '2024-04-05', returnDate: '', remarks: 'Corporate calling plan' },
      { id: 3, assetItem: 'RFID Access Card & ID Badge', assetIdSerial: 'ID-001', qty: '1', condition: 'Active', issueDate: '2024-04-01', returnDate: '', remarks: 'Main gate access enabled' },
      { id: 4, assetItem: 'Safety Helmet & Steel Toe Shoes', assetIdSerial: 'PPE-HIM-102', qty: '1 Set', condition: 'New', issueDate: '2024-04-01', returnDate: '', remarks: 'Standard PPE kit' }
    ],
    acknowledgement: 'I acknowledge receipt/return of the above company property and agree to follow applicable company controls.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-13',
    formNo: 'HR-F-13',
    title: 'Exit Clearance Form',
    category: 'Separation & Offboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Multi-departmental signoff protocol confirming surrender of dues, tools, keys, and clearances.',
    purpose: 'Zero leakage of company assets and accounts prior to final relieving.',
    formType: 'exit_clearance',
    employeeInfo: {
      employeeName: '',
      employeeId: '',
      lastWorkingDate: '',
      reason: 'Resignation', // Resignation / Termination / Retirement / Other
      pendingItemsRemarks: ''
    },
    departments: [
      { id: 1, area: 'HR', responsiblePerson: 'HR Manager', status: 'Cleared', signatureDate: '', remarks: 'Exit interview completed, personnel file reviewed' },
      { id: 2, area: 'Reporting Department', responsiblePerson: 'Dept Head', status: 'Cleared', signatureDate: '', remarks: 'All projects & documentation handed over' },
      { id: 3, area: 'Stores', responsiblePerson: 'Store In-Charge', status: 'Cleared', signatureDate: '', remarks: 'Tools, PPE, safety equipment returned' },
      { id: 4, area: 'IT / Admin (where applicable)', responsiblePerson: 'IT Admin', status: 'Cleared', signatureDate: '', remarks: 'Email deactivated, laptop wiped and collected' },
      { id: 5, area: 'Accounts', responsiblePerson: 'Finance Head', status: 'Cleared', signatureDate: '', remarks: 'Travel advances and petty cash settled' },
      { id: 6, area: 'Other', responsiblePerson: 'Facility Lead', status: 'Cleared', signatureDate: '', remarks: 'Locker cleared and keys returned' }
    ],
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-14',
    formNo: 'HR-F-14',
    title: 'Exit Interview Form',
    category: 'Separation & Offboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Confidential feedback interview capturing reasons for leaving, employee sentiment, and organizational suggestions.',
    purpose: 'Drives attrition analysis, retention strategy, and cultural enhancements.',
    formType: 'exit_interview',
    fields: {
      employeeName: '',
      employeeId: '',
      department: '',
      designation: '',
      dateOfJoining: '',
      lastWorkingDate: '',
      reportingManager: '',
      interviewDate: ''
    },
    topics: [
      { id: 1, topic: 'Job satisfaction', ratingResponse: 'Good', comments: 'Challenging precast projects' },
      { id: 2, topic: 'Work environment', ratingResponse: 'Excellent', comments: 'Supportive team members' },
      { id: 3, topic: 'Supervisor / management', ratingResponse: 'Good', comments: 'Clear operational direction' },
      { id: 4, topic: 'Compensation / benefits', ratingResponse: 'Average', comments: 'Relocating to home town' },
      { id: 5, topic: 'Growth / development', ratingResponse: 'Good', comments: 'Learned modern ERP and manufacturing techniques' },
      { id: 6, topic: 'Training', ratingResponse: 'Good', comments: 'HSE workshops were helpful' },
      { id: 7, topic: 'Reason for leaving', ratingResponse: 'Personal / Relocation', comments: 'Family requirements closer to home' },
      { id: 8, topic: 'Would you recommend the company?', ratingResponse: 'Yes', comments: 'Great foundation in concrete engineering' }
    ],
    suggestionsForImprovement: 'Provide more automated tools for daily plant logging.',
    considerRejoining: 'Yes', // Yes / No / Maybe
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  },
  {
    id: 'HR-F-15',
    formNo: 'HR-F-15',
    title: 'Full & Final Checklist',
    category: 'Separation & Offboarding',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: '15-point statutory and payroll verification checklist for settling all dues and relieving documents.',
    purpose: 'Complete legal, statutory, and financial compliance upon employee exit.',
    formType: 'full_final_checklist',
    employeeInfo: {
      employeeName: '',
      employeeId: '',
      lastWorkingDate: '',
      preparedBy: '',
      verifiedBy: '',
      approvedBy: ''
    },
    checks: [
      { id: 1, checkItem: 'Resignation / separation documents', status: 'Complete', remarks: 'Resignation letter & acceptance on file' },
      { id: 2, checkItem: 'Notice period verified', status: 'Complete', remarks: 'Served 30 days notice fully' },
      { id: 3, checkItem: 'Attendance verified', status: 'Complete', remarks: 'Biometric logs verified up to last day' },
      { id: 4, checkItem: 'Leave balance verified', status: 'Complete', remarks: '4.5 days PL encashment approved' },
      { id: 5, checkItem: 'Overtime verified', status: 'Complete', remarks: 'Verified against approved OT slips' },
      { id: 6, checkItem: 'Assets returned', status: 'Complete', remarks: 'Asset handover form HR-F-12 attached' },
      { id: 7, checkItem: 'Advance / loan verified', status: 'Complete', remarks: 'Nil advance balance in ledger' },
      { id: 8, checkItem: 'Department clearance', status: 'Complete', remarks: 'HR-F-13 signed off by all leads' },
      { id: 9, checkItem: 'Salary / dues calculation', status: 'Complete', remarks: 'Payroll sheet prepared' },
      { id: 10, checkItem: 'Statutory requirements checked', status: 'Complete', remarks: 'PF, ESIC & Gratuity eligibility updated' },
      { id: 11, checkItem: 'Access deactivated', status: 'Complete', remarks: 'ERP, biometric & email revoked' },
      { id: 12, checkItem: 'Exit interview completed', status: 'Complete', remarks: 'HR-F-14 recorded' },
      { id: 13, checkItem: 'Management approval', status: 'Complete', remarks: 'Managing Director approval received' },
      { id: 14, checkItem: 'Relieving / service documents', status: 'Complete', remarks: 'Relieving & Experience letters issued' },
      { id: 15, checkItem: 'Personnel file closed', status: 'Complete', remarks: 'Archived into ex-employee registry' }
    ]
  },
  {
    id: 'HR-F-16',
    formNo: 'HR-F-16',
    title: 'Monthly HR Report',
    category: 'HR Audits & Reports',
    revision: '00',
    effectiveDate: '2024-04-01',
    description: 'Executive monthly dashboard aggregating headcount, recruitment TAT, KPIs, attrition, and statutory compliance.',
    purpose: 'Provides executive leadership visibility over workforce performance and compliance.',
    formType: 'monthly_hr_report',
    meta: {
      reportingMonth: 'March 2025',
      preparedBy: '',
      date: ''
    },
    manpowerTable: [
      { id: 1, indicator: 'Total Manpower', opening: 145, additions: 6, exits: 2, closing: 149, remarks: 'Plant scaling for Phase II' },
      { id: 2, indicator: 'Production', opening: 65, additions: 3, exits: 1, closing: 67, remarks: 'Precast casting expansion' },
      { id: 3, indicator: 'QA/QC', opening: 14, additions: 1, exits: 0, closing: 15, remarks: 'Additional batch tester' },
      { id: 4, indicator: 'Maintenance', opening: 12, additions: 0, exits: 0, closing: 12, remarks: 'Stable roster' },
      { id: 5, indicator: 'Stores / Dispatch', opening: 16, additions: 1, exits: 0, closing: 17, remarks: 'Yard supervisor added' },
      { id: 6, indicator: 'Site / Civil', opening: 18, additions: 0, exits: 1, closing: 17, remarks: 'Site handover completion' },
      { id: 7, indicator: 'Office / Admin', opening: 12, additions: 1, exits: 0, closing: 13, remarks: 'Finance executive joined' },
      { id: 8, indicator: 'Contract Manpower', opening: 8, additions: 0, exits: 0, closing: 8, remarks: 'Housekeeping & security' }
    ],
    kpisTable: [
      { id: 1, kpi: 'Manpower availability', target: '≥ 95%', actual: '97.4%', status: 'Achieved', remarks: 'Plant running at peak' },
      { id: 2, kpi: 'Recruitment TAT', target: '≤ 15 working days', actual: '12 days', status: 'Achieved', remarks: 'Fast hiring cycle' },
      { id: 3, kpi: 'Attendance accuracy', target: '≥ 99%', actual: '99.2%', status: 'Achieved', remarks: 'Biometric sync' },
      { id: 4, kpi: 'Payroll input accuracy', target: '100%', actual: '100%', status: 'Achieved', remarks: 'Zero error month' },
      { id: 5, kpi: 'Training completion', target: '≥ 95%', actual: '96.5%', status: 'Achieved', remarks: 'Safety sessions finished' },
      { id: 6, kpi: 'Employee documentation', target: '100%', actual: '98.8%', status: 'In Progress', remarks: 'Pending 2 bank proofs' },
      { id: 7, kpi: 'Grievance acknowledgement', target: '≤ 2 working days', actual: '1 day', status: 'Achieved', remarks: 'Prompt response' },
      { id: 8, kpi: 'Grievance closure', target: '≤ 7 working days', actual: '5 days', status: 'Achieved', remarks: 'All resolved' },
      { id: 9, kpi: 'Exit clearance', target: 'Approved F&F timeline', actual: 'On Time', status: 'Achieved', remarks: 'Settled within 10 days' },
      { id: 10, kpi: 'Applicable statutory compliance', target: '100% required actions', actual: '100%', status: 'Achieved', remarks: 'PF, ESIC, PT paid' }
    ],
    activitiesTable: [
      { id: 1, activity: 'New joiners', countStatus: '6 Employees', remarks: 'Onboarding & induction completed' },
      { id: 2, activity: 'Resignations / exits', countStatus: '2 Employees', remarks: 'F&F settlements executed' },
      { id: 3, activity: 'Open vacancies', countStatus: '3 Positions', remarks: 'Civil Engineer & Machine Operator' },
      { id: 4, activity: 'Leave / absenteeism', countStatus: '2.6%', remarks: 'Within acceptable threshold' },
      { id: 5, activity: 'Overtime', countStatus: '184 Hours', remarks: 'Due to month-end concrete dispatches' },
      { id: 6, activity: 'Training completed', countStatus: '4 Sessions', remarks: 'Total 48 participants' },
      { id: 7, activity: 'Grievances received / closed', countStatus: '1 / 1', remarks: 'Resolved cafeteria canteen request' },
      { id: 8, activity: 'Disciplinary cases', countStatus: '0 Cases', remarks: 'Full compliance maintained' },
      { id: 9, activity: 'Other management actions', countStatus: '1 Action', remarks: 'Annual safety audit review' }
    ],
    managementRemarks: 'Overall manpower productivity and statutory health remain strong. Continuous focus on rigging safety required.',
    signatories: {
      preparedBy: { name: '', signature: '', date: '' },
      verifiedBy: { name: '', signature: '', date: '' },
      approvedBy: { name: '', signature: '', date: '' }
    }
  }
];

export const SOP_CATEGORIES = [
  'All',
  'Recruitment & Onboarding',
  'Attendance & Overtime',
  'Training & Development',
  'Performance Management',
  'Employee Welfare & Grievance',
  'Separation & Offboarding',
  'HR Audits & Reports',
  'Custom SOPs'
];
