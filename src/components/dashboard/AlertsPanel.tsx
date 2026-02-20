"use client";

import { useState } from "react";
import { AlertTriangle, Bell, BellOff, CheckCircle, X, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Alert, AlertConfig } from "@/types/incubator";
import { format } from "date-fns";

interface AlertsPanelProps {
  alerts: Alert[];
  alertConfig: AlertConfig;
  onAcknowledge: (id: string) => void;
  onUpdateConfig: (config: AlertConfig) => void;
}

export function AlertsPanel({ alerts, alertConfig, onAcknowledge, onUpdateConfig }: AlertsPanelProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [localConfig, setLocalConfig] = useState(alertConfig);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged).slice(0, 5);

  const handleSaveConfig = () => {
    onUpdateConfig(localConfig);
    setShowConfig(false);
  };

  const alertTypeIcon = {
    temperature: "🌡️",
    humidity: "💧",
    turning: "🔄",
  };

  return (
    <Card
      title="Alerts"
      subtitle={`${activeAlerts.length} active alert${activeAlerts.length !== 1 ? "s" : ""}`}
      headerAction={
        <div className="flex items-center gap-2">
          {activeAlerts.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
              {activeAlerts.length}
            </span>
          )}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-1.5 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            title="Configure alert thresholds"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {/* Alert Config Panel */}
      {showConfig && (
        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <p className="text-sm font-medium text-gray-300 mb-3">Alert Thresholds</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={localConfig.tempMin}
                onChange={(e) => setLocalConfig({ ...localConfig, tempMin: parseFloat(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Temp (°C)</label>
              <input
                type="number"
                step="0.1"
                value={localConfig.tempMax}
                onChange={(e) => setLocalConfig({ ...localConfig, tempMax: parseFloat(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Min Humidity (%)</label>
              <input
                type="number"
                value={localConfig.humidityMin}
                onChange={(e) => setLocalConfig({ ...localConfig, humidityMin: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Max Humidity (%)</label>
              <input
                type="number"
                value={localConfig.humidityMax}
                onChange={(e) => setLocalConfig({ ...localConfig, humidityMax: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSaveConfig}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm py-1.5 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowConfig(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white text-sm py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
          <CheckCircle className="w-8 h-8 mb-2 text-emerald-500/50" />
          <p className="text-sm">All systems normal</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}
            >
              <span className="text-lg flex-shrink-0">{alertTypeIcon[alert.type]}</span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    alert.severity === "critical" ? "text-red-300" : "text-amber-300"
                  }`}
                >
                  {alert.message}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {format(alert.timestamp, "HH:mm:ss")}
                </p>
              </div>
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors"
                title="Acknowledge"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Acknowledged Alerts */}
      {acknowledgedAlerts.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <BellOff className="w-3 h-3" />
            Recent acknowledged
          </p>
          <div className="space-y-1">
            {acknowledgedAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-2 text-xs text-gray-600 py-1">
                <Bell className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{alert.message}</span>
                <span className="flex-shrink-0">{format(alert.timestamp, "HH:mm")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Check incubator conditions immediately</span>
          </div>
        </div>
      )}
    </Card>
  );
}
