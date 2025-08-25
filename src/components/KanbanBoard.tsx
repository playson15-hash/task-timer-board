import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { KanbanColumn } from './KanbanColumn';
import { ProgressTracker } from './ProgressTracker';
import { Task, TaskStatus, DailyProgress } from '../types/task';

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Reunião com cliente',
      description: 'Apresentar proposta do novo projeto',
      location: 'Rua das Flores, 123, São Paulo',
      status: 'todo',
      createdAt: new Date(),
      countdownMs: 5 * 60 * 1000, // 5 minutes
      isCountdownExpired: false,
      pomodoroActive: false,
      pomodoroMs: 25 * 60 * 1000
    },
    {
      id: '2',
      title: 'Revisar código',
      description: 'Pull request #453',
      status: 'todo',
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      countdownMs: 3 * 60 * 1000, // 3 minutes left
      isCountdownExpired: false,
      pomodoroActive: false,
      pomodoroMs: 25 * 60 * 1000
    },
    {
      id: '3',
      title: 'Documentar API',
      status: 'progress',
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
      countdownMs: 0,
      isCountdownExpired: true,
      pomodoroActive: true,
      pomodoroMs: 15 * 60 * 1000, // 15 minutes left in pomodoro
      pomodoroStartedAt: new Date(Date.now() - 10 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Testar nova feature',
      status: 'done',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 60 * 1000),
      countdownMs: 0,
      isCountdownExpired: true,
      pomodoroActive: false,
      pomodoroMs: 25 * 60 * 1000
    }
  ]);

  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    date: new Date().toISOString().split('T')[0],
    completed: 1,
    goal: 5
  });

  // Update countdowns and check for stuck tasks
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'todo') {
            const elapsed = now - task.createdAt.getTime();
            const remaining = Math.max(0, (5 * 60 * 1000) - elapsed);
            
            // Check if task has been stuck for > 10 minutes
            const stuckWarningTime = elapsed > 10 * 60 * 1000 ? new Date() : undefined;
            
            // Move to progress if countdown expired
            if (remaining === 0 && !task.isCountdownExpired) {
              // Check if In Progress has space (max 3)
              const inProgressCount = prevTasks.filter(t => t.status === 'progress').length;
              if (inProgressCount < 3) {
                return {
                  ...task,
                  status: 'progress' as TaskStatus,
                  countdownMs: 0,
                  isCountdownExpired: true
                };
              }
            }
            
            return {
              ...task,
              countdownMs: remaining,
              isCountdownExpired: remaining === 0,
              stuckWarningTime
            };
          }
          return task;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Update daily progress when tasks are completed
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const completedToday = tasks.filter(task => 
      task.status === 'done' && 
      task.completedAt && 
      task.completedAt.toISOString().split('T')[0] === today
    ).length;

    setDailyProgress(prev => ({
      ...prev,
      completed: completedToday
    }));
  }, [tasks]);

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    
    // Check In Progress limit (max 3)
    if (newStatus === 'progress') {
      const inProgressTasks = tasks.filter(task => task.status === 'progress');
      if (inProgressTasks.length >= 3 && source.droppableId !== 'progress') {
        return; // Don't allow move if already at limit
      }
    }

    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks];
      const taskIndex = updatedTasks.findIndex(task => task.id === draggableId);
      
      if (taskIndex !== -1) {
        const updates: Partial<Task> = { status: newStatus };
        
        // Mark as completed if moved to done
        if (newStatus === 'done') {
          updates.completedAt = new Date();
          updates.pomodoroActive = false; // Stop any active pomodoro
        }
        
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };
      }
      
      return updatedTasks;
    });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-6">
        <ProgressTracker 
          progress={dailyProgress} 
          currentDate={dailyProgress.date}
        />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={getTasksByStatus('todo')}
              onUpdateTask={handleUpdateTask}
              className="bg-kanban-todo-bg border-kanban-todo"
            />
            
            <KanbanColumn
              title="In Progress"
              status="progress"
              tasks={getTasksByStatus('progress')}
              onUpdateTask={handleUpdateTask}
              className="bg-kanban-progress-bg border-kanban-progress"
            />
            
            <KanbanColumn
              title="Done"
              status="done"
              tasks={getTasksByStatus('done')}
              onUpdateTask={handleUpdateTask}
              className="bg-kanban-completed-bg border-kanban-completed"
            />
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};