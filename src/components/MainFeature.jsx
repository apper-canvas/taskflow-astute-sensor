import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { fetchTasks, updateTaskById, moveTaskAction } from '../services/taskService';
import { getIcon } from '../utils/iconUtils';
import KanbanBoard from './KanbanBoard';
import { moveTask } from '../store/taskSlice';

const MainFeature = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading: tasksLoading } = useSelector(state => state.tasks);
  const { isAuthenticated } = useSelector(state => state.user);
  
  // Get icons as components
  const PlusIcon = getIcon('Plus');
  const TrashIcon = getIcon('Trash2');
  const EditIcon = getIcon('Edit');
  const CheckIcon = getIcon('Check');
  const XIcon = getIcon('X');
  const AlertCircleIcon = getIcon('AlertCircle');
  const ChevronDownIcon = getIcon('ChevronDown');
  const ChevronUpIcon = getIcon('ChevronUp');
  const CalendarIcon = getIcon('Calendar');
  const LayoutIcon = getIcon('Layout');
  const ListIcon = getIcon('List');
  const LayoutKanbanIcon = getIcon('Trello');
  const LoaderIcon = getIcon('Loader');

  // State for tasks
  const [localTasks, setLocalTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '',
    description: '',
    priority: 'medium',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'Not Started'
  });
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  // Handle validation errors
  const [errors, setErrors] = useState({});
  
  // Update local tasks when Redux tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Import from taskService.js
  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  // Validation function
  const validateTask = (task) => {
    const errors = {};
    if (!task.title.trim()) {
      errors.title = "Title is required";
    }
    if (!task.dueDate) {
      errors.dueDate = "Due date is required";
    }
    return errors;
  };

  // Handle adding new task with database
  const handleAddTask = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateTask(newTask);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear previous errors
    setErrors({});
    
    try {  
      setIsSubmitting(true);
      // Import function from taskService and dispatch it
      await dispatch(createTask(newTask));
      toast.success("Task added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add task");
    } finally {
      setIsSubmitting(false);
      
      // Reset form regardless of success/failure
      resetForm();
    }
  };
  
  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Not Started'
    });
  };

  // Handle editing a task (sets the editing state)
  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate && task.dueDate.split('T')[0] // Ensure date format is yyyy-MM-dd
    });
  };
  
  // Handle updating a task with the database
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateTask(editingTask);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear previous errors
    setErrors({});

    try {
      setIsSubmitting(true);
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error.message || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  // Handle changing task status
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Find the task to update
      const taskToUpdate = localTasks.find(task => task.id === id);
      
      if (taskToUpdate) {
        // Prepare the updated task data
        const updatedTask = {
          ...taskToUpdate,
          status: newStatus
        };

        // Update the task using the taskService
        dispatch(moveTask({ taskId: parseInt(id), newStatus }));
        await dispatch(updateTaskById(updatedTask));
        toast.info(`Task marked as ${newStatus}`);
      }
    } catch (error) {
      toast.error(error.message || `Failed to update task status to ${newStatus}`);
    }
  };
  
  // Handle task movement in kanban board
  const handleTaskMove = (taskId, newStatus) => {
    // Find task to update
    const taskToUpdate = tasks.find(t => (t.Id || t.id) === parseInt(taskId) || (t.Id || t.id) === taskId);
    
    if (taskToUpdate && taskToUpdate.status !== newStatus) {
      // Dispatch the moveTaskAction thunk
      dispatch(moveTaskAction({
        taskId,
        newStatus
      }));
      
      toast.info(`Task moved to ${newStatus}`);
    }
  };
  
  // Filter tasks based on the selected filter
  const getFilteredTasks = () => {
    let filtered = [...localTasks];
    
    // Apply filter
    if (filter !== 'all') {
      if (filter === 'completed') {
        filtered = filtered.filter(task => task.status === 'Completed');
      } else if (filter === 'inProgress') {
        filtered = filtered.filter(task => task.status === 'In Progress');
      } else if (filter === 'notStarted') {
        filtered = filtered.filter(task => task.status === 'Not Started');
      } else if (filter === 'onHold') {
        filtered = filtered.filter(task => task.status === 'On Hold');
      }
    }
    
    // Apply sorting
    if (sort === 'dueDate') {
      filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sort === 'priority') {
      const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sort === 'status') {
      const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'On Hold': 2, 'Completed': 3 };
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    
    return filtered;
  };

  // Priority classes and badges
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'task-item-low';
      case 'medium': return 'task-item-medium';
      case 'high': return 'task-item-high';
      case 'critical': return 'task-item-critical';
      default: return 'task-item-medium';
    }
  };

  const PriorityBadge = ({ priority }) => {
    const bgColors = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${bgColors[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const bgColors = {
      'Not Started': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'On Hold': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${bgColors[status]}`}>
        {status}
      </span>
    );
  };

  // Handle changing form input
  const handleInputChange = (e, target = 'new') => {
    const { name, value } = e.target;
    
    if (target === 'edit') {
      setEditingTask(prev => ({ ...prev, [name]: value }));
    } else {
      setNewTask(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Get completion statistics
  const getCompletionStats = () => {
    const total = localTasks.length;
    const completed = localTasks.filter(task => task.status === 'Completed').length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      percentage
    };
  };

  const stats = getCompletionStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-4 md:p-6 lg:p-8 shadow-neu-light dark:shadow-neu-dark">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-surface-800 dark:text-surface-50">Task Manager</h2>
        
        {/* View Toggle */}
        {tasksLoading && (
          <div className="flex justify-center my-8"><LoaderIcon className="w-12 h-12 animate-spin text-primary" /></div>
        )}
        <div className="flex justify-end mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <ListIcon className="h-4 w-4" /> List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg flex items-center gap-2 ${
                viewMode === 'kanban' 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <LayoutKanbanIcon className="h-4 w-4" /> Kanban Board
            </button>
          </div>
        </div>
        
        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div 
            className="card bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-bold text-lg mb-1 text-surface-800 dark:text-surface-50">Total Tasks</h3>
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
          </motion.div>
          
          <motion.div 
            className="card bg-gradient-to-br from-secondary/10 to-secondary/20 dark:from-secondary/20 dark:to-secondary/30"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-bold text-lg mb-1 text-surface-800 dark:text-surface-50">Completed</h3>
            <p className="text-3xl font-bold text-secondary">{stats.completed}</p>
          </motion.div>
          
          <motion.div 
            className="card bg-gradient-to-br from-accent/10 to-accent/20 dark:from-accent/20 dark:to-accent/30"
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="font-bold text-lg mb-1 text-surface-800 dark:text-surface-50">Progress</h3>
            <div className="flex items-center">
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2.5 mr-2">
                <div 
                  className="bg-accent h-2.5 rounded-full" 
                  style={{ width: `${stats.percentage}%` }}
                ></div>
              </div>
              <span className="text-surface-800 dark:text-surface-50 font-medium">{stats.percentage}%</span>
            </div>
          </motion.div>
        </div>
        
        {/* Task Creation Form */}
        <form onSubmit={handleAddTask} className="mb-8 card">
          <h3 className="text-xl font-bold mb-4 text-surface-800 dark:text-surface-50">Add New Task</h3>
          
          {isAuthenticated ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newTask.title}
                    onChange={(e) => handleInputChange(e)}
                    className={`input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="Enter task title"
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Due Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-surface-400" />
                    </div>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={newTask.dueDate}
                      onChange={(e) => handleInputChange(e)}
                      className={`input pl-10 ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <AlertCircleIcon className="h-4 w-4 mr-1" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTask.description}
                  onChange={(e) => handleInputChange(e)}
                  className="input min-h-[80px]"
                  placeholder="Enter task description"
                  disabled={isSubmitting}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTask.priority}
                    onChange={(e) => handleInputChange(e)}
                    className="input"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={newTask.status}
                    onChange={(e) => handleInputChange(e)}
                    className="input"
                    disabled={isSubmitting}
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <PlusIcon className="h-5 w-5" />}
                <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
              </button>
            </>
          ) : (
            <div className="text-center py-4 text-surface-600 dark:text-surface-400">
              Please log in to add tasks.
            </div>
          )}
        </form>
        
        {/* Task List Container */}
        {viewMode === 'list' ? (
          <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h3 className="text-xl font-bold text-surface-800 dark:text-surface-50">Your Tasks</h3>
            
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="flex items-center gap-1 text-surface-600 dark:text-surface-300 hover:text-surface-800 dark:hover:text-surface-100 transition-colors"
            >
              <span>Filter & Sort</span>
              {isFilterExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Filter and Sort Controls */}
          <AnimatePresence>
            {isFilterExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-4 overflow-hidden"
              >
                <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="filter" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                      Filter by Status
                    </label>
                    <select
                      id="filter"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="input"
                    >
                      <option value="all">All Tasks</option>
                      <option value="notStarted">Not Started</option>
                      <option value="inProgress">In Progress</option>
                      <option value="onHold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="sort" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="input"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Task List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-surface-500 dark:text-surface-400">No tasks found. Add a new task to get started!</p>
              </motion.div>
            ) : (
              filteredTasks.map(task => (
                <motion.div 
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`task-item ${getPriorityClass(task.priority)} ${task.status === 'Completed' ? 'opacity-70' : ''}`}
                >
                  {editingTask && editingTask.id === task.id ? (
                    <form onSubmit={handleUpdateTask} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                            Task Title *
                          </label>
                          <input
                            type="text"
                            id="edit-title"
                            name="title"
                            value={editingTask.title}
                            onChange={(e) => handleInputChange(e, 'edit')}
                            className={`input ${errors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                          {errors.title && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircleIcon className="h-4 w-4 mr-1" />
                              {errors.title}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="edit-dueDate" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                            Due Date *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-surface-400" />
                            </div>
                            <input
                              type="date"
                              id="edit-dueDate"
                              name="dueDate"
                              value={editingTask.dueDate}
                              onChange={(e) => handleInputChange(e, 'edit')}
                              className={`input pl-10 ${errors.dueDate ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                          </div>
                          {errors.dueDate && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                              <AlertCircleIcon className="h-4 w-4 mr-1" />
                              {errors.dueDate}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="edit-description" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                          Description
                        </label>
                        <textarea
                          id="edit-description"
                          name="description"
                          value={editingTask.description}
                          onChange={(e) => handleInputChange(e, 'edit')}
                          className="input min-h-[80px]"
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="edit-priority" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                            Priority
                          </label>
                          <select
                            id="edit-priority"
                            name="priority"
                            value={editingTask.priority}
                            onChange={(e) => handleInputChange(e, 'edit')}
                            className="input"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="edit-status" className="block text-sm font-medium mb-1 text-surface-700 dark:text-surface-300">
                            Status
                          </label>
                          <select
                            id="edit-status"
                            name="status"
                            value={editingTask.status}
                            onChange={(e) => handleInputChange(e, 'edit')}
                            className="input"
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setEditingTask(null)}
                          className="btn btn-outline flex items-center gap-1"
                        >
                          <XIcon className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                        <button 
                          type="submit" 
                          className="btn btn-primary flex items-center gap-1"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className={`font-bold text-lg ${task.status === 'Completed' ? 'line-through text-surface-500 dark:text-surface-400' : 'text-surface-800 dark:text-surface-50'}`}>
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <PriorityBadge priority={task.priority} />
                          <StatusBadge status={task.status} />
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-surface-600 dark:text-surface-300 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mt-4">
                        <div className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {/* Quick status update buttons */}
                          {task.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'Completed')}
                              className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              aria-label="Mark as completed"
                            >
                              Complete
                            </button>
                          )}
                          
                          {task.status !== 'In Progress' && task.status !== 'Completed' && (
                            <button
                              onClick={() => handleStatusChange(task.id, 'In Progress')}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              aria-label="Mark as in progress"
                            >
                              Start
                            </button>
                          )}
                          
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="p-1.5 text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full transition-colors"
                            aria-label="Edit task"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteTask(task.Id || task.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                            aria-label="Delete task"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold mb-4 text-surface-800 dark:text-surface-50">Kanban Board</h3>
            <KanbanBoard tasks={localTasks} onTaskMove={handleTaskMove} onEditTask={handleEditTask} 
              onDeleteTask={handleDeleteTask} onStatusChange={handleStatusChange} />
          </div>
        )}
        </div>
      </div>
  );
};

export default MainFeature;