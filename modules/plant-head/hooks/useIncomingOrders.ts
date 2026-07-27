import { useState, useEffect } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';

export function useIncomingOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderRepository.getAll();
            // interceptor unwraps envelope — data is the array directly
            const list = Array.isArray(data) ? data : [];
            const pending = list.filter((o: any) => 
                o.workflowStatus === OrderStatus.SALES_ORDER || 
                o.workflowStatus === OrderStatus.PLANT_PENDING
            );
            setOrders(pending);
        } catch (err) {
            console.error('Failed to fetch incoming orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const approvePlanning = async (orderId: string, scheduleData: any) => {
        try {
            await orderRepository.approvePlanning(orderId, scheduleData);
            fetchOrders();
            return true;
        } catch (err) {
            console.error('Failed to approve planning', err);
            return false;
        }
    };

    return { orders, loading, approvePlanning, refresh: fetchOrders };
}
