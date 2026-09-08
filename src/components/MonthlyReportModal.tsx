import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Printer,
  X,
  FileSpreadsheet,
  Truck,
  User,
  Fuel,
  MapPin,
  Building,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { TransportRecord } from '../types';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TransportRecord[];
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  records,
}) => {
  // Compute default date range (1st of previous month to today)
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const firstDayThreeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(firstDayThreeMonthsAgo);
  const [endDate, setEndDate] = useState(todayStr);
  const [activeTab, setActiveTab] = useState<'detailed' | 'monthWise'>('monthWise');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');

  if (!isOpen) return null;

  // Filter records within the selected date range
  const periodRecords = records.filter((r) => {
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (selectedVehicle !== 'ALL' && r.vehicle.toUpperCase() !== selectedVehicle.toUpperCase()) {
      return false;
    }
    return true;
  });

  // Sort chronological for ODO calculations
  const sortedPeriodRecords = [...periodRecords].sort((a, b) =>
    a.date.localeCompare(b.date) || a.id - b.id
  );

  // Extract unique vehicles in the system
  const vehicleList = Array.from(new Set(records.map((r) => r.vehicle.toUpperCase()))).sort();

  // Summary Metrics for the entire selected period
  const totalKm = sortedPeriodRecords.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
  const totalFuel = sortedPeriodRecords.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
  const overallMileage = totalFuel > 0 ? (totalKm / totalFuel).toFixed(2) : '0.00';

  // Group records by Month (YYYY-MM)
  interface MonthlyGroup {
    monthKey: string; // e.g. "2026-03"
    monthLabel: string; // e.g. "March 2026"
    records: TransportRecord[];
    totalKm: number;
    totalFuel: number;
    mileage: number;
    startOdo: number;
    endOdo: number;
    vehicles: string[];
    drivers: string[];
    stations: string[];
    locations: string[];
    vendors: string[];
    vehicleBreakdown: Array<{
      vehicle: string;
      totalKm: number;
      totalFuel: number;
      mileage: number;
      startOdo: number;
      endOdo: number;
      drivers: string[];
      stations: string[];
      locations: string[];
      vendors: string[];
    }>;
  }

  const monthGroups: MonthlyGroup[] = useMemo(() => {
    const map = new Map<string, TransportRecord[]>();

    sortedPeriodRecords.forEach((r) => {
      const mKey = r.date.slice(0, 7); // "YYYY-MM"
      if (!map.has(mKey)) {
        map.set(mKey, []);
      }
      map.get(mKey)!.push(r);
    });

    const groups: MonthlyGroup[] = [];
    // Sort months descending (most recent first)
    const sortedKeys = Array.from(map.keys()).sort().reverse();

    sortedKeys.forEach((mKey) => {
      const recs = map.get(mKey)!;
      const [yearStr, monthStr] = mKey.split('-');
      const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Aggregate overall for the month
      const mKm = recs.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
      const mFuel = recs.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
      const mMileage = mFuel > 0 ? Number((mKm / mFuel).toFixed(2)) : 0;

      const mStartOdo = recs.length > 0 ? Math.min(...recs.map((r) => r.opening)) : 0;
      const mEndOdo = recs.length > 0 ? Math.max(...recs.map((r) => r.closing)) : 0;

      const vSet = new Set<string>();
      const dSet = new Set<string>();
      const sSet = new Set<string>();
      const lSet = new Set<string>();
      const vendSet = new Set<string>();

      recs.forEach((r) => {
        if (r.vehicle) vSet.add(r.vehicle.toUpperCase());
        if (r.driver || r.userName) dSet.add(r.driver || r.userName);
        if (r.fuelStation) sSet.add(r.fuelStation);
        if (r.fuelLocation) lSet.add(r.fuelLocation);
        if (r.fuelVendor) vendSet.add(r.fuelVendor);
      });

      // Break down by vehicle within this month
      const vehicleSubMap = new Map<string, TransportRecord[]>();
      recs.forEach((r) => {
        const vKey = r.vehicle.toUpperCase();
        if (!vehicleSubMap.has(vKey)) vehicleSubMap.set(vKey, []);
        vehicleSubMap.get(vKey)!.push(r);
      });

      const vehicleBreakdown = Array.from(vehicleSubMap.entries()).map(([v, vRecs]) => {
        const vKm = vRecs.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
        const vFuel = vRecs.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
        const vMileage = vFuel > 0 ? Number((vKm / vFuel).toFixed(2)) : 0;
        const vStartOdo = vRecs.length > 0 ? Math.min(...vRecs.map((r) => r.opening)) : 0;
        const vEndOdo = vRecs.length > 0 ? Math.max(...vRecs.map((r) => r.closing)) : 0;

        return {
          vehicle: v,
          totalKm: vKm,
          totalFuel: vFuel,
          mileage: vMileage,
          startOdo: vStartOdo,
          endOdo: vEndOdo,
          drivers: Array.from(new Set(vRecs.map((r) => r.driver || r.userName).filter(Boolean))),
          stations: Array.from(new Set(vRecs.map((r) => r.fuelStation).filter(Boolean))),
          locations: Array.from(new Set(vRecs.map((r) => r.fuelLocation).filter(Boolean))),
          vendors: Array.from(new Set(vRecs.map((r) => r.fuelVendor).filter(Boolean))),
        };
      });

      groups.push({
        monthKey: mKey,
        monthLabel,
        records: recs,
        totalKm: mKm,
        totalFuel: mFuel,
        mileage: mMileage,
        startOdo: mStartOdo,
        endOdo: mEndOdo,
        vehicles: Array.from(vSet),
        drivers: Array.from(dSet),
        stations: Array.from(sSet),
        locations: Array.from(lSet),
        vendors: Array.from(vendSet),
        vehicleBreakdown,
      });
    });

    return groups;
  }, [sortedPeriodRecords]);

  // Export to CSV Functionality for the Monthly Mileage Report
  const handleExportMonthWiseCSV = () => {
    const headers = [
      'Month',
      'Vehicle Number',
      'User / Driver',
      'Starting ODO KM',
      'Ending ODO KM',
      'Total KM',
      'Fuel Litres (L)',
      'Fuel Station',
      'Fuel Fill Location',
      'Fuel Vendor',
      'Mileage (KM/L)',
    ];

    const rows: string[][] = [];

    monthGroups.forEach((m) => {
      m.vehicleBreakdown.forEach((vb) => {
        rows.push([
          m.monthLabel,
          vb.vehicle,
          vb.drivers.join('; '),
          String(vb.startOdo),
          String(vb.endOdo),
          String(vb.totalKm),
          String(vb.totalFuel),
          vb.stations.join('; ') || 'N/A',
          vb.locations.join('; ') || 'N/A',
          vb.vendors.join('; ') || 'N/A',
          String(vb.mileage),
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Month_Wise_Mileage_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Month-wise Mileage Report & Period Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comprehensive odometer continuity, fuel stations, fill locations (villages), and vendor records.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportMonthWiseCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Download Month-wise report as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Print report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Controls & Filters */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Start Date:
              </span>
              <input
                type="date"
                id="report-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                End Date:
              </span>
              <input
                type="date"
                id="report-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Vehicle Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
                Vehicle:
              </span>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Fleet Vehicles ({vehicleList.length})</option>
                {vehicleList.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setStartDate(firstDayThisMonth);
                  setEndDate(todayStr);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[11px] font-medium"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => {
                  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                    .toISOString()
                    .split('T')[0];
                  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
                    .toISOString()
                    .split('T')[0];
                  setStartDate(lastMonthStart);
                  setEndDate(lastMonthEnd);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[11px] font-medium"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate(firstDayThreeMonthsAgo);
                  setEndDate(todayStr);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[11px] font-medium"
              >
                Last 3 Months
              </button>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-300/80">
            <button
              type="button"
              onClick={() => setActiveTab('monthWise')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'monthWise'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Month-wise Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detailed')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'detailed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📋 All Entries in Period
            </button>
          </div>
        </div>

        {/* Selected Period Summary Metrics Strip */}
        <div className="px-5 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Entries</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{sortedPeriodRecords.length} trips</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Distance</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{totalKm.toLocaleString()} KM</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Total Fuel</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{totalFuel.toFixed(1)} L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Period Mileage</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{overallMileage} KM/L</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px]">
            Audited period from <strong className="text-slate-800">{startDate}</strong> to <strong className="text-slate-800">{endDate}</strong>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50">
          {sortedPeriodRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No records found for the selected period.</p>
              <p className="text-xs text-slate-400 mt-1">Adjust the Start Date or End Date above to view mileage reports.</p>
            </div>
          ) : activeTab === 'monthWise' ? (
            /* ========================================================================= */
            /* VIEW 1: MONTH-WISE AGGREGATED REPORTS                                    */
            /* ========================================================================= */
            <div className="space-y-6">
              {monthGroups.map((month) => (
                <div
                  key={month.monthKey}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Month Header Banner */}
                  <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h3 className="font-bold text-base text-white">{month.monthLabel}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {month.records.length} {month.records.length === 1 ? 'trip' : 'trips'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        Total Distance: <strong className="text-white">{month.totalKm.toLocaleString()} KM</strong>
                      </div>
                      <div>
                        Total Fuel: <strong className="text-white">{month.totalFuel.toFixed(1)} L</strong>
                      </div>
                      <div className="px-2 py-0.5 bg-emerald-900/80 text-emerald-300 rounded font-bold">
                        Monthly Mileage: {month.mileage.toFixed(2)} KM/L
                      </div>
                    </div>
                  </div>

                  {/* Month Vehicle Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                          <th className="py-2.5 px-3">Vehicle Number</th>
                          <th className="py-2.5 px-3">User / Driver</th>
                          <th className="py-2.5 px-3 text-right">Starting ODO KM</th>
                          <th className="py-2.5 px-3 text-right">Ending ODO KM</th>
                          <th className="py-2.5 px-3 text-right">Total KM</th>
                          <th className="py-2.5 px-3 text-right">Fuel Litres</th>
                          <th className="py-2.5 px-3">Fuel Station</th>
                          <th className="py-2.5 px-3">Fuel Fill Location (Village)</th>
                          <th className="py-2.5 px-3">Fuel Vendor</th>
                          <th className="py-2.5 px-3 text-right">Mileage (KM/L)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {month.vehicleBreakdown.map((vb) => (
                          <tr key={vb.vehicle} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                                {vb.vehicle}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">
                              {vb.drivers.length > 0 ? vb.drivers.join(', ') : 'Assigned Driver'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-slate-600">
                              {vb.startOdo.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-slate-600">
                              {vb.endOdo.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right font-bold text-blue-900">
                              {vb.totalKm.toLocaleString()} KM
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right text-slate-800">
                              {vb.totalFuel > 0 ? `${vb.totalFuel.toFixed(1)} L` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {vb.stations.length > 0 ? vb.stations.join(', ') : <span className="text-slate-400">-</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {vb.locations.length > 0 ? vb.locations.join(', ') : <span className="text-slate-400">-</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700">
                              {vb.vendors.length > 0 ? vb.vendors.join(', ') : <span className="text-slate-400">-</span>}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-right font-bold">
                              {vb.totalFuel > 0 ? (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    vb.mileage >= 4.0
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {vb.mileage.toFixed(2)} KM/L
                                </span>
                              ) : (
                                <span className="text-slate-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ========================================================================= */
            /* VIEW 2: DETAILED RECORD-BY-RECORD AUDIT TABLE                            */
            /* ========================================================================= */
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Detailed Mileage Records in Selected Period</span>
                <span className="font-mono">{sortedPeriodRecords.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Vehicle Number</th>
                      <th className="py-2.5 px-3">User / Driver</th>
                      <th className="py-2.5 px-3 text-right">Starting ODO KM</th>
                      <th className="py-2.5 px-3 text-right">Ending ODO KM</th>
                      <th className="py-2.5 px-3 text-right">Total KM</th>
                      <th className="py-2.5 px-3 text-right">Fuel Litres</th>
                      <th className="py-2.5 px-3">Fuel Station</th>
                      <th className="py-2.5 px-3">Fuel Fill Location (Village)</th>
                      <th className="py-2.5 px-3">Fuel Vendor</th>
                      <th className="py-2.5 px-3 text-right">Mileage (KM/L)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sortedPeriodRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{r.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.vehicle}
                        </td>
                        <td className="py-2 px-3 text-slate-800 whitespace-nowrap">
                          {r.userName || r.driver}
                        </td>
                        <td className="py-2 px-3 font-mono text-right text-slate-600">
                          {r.opening.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-mono text-right text-slate-600">
                          {r.closing.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 font-mono text-right font-bold text-blue-900">
                          {r.totalKm.toLocaleString()} KM
                        </td>
                        <td className="py-2 px-3 font-mono text-right text-slate-800">
                          {r.fuel > 0 ? `${r.fuel} L` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">
                          {r.fuelStation || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">
                          {r.fuelLocation || '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">
                          {r.fuelVendor || '-'}
                        </td>
                        <td className="py-2 px-3 font-mono text-right font-bold">
                          {r.fuel > 0 ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${
                                r.mileage >= 4.0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.mileage} KM/L
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                      <td colSpan={5} className="py-2.5 px-3 text-right uppercase text-[11px]">
                        Period Totals:
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">
                        {totalKm.toLocaleString()} KM
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                        {totalFuel.toFixed(1)} L
                      </td>
                      <td colSpan={3}></td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-800">
                        {overallMileage} KM/L
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {sortedPeriodRecords.length} records across {monthGroups.length} monthly report cycles
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
