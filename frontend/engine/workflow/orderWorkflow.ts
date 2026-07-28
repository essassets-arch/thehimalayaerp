import { OrderStatus, Order } from '../../types/Order';

export interface WorkflowTransition {
    from: OrderStatus;
    to: OrderStatus;
    action: string;
    allowedRoles: string[];
    timelineEvent: string;
    audit: boolean;
}

export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
    { from: OrderStatus.LEAD, to: OrderStatus.SAMPLE, action: 'Request Sample', allowedRoles: ['Sales Executive'], timelineEvent: 'Sample Requested', audit: true },
    { from: OrderStatus.LEAD, to: OrderStatus.QUOTATION, action: 'Convert to Quotation', allowedRoles: ['Sales Executive'], timelineEvent: 'Converted to Quotation', audit: true },
    { from: OrderStatus.SAMPLE, to: OrderStatus.QUOTATION, action: 'Convert to Quotation', allowedRoles: ['Sales Executive'], timelineEvent: 'Converted to Quotation', audit: true },
    { from: OrderStatus.QUOTATION, to: OrderStatus.SALES_ORDER, action: 'Convert to Order', allowedRoles: ['Sales Executive', 'Sales Manager'], timelineEvent: 'Order Created', audit: true },
    
    // Plant Head
    { from: OrderStatus.SALES_ORDER, to: OrderStatus.PLANT_PENDING, action: 'Confirm Order', allowedRoles: ['Sales Executive'], timelineEvent: 'Order Confirmed, Sent to Plant', audit: true },
    { from: OrderStatus.PLANT_PENDING, to: OrderStatus.WORK_ORDER_CREATED, action: 'Approve Planning', allowedRoles: ['Plant Head'], timelineEvent: 'Production Scheduled', audit: true },
    
    // Production
    { from: OrderStatus.WORK_ORDER_CREATED, to: OrderStatus.PRODUCTION_PLANNED, action: 'Assign Machine', allowedRoles: ['Plant Head', 'Production Lead'], timelineEvent: 'Machine Assigned', audit: true },
    { from: OrderStatus.PRODUCTION_PLANNED, to: OrderStatus.IN_PRODUCTION, action: 'Start Production', allowedRoles: ['Production Lead', 'Floor Operator'], timelineEvent: 'Production Started', audit: true },
    { from: OrderStatus.IN_PRODUCTION, to: OrderStatus.PRODUCTION_COMPLETED, action: 'Complete Production', allowedRoles: ['Floor Operator'], timelineEvent: 'Production Completed', audit: true },
    
    // QC
    { from: OrderStatus.PRODUCTION_COMPLETED, to: OrderStatus.QC_PENDING, action: 'Send to QC', allowedRoles: ['Production Lead'], timelineEvent: 'Sent for Quality Check', audit: true },
    { from: OrderStatus.QC_PENDING, to: OrderStatus.QC_APPROVED, action: 'Approve QC', allowedRoles: ['QC Inspector'], timelineEvent: 'Quality Approved', audit: true },
    { from: OrderStatus.QC_PENDING, to: OrderStatus.QC_FAILED, action: 'Fail QC', allowedRoles: ['QC Inspector'], timelineEvent: 'Quality Failed (Rework Required)', audit: true },
    { from: OrderStatus.QC_FAILED, to: OrderStatus.WORK_ORDER_CREATED, action: 'Rework Order', allowedRoles: ['Plant Head', 'Production Lead'], timelineEvent: 'Rework Scheduled', audit: true },
    
    // Dispatch
    { from: OrderStatus.QC_APPROVED, to: OrderStatus.DISPATCH_PENDING, action: 'Queue for Dispatch', allowedRoles: ['QC Inspector', 'Dispatcher'], timelineEvent: 'Queued for Dispatch', audit: true },
    { from: OrderStatus.DISPATCH_PENDING, to: OrderStatus.IN_TRANSIT, action: 'Dispatch Vehicle', allowedRoles: ['Dispatcher', 'Plant Head'], timelineEvent: 'In Transit', audit: true },
    { from: OrderStatus.IN_TRANSIT, to: OrderStatus.DELIVERED, action: 'Confirm Delivery', allowedRoles: ['Dispatcher'], timelineEvent: 'Delivered to Customer', audit: true },
    
    // Invoicing & Payment
    { from: OrderStatus.DELIVERED, to: OrderStatus.INVOICED, action: 'Auto Generate Invoice', allowedRoles: ['Dispatcher', 'Finance Executive', 'System'], timelineEvent: 'Invoice Generated Automatically', audit: true },
    { from: OrderStatus.INVOICED, to: OrderStatus.PAYMENT_PENDING, action: 'Record Payment', allowedRoles: ['Sales Executive', 'Sales Manager', 'System'], timelineEvent: 'Payment Details Recorded', audit: true },
    { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.PAID, action: 'Verify Payment', allowedRoles: ['Finance Executive', 'Finance Manager', 'System'], timelineEvent: 'Payment Verified', audit: true },
    { from: OrderStatus.PAID, to: OrderStatus.CLOSED, action: 'Close Order', allowedRoles: ['Finance Lead', 'System'], timelineEvent: 'Order Closed Automatically', audit: true }
];

export function getTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): WorkflowTransition | undefined {
    return WORKFLOW_TRANSITIONS.find(t => t.from === currentStatus && t.to === nextStatus);
}

export function canTransition(currentStatus: OrderStatus, nextStatus: OrderStatus, userRole?: string): boolean {
    const transition = getTransition(currentStatus, nextStatus);
    if (!transition) return false;
    if (userRole && !transition.allowedRoles.includes(userRole)) return false;
    return true;
}

export function moveOrderToNextStage(order: any, nextStatus: OrderStatus, userRole?: string, userRef?: string): any {
    const transition = getTransition(order.workflowStatus, nextStatus);
    
    if (!transition) {
        throw new Error(`Invalid transition from ${order.workflowStatus} to ${nextStatus}`);
    }
    
    if (userRole && !transition.allowedRoles.includes(userRole)) {
        throw new Error(`Role ${userRole} is not authorized to transition from ${order.workflowStatus} to ${nextStatus}`);
    }
    
    // Append to timeline history
    const timelineEvent = {
        id: `EVT-${Date.now()}`,
        status: nextStatus,
        event: transition.timelineEvent,
        action: transition.action,
        timestamp: new Date().toISOString(),
        actor: userRef || 'System'
    };
    
    const newHistory = order.history ? [...order.history, timelineEvent] : [timelineEvent];
    
    return {
        ...order,
        workflowStatus: nextStatus,
        history: newHistory,
        updatedAt: new Date().toISOString()
    };
}
