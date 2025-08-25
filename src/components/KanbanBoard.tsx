import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { KanbanColumn } from './KanbanColumn';
import { Task, TaskStatus } from '../types/kanban';

export interface KanbanBoardProps {}

export const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Reunião com cliente',
      startTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      status: 'todo',
      address: 'Rua das Flores, 123, São Paulo'
    },
    {
      id: '2',
      title: 'Revisar relatório',
      startTime: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
      status: 'todo',
    },
    {
      id: '3',
      title: 'Call com equipe',
      startTime: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      status: 'progress',
    },
    {
      id: '4',
      title: 'Entrega do projeto',
      startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'completed',
    }
  ]);

  const [currentDate, setCurrentDate] = useState(new Date());

  // Update current date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for tasks that need to move from todo to progress
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.status === 'todo' && task.startTime <= now) {
            // Send notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Tarefa iniciada: ${task.title}`, {
                icon: '/favicon.ico',
                body: task.address ? `Local: ${task.address}` : 'Sua tarefa começou agora!'
              });
            }
            return { ...task, status: 'progress' as TaskStatus };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  const handleTaskMove = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    handleTaskMove(taskId, status);
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Kanban Board</h1>
          <p className="text-muted-foreground text-lg">{formatDate(currentDate)}</p>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          <KanbanColumn
            title="To Do"
            status="todo"
            tasks={getTasksByStatus('todo')}
            onTaskMove={handleTaskMove}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'todo')}
            className="bg-kanban-todo-bg border-kanban-todo"
          />
          
          <KanbanColumn
            title="In Progress"
            status="progress"
            tasks={getTasksByStatus('progress')}
            onTaskMove={handleTaskMove}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'progress')}
            className="bg-kanban-progress-bg border-kanban-progress"
          />
          
          <KanbanColumn
            title="Completed"
            status="completed"
            tasks={getTasksByStatus('completed')}
            onTaskMove={handleTaskMove}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'completed')}
            className="bg-kanban-completed-bg border-kanban-completed"
          />
        </div>
      </div>
    </div>
  );
};