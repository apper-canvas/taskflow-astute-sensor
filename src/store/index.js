import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: taskReducer
  },
  devTools: import.meta.env.MODE !== 'production'
});