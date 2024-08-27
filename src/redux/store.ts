// store.ts
import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { rootReducer } from './rootReducer'; // We'll create this next

// Create the Redux store
const makeStore = () => configureStore({
  reducer: rootReducer,
});

// Export types for the store and dispatch
export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Create the wrapper for Next.js
export const wrapper = createWrapper<AppStore>(makeStore);