import {
  LayoutGrid, Users, FlaskConical, FileText, Box, Boxes, Wrench, Truck, CreditCard,
  UserCheck, BarChart3, Layers, ShieldAlert, ClipboardList, PackageCheck,
  UserPlus, Clock, Bell, ClipboardCheck, AlertTriangle, RefreshCw, Package, Shield, ShieldCheck,
  Receipt, TrendingUp, Target, DollarSign, Percent, Calendar, Cpu, Activity,
  CheckCircle, XCircle, Database, ArrowRightLeft, ArrowLeftRight, ArrowDownUp, ShoppingCart,
  ListTodo, FileSignature, Car, UserCircle, Map, MapPin, History, Navigation, ArrowDownLeft,
  ArrowUpRight, BookOpen, Wallet, Building, Book, Notebook, Library, Scale, Landmark,
  Calculator, ShoppingBag, CalendarOff, Award, Files, MessageSquare, BellRing, Hash, Ruler, Grid,
  RotateCcw, Monitor, Server, ActivitySquare, Terminal, Eye, Navigation2,
  BadgeCheck, FileCheck
} from 'lucide-react';

export const navigationConfig = {
  'Sales': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/sales/dashboard' },
    { id: 'daily-task', label: 'Daily Tasks', icon: ClipboardList, path: '/sales/daily-task' },
    { id: 'leads', label: 'Leads Directory', icon: Users, path: '/sales/leads', group: 'CRM' },
    { id: 'samples', label: 'Sample Management', icon: FlaskConical, path: '/sales/samples', group: 'CRM' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/sales/quotations', group: 'Sales' },
    { id: 'orders', label: 'Orders', icon: Box, path: '/sales/orders', group: 'Sales' },
    { id: 'production-status', label: 'Production Status', icon: Wrench, path: '/sales/production-status', group: 'Sales' },
    { id: 'payment-followup', label: 'Payment Follow-up', icon: CreditCard, path: '/sales/payment-followup', group: 'Sales' },
    { id: 'payment-history', label: 'Payment History', icon: History, path: '/sales/payment-history', group: 'Sales' },
    { id: 'customers', label: 'Customers', icon: UserCheck, path: '/sales/customers', group: 'Sales' },
    { id: 'customer-complaints', label: 'Customer Complaints', icon: MessageSquare, path: '/sales/customer-complaints', group: 'Sales' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/sales/reports' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/sales/profile' }
  ],

  'SuperSales': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/supersales/dashboard' },
    { id: 'daily-task', label: 'Daily Tasks', icon: ClipboardList, path: '/supersales/daily-task' },
    { id: 'leads', label: 'Leads Directory', icon: Users, path: '/supersales/leads', group: 'CRM' },
    { id: 'samples', label: 'Sample Management', icon: FlaskConical, path: '/supersales/samples', group: 'CRM' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/supersales/quotations', group: 'SuperSales' },
    { id: 'orders', label: 'Orders', icon: Box, path: '/supersales/orders', group: 'SuperSales' },
    { id: 'production-status', label: 'Production Status', icon: Wrench, path: '/supersales/production-status', group: 'SuperSales' },
    { id: 'payment-followup', label: 'Payment Follow-up', icon: CreditCard, path: '/supersales/payment-followup', group: 'SuperSales' },
    { id: 'payment-history', label: 'Payment History', icon: History, path: '/supersales/payment-history', group: 'SuperSales' },
    { id: 'customers', label: 'Customers', icon: UserCheck, path: '/supersales/customers', group: 'SuperSales' },
    { id: 'customer-complaints', label: 'Customer Complaints', icon: MessageSquare, path: '/supersales/customer-complaints', group: 'SuperSales' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/supersales/reports' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/supersales/profile' }
  ],

  'Production': [
    { type: 'badge', label: 'PRODUCTION' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/production/dashboard' },
    { id: 'work-orders', label: 'Work Orders', icon: ClipboardList, path: '/production/work-orders' },
    { id: 'incoming-orders', label: 'Incoming Orders', icon: Box, path: '/production/incoming-orders' },
    {
      id: 'material-workflow',
      label: 'Material Requests',
      icon: Layers,
      path: '/production/material-requests',
      subItems: [
        { id: 'material-requests', label: 'Material Requests', path: '/production/material-requests' },
        { id: 'material-request-history', label: 'Material Request History', path: '/production/material-requests?tab=history' }
      ]
    },
    { id: 'store-releases', label: 'Store Releases', icon: PackageCheck, path: '/production/store-releases' },
    { id: 'floor', label: 'Production Floor', icon: Wrench, path: '/production/floor' },
    { id: 'completed', label: 'Completed', icon: ClipboardCheck, path: '/production/completed' },
    { id: 'qc-failed', label: 'QC Failed & Reproduction', icon: RefreshCw, path: '/production/qc-failed' },
    { id: 'testing', label: 'Testing', icon: ClipboardCheck, path: '/production/testing' },
    { id: 'all-stock', label: 'All Stock', icon: Boxes, path: '/production/all-stock' },
    { id: 'finished-goods', label: 'Finished Goods', icon: Package, path: '/production/finished-goods' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/production/reports' },
    { id: 'machines', label: 'Machine Performance', icon: Cpu, path: '/production/machines' },

    { type: 'badge', label: 'QUALITY CONTROL' },
    { id: 'qc-pending', label: 'Pending Inspections', icon: Clock, path: '/production/qc-pending' },
    { id: 'qc-history', label: 'Inspected History', icon: ClipboardList, path: '/production/qc-history' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/production/profile' }
  ],

  'Plant Head': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/plant-head/dashboard' },
    { id: 'incoming-orders', label: 'Incoming Orders', icon: Box, path: '/plant-head/incoming-orders', group: 'Planning Board' },
    { id: 'recruitment-request', label: 'Recruitment Request', icon: UserPlus, path: '/plant-head/recruitment-request', group: 'Planning Board' },
    { id: 'finished-goods', label: 'Finished Goods Inventory', icon: PackageCheck, path: '/plant-head/finished-goods', group: 'Planning Board' },
    { id: 'planning', label: 'Planning', icon: Wrench, path: '/plant-head/planning', group: 'Planning Board' },
    { id: 'material-approvals', label: 'Material Approvals', icon: FileCheck, path: '/plant-head/material-approvals' },
    { id: 'indent-approvals', label: 'Indent Approvals', icon: CheckCircle, path: '/plant-head/indent-approvals' },
    { id: 'replacements', label: 'Replacement Requests', icon: RefreshCw, path: '/plant-head/replacements' },
    { id: 'returns', label: 'Return Requests', icon: RefreshCw, path: '/plant-head/returns' },
    {
      id: 'analytics-and-reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      path: '/plant-head/production-analytics',
      subItems: [
        { id: 'production-analytics', label: 'Production Analytics', path: '/plant-head/production-analytics' },
        { id: 'dispatch-analytics', label: 'Dispatch Analytics', path: '/plant-head/dispatch-analytics' },
        { id: 'material-analytics', label: 'Material Analytics', path: '/plant-head/material-analytics' },
        { id: 'department-overview', label: 'Department Overview', path: '/plant-head/department-overview' },
        { id: 'executive-reports', label: 'Executive Reports', path: '/plant-head/executive-reports' }
      ]
    },
    { id: 'raw-inventory', label: 'Raw Inventory', icon: Layers, path: '/plant-head/raw-inventory' },
    { id: 'qc-failures', label: 'QC Failures', icon: ShieldAlert, path: '/plant-head/qc-failures' },
    { id: 'testing', label: 'Production Testing', icon: ClipboardCheck, path: '/plant-head/testing' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/plant-head/profile' },
    { id: 'leave-approvals', label: 'Leave Approvals', icon: Calendar, path: '/plant-head/leave-approvals' }
  ],

  'Store': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/store/dashboard' },
    { id: 'raw-inventory', label: 'Raw Inventory', icon: Layers, path: '/store/raw-inventory' },
    { id: 'low-stock-alerts', label: 'Low Stock Alerts', icon: AlertTriangle, path: '/store/low-stock-alerts' },
    { id: 'analysis-requests', label: 'Product & Brand Analysis', icon: ClipboardList, path: '/store/analysis-requests', group: 'Inward Quality & Returns' },
    { id: 'material-requests', label: 'Material Requests', icon: ClipboardList, path: '/store/material-requests' },
    { id: 'store-releases', label: 'Store Releases', icon: PackageCheck, path: '/store/store-releases' },
    { id: 'issued-history', label: 'Material Issued History', icon: History, path: '/store/issued-history' },
    {
      id: 'purchase',
      label: 'Purchase',
      icon: FileText,
      path: '/store/purchase',
      subItems: [
        { id: 'create-request', label: 'Create Request', path: '/store/purchase?tab=Create Request' },
        { id: 'verify-delivery', label: 'Verify Delivery', path: ' ' },
        { id: 'delivery-history', label: 'Delivery History', path: '/store/purchase?tab=Delivery History' },
        { id: 'grn-history', label: 'GRN History', path: '/store/purchase?tab=GRN History' },
        { id: 'material-rejections', label: 'Material Rejections', path: '/store/purchase?tab=Material Rejections' },
        { id: 'replacement-deliveries', label: 'Replacement Deliveries', path: '/store/purchase?tab=Replacement Deliveries' },
        { id: 'indent-history', label: 'Indent History', path: '/store/purchase?tab=Indent History' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      path: '/store/reports',
      subItems: [
        { id: 'summary-report', label: 'Store Summary Report', path: '/store/reports' }
      ]
    },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/store/profile' }
  ],

  'Dispatch': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dispatch/dashboard' },
    { id: 'finished-goods', label: 'Finished Goods', icon: PackageCheck, path: '/dispatch/finished-goods', group: 'Logistics' },
    {
      id: 'Sales-order dispatch',
      label: 'Create Dispatch',
      icon: Truck,
      path: '/dispatch/orders',
      group: 'Logistics',
      subItems: [
        { id: 'pending-dispatch', label: 'Pending Dispatch', path: '/dispatch/orders' },
        { id: 'new-dispatch', label: 'Create Dispatch', path: '/dispatch/create-dispatch' },
        { id: 'in-transit', label: 'In Transit', path: '/dispatch/in-transit' },
        { id: 'delivered', label: 'Delivered', path: '/dispatch/delivery' },
      ],
    },
    {
      id: 'sample-dispatch', label: 'Sample Dispatch', icon: FlaskConical, path: '/dispatch/sample-dispatch', group: 'Logistics',
      subItems: [
        { id: 'sample-pending', label: 'Pending Dispatch', path: '/dispatch/sample-dispatch?status=pending' },
        { id: 'sample-create', label: 'Create Sample Dispatch', path: '/dispatch/sample-dispatch/create/new' },
        { id: 'sample-transit', label: 'In Transit', path: '/dispatch/sample-dispatch?status=in-transit' },
        { id: 'sample-delivered', label: 'Delivered', path: '/dispatch/sample-dispatch?status=delivered' },
        { id: 'sample-all', label: 'All', path: '/dispatch/sample-dispatch?status=all' },
      ],
    },
    {
      id: 'replacements', label: 'Replacement Dispatch', icon: RefreshCw, path: '/dispatch/replacements', group: 'Logistics',
      subItems: [
        { id: 'replacement-pending', label: 'Pending Dispatch', path: '/dispatch/replacements?status=pending' },
        { id: 'replacement-transit', label: 'In Transit', path: '/dispatch/replacements?status=in-transit' },
        { id: 'replacement-delivered', label: 'Delivered', path: '/dispatch/replacements?status=delivered' },
      ],
    },
    {
      id: 'returns',
      label: 'Return Dispatch',
      icon: RotateCcw,
      path: '/dispatch/returns',
      group: 'Logistics',
      subItems: [
        { id: 'return-pending', label: 'Pending Dispatch', path: '/dispatch/returns?status=pending' },
        { id: 'return-transit', label: 'In Transit', path: '/dispatch/returns?status=in-transit' },
        { id: 'return-delivered', label: 'Delivered', path: '/dispatch/returns?status=delivered' },
      ],
    },
    { id: 'remaining', label: 'Remaining Dispatch', icon: ClipboardList, path: '/dispatch/remaining' },
    { id: 'history', label: 'Dispatch History', icon: Clock, path: '/dispatch/history' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/dispatch/profile' }
  ],

  'Dispatch 2': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dispatch-2/dashboard' },
    { id: 'finished-goods', label: 'Finished Goods', icon: PackageCheck, path: '/dispatch-2/finished-goods', group: 'Logistics' },
    {
      id: 'Sales-order dispatch',
      label: 'Create Dispatch',
      icon: Truck,
      path: '/dispatch-2/orders',
      group: 'Logistics',
      subItems: [
        { id: 'pending-dispatch', label: 'Pending Dispatch', path: '/dispatch-2/orders' },
        { id: 'new-dispatch', label: 'Create Dispatch', path: '/dispatch-2/create-dispatch' },
        { id: 'in-transit', label: 'In Transit', path: '/dispatch-2/in-transit' },
        { id: 'delivered', label: 'Delivered', path: '/dispatch-2/delivery' },
      ],
    },
    {
      id: 'sample-dispatch', label: 'Sample Dispatch', icon: FlaskConical, path: '/dispatch-2/sample-dispatch', group: 'Logistics',
      subItems: [
        { id: 'sample-pending', label: 'Pending Dispatch', path: '/dispatch-2/sample-dispatch?status=pending' },
        { id: 'sample-create', label: 'Create Sample Dispatch', path: '/dispatch-2/sample-dispatch/create/new' },
        { id: 'sample-transit', label: 'In Transit', path: '/dispatch-2/sample-dispatch?status=in-transit' },
        { id: 'sample-delivered', label: 'Delivered', path: '/dispatch-2/sample-dispatch?status=delivered' },
        { id: 'sample-all', label: 'All', path: '/dispatch-2/sample-dispatch?status=all' },
      ],
    },
    {
      id: 'replacements', label: 'Replacement Dispatch', icon: RefreshCw, path: '/dispatch-2/replacements', group: 'Logistics',
      subItems: [
        { id: 'replacement-pending', label: 'Pending Dispatch', path: '/dispatch-2/replacements?status=pending' },
        { id: 'replacement-transit', label: 'In Transit', path: '/dispatch-2/replacements?status=in-transit' },
        { id: 'replacement-delivered', label: 'Delivered', path: '/dispatch-2/replacements?status=delivered' },
      ],
    },
    {
      id: 'returns',
      label: 'Return Dispatch',
      icon: RotateCcw,
      path: '/dispatch-2/returns',
      group: 'Logistics',
      subItems: [
        { id: 'return-pending', label: 'Pending Dispatch', path: '/dispatch-2/returns?status=pending' },
        { id: 'return-transit', label: 'In Transit', path: '/dispatch-2/returns?status=in-transit' },
        { id: 'return-delivered', label: 'Delivered', path: '/dispatch-2/returns?status=delivered' },
      ],
    },
    { id: 'remaining', label: 'Remaining Dispatch', icon: ClipboardList, path: '/dispatch-2/remaining' },
    { id: 'history', label: 'Dispatch History', icon: Clock, path: '/dispatch-2/history' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/dispatch-2/profile' }
  ],

  'Finance Executive': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/finance-executive/dashboard' },
    { id: 'daily-tasks', label: 'Tasks', icon: ClipboardList, path: '/finance-executive/daily-tasks' },
    {
      id: 'payment-verification',
      label: 'Payment Verification',
      icon: BadgeCheck,
      path: '/finance-executive/payment-verification',
      subItems: [
        { id: 'payment-verification-queue', label: 'Payment Verification Queue', path: '/finance-executive/payment-verification' },
        { id: 'payment-receipts', label: 'Payment Receipts', path: '/finance-executive/receipts' },
        { id: 'outstanding-payments', label: 'Outstanding Payments', path: '/finance-executive/outstanding' },
        { id: 'customers', label: 'Customers', path: '/finance-executive/customers' },
      ],
    },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/finance-executive/reports' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/finance-executive/profile' }
  ],

  'Finance': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/finance/dashboard' },
    { id: 'daily-tasks', label: 'Daily Tasks', icon: ClipboardList, path: '/finance/daily-tasks' },
    { id: 'brand-analysis', label: 'Brand Analysis', icon: ClipboardCheck, path: '/finance/brand-analysis' },
    {
      id: 'payment-verification',
      label: 'Payment Verification',
      icon: BadgeCheck,
      path: '/finance/payment-verification',
      subItems: [
        { id: 'payment-verification', label: 'Payment Verification Queue', path: '/finance/payment-verification' },
        { id: 'payment-receipts', label: 'Payment Receipts', path: '/finance/receipts' },
        { id: 'outstanding-payments', label: 'Outstanding Payments', path: '/finance/outstanding' },
        { id: 'customers', label: 'Customers', path: '/finance/customers' }
      ]
    },
    {
      id: 'po-requests',
      label: 'PO Requests',
      icon: FileText,
      path: '/finance/po-requests',
      subItems: [
        { id: 'pending-requests', label: 'Pending Requests', path: '/finance/po-requests?tab=Pending Requests' },
        { id: 'create-po', label: 'Create PO', path: '/finance/po-requests?tab=Create PO' },
        { id: 'draft-pos', label: 'Draft POs', path: '/finance/po-requests?tab=Draft POs' },
        { id: 'pending-approval', label: 'Pending Approval', path: '/finance/po-requests?tab=Pending Approval' },
        { id: 'approved-pos', label: 'Approved POs', path: '/finance/po-requests?tab=Approved POs' },
        { id: 'delivery-audit', label: 'Delivery Audit', path: '/finance/po-requests?tab=Delivery Audit' },
        { id: 'closed-pos', label: 'Closed POs', path: '/finance/po-requests?tab=Closed POs' },
        { id: 'history', label: 'History', path: '/finance/po-requests?tab=History' }
      ]
    },
    { id: 'rejection-management', label: 'Material Rejections', icon: AlertTriangle, path: '/finance/rejection-management' },

    {
      id: 'salary',
      label: 'Salary & Payroll',
      icon: CreditCard,
      path: '/finance/salary/pending',
      subItems: [
        { id: 'pending-salary', label: 'Pending Salary Payments', path: '/finance/salary/pending' },
        { id: 'processing-salary', label: 'Processing', path: '/finance/salary/processing' },
        { id: 'paid-salary', label: 'Paid Salaries', path: '/finance/salary/paid' },
        { id: 'salary-history', label: 'Salary History', path: '/finance/salary/history' }
      ]
    },

    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/finance/reports' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/finance/profile' }
  ],

  'HR': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/hr/dashboard' },
    { id: 'users', label: 'User Management', icon: Users, path: '/hr/users' },
    { id: 'recruitment', label: 'Recruitment Requisitions', icon: UserPlus, path: '/hr/recruitment' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/hr/employees' },
    { id: 'register-staff', label: 'Register Staff', icon: UserPlus, path: '/hr/register-staff' },
    { id: 'attendance', label: 'Attendance & Clock', icon: Clock, path: '/hr/attendance' },
    { id: 'shifts', label: 'Shift Schedule', icon: ClipboardList, path: '/hr/shifts' },
    { id: 'leaves', label: 'Leave Workflows', icon: FileText, path: '/hr/leaves' },
    { id: 'exit-clearance', label: 'Exit Clearance', icon: PackageCheck, path: '/hr/exit-clearance' },
    {
      id: 'salary',
      label: 'Salary Management',
      icon: CreditCard,
      path: '/hr/salary/prepare',
      subItems: [
        { id: 'prepare-salary', label: 'Prepare Salary', path: '/hr/salary/prepare' },
        { id: 'salary-status', label: 'Salary Approval Status', path: '/hr/salary/status' },
        { id: 'salary-history', label: 'Salary History', path: '/hr/salary/history' }
      ]
    },
    { id: 'notifications', label: 'HR Notifications', icon: Bell, path: '/hr/notifications' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/hr/profile' },
    { id: 'expense-management', label: 'Expense Management', icon: CreditCard, path: '/hr/expense-management' },
    { id: 'leave-approvals', label: 'Leave Approvals', icon: Calendar, path: '/hr/leave-approvals' },
    { id: 'attendance-requests', label: 'Attendance Requests', icon: Clock, path: '/hr/attendance-requests' }
  ],

  'Super Admin': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/super-admin/dashboard' },

    { type: 'badge', label: 'APPROVALS' },
    { id: 'brand-analysis', label: 'Brand Analysis Requests', icon: ShieldCheck, path: '/super-admin/brand-analysis' },
    { id: 'purchase-indents', label: 'Purchase Order Approvals', icon: ClipboardCheck, path: '/super-admin/purchase-indents' },
    { id: 'salary-approval', label: 'Salary Approvals', icon: CreditCard, path: '/super-admin/salary-approval' },
    { id: 'customer-complaints', label: 'Customer Complaints', icon: MessageSquare, path: '/super-admin/customer-complaints' },

    { type: 'badge', label: 'BUSINESS MANAGEMENT' },
    { id: 'users', label: 'Users & Roles', icon: Users, path: '/super-admin/users' },
    { id: 'employees', label: 'Employees', icon: UserCheck, path: '/super-admin/employees' },
    { id: 'companies', label: 'Companies', icon: Building, path: '/super-admin/companies' },
    { id: 'sales-target', label: 'Sales Targets', icon: Target, path: '/super-admin/sales-target' },
    { id: 'production-target', label: 'Production Targets', icon: Target, path: '/super-admin/production-target' },

    { type: 'badge', label: 'MASTER DATA' },
    { id: 'products', label: 'Products', icon: Package, path: '/super-admin/products' },
    { id: 'categories', label: 'Categories', icon: Grid, path: '/super-admin/categories' },
        
    { type: 'badge', label: 'ANALYTICS & REPORTS' },
    { id: 'analytics-business', label: 'Business Analytics', icon: BarChart3, path: '/super-admin/analytics/business' },
    { id: 'analytics-sales', label: 'Sales Analytics', icon: TrendingUp, path: '/super-admin/analytics/sales' },
    { id: 'analytics-finance', label: 'Finance Analytics', icon: Landmark, path: '/super-admin/analytics/finance' },
    { id: 'analytics-production', label: 'Production Analytics', icon: Cpu, path: '/super-admin/analytics/production' },
    { id: 'analytics-inventory', label: 'Inventory Analytics', icon: Database, path: '/super-admin/analytics/inventory' },
    { id: 'analytics-hr', label: 'HR Analytics', icon: Users, path: '/super-admin/analytics/hr' },
    { id: 'analytics-dispatch', label: 'Dispatch Analytics', icon: Truck, path: '/super-admin/analytics/dispatch' },
    { id: 'analytics-profitability', label: 'Profitability Analytics', icon: DollarSign, path: '/super-admin/analytics/profitability' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/super-admin/reports' },
    { id: 'notifications', label: 'Notification Management', icon: Bell, path: '/super-admin/notifications' },
    { id: 'profile', label: 'My Profile', icon: UserCircle, path: '/super-admin/profile' },
    { id: 'expense-management', label: 'Expense Management', icon: CreditCard, path: '/super-admin/expense-management' },
    { id: 'leave-approvals', label: 'Leave Approvals', icon: Calendar, path: '/super-admin/leave-approvals' }
  ]
};
