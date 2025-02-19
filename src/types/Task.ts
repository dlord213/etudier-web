export interface TaskProps {
  task_id: number;
  created_at: string;
  title: string;
  description: string;
  deadline: string;
  labels: string;
  user_id: string;
  completed: boolean;
}
