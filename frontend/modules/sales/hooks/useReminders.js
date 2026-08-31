import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { useERP, useSalesBackend } from '../../../shared/context/ERPContext.jsx';
import { remindersService } from '../services/reminders.service.js';

const getErrorText = (err) => {
  if (!err) return 'Unknown error occurred';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    if (err.response?.data?.message) {
      const msg = err.response.data.message;
      return typeof msg === 'string' ? msg : JSON.stringify(msg);
    }
    if (err.message && typeof err.message === 'string') return err.message;
    if (err.message && typeof err.message === 'object') {
      return err.message.message || JSON.stringify(err.message);
    }
    if (err.error && typeof err.error === 'string') return err.error;
    if (Array.isArray(err.message)) return err.message.join(', ');
    try {
      const str = JSON.stringify(err);
      return str === '{}' ? 'An unexpected error occurred' : str;
    } catch {
      return 'An unexpected error occurred';
    }
  }
  return String(err);
};

export function useReminders(showToast) {
  const { state, syncData } = useERP();
  const salesBackend = useSalesBackend();
  const reminders = Array.isArray(state?.reminders) ? state.reminders : [];

  const triggerRefresh = useCallback(async () => {
    await syncData();
    if (salesBackend) {
      if (salesBackend.refreshLeads) salesBackend.refreshLeads().catch(() => {});
      if (salesBackend.refreshSamples) salesBackend.refreshSamples().catch(() => {});
      if (salesBackend.refreshQuotations) salesBackend.refreshQuotations().catch(() => {});
      if (salesBackend.refreshSalesOrders) salesBackend.refreshSalesOrders().catch(() => {});
    }
  }, [syncData, salesBackend]);

  const createReminder = useCallback(async (payload) => {
    const res = await remindersService.create(payload);
    if (res.success) {
      showToast?.('Reminder saved.');
      await triggerRefresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: getErrorText(res.error) });
    }
    return res;
  }, [showToast, triggerRefresh]);

  const updateReminder = useCallback(async (id, payload) => {
    const res = await remindersService.update(id, payload);
    if (res.success) {
      showToast?.('Reminder updated.');
      await triggerRefresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: getErrorText(res.error) });
    }
    return res;
  }, [showToast, triggerRefresh]);

  const completeReminder = useCallback(async (id) => {
    const res = await remindersService.complete(id);
    if (res.success) {
      showToast?.('Reminder marked complete.');
      await triggerRefresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: getErrorText(res.error) });
    }
    return res;
  }, [showToast, triggerRefresh]);

  const cancelReminder = useCallback(async (id) => {
    const res = await remindersService.cancel(id);
    if (res.success) {
      showToast?.('Reminder cancelled.');
      await triggerRefresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: getErrorText(res.error) });
    }
    return res;
  }, [showToast, triggerRefresh]);

  const dismissReminder = useCallback(async (id) => {
    const res = await remindersService.dismiss(id);
    if (res.success) {
      showToast?.('Reminder dismissed.');
      await triggerRefresh();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: getErrorText(res.error) });
    }
    return res;
  }, [showToast, triggerRefresh]);

  return {
    reminders,
    createReminder,
    updateReminder,
    completeReminder,
    cancelReminder,
    dismissReminder
  };
}
