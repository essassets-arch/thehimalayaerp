import { useState, useEffect } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';

export function useActiveProduction() {
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActiveOrders = async () => {
        setLoading(true);
        try {
            const data = await orderRepository.getAll();
            const list = Array.isArray(data) ? data : [];
            setActiveOrders(list.filter((o: any) => o.workflowStatus === OrderStatus.IN_PRODUCTION));
        } catch (err) {
            console.error('Failed to fetch active production orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActiveOrders(); }, []);

    const finishProduction = async (orderId: string, outputData: any) => {
        try {
            await orderRepository.finishProduction(orderId, outputData);
            fetchActiveOrders();
            return true;
        } catch (err) {
            console.error('Failed to finish production', err);
            return false;
        }
    };

    return { activeOrders, loading, finishProduction, refresh: fetchActiveOrders };
}
