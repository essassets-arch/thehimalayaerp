import { NextResponse } from 'next/server';
import { workflowService } from '../../../../../engine/services/workflow.service';

type ActionHandler = (id: string, body: any) => any;

const ACTION_MAP: Record<string, ActionHandler> = {
    'planning':          (id, body) => workflowService.approvePlanning(id, body),
    'machine':           (id, body) => workflowService.assignMachine(id, body),
    'production/start':  (id)       => workflowService.startProduction(id),
    'production/finish': (id, body) => workflowService.finishProduction(id, body),
    'qc/approve':        (id, body) => workflowService.approveQC(id, body),
    'qc/fail':           (id, body) => workflowService.failQC(id, body),
    'dispatch':          (id, body) => workflowService.createDispatch(id, body),
    'in-transit':        (id)       => workflowService.markInTransit(id),
    'deliver':           (id, body) => workflowService.markDelivered(id, body),
    'invoice':           (id, body) => workflowService.createInvoice(id, body),
    'payment':           (id, body) => workflowService.verifyPayment(id, body),
    'close':             (id)       => workflowService.closeOrder(id),
};

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string; action: string[] }> }
) {
    const { id, action } = await params;
    const body = await request.json().catch(() => ({}));
    const actionKey = Array.isArray(action) ? action.join('/') : action;
    const handler = ACTION_MAP[actionKey];

    if (!handler) {
        return NextResponse.json(
            { success: false, error: `Unknown action: ${actionKey}` },
            { status: 400 }
        );
    }

    try {
        const updatedOrder = handler(id, body);
        return NextResponse.json({ success: true, data: updatedOrder });
    } catch (err: any) {
        const isNotFound = err?.message && (err.message.toLowerCase().includes('not found') || err.message.toLowerCase().includes('no order'));
        const status = isNotFound ? 404 : 422;
        return NextResponse.json(
            { success: false, error: err.message, message: err.message },
            { status }
        );
    }
}
