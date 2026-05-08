// src/app/models/activity.model.ts

export interface Activity {
  id: number;
  title: string;
  startDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
  owner: string;
  progress: number;
  status: 'Planifié' | 'En cours' | 'Terminé';
  comments: string;
}
