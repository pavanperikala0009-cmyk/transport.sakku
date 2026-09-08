import React, { useState } from 'react';
import { Truck, Fuel, Route, IndianRupee, Gauge, X, Table, LayoutGrid, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { TransportRecord } from '../types';

interface FleetBreakdownProps {
  records: TransportRecord[];
  onSelectVehicle: (vehicle: string) => void;
  onClose?: () => void;
  onOpenVehicleManager?: () => void;
  isStandaloneView?: boolean;
}

export type PerformanceStatus = 'Good Mileage' | 'Normal Mileage' | 'Low Mileage' | 'No Data';

export const FleetBreakdown: React.FC<FleetBreakdownProps> = ({
  records,
  onSelectVehicle,
  onClose,
  onOpenVehicleManager,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Aggregate stats per vehicle
  const vehicleMap = new Map<
    string,
    {
      vehicle: string;
      trips: number;
      totalKm: number;
      totalFuel: number;
      totalFuelAmount: number;
      drivers: Set<string>;
    }
  >();

  records.forEach((r) => {
    const key = r.vehicle.toUpperCase();
    const existing = vehicleMap.get(key) || {
      vehicle: key,
      trips: 0,
      totalKm: 0,
      totalFuel: 0,
      totalFuelAmount: 0,
      drivers: new Set<string>(),
    };

    existing.trips += 1;
    existing.totalKm += Number(r.totalKm) || 0;
    existing.totalFuel += Number(r.fuel) || 0;
    existing.totalFuelAmount += Number(r.fuelAmount) || 0;
    if (r.driver) existing.drivers.add(r.driver);

    vehicleMap.set(key, existing);
  });

  const vehicleStats = Array.from(vehicleMap.values()).map((v) => {
    const avgMileage = v.totalFuel > 0 ? Number((v.totalKm / v.totalFuel).toFixed(2)) : 0;
    const costPerKm = v.totalKm > 0 ? v.totalFuelAmount / v.totalKm : 0;

    let status: PerformanceStatus = 'No Data';
    if (v.totalFuel > 0) {
      if (avgMileage >= 4.0) {
        status = 'Good Mileage';
      } else if (avgMileage >= 3.0) {
        status = 'Normal Mileage';
      } else {
        status = 'Low Mileage';
      }
    }

    return {
      ...v,
      avgMileage,
      costPerKm,
      status,
    };
  });

  // Calculate totals across all fleet
  const totalFleetKm = vehicleStats.reduce((sum, v) => sum + v.totalKm, 0);
  const totalFleetFuel = vehicleStats.reduce((sum, v) => sum + v.totalFuel, 0);
  const overallFleetMileage = totalFleetFuel > 0 ? (totalFleetKm / totalFleetFuel).toFixed(2) : '0.00';

  const getStatusBadge = (status: PerformanceStatus) => {
    switch (status) {
      case 'Good Mileage':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Good Mileage</span>
          </span>
        );
      case 'Normal Mileage':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <Gauge className="w-3 h-3 text-blue-400" />
            <span>Normal Mileage</span>
          </span>
        );
      case 'Low Mileage':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Low Mileage</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <span>No Fuel Log</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md mb-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-400" />
          <h2 className="text-base sm:text-lg font-bold">
            Fleet Vehicle Performance Summary
          </h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
            {vehicleStats.length} {vehicleStats.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle View: Table vs Cards */}
          <div className="inline-flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'table' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Cards</span>
            </button>
          </div>

          {onOpenVehicleManager && (
            <button
              type="button"
              onClick={onOpenVehicleManager}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white px-2.5 py-1 rounded border border-slate-700 transition-colors"
            >
              + Manage Fleet
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Close Fleet Summary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Fleet Totals Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 mb-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Fleet Distance</span>
          <span className="text-sm font-bold text-white">{totalFleetKm.toLocaleString()} KM</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Fuel Consumed</span>
          <span className="text-sm font-bold text-white">{totalFleetFuel.toFixed(1)} Litres</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Average Fleet Mileage</span>
          <span className="text-sm font-bold text-emerald-400">{overallFleetMileage} KM/L</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-sans">Mileage Criteria</span>
          <span className="text-[11px] text-slate-300">
            Good: &ge;4.0 &bull; Normal: 3.0-4.0 &bull; Low: &lt;3.0
          </span>
        </div>
      </div>

      {vehicleStats.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">No vehicle data logged yet.</p>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Exact required columns) */
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-800/90 text-slate-300 uppercase font-semibold border-b border-slate-700 text-center">
                <th className="py-2.5 px-3 text-left">Vehicle Number</th>
                <th className="py-2.5 px-3">Total KM</th>
                <th className="py-2.5 px-3">Total Fuel (Litres)</th>
                <th className="py-2.5 px-3">Overall Mileage (KM/L)</th>
                <th className="py-2.5 px-3">Performance Status</th>
                <th className="py-2.5 px-3">Trips</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-center">
              {vehicleStats.map((v) => (
                <tr
                  key={v.vehicle}
                  onClick={() => onSelectVehicle(v.vehicle)}
                  className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  title={`Filter records for ${v.vehicle}`}
                >
                  <td className="py-2.5 px-3 text-left font-mono font-bold text-blue-300 group-hover:text-blue-200">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {v.vehicle}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-white">
                    {v.totalKm.toLocaleString()} KM
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">
                    {v.totalFuel > 0 ? `${v.totalFuel.toFixed(1)} L` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                    {v.totalFuel > 0 ? `${v.avgMileage.toFixed(2)} KM/L` : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    {getStatusBadge(v.status)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {v.trips}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {vehicleStats.map((v) => (
            <div
              key={v.vehicle}
              onClick={() => onSelectVehicle(v.vehicle)}
              className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-lg p-3.5 transition-all cursor-pointer group"
              title={`Click to filter records for ${v.vehicle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-blue-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 group-hover:border-blue-500">
                  {v.vehicle}
                </span>
                {getStatusBadge(v.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 mt-3 pt-2 border-t border-slate-700/60">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Total KM</span>
                  <span className="font-bold text-white font-mono">{v.totalKm.toLocaleString()} km</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Total Fuel</span>
                  <span className="font-bold text-white font-mono">{v.totalFuel.toFixed(1)} L</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Mileage</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {v.avgMileage > 0 ? `${v.avgMileage.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Trips: <strong>{v.trips}</strong></span>
                {v.totalFuelAmount > 0 && (
                  <span>Total Fuel: <strong>₹{v.totalFuelAmount.toLocaleString('en-IN')}</strong></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
