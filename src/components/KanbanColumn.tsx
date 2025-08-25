import { Card } from "@/components/ui/card";
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types/kanban';
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  className?: string;
}

export const KanbanColumn = ({ 
  title, 
  status, 
  tasks, 
  onTaskMove, 
  onDragOver, 
  onDrop, 
  className 
}: KanbanColumnProps) => {
  return (
    <Card
      className={cn(
        "min-w-[200px] p-4 border-2 border-dashed transition-colors duration-200",
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
        <div className="w-full h-1 rounded-full bg-border">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              status === 'todo' && "bg-kanban-todo",
              status === 'progress' && "bg-kanban-progress", 
              status === 'completed' && "bg-kanban-completed"
            )}
            style={{ width: `${Math.min((tasks.length / 5) * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onTaskMove={onTaskMove}
          />
        ))}
      </div>
    </Card>
  );
};