import { useState, useEffect, useRef } from 'react';
import { orderRepository } from '../../orders/repository/order.repository';
import { OrderStatus } from '../../../types/Order';
import { useERPStore } from '../../../shared/context/ERPContext';
import { getProductionWorkOrders } from '../utils/getProductionWorkOrders';

export function useProductionWorkOrders() {
    const store: any = useERPStore();
    const state = store?.state;
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const hasLoadedRef = useRef(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const list: any[] = getProductionWorkOrders(state);
            setOrders(list);
        } catch (err) {
            console.error('Failed to fetch production work orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        fetchOrders();
    }, [state]);

    const startProduction = async (orderId: string) => {
        try {
            await orderRepository.startProduction(orderId);
            fetchOrders();
            return true;
        } catch (err) {
            console.error('Failed to start production', err);
            return false;
        }
    };

    return { orders, loading, startProduction, refresh: fetchOrders };
}
