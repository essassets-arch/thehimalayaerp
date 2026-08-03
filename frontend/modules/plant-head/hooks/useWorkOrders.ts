import { useState, useEffect } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';

export function useWorkOrders() {
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWorkOrders = async () => {
        setLoading(true);
        try {
            const data = await orderRepository.getAll();
            const list = Array.isArray(data) ? data : [];
            setWorkOrders(list.filter((o: any) =>
                o.workflowStatus === OrderStatus.WORK_ORDER_CREATED ||
                o.workflowStatus === OrderStatus.PRODUCTION_PLANNED ||
                o.workflowStatus === OrderStatus.IN_PRODUCTION ||
                o.workflowStatus === OrderStatus.QC_FAILED
            ));
        } catch (err) {
            console.error('Failed to fetch work orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWorkOrders(); }, []);

    const assignMachine = async (orderId: string, machineData: any) => {
        try {
            await orderRepository.assignMachine(orderId, machineData);
            fetchWorkOrders();
            return true;
        } catch (err) {
            console.error('Failed to assign machine', err);
            return false;
        }
    };

    return { workOrders, loading, assignMachine, refresh: fetchWorkOrders };
}
