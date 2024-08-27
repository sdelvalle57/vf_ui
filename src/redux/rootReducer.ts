// rootReducer.ts
import { combineReducers } from '@reduxjs/toolkit';
// Import your individual reducers here
import selectedAgent from './selectedAgent';

export const rootReducer = combineReducers({
  // Add your reducers here
  selectedAgent,
});

export type RootState = ReturnType<typeof rootReducer>;
