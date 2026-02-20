"use client";

import { useState } from "react";
import { Settings, Save, Clock, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TurningSchedule } from "@/types/incubator";
import { calculateSchedule } from "@/lib/mockData";

interface TurningControlPanelProps {
  schedule: TurningSchedule;
  onSave: (schedule: TurningSchedule) => void;
}

export function TurningControlPanel({ schedule, onSave }: TurningControlPanelProps) {
  const [turnsPerDay, setTurnsPerDay] = useState(schedule.turnsPerDay);
  const [intervalHours, setIntervalHours] = useState(schedule.intervalHours);
  const [saved, setSaved] = useState(false);

  const previewSchedule = calculateSchedule(turnsPerDay, intervalHours);

  const handleSave = () => {
    const newSchedule: TurningSchedule = {
      turnsPerDay,
      intervalHours,
      schedule: previewSchedule,
    };
    onSave(newSchedule);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card
      title="Egg Turning Control"
      subtitle="Configure automatic turning schedule"
      headerAction={
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Settings className="w-4 h-4 text-orange-400" />
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Turns Per Day
          </label>
          <div className="relative">
            <RefreshCw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              min={1}
              max={24}
              value={turnsPerDay}
              onChange={(e) => setTurnsPerDay(Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Recommended: 3-8 times/day</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Interval (Hours)
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={intervalHours}
              onChange={(e) => setIntervalHours(Math.max(1, Math.min(24, parseFloat(e.target.value) || 1)))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Hours between each turn</p>
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
        <p className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-400" />
          Calculated Schedule
        </p>
        <div className="flex flex-wrap gap-2">
          {previewSchedule.map((time, i) => (
            <span
              key={i}
              className="bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-lg px-3 py-1 text-sm font-mono"
            >
              {time}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {turnsPerDay} turn{turnsPerDay !== 1 ? "s" : ""} per day, every {intervalHours} hour{intervalHours !== 1 ? "s" : ""}
        </p>
      </div>

      <button
        onClick={handleSave}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
          saved
            ? "bg-emerald-600 text-white"
            : "bg-orange-600 hover:bg-orange-500 text-white"
        }`}
      >
        <Save className="w-4 h-4" />
        {saved ? "Schedule Saved!" : "Save & Apply Schedule"}
      </button>
    </Card>
  );
}
