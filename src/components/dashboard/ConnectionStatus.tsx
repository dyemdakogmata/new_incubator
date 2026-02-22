"use client";

import { Wifi, WifiOff, Egg, Activity } from "lucide-react";
import { format } from "date-fns";
import { ESP32_IP } from "@/lib/config";

interface ConnectionStatusProps {
  isConnected: boolean;
  lastUpdated: Date;
  useMockData: boolean;
  onToggleMockData: (value: boolean) => void;
}

export function ConnectionStatus({ isConnected, lastUpdated, useMockData, onToggleMockData }: ConnectionStatusProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Egg className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">EggWatch Pro</h1>
              <p className="text-gray-500 text-xs">Smart Incubator Monitor</p>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Updated {format(lastUpdated, "HH:mm:ss")}</span>
            </div>

            {/* Mock data toggle */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
              <span className="text-xs text-gray-400 hidden sm:block">
                {useMockData ? "Demo Mode" : "Live ESP32"}
              </span>
              <button
                onClick={() => onToggleMockData(!useMockData)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  useMockData ? "bg-orange-600" : "bg-emerald-600"
                }`}
                title={useMockData ? "Switch to live ESP32 data" : "Switch to demo mode"}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    useMockData ? "translate-x-1" : "translate-x-4.5"
                  }`}
                />
              </button>
            </div>

            {/* Connection status */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {isConnected ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:block">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            {!useMockData && (
              <div className="text-xs text-gray-500" title="ESP32 IP Address">
                {ESP32_IP}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
