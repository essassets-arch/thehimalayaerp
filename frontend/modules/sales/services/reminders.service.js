import { remindersRepository } from '../api/reminders.repository.js';
import { ERPSuccess, ERPError } from '../../../engine/utils/errors.js';

export const remindersService = {
  list: async (params = {}) => {
    try {
      const data = await remindersRepository.getAll(params);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'LIST_ERROR');
    }
  },

  create: async (payload) => {
    try {
      const data = await remindersRepository.create(payload);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'CREATE_ERROR');
    }
  },

  update: async (id, payload) => {
    try {
      const data = await remindersRepository.update(id, payload);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'UPDATE_ERROR');
    }
  },

  complete: async (id) => {
    try {
      const data = await remindersRepository.complete(id);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'COMPLETE_ERROR');
    }
  },

  dismiss: async (id) => {
    try {
      const data = await remindersRepository.dismiss(id);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'DISMISS_ERROR');
    }
  },

  cancel: async (id) => {
    try {
      const data = await remindersRepository.cancel(id);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'CANCEL_ERROR');
    }
  },

  getDaily: async (params = {}) => {
    try {
      const data = await remindersRepository.getDaily(params);
      return ERPSuccess(data);
    } catch (err) {
      return ERPError(err.message, 'GET_DAILY_ERROR');
    }
  }
};
