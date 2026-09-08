import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Truck,
  Fuel,
  MapPin,
  Building,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { TransportRecord, User } from '../types';

interface MonthWiseReportViewProps {
  records: TransportRecord[];
  onSelectVehicleForDaily?: (vehicle: string) => void;
  onPrintPreview?: () => void;
  currentUser?: User | null;
}

export const MonthWiseReportView: React.FC<MonthWiseReportViewProps> = ({
  records,
  onSelectVehicleForDaily,
  onPrintPreview,
  currentUser,
}) => {
  // Compute default date range (1st of 3 months ago to today)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const firstDayThreeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    .toISOString()
    .split('T')[0];

  const [startDate, setStartDate] = useState(firstDayThreeMonthsAgo);
  const [endDate, setEndDate] = useState(todayStr);
  const [subView, setSubView] = useState<'monthSummary' | 'detailedPeriod'>('monthSummary');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('ALL');

  // Quick Preset Handlers
  const applyPreset = (preset: 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'all') => {
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = d.getMonth();

    if (preset === 'thisMonth') {
      setStartDate(new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'lastMonth') {
      const startLastMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
      const endLastMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      setStartDate(startLastMonth);
      setEndDate(endLastMonth);
    } else if (preset === 'last3Months') {
      setStartDate(new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'thisYear') {
      setStartDate(`${currentYear}-01-01`);
      setEndDate(todayStr);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filter records within the selected date range and vehicle
  const periodRecords = useMemo(() => {
    return records.filter((r) => {
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      if (selectedVehicle !== 'ALL' && r.vehicle.toUpperCase() !== selectedVehicle.toUpperCase()) {
        return false;
      }
      return true;
    });
  }, [records, startDate, endDate, selectedVehicle]);

  // Sort chronological for ODO calculations
  const sortedPeriodRecords = useMemo(() => {
    return [...periodRecords].sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
  }, [periodRecords]);

  // Extract unique vehicles in the system
  const vehicleList = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.vehicle.toUpperCase()))).sort();
  }, [records]);

  // Summary Metrics for the entire selected period
  const totalKm = useMemo(
    () => sortedPeriodRecords.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0),
    [sortedPeriodRecords]
  );
  const totalFuel = useMemo(
    () => sortedPeriodRecords.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0),
    [sortedPeriodRecords]
  );
  const totalFuelCost = useMemo(
    () => sortedPeriodRecords.reduce((sum, r) => sum + (Number(r.fuelAmount) || 0), 0),
    [sortedPeriodRecords]
  );
  const overallMileage = totalFuel > 0 ? (totalKm / totalFuel).toFixed(2) : '0.00';

  // Group records by Month (YYYY-MM)
  interface MonthlyGroup {
    monthKey: string;
    monthLabel: string;
    records: TransportRecord[];
    totalKm: number;
    totalFuel: number;
    totalAmount: number;
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
      totalAmount: number;
      mileage: number;
      startOdo: number;
      endOdo: number;
      drivers: string[];
      stations: string[];
      locations: string[];
      vendors: string[];
      tripsCount: number;
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
    const sortedKeys = Array.from(map.keys()).sort().reverse();

    sortedKeys.forEach((mKey) => {
      const recs = map.get(mKey)!;
      const [yearStr, monthStr] = mKey.split('-');
      const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      const mKm = recs.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
      const mFuel = recs.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
      const mAmount = recs.reduce((sum, r) => sum + (Number(r.fuelAmount) || 0), 0);
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

      const vehicleSubMap = new Map<string, TransportRecord[]>();
      recs.forEach((r) => {
        const vKey = r.vehicle.toUpperCase();
        if (!vehicleSubMap.has(vKey)) vehicleSubMap.set(vKey, []);
        vehicleSubMap.get(vKey)!.push(r);
      });

      const vehicleBreakdown = Array.from(vehicleSubMap.entries()).map(([v, vRecs]) => {
        const vKm = vRecs.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
        const vFuel = vRecs.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
        const vAmount = vRecs.reduce((sum, r) => sum + (Number(r.fuelAmount) || 0), 0);
        const vMileage = vFuel > 0 ? Number((vKm / vFuel).toFixed(2)) : 0;
        const vStartOdo = vRecs.length > 0 ? Math.min(...vRecs.map((r) => r.opening)) : 0;
        const vEndOdo = vRecs.length > 0 ? Math.max(...vRecs.map((r) => r.closing)) : 0;

        return {
          vehicle: v,
          totalKm: vKm,
          totalFuel: vFuel,
          totalAmount: vAmount,
          mileage: vMileage,
          startOdo: vStartOdo,
          endOdo: vEndOdo,
          drivers: Array.from(new Set(vRecs.map((r) => r.driver || r.userName).filter(Boolean))),
          stations: Array.from(new Set(vRecs.map((r) => r.fuelStation).filter(Boolean))),
          locations: Array.from(new Set(vRecs.map((r) => r.fuelLocation).filter(Boolean))),
          vendors: Array.from(new Set(vRecs.map((r) => r.fuelVendor).filter(Boolean))),
          tripsCount: vRecs.length,
        };
      });

      groups.push({
        monthKey: mKey,
        monthLabel,
        records: recs,
        totalKm: mKm,
        totalFuel: mFuel,
        totalAmount: mAmount,
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
      'Total Fuel Amount (INR)',
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
          String(vb.totalAmount),
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Month_Wise_Mileage_Report_${startDate || 'all'}_to_${endDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMileageBadge = (mileage: number) => {
    if (mileage >= 4.0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle className="w-3 h-3 text-emerald-600" />
          <span>Good ({mileage.toFixed(2)})</span>
        </span>
      );
    }
    if (mileage >= 3.0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
          <TrendingUp className="w-3 h-3 text-blue-600" />
          <span>Normal ({mileage.toFixed(2)})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        <span>Low ({mileage.toFixed(2)})</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Month-Wise Mileage & Odometer Audit
                </h2>
                <p className="text-xs text-slate-500">
                  Continuous starting & ending ODO tracking, fuel stations, fill villages, and vendor summaries
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Toggle Summary vs Detailed */}
            <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setSubView('monthSummary')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  subView === 'monthSummary'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Month Summary</span>
              </button>
              <button
                type="button"
                onClick={() => setSubView('detailedPeriod')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  subView === 'detailedPeriod'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Period Trips ({sortedPeriodRecords.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportMonthWiseCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
              title="Download Month-Wise CSV summary"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>

            {onPrintPreview && (
              <button
                type="button"
                onClick={onPrintPreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                title="Print or view official PDF mileage sheet"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF Statement</span>
              </button>
            )}
          </div>
        </div>

        {/* Date Range Selectors & Filter Presets */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end text-xs">
          {/* Start Date */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Vehicle Filter */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Filter Vehicle
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <div className="md:col-span-3 flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => applyPreset('thisMonth')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-200"
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => applyPreset('lastMonth')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-200"
            >
              Last Month
            </button>
            <button
              type="button"
              onClick={() => applyPreset('last3Months')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-200"
            >
              3 Months
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] border border-slate-200"
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Period Grand Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Audited Period Distance
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
              {totalKm.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">KM</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Fuel Consumed
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-700">
              {totalFuel.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-slate-500">Litres</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Overall Period Mileage
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
              {overallMileage}
            </span>
            <span className="text-xs font-semibold text-slate-500">KM/L</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Fuel Cost
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black font-mono text-blue-700">
              ₹{totalFuelCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Period Records Audited
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-700">
              {sortedPeriodRecords.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              across {monthGroups.length} month(s)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {monthGroups.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 space-y-3">
          <Calendar className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="font-semibold text-base text-slate-700">No records found for the selected dates.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try choosing a broader date range or select &quot;All Time&quot; preset above to see your fleet&apos;s month-by-month mileage.
          </p>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 shadow-xs"
          >
            Show All Time Records
          </button>
        </div>
      ) : subView === 'monthSummary' ? (
        /* 1. MONTH-BY-MONTH GROUPED SUMMARY VIEW */
        <div className="space-y-6">
          {monthGroups.map((group) => (
            <div
              key={group.monthKey}
              className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden"
            >
              {/* Month Header Banner */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-600 text-white">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <span>{group.monthLabel}</span>
                      <span className="text-xs font-mono font-normal bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {group.records.length} trips
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Vehicles: {group.vehicles.join(', ') || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Month Totals Banner */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans">Distance</span>
                    <span className="font-bold text-white text-sm">{group.totalKm.toLocaleString()} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans">Fuel</span>
                    <span className="font-bold text-amber-300 text-sm">{group.totalFuel.toFixed(1)} L</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans">Avg Mileage</span>
                    <span className="font-bold text-emerald-400 text-sm">{group.mileage.toFixed(2)} KM/L</span>
                  </div>
                </div>
              </div>

              {/* Vehicle-wise breakdown table for this month */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-center">
                      <th className="py-2.5 px-3 text-left">Vehicle Number</th>
                      <th className="py-2.5 px-3 text-left">User / Drivers</th>
                      <th className="py-2.5 px-3">Starting ODO</th>
                      <th className="py-2.5 px-3">Ending ODO</th>
                      <th className="py-2.5 px-3">Total KM</th>
                      <th className="py-2.5 px-3">Fuel (L)</th>
                      <th className="py-2.5 px-3 text-left">Fuel Stations</th>
                      <th className="py-2.5 px-3 text-left">Fill Location (Village)</th>
                      <th className="py-2.5 px-3 text-left">Fuel Vendor</th>
                      <th className="py-2.5 px-3">Mileage (KM/L)</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-center">
                    {group.vehicleBreakdown.map((vb) => (
                      <tr key={vb.vehicle} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-left font-mono font-bold text-blue-900 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                            {vb.vehicle}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-left font-medium text-slate-800 max-w-[140px] truncate">
                          {vb.drivers.join(', ') || '-'}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {vb.startOdo.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {vb.endOdo.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {vb.totalKm.toLocaleString()} KM
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-800 font-semibold whitespace-nowrap">
                          {vb.totalFuel > 0 ? `${vb.totalFuel.toFixed(1)} L` : '-'}
                        </td>
                        <td className="py-3 px-3 text-left text-xs max-w-[150px]">
                          {vb.stations.length > 0 ? (
                            <div className="flex items-center gap-1 font-medium text-slate-800 truncate" title={vb.stations.join(', ')}>
                              <Fuel className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{vb.stations.join(', ')}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-left text-xs max-w-[140px]">
                          {vb.locations.length > 0 ? (
                            <div className="flex items-center gap-1 text-slate-600 truncate" title={vb.locations.join(', ')}>
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{vb.locations.join(', ')}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-left text-xs max-w-[140px]">
                          {vb.vendors.length > 0 ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium truncate block max-w-full" title={vb.vendors.join(', ')}>
                              {vb.vendors.join(', ')}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {vb.totalFuel > 0 ? getMileageBadge(vb.mileage) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {onSelectVehicleForDaily && (
                            <button
                              type="button"
                              onClick={() => onSelectVehicleForDaily(vb.vehicle)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View Logs</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </button>
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
        /* 2. DETAILED TRIP AUDIT TABLE FOR SELECTED PERIOD */
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Detailed Trip Records ({sortedPeriodRecords.length} Entries)
            </span>
            <span className="text-xs text-slate-500">
              Showing sorted chronological records for period {startDate || 'start'} to {endDate || 'end'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200 text-center">
                  <th className="py-2.5 px-3 text-left">Date</th>
                  <th className="py-2.5 px-3 text-left">Vehicle</th>
                  <th className="py-2.5 px-3 text-left">User / Driver</th>
                  <th className="py-2.5 px-3">Starting ODO</th>
                  <th className="py-2.5 px-3">Ending ODO</th>
                  <th className="py-2.5 px-3">Total KM</th>
                  <th className="py-2.5 px-3">Fuel (L)</th>
                  <th className="py-2.5 px-3 text-left">Fuel Station</th>
                  <th className="py-2.5 px-3 text-left">Village Location</th>
                  <th className="py-2.5 px-3 text-left">Fuel Vendor</th>
                  <th className="py-2.5 px-3">Mileage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-center">
                {sortedPeriodRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-left font-mono font-medium text-slate-700 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="py-2.5 px-3 text-left font-mono font-bold text-blue-900 whitespace-nowrap">
                      {r.vehicle}
                    </td>
                    <td className="py-2.5 px-3 text-left font-medium text-slate-800 whitespace-nowrap">
                      {r.userName || r.driver || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {r.opening.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {r.closing.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {r.totalKm.toLocaleString()} KM
                    </td>
                    <td className="py-2.5 px-3 font-mono text-amber-800 whitespace-nowrap">
                      {r.fuel > 0 ? `${r.fuel} L` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-left max-w-[140px] truncate text-slate-800">
                      {r.fuelStation || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-left max-w-[130px] truncate text-slate-600">
                      {r.fuelLocation || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-left max-w-[120px] truncate text-slate-700">
                      {r.fuelVendor || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.fuel > 0 ? getMileageBadge(r.mileage) : <span className="text-slate-400">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
