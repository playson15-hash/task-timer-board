import { useState, useEffect } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Square } from "lucide-react";
import { Task } from '../types/task';
import { MapPreview } from './MapPreview';
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TaskCard = ({ task, index, onUpdateTask }: TaskCardProps) => {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handlePomodoroToggle = () => {
    if (task.pomodoroActive) {
      // Stop Pomodoro
      onUpdateTask(task.id, {
        pomodoroActive: false,
        pomodoroStartedAt: undefined
      });
    } else {
      // Start Pomodoro
      onUpdateTask(task.id, {
        pomodoroActive: true,
        pomodoroMs: 25 * 60 * 1000, // 25 minutes
        pomodoroStartedAt: new Date()
      });
    }
  };

  const handlePomodoroStop = () => {
    onUpdateTask(task.id, {
      pomodoroActive: false,
      pomodoroMs: 25 * 60 * 1000,
      pomodoroStartedAt: undefined
    });
  };

  // Calculate current Pomodoro time
  const getCurrentPomodoroMs = () => {
    if (!task.pomodoroActive || !task.pomodoroStartedAt) return task.pomodoroMs;
    const elapsed = currentTime - task.pomodoroStartedAt.getTime();
    return Math.max(0, task.pomodoroMs - elapsed);
  };

  const pomodoroTimeLeft = getCurrentPomodoroMs();
  const isPomodoroExpired = task.pomodoroActive && pomodoroTimeLeft <= 0;

  // Check if task should show warning (stuck in todo > 10 min)
  const isStuckWarning = task.status === 'todo' && task.stuckWarningTime;
  
  // Check if countdown is expired and should blink
  const shouldBlink = task.status === 'todo' && task.isCountdownExpired;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "p-4 cursor-move bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200 border-border/50",
            shouldBlink && "animate-blink",
            isStuckWarning && "animate-pulse-warning",
            snapshot.isDragging && "rotate-2 scale-105"
          )}
        >
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground leading-tight">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>

            {/* 5-minute countdown for todo tasks */}
            {task.status === 'todo' && (
              <div className={cn(
                "flex items-center justify-center py-2 px-3 rounded-lg font-mono text-sm font-semibold",
                getCountdownColor(task.countdownMs),
                getCountdownBg(task.countdownMs)
              )}>
                <Clock className="w-4 h-4 mr-2" />
                {task.isCountdownExpired ? "EXPIRADO!" : formatTime(task.countdownMs)}
              </div>
            )}

            {/* Location with map preview */}
            {task.location && (
              <MapPreview location={task.location} />
            )}

            {/* Pomodoro Timer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={task.pomodoroActive ? "default" : "outline"}
                  onClick={handlePomodoroToggle}
                  className="h-8 px-2"
                >
                  {task.pomodoroActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                
                {task.pomodoroActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePomodoroStop}
                    className="h-8 px-2"
                  >
                    <Square className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {task.pomodoroActive && (
                <div className={cn(
                  "text-xs font-mono px-2 py-1 rounded",
                  isPomodoroExpired ? "bg-countdown-danger/20 text-countdown-danger" : "bg-primary/10 text-primary"
                )}>
                  {isPomodoroExpired ? "Pomodoro Concluído!" : formatTime(pomodoroTimeLeft)}
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex justify-between items-center">
              <Badge variant={
                task.status === 'todo' ? 'secondary' :
                task.status === 'progress' ? 'default' : 'outline'
              }>
                {task.status === 'todo' ? 'To Do' :
                 task.status === 'progress' ? 'In Progress' : 'Done'}
              </Badge>

              {isStuckWarning && (
                <Badge variant="destructive" className="text-xs">
                  Atrasada
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
};