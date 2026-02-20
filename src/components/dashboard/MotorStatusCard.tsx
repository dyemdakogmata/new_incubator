"use client";

import { RotateCw, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDuration } from "@/lib/mockData";

interface MotorStatusCardProps {
  motorStatus: "running" | "idle";
  turnsCompletedToday: number;
  nextTurnIn: number;
}

export function MotorStatusCard({ motorStatus, turnsCompletedToday, nextTurnIn }: MotorStatusCardProps) {
  const isRunning = motorStatus === "running";

  return (
    <Card className={`border ${isRunning ? "border-emerald-500/30" : "border-gray-700"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${isRunning ? "bg-emerald-500/10" : "bg-gray-700/50"}`}>
          <RotateCw
            className={`w-6 h-6 ${isRunning ? "text-emerald-400 animate-spin" : "text-gray-400"}`}
            style={{ animationDuration: "2s" }}
          />
        </div>
        <Badge variant={isRunning ? "success" : "neutral"} dot={isRunning}>
          {isRunning ? "Running" : "Idle"}
        </Badge>
      </div>

      <div className="mt-2">
        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Egg Turner</p>
        <p className={`text-3xl font-bold ${isRunning ? "text-emerald-400" : "text-gray-300"}`}>
          {isRunning ? "Turning..." : "Standby"}
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Turns Today</p>
            <p className="text-lg font-bold text-white">{turnsCompletedToday}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Next Turn</p>
            <p className="text-lg font-bold text-white tabular-nums">{formatDuration(nextTurnIn)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
