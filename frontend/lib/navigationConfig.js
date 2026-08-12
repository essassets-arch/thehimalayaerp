import {
  LayoutGrid, Users, FlaskConical, FileText, Box, Boxes, Wrench, Truck, CreditCard,
  UserCheck, BarChart3, FileCheck, Layers, ShieldAlert, ClipboardList, PackageCheck,
  UserPlus, Clock, Bell, ClipboardCheck, AlertTriangle, RefreshCw, Package, Shield,
  Settings, Receipt, TrendingUp, Target, DollarSign, Percent, Calendar, Cpu, Activity,
  CheckCircle, XCircle, Database, ArrowRightLeft, ArrowLeftRight, ArrowDownUp, ShoppingCart,
  ListTodo, FileSignature, Car, UserCircle, Map, MapPin, History, Navigation, ArrowDownLeft,
  ArrowUpRight, BookOpen, Wallet, Building, Book, Notebook, Library, Scale, Landmark,
  Calculator, ShoppingBag, CalendarOff, Award, Files, MessageSquare, BellRing, Hash, Ruler, Grid,
  DatabaseBackup, RotateCcw, Key, Monitor, Server, ActivitySquare, Terminal, Eye, Navigation2
} from 'lucide-react';

export const navigationConfig = {
  'Sales': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/sales/dashboard' },
    { id: 'daily-task', label: 'Daily Tasks', icon: ClipboardList, path: '/sales/daily-task' },
    { id: 'leads', label: 'Leads', icon: Users, path: '/sales/leads' },
    { id: 'samples', label: 'Sample Management', icon: FlaskConical, path: '/sales/samples' },
    { id: 'quotations', label: 'Quotations', icon: FileText, path: '/sales/quotations' },
    { id: 'orders', label: 'Orders', icon: Box, path: '/sales/orders' },
    { id: 'production-status', label: 'Production Status', icon: Wrench, path: '/sales/production-status' },
    { id: 'payment-followup', label: 'Payment Follow-up', icon: CreditCard, path: '/sales/payment-followup' },
    { id: 'customers', label: 'Customers', icon: UserCheck, path: '/sales/customers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/sales/reports' }
  ],
  'Production': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/production/dashboard' },
    { id: 'work-orders', label: 'Work Orders', icon: ClipboardList, path: '/production/work-orders' },
    { id: 'incoming-orders', label: 'Incoming Orders', icon: Box, path: '/production/incoming-orders' },
    { id: 'material-requests', label: 'Material Requests', icon: Layers, path: '/production/material-requests' },
    { id: 'store-releases', label: 'Store Releases', icon: PackageCheck, path: '/production/store-releases' },
    { id: 'production-work', label: 'Production Floor', icon: Wrench, path: '/production/production-work' },
    { id: 'completed', label: 'Completed', icon: ClipboardCheck, path: '/production/completed' },
    { id: 'rework', label: 'QC Failed & Reprod.', icon: RefreshCw, path: '/production/rework' },
    { id: 'testing', label: 'Testing', icon: ClipboardCheck, path: '/production/testing' },
    { id: 'all-stock', label: 'All Stock', icon: Boxes, path: '/production/all-stock' },
    { id: 'finished-goods', label: 'Finished Goods', icon: Package, path: '/production/finished-goods' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/production/reports' }
  ],
  'Plant Head': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/plant-head/dashboard' },
    { id: 'products', label: 'Products', icon: Package, path: '/plant-head/products' },
    { id: 'categories', label: 'Categories', icon: Grid, path: '/plant-head/categories' },
    { id: 'incoming-orders', label: 'Incoming Orders', icon: Box, path: '/plant-head/incoming-orders' },
    { id: 'planning', label: 'Planning Board', icon: Wrench, path: '/plant-head/planning' },
    { id: 'material-approvals', label: 'Material Approvals', icon: FileCheck, path: '/plant-head/material-approvals' },
    { id: 'indent-approvals', label: 'Indent Approvals', icon: CheckCircle, path: '/plant-head/indent-approvals' },
    { id: 'replacements', label: 'Replacement Requests', icon: RefreshCw, path: '/plant-head/replacements' },
    {
      id: 'analytics-and-reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      path: '/plant-head/production-analytics',
      subItems: [
        { id: 'production-analytics', label: 'Production Analytics', path: '/plant-head/production-analytics' },
        { id: 'dispatch-analytics', label: 'Dispatch Analytics', path: '/plant-head/dispatch-analytics' },
        { id: 'material-analytics', label: 'Store Analytics', path: '/plant-head/material-analytics' },
        { id: 'executive-reports', label: 'Executive Reports', path: '/plant-head/executive-reports' }
      ]
    },
    { id: 'raw-inventory', label: 'Raw Inventory', icon: Layers, path: '/plant-head/raw-inventory' },
    { id: 'finished-goods', label: 'Finished Goods Inventory', icon: PackageCheck, path: '/plant-head/finished-goods' },
    { id: 'qc-failures', label: 'QC Failures', icon: ShieldAlert, path: '/plant-head/qc-failures' },
    { id: 'testing', label: 'Production Testing', icon: ClipboardCheck, path: '/plant-head/testing' }
  ],
  'Store': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/store/dashboard' },
    { id: 'raw-inventory', label: 'Raw Inventory', icon: Layers, path: '/store/raw-inventory' },
    { id: 'material-requests', label: 'Material Requests', icon: ClipboardList, path: '/store/material-requests' },
    { id: 'store-releases', label: 'Store Releases', icon: PackageCheck, path: '/store/store-releases' },
    { id: 'low-stock-alerts', label: 'Low Stock Alerts', icon: AlertTriangle, path: '/store/low-stock-alerts' },
    { id: 'purchase', label: 'Purchase', icon: FileText, path: '/store/purchase' }
  ],
  'QC': [
    { id: 'dashboard', label: 'QC Dashboard', icon: LayoutGrid, path: '/qc/dashboard' },
    { id: 'pending', label: 'Pending Inspections', icon: Clock, path: '/qc/pending' },
    { id: 'completed', label: 'Inspected History', icon: ClipboardList, path: '/qc/history' }
  ],
  'Dispatch': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/dispatch/dashboard' },
    { id: 'finished-goods', label: 'Finished Goods', icon: PackageCheck, path: '/dispatch/finished-goods' },
    {
      id: 'create-dispatch',
      label: 'Create Dispatch',
      icon: Truck,
      path: '/dispatch/orders',
      subItems: [
        { id: 'pending-dispatch', label: 'Pending Dispatch', path: '/dispatch/orders' },
        { id: 'new-dispatch', label: 'Create Dispatch', path: '/dispatch/create-dispatch' },
        { id: 'in-transit', label: 'In Transit', path: '/dispatch/in-transit' },
        { id: 'delivered', label: 'Delivered', path: '/dispatch/delivery' },
      ],
    },
    {
      id: 'sample-dispatch', label: 'Sample Dispatch', icon: FlaskConical, path: '/dispatch/sample-dispatch',
      subItems: [
        { id: 'sample-pending', label: 'Pending Dispatch', path: '/dispatch/sample-dispatch?status=pending' },
        { id: 'sample-transit', label: 'In Transit', path: '/dispatch/sample-dispatch?status=in-transit' },
        { id: 'sample-delivered', label: 'Delivered', path: '/dispatch/sample-dispatch?status=delivered' },
        { id: 'sample-all', label: 'All', path: '/dispatch/sample-dispatch?status=all' },
      ],
    },
    {
      id: 'replacements', label: 'Replacement Dispatch', icon: RefreshCw, path: '/dispatch/replacements',
      subItems: [
        { id: 'replacement-pending', label: 'Pending Dispatch', path: '/dispatch/replacements?status=pending' },
        { id: 'replacement-transit', label: 'In Transit', path: '/dispatch/replacements?status=in-transit' },
        { id: 'replacement-delivered', label: 'Delivered', path: '/dispatch/replacements?status=delivered' },
        { id: 'replacement-all', label: 'All', path: '/dispatch/replacements?status=all' },
      ],
    },
    { id: 'remaining', label: 'Remaining Dispatch', icon: ClipboardList, path: '/dispatch/remaining' },
    { id: 'history', label: 'Dispatch History', icon: Clock, path: '/dispatch/history' }
  ],
  'Finance': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/finance/dashboard' },
    { id: 'salary-verification', label: 'Salary Verification', icon: FileCheck, path: '/finance/salary-verification' },
    { id: 'salary-disbursement', label: 'Salary Disbursement', icon: CreditCard, path: '/finance/salary-disbursement' },
    { id: 'salary-history', label: 'Salary History', icon: History, path: '/finance/salary-history' },
    { id: 'daily-tasks', label: 'Daily Tasks', icon: ClipboardList, path: '/finance/daily-tasks' },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/finance/payment-verification',
      subItems: [
        { id: 'payment-verification', label: 'Payment Verification', path: '/finance/payment-verification' },
        { id: 'payment-receipts', label: 'Payment Receipts', path: '/finance/receipts' },
        { id: 'outstanding-payments', label: 'Outstanding Payments', path: '/finance/outstanding' },
        { id: 'customers', label: 'Customers', path: '/finance/customers' }
      ]
    },
    {
      id: 'procurement',
      label: 'Procurement (PO)',
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

    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/finance/reports' }
  ],
  'finance-lead': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/finance/dashboard' },
    { id: 'daily-tasks', label: 'Daily Tasks', icon: ClipboardList, path: '/finance/daily-tasks' },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      path: '/finance/payment-verification',
      subItems: [
        { id: 'payment-verification', label: 'Payment Verification', path: '/finance/payment-verification' },
        { id: 'payment-receipts', label: 'Payment Receipts', path: '/finance/receipts' },
        { id: 'outstanding-payments', label: 'Outstanding Payments', path: '/finance/outstanding' },
        { id: 'customers', label: 'Customers', path: '/finance/customers' }
      ]
    },
    {
      id: 'procurement',
      label: 'Procurement (PO)',
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

    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/finance/reports' }
  ],
  'HR': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/hr/dashboard' },
    { id: 'employees', label: 'Employees', icon: Users, path: '/hr/employees' },
    { id: 'register-staff', label: 'Register Staff', icon: UserPlus, path: '/hr/register-staff' },
    { id: 'attendance', label: 'Attendance & Clock', icon: Clock, path: '/hr/attendance' },
    { id: 'shifts', label: 'Shift Schedule', icon: ClipboardList, path: '/hr/shifts' },
    { id: 'leaves', label: 'Leave Workflows', icon: FileText, path: '/hr/leaves' },
    { id: 'exit-clearance', label: 'Exit Clearance', icon: PackageCheck, path: '/hr/exit-clearance' },
    { id: 'salary-structure', label: 'Salary Structure', icon: Calculator, path: '/hr/salary-structure' },
    { id: 'payroll', label: 'Prepare Salary', icon: CreditCard, path: '/hr/salary/prepare' },
    { id: 'payslips', label: 'Payslips', icon: Receipt, path: '/hr/salary/payslips' },
    { id: 'payroll-history', label: 'Payroll History', icon: History, path: '/hr/salary/history' },
    { id: 'notifications', label: 'HR Notifications', icon: Bell, path: '/hr/notifications' }
  ],
  'Settings Admin': [
    { id: 'profile', label: 'Company Profile', icon: Building, path: '/settings-admin/profile' },
    { id: 'branches', label: 'Branches', icon: MapPin, path: '/settings-admin/branches' },
    { id: 'tax', label: 'Tax Settings', icon: Calculator, path: '/settings-admin/tax' },
    { id: 'gst', label: 'GST', icon: Percent, path: '/settings-admin/gst' },
    { id: 'fy', label: 'Financial Year', icon: Calendar, path: '/settings-admin/fy' },
    { id: 'email', label: 'Email Settings', icon: MessageSquare, path: '/settings-admin/email' },
    { id: 'sms', label: 'SMS Settings', icon: MessageSquare, path: '/settings-admin/sms' },
    { id: 'notifications', label: 'Notification Templates', icon: BellRing, path: '/settings-admin/notifications' },
    { id: 'workflow', label: 'Workflow Configuration', icon: Activity, path: '/settings-admin/workflow' },
    { id: 'approval', label: 'Approval Matrix', icon: CheckCircle, path: '/settings-admin/approval' },
    { id: 'number-series', label: 'Number Series', icon: Hash, path: '/settings-admin/number-series' },
    { id: 'units', label: 'Units', icon: Ruler, path: '/settings-admin/units' },
    { id: 'categories', label: 'Categories', icon: Grid, path: '/settings-admin/categories' },
    { id: 'product-types', label: 'Product Types', icon: Package, path: '/settings-admin/product-types' },
    { id: 'backup', label: 'Backup', icon: DatabaseBackup, path: '/settings-admin/backup' },
    { id: 'restore', label: 'Restore', icon: RotateCcw, path: '/settings-admin/restore' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/settings-admin/reports' }
  ],
  'Admin': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'roles', label: 'Roles', icon: Shield, path: '/admin/roles' },
    { id: 'permissions', label: 'Permissions', icon: Key, path: '/admin/permissions' },
    { id: 'departments', label: 'Departments', icon: Building, path: '/admin/departments' },
    { id: 'audit', label: 'Audit Logs', icon: ClipboardList, path: '/admin/audit' },
    { id: 'activity', label: 'Activity Logs', icon: Activity, path: '/admin/activity' },
    { id: 'login-history', label: 'Login History', icon: History, path: '/admin/login-history' },
    { id: 'error-logs', label: 'Error Logs', icon: AlertTriangle, path: '/admin/error-logs' },
    { id: 'api-monitor', label: 'API Monitor', icon: Monitor, path: '/admin/api-monitor' },
    { id: 'sessions', label: 'Session Manager', icon: Clock, path: '/admin/sessions' },
    { id: 'db-health', label: 'Database Health', icon: Server, path: '/admin/db-health' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' }
  ],
  'Super Admin': [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, path: '/super-admin/dashboard' },
    { id: 'salary-approvals', label: 'Salary Approvals', icon: CreditCard, path: '/super-admin/salary-approvals' },
    { id: 'workflow', label: 'Workflow Monitor', icon: Activity, path: '/super-admin/workflow' },
    { id: 'users', label: 'Users', icon: Users, path: '/super-admin/users' },
    { id: 'employees', label: 'Employees', icon: UserCheck, path: '/super-admin/employees' },
    { id: 'companies', label: 'Companies', icon: Building, path: '/super-admin/companies' },
    { id: 'sales-target', label: 'Sales Targets', icon: Target, path: '/super-admin/sales-target' },
    { id: 'production-target', label: 'Production Targets', icon: Target, path: '/super-admin/production-target' },
    { id: 'products', label: 'Products', icon: Package, path: '/super-admin/products' },
    { id: 'categories', label: 'Categories', icon: Grid, path: '/super-admin/categories' },
            { id: 'analytics-business', label: 'Business Analytics', icon: BarChart3, path: '/super-admin/analytics/business' },
    { id: 'analytics-sales', label: 'Sales Analytics', icon: TrendingUp, path: '/super-admin/analytics/sales' },
    { id: 'analytics-finance', label: 'Finance Analytics', icon: Landmark, path: '/super-admin/analytics/finance' },
    { id: 'analytics-production', label: 'Production Analytics', icon: Cpu, path: '/super-admin/analytics/production' },
    { id: 'analytics-hr', label: 'HR Analytics', icon: Users, path: '/super-admin/analytics/hr' },
    { id: 'analytics-dispatch', label: 'Dispatch Analytics', icon: Truck, path: '/super-admin/analytics/dispatch' },
    { id: 'analytics-workflow', label: 'Workflow Analytics', icon: Activity, path: '/super-admin/analytics/workflow' },
    { id: 'health', label: 'System Health', icon: Server, path: '/super-admin/health' },
    { id: 'debug', label: 'Debug Console', icon: Terminal, path: '/super-admin/debug' },
    { id: 'events', label: 'Domain Events', icon: ActivitySquare, path: '/super-admin/events' },
    { id: 'outbox', label: 'Outbox Monitor', icon: Box, path: '/super-admin/outbox' },
    { id: 'trace', label: 'Trace Route', icon: Navigation2, path: '/super-admin/trace' },
    { id: 'db-monitor', label: 'Database Monitor', icon: Database, path: '/super-admin/db-monitor' },
    { id: 'redis', label: 'Redis Monitor', icon: Database, path: '/super-admin/redis' },
    { id: 'queue', label: 'Queue Monitor', icon: ListTodo, path: '/super-admin/queue' },
    { id: 'cache', label: 'Cache Monitor', icon: Layers, path: '/super-admin/cache' },
    { id: 'scheduler', label: 'Scheduler Monitor', icon: Clock, path: '/super-admin/scheduler' },
    { id: 'logs', label: 'Logs', icon: FileText, path: '/super-admin/logs' },
    { id: 'backups', label: 'Backups', icon: DatabaseBackup, path: '/super-admin/backups' },
    { id: 'restore', label: 'Restore', icon: RotateCcw, path: '/super-admin/restore' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/super-admin/settings' },
    { id: 'license', label: 'License', icon: FileCheck, path: '/super-admin/license' },
    { id: 'api-keys', label: 'API Keys', icon: Key, path: '/super-admin/api-keys' },
    { id: 'dev-tools', label: 'Developer Tools', icon: Wrench, path: '/super-admin/dev-tools' },
    { id: 'environment', label: 'Environment', icon: Server, path: '/super-admin/environment' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/super-admin/reports' },
    { id: 'notifications', label: 'Notification Management', icon: Bell, path: '/super-admin/notifications' }
  ]
};
