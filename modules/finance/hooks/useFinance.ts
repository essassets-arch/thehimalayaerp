import { useState, useEffect } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';

export function useFinance() {
    const [financeOrders, setFinanceOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFinanceOrders = async () => {
        setLoading(true);
        try {
            const data = await orderRepository.getAll();
            const list = Array.isArray(data) ? data : [];
            const active = list.filter((o: any) =>
                o.workflowStatus === OrderStatus.DELIVERED ||
                o.workflowStatus === OrderStatus.INVOICE_PENDING ||
                o.workflowStatus === OrderStatus.INVOICED ||
                o.workflowStatus === OrderStatus.PAYMENT_PENDING
            );
            setFinanceOrders(active);
        } catch (err) {
            console.error('Failed to fetch finance orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFinanceOrders(); }, []);

    const createInvoice = async (orderId: string, invoiceData: any) => {
        try {
            await orderRepository.createInvoice(orderId, invoiceData);
            fetchFinanceOrders();
            return true;
        } catch (err) {
            console.error('Failed to create invoice', err);
            return false;
        }
    };

    const verifyPayment = async (orderId: string, paymentData: any) => {
        try {
            await orderRepository.verifyPayment(orderId, paymentData);
            fetchFinanceOrders();
            return true;
        } catch (err) {
            console.error('Failed to verify payment', err);
            return false;
        }
    };

    const closeOrder = async (orderId: string) => {
        try {
            await orderRepository.closeOrder(orderId);
            fetchFinanceOrders();
            return true;
        } catch (err) {
            console.error('Failed to close order', err);
            return false;
        }
    };

    return { financeOrders, loading, createInvoice, verifyPayment, closeOrder, refresh: fetchFinanceOrders };
}
