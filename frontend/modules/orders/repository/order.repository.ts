import { client } from '../../../shared/api/client.js';

export const orderRepository = {
    getAll: () => client.get('/orders'),
    getById: (id: string) => client.get(`/orders/${id}`),

    // Plant Head
    approvePlanning: (id: string, data: any) => client.patch(`/orders/${id}/planning`, data),

    // Production
    assignMachine: (id: string, data: any) => client.patch(`/orders/${id}/machine`, data),
    startProduction: (id: string) => client.patch(`/orders/${id}/production/start`),
    finishProduction: (id: string, data: any) => client.patch(`/orders/${id}/production/finish`, data),

    // QC
    approveQC: (id: string, data: any) => client.patch(`/orders/${id}/qc/approve`, data),
    failQC: (id: string, data: any) => client.patch(`/orders/${id}/qc/fail`, data),

    // Dispatch
    createDispatch: (id: string, data: any) => client.patch(`/orders/${id}/dispatch`, data),
    markInTransit: (id: string) => client.patch(`/orders/${id}/in-transit`),
    markDelivered: (id: string, data: any) => client.patch(`/orders/${id}/deliver`, data),

    // Finance
    createInvoice: (id: string, data: any) => client.patch(`/orders/${id}/invoice`, data),
    verifyPayment: (id: string, data: any) => client.patch(`/orders/${id}/payment`, data),
    closeOrder: (id: string) => client.patch(`/orders/${id}/close`),
};

