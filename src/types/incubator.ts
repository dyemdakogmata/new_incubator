export interface IncubatorReading {
  id: string;
  timestamp: Date;
  temperature: number; // °C
  humidity: number; // %
  eggTurningEvent: boolean;
  motorStatus: "running" | "idle";
}

export interface IncubatorStatus {
  temperature: number;
  humidity: number;
  motorStatus: "running" | "idle";
  turnsCompletedToday: number;
  nextTurnIn: number; // seconds
  lastUpdated: Date;
  isConnected: boolean;
}

export interface TurningSchedule {
  turnsPerDay: number;
  intervalHours: number;
  schedule: string[]; // list of times HH:MM
}

export interface AlertConfig {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
}

export interface Alert {
  id: string;
  type: "temperature" | "humidity" | "turning";
  severity: "warning" | "critical";
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export type TemperatureStatus = "low" | "normal" | "high";
export type HumidityStatus = "low" | "normal" | "high";

export function getTemperatureStatus(temp: number, config: AlertConfig): TemperatureStatus {
  if (temp < config.tempMin) return "low";
  if (temp > config.tempMax) return "high";
  return "normal";
}

export function getHumidityStatus(humidity: number, config: AlertConfig): HumidityStatus {
  if (humidity < config.humidityMin) return "low";
  if (humidity > config.humidityMax) return "high";
  return "normal";
}
