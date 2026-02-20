"use client";

import { useIncubatorData } from "@/lib/incubatorStore";
import { ConnectionStatus } from "./ConnectionStatus";
import { TemperatureCard } from "./TemperatureCard";
import { HumidityCard } from "./HumidityCard";
import { MotorStatusCard } from "./MotorStatusCard";
import { TurningControlPanel } from "./TurningControlPanel";
import { DataLogsTable } from "./DataLogsTable";
import { IncubatorCharts } from "./IncubatorCharts";
import { AlertsPanel } from "./AlertsPanel";
import { HistoryPanel } from "./HistoryPanel";

export function Dashboard() {
  const {
    status,
    readings,
    alerts,
    alertConfig,
    turningSchedule,
    useMockData,
    setUseMockData,
    setAlertConfig,
    acknowledgeAlert,
    saveTurningSchedule,
    fetchLogs,
  } = useIncubatorData();

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <ConnectionStatus
        isConnected={status.isConnected}
        lastUpdated={status.lastUpdated}
        useMockData={useMockData}
        onToggleMockData={setUseMockData}
      />

      {/* Alert Banner */}
      {activeAlertCount > 0 && (
        <div className="bg-red-900/40 border-b border-red-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <p className="text-red-300 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <strong>{activeAlertCount} active alert{activeAlertCount !== 1 ? "s" : ""}</strong>
              {" — "}Check the Alerts section below for details
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section: Real-Time Monitoring */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            <h2 className="text-lg font-semibold text-white">Real-Time Monitoring</h2>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <TemperatureCard temperature={status.temperature} alertConfig={alertConfig} />
            <HumidityCard humidity={status.humidity} alertConfig={alertConfig} />
            <MotorStatusCard
              motorStatus={status.motorStatus}
              turnsCompletedToday={status.turnsCompletedToday}
              nextTurnIn={status.nextTurnIn}
            />
          </div>
        </section>

        {/* Section: Charts + Alerts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h2 className="text-lg font-semibold text-white">Charts & Alerts</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <IncubatorCharts readings={readings} alertConfig={alertConfig} />
            </div>
            <div>
              <AlertsPanel
                alerts={alerts}
                alertConfig={alertConfig}
                onAcknowledge={acknowledgeAlert}
                onUpdateConfig={setAlertConfig}
              />
            </div>
          </div>
        </section>

        {/* Section: Control Panel + Logs */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-orange-500 rounded-full" />
            <h2 className="text-lg font-semibold text-white">Control & Logs</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <TurningControlPanel schedule={turningSchedule} onSave={saveTurningSchedule} />
            </div>
            <div className="lg:col-span-2">
              <DataLogsTable readings={readings} onRefresh={fetchLogs} limit={20} />
            </div>
          </div>
        </section>

        {/* Section: Full History */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            <h2 className="text-lg font-semibold text-white">Full History</h2>
          </div>
          <HistoryPanel readings={readings} />
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 border-t border-gray-800 text-center text-xs text-gray-600">
          <p>EggWatch Pro — Smart Incubator Monitoring System</p>
          <p className="mt-1">
            Designed for ESP32 integration •{" "}
            <span className="text-gray-500">
              API: {process.env.NEXT_PUBLIC_ESP32_API_URL || "http://192.168.1.100"}
            </span>
          </p>
        </footer>
      </main>
    </div>
  );
}
