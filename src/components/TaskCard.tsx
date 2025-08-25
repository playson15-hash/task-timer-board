import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { Task, TaskStatus } from '../types/kanban';
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskCard = ({ task, onTaskMove }: TaskCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (task.status !== 'todo') return;

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.max(0, task.startTime.getTime() - now.getTime());
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [task.startTime, task.status]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCountdownColor = (ms: number) => {
    const minutes = ms / (1000 * 60);
    if (minutes > 3) return 'text-countdown-safe';
    if (minutes > 1) return 'text-countdown-warning';
    return 'text-countdown-danger';
  };

  const getCountdownBg = (ms: number) => {
    const minutes = ms / (1000 * 60);
    if (minutes > 3) return 'bg-countdown-safe/10';
    if (minutes > 1) return 'bg-countdown-warning/10';
    return 'bg-countdown-danger/10';
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleAddressClick = () => {
    if (task.address) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`;
      window.open(url, '_blank');
    }
  };

  const formatStartTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card
      className="p-4 cursor-move bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200 border-border/50"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="space-y-3">
        <h4 className="font-medium text-foreground leading-tight">{task.title}</h4>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{formatStartTime(task.startTime)}</span>
        </div>

        {task.status === 'todo' && timeRemaining > 0 && (
          <div className={cn(
            "flex items-center justify-center py-2 px-3 rounded-lg font-mono text-sm font-semibold",
            getCountdownColor(timeRemaining),
            getCountdownBg(timeRemaining)
          )}>
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeRemaining)}
          </div>
        )}

        {task.address && (
          <div className="relative">
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
              onClick={handleAddressClick}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <MapPin className="w-4 h-4" />
              <span className="truncate">Local disponível</span>
            </div>
            
            {showTooltip && (
              <div className="absolute z-10 bottom-full left-0 mb-2 p-2 bg-foreground text-background text-xs rounded shadow-lg max-w-xs">
                {task.address}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground"></div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Badge variant={
            task.status === 'todo' ? 'secondary' :
            task.status === 'progress' ? 'default' : 'outline'
          }>
            {task.status === 'todo' ? 'Pendente' :
             task.status === 'progress' ? 'Em andamento' : 'Concluída'}
          </Badge>
        </div>
      </div>
    </Card>
  );
};