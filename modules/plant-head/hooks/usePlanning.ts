import { useState, useEffect } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';

export function usePlanning() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderRepository.getAll();
            const list = Array.isArray(data) ? data : [];
            setOrders(list.filter((o: any) => o.workflowStatus === OrderStatus.PLANT_PENDING));
        } catch (err) {
            console.error('Failed to fetch planning orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    return { orders, loading, refresh: fetchOrders };
}
