import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
      state.isLoading = false;
      state.error = null;
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => (task.Id || task.id) === (action.payload.Id || action.payload.id));
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      state.isLoading = false;
      state.error = null;
    },
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(task => (task.Id || task.id) !== action.payload);
      state.isLoading = false;
      state.error = null;
    },
    moveTask: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const index = state.tasks.findIndex(task => (task.Id || task.id) === taskId);
      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          status: newStatus,
          ModifiedOn: new Date().toISOString()
        };
      }
      state.isLoading = false;
      state.error = null;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    }
  },
});

export const { 
  setLoading, 
  setError, 
  setTasks, 
  addTask, 
  updateTask, 
  removeTask, 
  moveTask,
  setSelectedTask,
  clearSelectedTask 
} = taskSlice.actions;

export default taskSlice.reducer;