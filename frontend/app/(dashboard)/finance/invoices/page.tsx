'use client';

import React from 'react';
import { useFinance } from '../../../../modules/finance/hooks/useFinance';
import DataTable from '../../../../shared/components/DataTable';
import { OrderStatus } from '../../../../types/Order';

export default function FinanceInvoicesPage() {
    const { financeOrders, loading, createInvoice, verifyPayment, closeOrder } = useFinance();

    const handleInvoice = (order: any) => {
        createInvoice(order.id, { invoiceNumber: 'INV-' + Date.now(), amount: 150000 });
    };

    const handlePayment = (order: any) => {
        verifyPayment(order.id, { amount: 150000, transactionReference: 'UTR-123456789' });
    };
    
    const handleClose = (order: any) => {
        closeOrder(order.id);
    };

    const columns = [
        { header: 'Order No', accessorKey: 'id' },
        { header: 'Customer', accessorKey: 'customer.name' },
        { header: 'Invoice No', accessorKey: 'invoice.invoiceNumber' },
        { header: 'Status', accessorKey: 'workflowStatus' },
        { 
            header: 'Actions', 
            cell: (info: any) => {
                const order = info.row.original;
                return (
                    <div className="flex gap-2">
                        {(order.workflowStatus === OrderStatus.DELIVERED || order.workflowStatus === OrderStatus.INVOICE_PENDING) && (
                            <button onClick={() => handleInvoice(order)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                Generate Invoice
                            </button>
                        )}
                        {(order.workflowStatus === OrderStatus.INVOICED || order.workflowStatus === OrderStatus.PAYMENT_PENDING) && (
                            <button onClick={() => handlePayment(order)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                                Verify Payment
                            </button>
                        )}
                        {order.workflowStatus === OrderStatus.PAID && (
                            <button onClick={() => handleClose(order)} className="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-900 text-sm">
                                Close Order
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-slate-800">Finance & Invoicing</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-lg shadow border border-slate-200">
                    <DataTable data={financeOrders} columns={columns} />
                </div>
            )}
        </div>
    );
}

