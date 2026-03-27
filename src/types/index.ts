export interface Holiday {
  fecha: string;
  tipo: string;
  nombre: string;
}

export interface UpcomingHoliday extends Holiday {
  date: Date;
  daysRemaining: number;
}

export interface WeatherData {
  temp: number;
  conditionCode: number;
  time: string;
  isDay: boolean;
}
