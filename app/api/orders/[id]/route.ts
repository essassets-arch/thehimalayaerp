import { NextResponse } from 'next/server';
import { INITIAL_ERP_STATE } from '../../../../engine/database';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = (INITIAL_ERP_STATE.orders as any[]).find(o => o.id === id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const idx = (INITIAL_ERP_STATE.orders as any[]).findIndex(o => o.id === id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    const updated = { ...(INITIAL_ERP_STATE.orders as any[])[idx], ...body, updatedAt: new Date().toISOString() };
    (INITIAL_ERP_STATE.orders as any[])[idx] = updated;
    return NextResponse.json({ success: true, data: updated });
}
