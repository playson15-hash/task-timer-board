export type TaskStatus = 'todo' | 'progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  startTime: Date;
  status: TaskStatus;
  address?: string;
}