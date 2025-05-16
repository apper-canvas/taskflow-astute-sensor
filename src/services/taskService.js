import { 
  setLoading, 
  setError, 
  setTasks, 
  addTask, 
  updateTask, 
  removeTask,
  moveTask
} from '../store/taskSlice';

// Table name from the provided database schema
const TABLE_NAME = 'task7';

// Task fields from the provided schema
const TASK_FIELDS = [
  'Id',
  'Name',
  'Tags',
  'title',
  'description',
  'priority',
  'status',
  'dueDate',
  'CreatedOn',
  'ModifiedOn'
];

/**
 * Fetches all tasks from the database
 */
export const fetchTasks = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: TASK_FIELDS,
      distinct: true,
      orderBy: [
        {
          field: "dueDate",
          direction: "asc"
        }
      ]
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      dispatch(setTasks([]));
      return [];
    }
    
    // Process the response data to ensure it has all required fields for the UI
    const processedTasks = response.data.map(task => ({
      ...task,
      // Ensure the task has a proper ID field for UI consumption
      // Keep the original Id for database operations
      id: task.Id,
      // We'll use both Id and id in the UI for compatibility
      // Set defaults for missing fields to avoid UI errors
      Id: task.Id,
      priority: task.priority || 'medium',
      status: task.status || 'Not Started',
      title: task.title || task.Name || 'Untitled Task'
    }));
    
    dispatch(setTasks(processedTasks));
    return processedTasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    dispatch(setError(error.message || "Failed to fetch tasks"));
    return [];
  }
};

/**
 * Creates a new task in the database
 */
export const createTask = (taskData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Prepare task data for the database
    const newTaskData = {
      Name: taskData.title, // Use title as Name for better display
      title: taskData.title,
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'Not Started',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0]
    };
    
    const params = {
      records: [newTaskData]
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      const createdTask = response.results[0].data;
      
      // Add both id and Id for UI compatibility
      const processedTask = {
        ...createdTask,
        id: createdTask.Id,
        title: createdTask.title || createdTask.Name
      };
      
      dispatch(addTask(processedTask));
      return processedTask;
    } else {
      throw new Error("Failed to create task");
    }
  } catch (error) {
    console.error("Error creating task:", error);
    dispatch(setError(error.message || "Failed to create task"));
    throw error;
  }
};

/**
 * Updates an existing task in the database
 */
export const updateTaskById = (taskData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Prepare task data for update
    const updateData = {
      Id: taskData.Id || taskData.id, // Support both id formats
      Name: taskData.title, // Keep Name in sync with title
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: taskData.dueDate
    };
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (response && response.success && response.results && response.results.length > 0) {
      const updatedTask = response.results[0].data;
      
      // Process for UI consistency
      const processedTask = {
        ...updatedTask,
        id: updatedTask.Id
      };
      
      dispatch(updateTask(processedTask));
      return processedTask;
    } else {
      throw new Error("Failed to update task");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    dispatch(setError(error.message || "Failed to update task"));
    throw error;
  }
};

/**
 * Deletes a task from the database
 */
export const deleteTask = (taskId) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Ensure taskId is in the right format
    const idToDelete = typeof taskId === 'string' && !isNaN(parseInt(taskId)) 
      ? parseInt(taskId) 
      : taskId;
    
    const params = {
      RecordIds: [idToDelete]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (response && response.success) {
      return true;
    } else {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    dispatch(setError(error.message || "Failed to delete task"));
    return false;
    throw error;
  } finally {
    dispatch(removeTask(taskId));
  }
};

/**
 * Moves a task to a new status in the database
 * @param {Object} params - The parameters object
 * @param {number|string} params.taskId - The ID of the task to move
 * @param {string} params.newStatus - The new status for the task
 */
export const moveTaskAction = ({ taskId, newStatus }) => async (dispatch, getState) => {
  try {
    // Get the task from current Redux state before any updates
    const state = getState();
    const task = state.tasks.tasks.find(t => (t.Id || t.id) === taskId);
    
    if (!task) {
      throw new Error("Task not found in current state");
    }
    
    // Step 1: Immediately update Redux state to provide responsive UI
    dispatch(moveTask({ taskId, newStatus }));

    // Step 2: Make direct API call without dispatching another action
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Prepare update data - only include the fields we're changing
    const updateData = {
      Id: task.Id || task.id,
      status: newStatus
    };
    
    const params = {
      records: [updateData]
    };
    
    // Make the API call directly
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response.success) {
      throw new Error("Failed to update task status in database");
    }
    
    // No need to update Redux again as we already did it
    return true;
  } catch (error) {
    // If the API call fails, revert the task status in Redux
    if (task) {
      // Revert the UI state by dispatching an update with the original status
      dispatch(moveTask({ taskId, newStatus: task.status }));
    }
    
    console.error("Error moving task:", error);
    dispatch(setError(error.message || "Failed to move task"));
    return false;
  }
};