export type TaskStatus = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  location?: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt?: Date;
  
  // Countdown (5 minutes from creation)
  countdownMs: number;
  isCountdownExpired: boolean;
  
  // Anti-procrastination tracking
  stuckWarningTime?: Date; // When task has been in todo for >10 min
  
  // Pomodoro timer
  pomodoroActive: boolean;
  pomodoroMs: number; // 25 minutes
  pomodoroStartedAt?: Date;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  completed: number;
  goal: number;
}