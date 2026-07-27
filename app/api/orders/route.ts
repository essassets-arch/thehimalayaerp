import { NextResponse } from 'next/server';
import { INITIAL_ERP_STATE } from '../../../engine/database';

export async function GET() {
    return NextResponse.json({ success: true, data: INITIAL_ERP_STATE.orders });
}

export async function POST(request: Request) {
    const body = await request.json();
    const newOrder = {
        ...body,
        id: body.id || `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: body.history || [],
    };
    (INITIAL_ERP_STATE.orders as any[]).push(newOrder);
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
}
