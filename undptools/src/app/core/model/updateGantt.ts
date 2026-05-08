export interface UpdateGanttTaskDto {
  id: string;
  start?: Date;
  end?: Date;
  progress?: number;
  responsable?: string;
  status?: string;
  details?: string;
  comments?: string;
  close?: string;
}