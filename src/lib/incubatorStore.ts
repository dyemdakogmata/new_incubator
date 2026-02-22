"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IncubatorReading,
  IncubatorStatus,
  Alert,
  AlertConfig,
  TurningSchedule,
  getTemperatureStatus,
  getHumidityStatus,
} from "@/types/incubator";
import {
  generateMockReadings,
  generateCurrentStatus,
  generateAlerts,
  DEFAULT_ALERT_CONFIG,
  DEFAULT_TURNING_SCHEDULE,
} from "./mockData";

// Proxy routes — browser calls these Next.js endpoints, which forward to the ESP32
const API_BASE_URL = "/api/esp32";

export function useIncubatorData() {
  const [status, setStatus] = useState<IncubatorStatus>(generateCurrentStatus());
  const [readings, setReadings] = useState<IncubatorReading[]>(generateMockReadings(100));
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(DEFAULT_ALERT_CONFIG);
  const [turningSchedule, setTurningSchedule] = useState<TurningSchedule>(DEFAULT_TURNING_SCHEDULE);
  const [isLoading, setIsLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate real-time updates (polling every 5 seconds)
  const fetchStatus = useCallback(async () => {
    if (useMockData) {
      // Simulate live data with slight variations
      setStatus((prev) => {
        const newTemp = parseFloat((prev.temperature + (Math.random() - 0.5) * 0.2).toFixed(1));
        const newHumidity = parseFloat((prev.humidity + (Math.random() - 0.5) * 1).toFixed(1));
        const clampedTemp = Math.max(36.0, Math.min(40.0, newTemp));
        const clampedHumidity = Math.max(40, Math.min(80, newHumidity));

        return {
          ...prev,
          temperature: clampedTemp,
          humidity: clampedHumidity,
          lastUpdated: new Date(),
        };
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus({
          temperature: data.temperature,
          humidity: data.humidity,
          motorStatus: data.motor_status,
          turnsCompletedToday: data.turns_today,
          nextTurnIn: data.next_turn_in,
          lastUpdated: new Date(),
          isConnected: true,
        });
      } else {
        // Connection failed - show error details
        const errorData = await response.json().catch(() => ({}));
        console.error("ESP32 connection error:", response.status, errorData);
        setStatus((prev) => ({ ...prev, isConnected: false }));
      }
    } catch (err) {
      // Network error - ESP32 unreachable
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Cannot reach ESP32:", message);
      setStatus((prev) => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
    }
  }, [useMockData]);

  // Fetch logs every 15 minutes
  const fetchLogs = useCallback(async () => {
    if (useMockData) {
      // Add a new reading
      const newReading: IncubatorReading = {
        id: `reading-${Date.now()}`,
        timestamp: new Date(),
        temperature: status.temperature,
        humidity: status.humidity,
        eggTurningEvent: false,
        motorStatus: status.motorStatus,
      };
      setReadings((prev) => [newReading, ...prev].slice(0, 500));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/logs?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setReadings(
          data.map(
            (item: {
              id: string;
              timestamp: string;
              temperature: number;
              humidity: number;
              egg_turning: boolean;
              motor_status: string;
            }) => ({
              id: item.id,
              timestamp: new Date(item.timestamp),
              temperature: item.temperature,
              humidity: item.humidity,
              eggTurningEvent: item.egg_turning,
              motorStatus: item.motor_status,
            })
          )
        );
      }
    } catch {
      console.error("Failed to fetch logs");
    }
  }, [useMockData, status.temperature, status.humidity, status.motorStatus]);

  // Check for alerts
  const checkAlerts = useCallback(() => {
    const tempStatus = getTemperatureStatus(status.temperature, alertConfig);
    const humidityStatus = getHumidityStatus(status.humidity, alertConfig);
    const newAlerts: Alert[] = [];

    if (tempStatus !== "normal") {
      const existing = alerts.find(
        (a) => a.type === "temperature" && !a.acknowledged && Date.now() - a.timestamp.getTime() < 5 * 60 * 1000
      );
      if (!existing) {
        newAlerts.push({
          id: `alert-temp-${Date.now()}`,
          type: "temperature",
          severity: tempStatus === "high" ? "critical" : "warning",
          message:
            tempStatus === "high"
              ? `Temperature too high: ${status.temperature}°C (max: ${alertConfig.tempMax}°C)`
              : `Temperature too low: ${status.temperature}°C (min: ${alertConfig.tempMin}°C)`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }
    }

    if (humidityStatus !== "normal") {
      const existing = alerts.find(
        (a) => a.type === "humidity" && !a.acknowledged && Date.now() - a.timestamp.getTime() < 5 * 60 * 1000
      );
      if (!existing) {
        newAlerts.push({
          id: `alert-humidity-${Date.now()}`,
          type: "humidity",
          severity: humidityStatus === "high" ? "critical" : "warning",
          message:
            humidityStatus === "high"
              ? `Humidity too high: ${status.humidity}% (max: ${alertConfig.humidityMax}%)`
              : `Humidity too low: ${status.humidity}% (min: ${alertConfig.humidityMin}%)`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 50));
    }
  }, [status, alertConfig, alerts]);

  // Countdown timer
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setStatus((prev) => ({
        ...prev,
        nextTurnIn: Math.max(0, prev.nextTurnIn - 1),
      }));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Poll status every 5 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Poll logs every 15 minutes
  useEffect(() => {
    const interval = setInterval(fetchLogs, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  // Check alerts whenever status changes
  useEffect(() => {
    checkAlerts();
  }, [status.temperature, status.humidity]); // eslint-disable-line react-hooks/exhaustive-deps

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  const saveTurningSchedule = useCallback(
    async (schedule: TurningSchedule) => {
      setTurningSchedule(schedule);
      if (!useMockData) {
        try {
          await fetch(`${API_BASE_URL}/schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              turns_per_day: schedule.turnsPerDay,
              interval_hours: schedule.intervalHours,
            }),
          });
        } catch {
          console.error("Failed to save schedule");
        }
      }
    },
    [useMockData]
  );

  return {
    status,
    readings,
    alerts,
    alertConfig,
    turningSchedule,
    isLoading,
    useMockData,
    setUseMockData,
    setAlertConfig,
    acknowledgeAlert,
    saveTurningSchedule,
    fetchLogs,
  };
}
