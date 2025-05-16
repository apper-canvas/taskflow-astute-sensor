import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

const KanbanBoard = ({ tasks, onTaskMove, onEditTask, onDeleteTask, onStatusChange }) => {
  // Get icons
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash2');
  const CalendarIcon = getIcon('Calendar');
  
  // State for tracking which task is being dragged
  const [draggingId, setDraggingId] = useState(null);
  
  // Define the columns
  const columns = [
    { id: 'Not Started', name: 'To Do', className: 'column-not-started' },
    { id: 'In Progress', name: 'In Progress', className: 'column-in-progress' },
    { id: 'On Hold', name: 'On Hold', className: 'column-on-hold' },
    { id: 'Completed', name: 'Done', className: 'column-completed' }
  ];
  
  // Group tasks by status
  const getTasksByStatus = () => {
    const grouped = {};
    
    // Initialize all columns (even empty ones)
    columns.forEach(column => {
      grouped[column.id] = [];
    });
    
    // Add tasks to their respective columns
    tasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        // If status doesn't match any column, add to first column
        grouped[columns[0].id].push(task);
      }
    });
    
    return grouped;
  };
  
  // Handle drag end event
  const handleDragEnd = (result) => {
    setDraggingId(null);
    
    const { destination, source, draggableId } = result;
    
    // If dropped outside any droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // If moved to a different column, update task status
    if (destination.droppableId !== source.droppableId) {
      onTaskMove(draggableId, destination.droppableId);
    }
  };
  
  // Handle drag start event
  const handleDragStart = (start) => {
    setDraggingId(start.draggableId);
  };
  
  // Get color class based on priority
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'task-item-low';
      case 'medium': return 'task-item-medium';
      case 'high': return 'task-item-high';
      case 'critical': return 'task-item-critical';
      default: return 'task-item-medium';
    }
  };
  
  // Render the priority badge
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
  
  const tasksByStatus = getTasksByStatus();
  
  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="kanban-container">
        {columns.map(column => (
          <div key={column.id} className={`kanban-column ${column.className}`}>
            <div className="kanban-column-header">
              <span>{column.name}</span>
              <span className="kanban-column-badge">{tasksByStatus[column.id].length}</span>
            </div>
            
            {/* 
              Note: react-beautiful-dnd uses defaultProps which shows a warning in React 18.
              This is a library limitation and can be ignored until the library is updated.
              Warning: Connect(Droppable): Support for defaultProps will be removed from memo components
              in a future major release. Use JavaScript default parameters instead.
            */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  className={`kanban-task-list ${snapshot.isDraggingOver ? 'bg-surface-200/50 dark:bg-surface-700/30 rounded-lg' : ''}`}
                  ref={provided?.innerRef}
                  {...provided.droppableProps}
                >
                  {tasksByStatus[column.id].length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-center py-4 text-sm text-surface-500 dark:text-surface-400">
                      No tasks
                    </div>
                  )}
                  
                  {tasksByStatus[column.id].map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided?.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          className={`kanban-task-item ${getPriorityClass(task.priority)} ${
                            snapshot.isDragging ? 'is-dragging' : ''
                          }`}
                        >
                          <div className="flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-sm text-surface-800 dark:text-surface-50 line-clamp-2">
                                {task.title}
                              </h4>
                              <PriorityBadge priority={task.priority} />
                            </div>
                            
                            {task.description && (
                              <p className="text-surface-600 dark:text-surface-300 text-sm mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-center mt-1 text-xs">
                              <div className="text-surface-500 dark:text-surface-400 flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                              </div>
                              
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => onEditTask(task)}
                                  className="p-1 text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 rounded transition-colors"
                                  aria-label="Edit task"
                                >
                                  <EditIcon className="h-3 w-3" />
                                </button>
                                
                                <button 
                                  onClick={() => onDeleteTask(task.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                  aria-label="Delete task"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;