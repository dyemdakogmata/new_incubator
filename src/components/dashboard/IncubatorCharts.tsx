"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ComposedChart,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IncubatorReading, AlertConfig } from "@/types/incubator";
import { format } from "date-fns";

interface IncubatorChartsProps {
  readings: IncubatorReading[];
  alertConfig: AlertConfig;
}

interface ChartDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  turning: number | null;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number | null; color: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl text-sm">
        <p className="text-gray-400 mb-2 font-mono text-xs">{label}</p>
        {payload.map(
          (entry) =>
            entry.value !== null && (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-300">{entry.name}:</span>
                <span className="font-medium text-white">
                  {entry.name === "Temperature" ? `${entry.value}°C` : `${entry.value}%`}
                </span>
              </div>
            )
        )}
        {payload.some(
          (p) => p.name === "Egg Turn" && p.value !== null
        ) && (
          <div className="mt-1 pt-1 border-t border-gray-600">
            <span className="text-orange-400 text-xs">🥚 Egg turning event</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function IncubatorCharts({ readings, alertConfig }: IncubatorChartsProps) {
  const [activeChart, setActiveChart] = useState<"temperature" | "humidity">("temperature");

  // Use last 48 readings for chart (12 hours at 15-min intervals)
  const chartData: ChartDataPoint[] = readings
    .slice(0, 48)
    .reverse()
    .map((r) => ({
      time: format(r.timestamp, "HH:mm"),
      temperature: r.temperature,
      humidity: r.humidity,
      turning: r.eggTurningEvent ? r.temperature : null,
    }));

  return (
    <Card
      title="Trends & Visualization"
      subtitle="Last 12 hours of data"
      headerAction={
        <div className="flex gap-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveChart("temperature")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === "temperature"
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Temp
          </button>
          <button
            onClick={() => setActiveChart("humidity")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeChart === "humidity"
                ? "bg-cyan-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Humidity
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
            Temperature
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-500 inline-block" />
            Humidity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-orange-500 rounded-full inline-block" />
            Egg Turn
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#374151" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#6B7280", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={
                activeChart === "temperature"
                  ? [35, 41]
                  : [40, 80]
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ display: "none" }}
            />

            {activeChart === "temperature" && (
              <>
                <ReferenceLine
                  y={alertConfig.tempMax}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: "Max", fill: "#EF4444", fontSize: 10, position: "right" }}
                />
                <ReferenceLine
                  y={alertConfig.tempMin}
                  stroke="#3B82F6"
                  strokeDasharray="4 4"
                  label={{ value: "Min", fill: "#3B82F6", fontSize: 10, position: "right" }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981" }}
                />
              </>
            )}

            {activeChart === "humidity" && (
              <>
                <ReferenceLine
                  y={alertConfig.humidityMax}
                  stroke="#A855F7"
                  strokeDasharray="4 4"
                  label={{ value: "Max", fill: "#A855F7", fontSize: 10, position: "right" }}
                />
                <ReferenceLine
                  y={alertConfig.humidityMin}
                  stroke="#F59E0B"
                  strokeDasharray="4 4"
                  label={{ value: "Min", fill: "#F59E0B", fontSize: 10, position: "right" }}
                />
                <Line
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#06B6D4" }}
                />
              </>
            )}

            {/* Egg turning events as scatter dots */}
            <Scatter
              dataKey="turning"
              name="Egg Turn"
              fill="#F97316"
              shape={(props: { cx?: number; cy?: number; payload?: ChartDataPoint }) => {
                const { cx, cy, payload } = props;
                if (!payload?.turning || !cx || !cy) return <g />;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#F97316"
                    stroke="#FED7AA"
                    strokeWidth={2}
                  />
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
