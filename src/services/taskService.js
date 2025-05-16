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
      // Ensure the task has a proper ID field
      id: task.Id.toString(),
      // Set defaults for missing fields if needed
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
      
      // Process the created task to ensure it has all fields needed for UI
      const processedTask = {
        ...createdTask,
        id: createdTask.Id.toString() // Ensure ID is a string for consistency
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
      Id: taskData.Id,
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
      
      // Process the updated task for UI consistency
      const processedTask = {
        ...updatedTask,
        id: updatedTask.Id.toString()
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
    
    const params = {
      RecordIds: [taskId]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (response && response.success) {
      dispatch(removeTask(taskId));
      return true;
    } else {
      throw new Error("Failed to delete task");
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    dispatch(setError(error.message || "Failed to delete task"));
    throw error;
  }
};

/**
 * Moves a task to a new status in the database
 * @param {number|string} taskId - The ID of the task to move
 * @param {string} newStatus - The new status for the task
 */
export const moveTaskAction = (taskId, newStatus) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // First fetch the task to get its current data
    const fetchParams = {
      fields: TASK_FIELDS,
      where: [
        {
          fieldName: "Id",
          Operator: "ExactMatch",
          values: [taskId]
        }
      ]
    };
    
    const fetchResponse = await apperClient.fetchRecords(TABLE_NAME, fetchParams);
    
    if (fetchResponse && fetchResponse.data && fetchResponse.data.length > 0) {
      const taskToUpdate = fetchResponse.data[0];
      
      // Update the task with the new status
      await dispatch(updateTaskById({...taskToUpdate, status: newStatus}));
      
      // Also update the local state for immediate UI feedback
      dispatch(moveTask({taskId: parseInt(taskId), newStatus}));
    }
  } catch (error) {
    console.error("Error moving task:", error);
    dispatch(setError(error.message || "Failed to move task"));
    throw error;
  }
};