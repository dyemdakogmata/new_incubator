"use client";

import { Droplets } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertConfig, getHumidityStatus } from "@/types/incubator";

interface HumidityCardProps {
  humidity: number;
  alertConfig: AlertConfig;
}

export function HumidityCard({ humidity, alertConfig }: HumidityCardProps) {
  const status = getHumidityStatus(humidity, alertConfig);

  const colorMap = {
    low: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      badge: "warning" as const,
      label: "Too Dry",
      bar: "bg-amber-500",
    },
    normal: {
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      badge: "info" as const,
      label: "Normal",
      bar: "bg-cyan-500",
    },
    high: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      badge: "danger" as const,
      label: "Too Humid",
      bar: "bg-purple-500",
    },
  };

  const colors = colorMap[status];

  return (
    <Card className={`border ${colors.border} shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Droplets className={`w-6 h-6 ${colors.text}`} />
        </div>
        <Badge variant={colors.badge} dot>
          {colors.label}
        </Badge>
      </div>

      <div className="mt-2">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Humidity</p>
        <div className="flex items-end gap-2">
          <span className={`text-6xl font-bold tabular-nums ${colors.text}`}>
            {humidity.toFixed(1)}
          </span>
          <span className={`text-2xl font-medium mb-2 ${colors.text}`}>%</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Min: {alertConfig.humidityMin}%</span>
          <span>Safe Range</span>
          <span>Max: {alertConfig.humidityMax}%</span>
        </div>
        <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
            style={{
              width: `${Math.min(100, Math.max(0, humidity))}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
