export interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}

export interface UpcomingHoliday extends Holiday {
  date: Date;
  daysRemaining: number;
}
