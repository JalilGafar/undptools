// gantt-task.model.ts
export interface GanttTask {
  id: string;
  name: string;
  start: string;   // YYYY-MM-DD
  end: string;     // YYYY-MM-DD
  progress: number;
  custom_class: string;
}
