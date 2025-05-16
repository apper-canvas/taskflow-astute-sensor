import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

const KanbanBoard = ({ tasks, onTaskMove, onEditTask, onDeleteTask, onStatusChange }) => {
  // Get icons as components
  const TrashIcon = getIcon('Trash2');
  const EditIcon = getIcon('Edit');
  const CheckIcon = getIcon('Check');
  const PlayIcon = getIcon('Play');
  const PauseIcon = getIcon('Pause');
  
  // Status columns for the kanban board
  const columns = [
    { id: 'Not Started', title: 'Not Started', className: 'column-not-started' },
    { id: 'In Progress', title: 'In Progress', className: 'column-in-progress' },
    { id: 'On Hold', title: 'On Hold', className: 'column-on-hold' },
    { id: 'Completed', title: 'Completed', className: 'column-completed' }
  ];
  
  // Group tasks by status
  const getTasksByStatus = () => {
    const tasksByStatus = {};
    
    columns.forEach(column => {
      tasksByStatus[column.id] = tasks.filter(task => task.status === column.id);
    });
    
    return tasksByStatus;
  };
  
  // Handle task drag end event
  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    
    // If dropped outside of a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // If the status has changed, call the onTaskMove callback
    if (source.droppableId !== destination.droppableId) {
      const taskId = draggableId;
      const newStatus = destination.droppableId;
      
      onTaskMove(taskId, newStatus);
    }
  };
  
  // Get the appropriate priority class for the task
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'task-item-low';
      case 'medium': return 'task-item-medium';
      case 'high': return 'task-item-high';
      case 'critical': return 'task-item-critical';
      default: return 'task-item-medium';
    }
  };
  
  // Generate tasks grouped by status
  const tasksByStatus = getTasksByStatus();
  
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-container">
        {columns.map(column => (
          <div key={column.id} className={`kanban-column ${column.className}`}>
            <div className="kanban-column-header">
              <span>{column.title}</span>
              <span className="kanban-column-badge">{tasksByStatus[column.id]?.length || 0}</span>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="kanban-task-list"
                >
                  {tasksByStatus[column.id]?.map((task, index) => (
                    <Draggable 
                      key={task.Id || task.id} 
                      draggableId={task.Id?.toString() || task.id?.toString()} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`kanban-task-item ${getPriorityClass(task.priority)} ${snapshot.isDragging ? 'is-dragging' : ''}`}
                        >
                          <h4 className="font-medium mb-2 truncate pr-6">
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className="text-sm text-surface-600 dark:text-surface-300 line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-surface-500 dark:text-surface-400">
                              {task.dueDate && format(new Date(task.dueDate), 'MMM d, yyyy')}
                            </div>
                            
                            <div className="flex gap-1">
                              {/* Quick action buttons */}
                              {column.id !== 'Completed' && (
                                <button 
                                  onClick={() => onStatusChange(task.Id || task.id, 'Completed')}
                                  className="p-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
                                  title="Mark as completed"
                                >
                                  <CheckIcon className="h-3 w-3" />
                                </button>
                              )}
                              
                              {column.id === 'Not Started' && (
                                <button 
                                  onClick={() => onStatusChange(task.Id || task.id, 'In Progress')}
                                  className="p-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                                  title="Start task"
                                >
                                  <PlayIcon className="h-3 w-3" />
                                </button>
                              )}
                              
                              <button onClick={() => onEditTask(task)} className="p-1 bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300 rounded hover:bg-surface-300 dark:hover:bg-surface-600" title="Edit task">
                                <EditIcon className="h-3 w-3" />
                              </button>
                              
                              <button onClick={() => onDeleteTask(task.Id || task.id)} className="p-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800" title="Delete task">
                                <TrashIcon className="h-3 w-3" />
                              </button>
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