import { Droppable } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '../types/task';
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  className?: string;
}

export const KanbanColumn = ({ 
  title, 
  status, 
  tasks, 
  onUpdateTask, 
  className 
}: KanbanColumnProps) => {
  const isProgressColumn = status === 'progress';
  const isOverLimit = isProgressColumn && tasks.length >= 3;

  return (
    <Card
      className={cn(
        "min-w-[280px] p-4 border-2 border-dashed transition-colors duration-200",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-foreground mb-1">{title}</h3>
        <div className="w-full h-1 rounded-full bg-border">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              status === 'todo' && "bg-kanban-todo",
              status === 'progress' && "bg-kanban-progress", 
              status === 'done' && "bg-kanban-completed"
            )}
            style={{ width: `${Math.min((tasks.length / 5) * 100, 100)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
          {isProgressColumn && ` (máx: 3)`}
        </p>
      </div>

      {/* Anti-procrastination warning for In Progress */}
      {isOverLimit && (
        <Alert className="mb-4 border-countdown-warning bg-countdown-warning/10">
          <AlertDescription className="text-countdown-warning text-sm">
            Máximo de 3 tarefas em andamento! Finalize algumas antes de adicionar mais.
          </AlertDescription>
        </Alert>
      )}

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "space-y-3 min-h-[200px] transition-colors duration-200",
              snapshot.isDraggingOver && "bg-gradient-hover/20 rounded-lg p-2"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onUpdateTask={onUpdateTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
};