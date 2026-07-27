import { orderReducer } from './orderReducer';
import { inventoryReducer } from './inventoryReducer';
import { financeReducer } from './financeReducer';
import { generalReducer } from './generalReducer';

export const rootReducer = (state, action) => {
  // LOAD_STATE replaces the entire state — skip all sub-reducers
  if (action.type === 'LOAD_STATE') {
    return action.payload;
  }
  let newState = orderReducer(state, action);
  newState = inventoryReducer(newState, action);
  newState = financeReducer(newState, action);
  newState = generalReducer(newState, action);
  return newState;
};
