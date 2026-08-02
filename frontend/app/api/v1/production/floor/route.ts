import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Since this is a prototype, we return mock production floor data
    // In a real app, you would use verifyAuth from '@/lib/auth'
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      console.warn('No authorization header found, but returning mock data for prototype.');
    }
    
    // Return mock data for the dashboard
    const data = [
      {
        id: '1',
        workOrderNumber: 'WO-1001',
        quantity: 50,
        productionStatus: 'IN_PRODUCTION',
        reworkCount: 0,
        productionStartTime: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        workOrderNumber: 'WO-1002',
        quantity: 120,
        productionStatus: 'REWORK_IN_PROGRESS',
        reworkCount: 1,
        productionStartTime: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
