import { IncubatorReading, IncubatorStatus, Alert, AlertConfig, TurningSchedule } from "@/types/incubator";

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  tempMin: 37.0,
  tempMax: 38.5,
  humidityMin: 55,
  humidityMax: 65,
};

export const DEFAULT_TURNING_SCHEDULE: TurningSchedule = {
  turnsPerDay: 3,
  intervalHours: 8,
  schedule: ["08:00", "16:00", "00:00"],
};

function randomBetween(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

export function generateMockReadings(count: number = 100): IncubatorReading[] {
  const readings: IncubatorReading[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000); // every 15 min
    const isTurningEvent = i % 32 === 0; // roughly every 8 hours

    readings.push({
      id: `reading-${i}`,
      timestamp,
      temperature: randomBetween(37.0, 38.5),
      humidity: randomBetween(55, 65),
      eggTurningEvent: isTurningEvent,
      motorStatus: isTurningEvent ? "running" : "idle",
    });
  }

  return readings;
}

export function generateCurrentStatus(): IncubatorStatus {
  return {
    temperature: randomBetween(37.2, 38.3),
    humidity: randomBetween(57, 63),
    motorStatus: "idle",
    turnsCompletedToday: 2,
    nextTurnIn: 3600 + Math.floor(Math.random() * 3600), // 1-2 hours
    lastUpdated: new Date(),
    isConnected: true,
  };
}

export function generateAlerts(): Alert[] {
  return [
    {
      id: "alert-1",
      type: "temperature",
      severity: "warning",
      message: "Temperature slightly above normal range (38.6°C)",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: "alert-2",
      type: "humidity",
      severity: "warning",
      message: "Humidity dropped below minimum threshold (54%)",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      acknowledged: true,
    },
  ];
}

export function calculateSchedule(turnsPerDay: number, intervalHours: number): string[] {
  const schedule: string[] = [];
  const startHour = 8; // Start at 8 AM

  for (let i = 0; i < turnsPerDay; i++) {
    const totalMinutes = (startHour * 60 + i * intervalHours * 60) % (24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    schedule.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`);
  }

  return schedule;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function exportToCSV(readings: IncubatorReading[]): void {
  const headers = ["Timestamp", "Temperature (°C)", "Humidity (%)", "Egg Turning Event", "Motor Status"];
  const rows = readings.map((r) => [
    r.timestamp.toISOString(),
    r.temperature.toFixed(1),
    r.humidity.toFixed(1),
    r.eggTurningEvent ? "Yes" : "No",
    r.motorStatus,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `incubator-logs-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
