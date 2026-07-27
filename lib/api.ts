import { delay } from "./delay";
import { mockLeads, mockQuotations, mockOrders, mockCustomers, mockNotifications } from "./mockData";

const LATENCY = 500;

export const api = {
  sales: {
    getLeads: async () => {
      await delay(LATENCY);
      return [...mockLeads];
    },
    getQuotations: async () => {
      await delay(LATENCY);
      return [...mockQuotations];
    },
    getOrders: async () => {
      await delay(LATENCY);
      return [...mockOrders];
    },
    getCustomers: async () => {
      await delay(LATENCY);
      return [...mockCustomers];
    }
  },
  notifications: {
    getNotifications: async () => {
      await delay(LATENCY);
      return [...mockNotifications];
    }
  }
};
