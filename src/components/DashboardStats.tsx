import React from 'react';
import { Route, Fuel, Gauge, FileText, IndianRupee, TrendingUp, Printer, ShieldCheck } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
  activeFilterCount?: number;
  onPrintPreview?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  metrics,
  activeFilterCount = 0,
  onPrintPreview,
}) => {
  return (
    <section aria-label="Dashboard Statistics" className="mb-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Fleet Performance Dashboard
          </span>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Filtered Scope Active ({activeFilterCount})
            </span>
          )}
        </div>

        {/* PDF Print Preview Button for Official Record Keeping */}
        {onPrintPreview && (
          <button
            type="button"
            id="btn-dashboard-pdf-print"
            onClick={onPrintPreview}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto group"
            title="Generate official PDF statement preview of currently filtered records"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400 group-hover:text-white transition-colors" />
            <span>PDF Print Preview</span>
            <span className="bg-slate-800 group-hover:bg-blue-700 text-slate-200 group-hover:text-white text-[10px] px-2 py-0.5 rounded-full font-mono transition-colors">
              {metrics.totalEntries} {metrics.totalEntries === 1 ? 'Record' : 'Records'}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Entries */}
        <div
          id="stat-total-entries"
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Entries
            </h3>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <p
            id="totalEntries"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight"
          >
            {metrics.totalEntries}
          </p>
          <div className="mt-1 text-xs text-slate-400">
            {activeFilterCount > 0 ? `Filtered view` : `Recorded trips`}
          </div>
        </div>

        {/* Total KM */}
        <div
          id="stat-total-km"
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total KM
            </h3>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <Route className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <p
            id="totalKm"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight"
          >
            {metrics.totalKm.toLocaleString()}
            <span className="text-sm font-semibold text-slate-500 ml-1">km</span>
          </p>
          <div className="mt-1 text-xs text-slate-400">
            Across active vehicles
          </div>
        </div>

        {/* Total Fuel */}
        <div
          id="stat-total-fuel"
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Fuel
            </h3>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <Fuel className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <p
            id="totalFuel"
            className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 tracking-tight"
          >
            {metrics.totalFuel.toLocaleString(undefined, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 2,
            })}
            <span className="text-sm font-semibold text-slate-500 ml-1">L</span>
          </p>
          <div className="mt-1 text-xs text-slate-400">
            Diesel / Petrol consumed
          </div>
        </div>

        {/* Average Mileage */}
        <div
          id="stat-avg-mileage"
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Average Mileage
            </h3>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
              <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </div>
          <p
            id="avgMileage"
            className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-2 tracking-tight"
          >
            {metrics.avgMileage.toFixed(2)}
            <span className="text-sm font-semibold text-slate-500 ml-1">KM/L</span>
          </p>
          <div className="mt-1 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500 inline" />
            <span>Fleet fuel efficiency</span>
          </div>
        </div>
      </div>

      {/* Secondary Financial Insight Bar with Print Preview Button */}
      <div className="mt-3 bg-slate-100 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 border border-slate-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-700">
              <IndianRupee className="w-3 h-3" />
            </span>
            <span>
              Total Fuel Expense:{' '}
              <strong className="text-slate-900 font-bold">
                ₹{metrics.totalFuelAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>
              Avg Cost per KM:{' '}
              <strong className="text-slate-900 font-bold">
                ₹{metrics.avgCostPerKm.toFixed(2)} / km
              </strong>
            </span>
          </div>
        </div>

        {onPrintPreview && (
          <button
            type="button"
            onClick={onPrintPreview}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Official Audit Statement &rarr;</span>
          </button>
        )}
      </div>
    </section>
  );
};
