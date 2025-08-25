import { Progress } from "@/components/ui/progress";
import { DailyProgress } from "../types/task";

interface ProgressTrackerProps {
  progress: DailyProgress;
  currentDate: string;
}

export const ProgressTracker = ({ progress, currentDate }: ProgressTrackerProps) => {
  const percentage = Math.min((progress.completed / progress.goal) * 100, 100);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} de ${month} de ${year}`;
  };

  return (
    <div className="text-center mb-8 space-y-4">
      <h1 className="text-3xl font-bold text-foreground">Task Planner</h1>
      <p className="text-muted-foreground text-lg">{formatDate(currentDate)}</p>
      
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Tarefas completadas hoje</span>
          <span className="font-semibold text-foreground">
            {progress.completed} / {progress.goal}
          </span>
        </div>
        
        <Progress value={percentage} className="h-2" />
        
        {progress.completed >= progress.goal && (
          <p className="text-countdown-safe font-medium text-sm">
            🎉 Meta diária alcançada!
          </p>
        )}
      </div>
    </div>
  );
};