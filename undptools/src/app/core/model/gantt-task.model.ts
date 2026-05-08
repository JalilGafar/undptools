// gantt-task.model.ts
export class GanttTask {
  id!: string;
  name!: string;
  details!: string;
  start!: string;   // YYYY-MM-DD
  end!: string;     // YYYY-MM-DD
  progress!: number;
  status!: string;
  dependencies!: string;
  close!: string;
  responsable!: string;
  comments!: string;
  cons_id!: number;
  comp_id!: number
}
