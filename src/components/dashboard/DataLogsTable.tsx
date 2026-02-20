"use client";

import { useState } from "react";
import { ClipboardList, RefreshCw, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IncubatorReading } from "@/types/incubator";
import { format } from "date-fns";

interface DataLogsTableProps {
  readings: IncubatorReading[];
  onRefresh: () => void;
  limit?: number;
}

export function DataLogsTable({ readings, onRefresh, limit = 20 }: DataLogsTableProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const displayReadings = readings.slice(0, limit);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <Card
      title="Data Logs"
      subtitle={`Latest ${limit} readings • Auto-updates every 15 min`}
      headerAction={
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      }
    >
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                Timestamp
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                Temp (°C)
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                Humidity (%)
              </th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3 pr-4">
                Egg Turn
              </th>
              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                Motor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {displayReadings.map((reading) => (
              <tr key={reading.id} className="hover:bg-gray-700/30 transition-colors">
                <td className="py-3 pr-4 text-gray-300 font-mono text-xs whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {reading.eggTurningEvent && (
                      <RotateCw className="w-3 h-3 text-orange-400 flex-shrink-0" />
                    )}
                    {format(reading.timestamp, "MMM dd, HH:mm:ss")}
                  </div>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`font-mono font-medium ${
                      reading.temperature < 37.0
                        ? "text-blue-400"
                        : reading.temperature > 38.5
                        ? "text-red-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {reading.temperature.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span
                    className={`font-mono font-medium ${
                      reading.humidity < 55
                        ? "text-amber-400"
                        : reading.humidity > 65
                        ? "text-purple-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {reading.humidity.toFixed(1)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-center">
                  {reading.eggTurningEvent ? (
                    <Badge variant="warning" size="sm">Yes</Badge>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 text-center">
                  <Badge
                    variant={reading.motorStatus === "running" ? "success" : "neutral"}
                    size="sm"
                    dot={reading.motorStatus === "running"}
                  >
                    {reading.motorStatus === "running" ? "Running" : "Idle"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {displayReadings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ClipboardList className="w-10 h-10 mb-3 opacity-50" />
            <p>No logs available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
