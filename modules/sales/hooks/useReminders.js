import { useCallback } from 'react';
import Swal from 'sweetalert2';
import { useERP } from '../../../shared/context/ERPContext.jsx';
import { remindersService } from '../services/reminders.service.js';

export function useReminders(showToast) {
  const { state, syncData } = useERP();
  const reminders = Array.isArray(state?.reminders) ? state.reminders : [];

  const createReminder = useCallback(async (payload) => {
    const res = await remindersService.create(payload);
    if (res.success) {
      showToast?.('Reminder saved.');
      await syncData();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
    }
    return res;
  }, [showToast, syncData]);

  const updateReminder = useCallback(async (id, payload) => {
    const res = await remindersService.update(id, payload);
    if (res.success) {
      showToast?.('Reminder updated.');
      await syncData();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
    }
    return res;
  }, [showToast, syncData]);

  const completeReminder = useCallback(async (id) => {
    const res = await remindersService.complete(id);
    if (res.success) {
      showToast?.('Reminder marked complete.');
      await syncData();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
    }
    return res;
  }, [showToast, syncData]);

  const cancelReminder = useCallback(async (id) => {
    const res = await remindersService.cancel(id);
    if (res.success) {
      showToast?.('Reminder cancelled.');
      await syncData();
    } else {
      Swal.fire({ icon: 'error', title: 'Error', text: res.error?.message || res.error });
    }
    return res;
  }, [showToast, syncData]);

  return {
    reminders,
    createReminder,
    updateReminder,
    completeReminder,
    cancelReminder
  };
}
