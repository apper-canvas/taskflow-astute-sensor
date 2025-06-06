import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, resetServerContext } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

const KanbanBoard = ({ tasks, onTaskMove, onEditTask, onDeleteTask, onPriorityChange, onStatusChange }) => {
  // Get icons
  const EditIcon = getIcon('Edit');
  const TrashIcon = getIcon('Trash2');
  const CalendarIcon = getIcon('Calendar');

  // Define board columns
  const columns = [
    { id: 'not-started', title: 'Not Started', status: 'Not Started', className: 'column-not-started' },
    { id: 'in-progress', title: 'In Progress', status: 'In Progress', className: 'column-in-progress' },
    { id: 'on-hold', title: 'On Hold', status: 'On Hold', className: 'column-on-hold' },
    { id: 'completed', title: 'Completed', status: 'Completed', className: 'column-completed' }
  ];
  
  // Reset server context to prevent issues in SSR environments
  try {
    resetServerContext();
  } catch (err) {
    // Ignore error if not in SSR environment
  }
  
  // State to track which column is currently being dragged over
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  
  // Handle drag start to set visual styles
  const handleDragStart = () => {
    // Add a class to the body to indicate dragging is in progress
    document.body.classList.add('dragging-active');
  };

  // Handle getting tasks for a specific column
  const getTasksForColumn = (columnStatus) => {
    return tasks.filter(task => task.status === columnStatus);
  };

  // Handle drag end - the key function that was missing/broken
  const handleDragEnd = result => {
    const { destination, source, draggableId } = result;

    // Remove dragging classes when the drag ends
    document.body.classList.remove('dragging-active');
    setDraggedOverColumn(null);

    // If there's no destination or the item was dropped back in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the column status by droppableId
    const targetColumn = columns.find(col => col.id === destination.droppableId);
    if (!targetColumn) return;

    // Extract and normalize the task ID
    let taskId = draggableId;
    if (taskId.startsWith('task-')) {
      taskId = taskId.replace('task-', '');
    }
    
    // Always try to convert to number first for consistency
    const parsedTaskId = !isNaN(parseInt(taskId)) ? parseInt(taskId) : taskId;
    
    // Call the move handler with normalized ID
    onTaskMove(parsedTaskId, targetColumn.status);
  };
  
  // Handle drag update to track which column is being dragged over
  const handleDragUpdate = (update) => {
    if (!update.destination) {
      setDraggedOverColumn(null);
      return;
    }
    
    // Update state with current column being dragged over
    setDraggedOverColumn(update.destination.droppableId);
  };

  // Determine task priority class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'task-item-low';
      case 'medium': return 'task-item-medium';
      case 'high': return 'task-item-high';
      case 'critical': return 'task-item-critical';
      default: return 'task-item-medium';
    }
  };

  // Priority badge component
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

  return (
    <DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
      <div className="kanban-container">
        {columns.map(column => (
          <div key={column.id} className={`kanban-column ${column.className} ${draggedOverColumn === column.id ? 'column-drag-over' : ''}`}>
            <div className="kanban-column-header">
              <span>{column.title}</span>
              <span className="kanban-column-badge">
                {getTasksForColumn(column.status).length}
              </span>
            </div>
            
            <Droppable droppableId={column.id} type="TASK">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`kanban-task-list ${snapshot.isDraggingOver ? 'column-is-dragging-over' : ''}`}
                >
                  {getTasksForColumn(column.status).map((task, index) => (
                    <Draggable 
                      key={`task-${task.Id || task.id}`} 
                      draggableId={`task-${task.Id || task.id}`}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={`kanban-task-item ${getPriorityClass(task.priority)} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          style={{
                            ...provided.draggableProps.style,
                            // Add subtle rotation when dragging like Trello
                            transform: snapshot.isDragging 
                              ? `${provided.draggableProps.style.transform} rotate(${Math.random() > 0.5 ? 2 : -2}deg)` 
                              : provided.draggableProps.style.transform
                          }}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-surface-800 dark:text-surface-100 text-sm">
                                {task.title}
                              </h4>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => onEditTask(task, true)}
                                  className="p-1 text-surface-600 hover:text-surface-800 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full transition-colors"
                                >
                                  <EditIcon className="h-3 w-3" />
                                </button>
                                <button 
                                  onClick={() => onDeleteTask(task.Id || task.id)}
                                  className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                >
                                  <TrashIcon className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-xs text-surface-600 dark:text-surface-300 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-surface-500 dark:text-surface-400 flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <span>
                                  {format(new Date(task.dueDate), 'MMM d')}
                                </span>
                              </div>
                              <PriorityBadge priority={task.priority} />
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  
                  {/* Empty state indicator */}
                  {getTasksForColumn(column.status).length === 0 && (
                    <div className={`kanban-placeholder flex items-center justify-center ${snapshot.isDraggingOver ? 'placeholder-drag-over' : ''}`}>
                      <span className="text-xs text-surface-400 dark:text-surface-500">
                        No tasks
                      </span>
                    </div>
                  )}
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