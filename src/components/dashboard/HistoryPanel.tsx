"use client";

import { useState, useMemo } from "react";
import { Search, Download, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IncubatorReading } from "@/types/incubator";
import { exportToCSV } from "@/lib/mockData";
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

interface HistoryPanelProps {
  readings: IncubatorReading[];
}

interface Filters {
  dateFrom: string;
  dateTo: string;
  tempMin: string;
  tempMax: string;
  humidityMin: string;
  humidityMax: string;
  turningOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  dateFrom: "",
  dateTo: "",
  tempMin: "",
  tempMax: "",
  humidityMin: "",
  humidityMax: "",
  turningOnly: false,
};

export function HistoryPanel({ readings }: HistoryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchDate, setSearchDate] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filteredReadings = useMemo(() => {
    return readings.filter((r) => {
      // Date search
      if (searchDate) {
        const dateStr = format(r.timestamp, "yyyy-MM-dd");
        if (!dateStr.includes(searchDate)) return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        try {
          const from = startOfDay(parseISO(filters.dateFrom));
          if (r.timestamp < from) return false;
        } catch {
          // ignore invalid date
        }
      }
      if (filters.dateTo) {
        try {
          const to = endOfDay(parseISO(filters.dateTo));
          if (r.timestamp > to) return false;
        } catch {
          // ignore invalid date
        }
      }

      // Temperature filter
      if (filters.tempMin && r.temperature < parseFloat(filters.tempMin)) return false;
      if (filters.tempMax && r.temperature > parseFloat(filters.tempMax)) return false;

      // Humidity filter
      if (filters.humidityMin && r.humidity < parseFloat(filters.humidityMin)) return false;
      if (filters.humidityMax && r.humidity > parseFloat(filters.humidityMax)) return false;

      // Turning only filter
      if (filters.turningOnly && !r.eggTurningEvent) return false;

      return true;
    });
  }, [readings, searchDate, filters]);

  const totalPages = Math.ceil(filteredReadings.length / itemsPerPage);
  const paginatedReadings = filteredReadings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.tempMin ||
    filters.tempMax ||
    filters.humidityMin ||
    filters.humidityMax ||
    filters.turningOnly;

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchDate("");
    setCurrentPage(1);
  };

  return (
    <Card
      title="Full History"
      subtitle={`${filteredReadings.length} of ${readings.length} records`}
      headerAction={
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCSV(filteredReadings)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => { setSearchDate(e.target.value); setCurrentPage(1); }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Search by date"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
            hasActiveFilters
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Temp Min (°C)</label>
              <input
                type="number"
                step="0.1"
                value={filters.tempMin}
                onChange={(e) => { setFilters({ ...filters, tempMin: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 37.0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Temp Max (°C)</label>
              <input
                type="number"
                step="0.1"
                value={filters.tempMax}
                onChange={(e) => { setFilters({ ...filters, tempMax: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. 38.5"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Humidity Min (%)</label>
              <input
                type="number"
                value={filters.humidityMin}
                onChange={(e) => { setFilters({ ...filters, humidityMin: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 55"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Humidity Max (%)</label>
              <input
                type="number"
                value={filters.humidityMax}
                onChange={(e) => { setFilters({ ...filters, humidityMax: e.target.value }); setCurrentPage(1); }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 65"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.turningOnly}
                onChange={(e) => { setFilters({ ...filters, turningOnly: e.target.checked }); setCurrentPage(1); }}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-300">Show egg turning events only</span>
            </label>
          </div>
        </div>
      )}

      {/* Table */}
      {isExpanded && (
        <>
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
                {paginatedReadings.map((reading) => (
                  <tr key={reading.id} className={`hover:bg-gray-700/30 transition-colors ${reading.eggTurningEvent ? "bg-orange-500/5" : ""}`}>
                    <td className="py-2.5 pr-4 text-gray-300 font-mono text-xs whitespace-nowrap">
                      {format(reading.timestamp, "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="py-2.5 pr-4 text-right">
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
                    <td className="py-2.5 pr-4 text-right">
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
                    <td className="py-2.5 pr-4 text-center">
                      {reading.eggTurningEvent ? (
                        <Badge variant="warning" size="sm">Yes</Badge>
                      ) : (
                        <span className="text-gray-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-center">
                      <Badge
                        variant={reading.motorStatus === "running" ? "success" : "neutral"}
                        size="sm"
                      >
                        {reading.motorStatus === "running" ? "Running" : "Idle"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedReadings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-10 h-10 mb-3 opacity-50" />
                <p>No records match your filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Page {currentPage} of {totalPages} ({filteredReadings.length} records)
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!isExpanded && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Click <strong className="text-gray-300">Expand</strong> to view full history table
        </div>
      )}
    </Card>
  );
}
