"use client";

import { Thermometer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertConfig, getTemperatureStatus } from "@/types/incubator";

interface TemperatureCardProps {
  temperature: number;
  alertConfig: AlertConfig;
}

export function TemperatureCard({ temperature, alertConfig }: TemperatureCardProps) {
  const status = getTemperatureStatus(temperature, alertConfig);

  const colorMap = {
    low: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      badge: "info" as const,
      label: "Too Low",
      glow: "shadow-blue-500/20",
    },
    normal: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      badge: "success" as const,
      label: "Normal",
      glow: "shadow-emerald-500/20",
    },
    high: {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      badge: "danger" as const,
      label: "Too High",
      glow: "shadow-red-500/20",
    },
  };

  const colors = colorMap[status];

  return (
    <Card className={`border ${colors.border} shadow-lg ${colors.glow}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Thermometer className={`w-6 h-6 ${colors.text}`} />
        </div>
        <Badge variant={colors.badge} dot>
          {colors.label}
        </Badge>
      </div>

      <div className="mt-2">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Temperature</p>
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-bold tabular-nums ${colors.text}`}>
            {temperature.toFixed(1)}
          </span>
          <span className={`text-2xl font-medium mb-2 ${colors.text}`}>°C</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Min: {alertConfig.tempMin}°C</span>
          <span>Safe Range</span>
          <span>Max: {alertConfig.tempMax}°C</span>
        </div>
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status === "low" ? "bg-blue-500" : status === "high" ? "bg-red-500" : "bg-emerald-500"
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, ((temperature - 35) / (42 - 35)) * 100))}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
