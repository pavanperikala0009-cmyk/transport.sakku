import React from 'react';
import { Printer, X, FileText, Download, CheckCircle, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import { TransportRecord, DashboardMetrics, FilterOptions } from '../types';

interface OfficialPdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TransportRecord[];
  metrics: DashboardMetrics;
  filters: FilterOptions;
}

export const OfficialPdfPreviewModal: React.FC<OfficialPdfPreviewModalProps> = ({
  isOpen,
  onClose,
  records,
  metrics,
  filters,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  // Build filter summary description
  const filterDescParts: string[] = [];
  if (filters.vehicles.length > 0) {
    filterDescParts.push(`Vehicles: ${filters.vehicles.join(', ')}`);
  } else {
    filterDescParts.push('All Fleet Vehicles');
  }

  if (filters.driver) {
    filterDescParts.push(`Driver: ${filters.driver}`);
  }

  if (filters.date) {
    filterDescParts.push(`Date: ${filters.date}`);
  } else if (filters.startDate || filters.endDate) {
    filterDescParts.push(
      `Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`
    );
  } else if (filters.period !== 'all') {
    filterDescParts.push(`Period: ${filters.period.toUpperCase()}`);
  }

  if (filters.location) {
    filterDescParts.push(`Route: ${filters.location}`);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[95vh]">
        {/* Modal Toolbar (hidden in print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Official PDF Print Preview</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  {records.length} {records.length === 1 ? 'Record' : 'Records'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official statement formatted for archival, audits, and PDF export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-confirm-print-pdf"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 printable-document">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-900 mb-1">
                  <Building2 className="w-6 h-6 text-blue-800" />
                  <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900">
                    VJPL Transport & Personal Fleet
                  </h1>
                </div>
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                  Daily Transport Mileage & Fuel Consumption Track Record
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official Verification & Audit Statement for Logged Vehicle Journeys
                </p>
              </div>

              {/* Document Meta Box */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-right text-xs font-mono">
                <div>
                  <span className="text-slate-500">Document No: </span>
                  <strong className="text-slate-900">
                    VJPL-TR-{now.getFullYear()}-{now.getMonth() + 1}-{records.length}
                  </strong>
                </div>
                <div className="mt-0.5">
                  <span className="text-slate-500">Date Generated: </span>
                  <strong className="text-slate-800">{formattedDate}, {formattedTime}</strong>
                </div>
                <div className="mt-0.5">
                  <span className="text-slate-500">Scope: </span>
                  <span className="text-blue-800 font-semibold">{filterDescParts.join(' | ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Official Executive KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6 text-center">
            <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Trips
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                {metrics.totalEntries}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Distance
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                {metrics.totalKm.toLocaleString()} <span className="text-xs font-normal">km</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Fuel
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                {metrics.totalFuel.toFixed(1)} <span className="text-xs font-normal">L</span>
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                Fleet Mileage
              </span>
              <span className="text-lg font-black font-mono text-emerald-800">
                {metrics.avgMileage.toFixed(2)} <span className="text-xs font-normal">KM/L</span>
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Fuel Expense
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                ₹{metrics.totalFuelAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-300 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Avg Cost / KM
              </span>
              <span className="text-lg font-black font-mono text-slate-900">
                ₹{metrics.avgCostPerKm.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Records Table */}
          {records.length === 0 ? (
            <div className="text-center py-10 text-slate-500 border border-dashed border-slate-300 rounded-lg">
              <p className="text-sm font-semibold">No records match the current filter selection.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded-lg mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider text-center">
                    <th className="py-2 px-2 border border-slate-800">#</th>
                    <th className="py-2 px-2.5 border border-slate-800">Date</th>
                    <th className="py-2 px-2.5 border border-slate-800">Vehicle</th>
                    <th className="py-2 px-2.5 border border-slate-800">User / Driver</th>
                    <th className="py-2 px-2 border border-slate-800">Starting ODO</th>
                    <th className="py-2 px-2 border border-slate-800">Ending ODO</th>
                    <th className="py-2 px-2 border border-slate-800">Total KM</th>
                    <th className="py-2 px-2 border border-slate-800">Fuel (L)</th>
                    <th className="py-2 px-2 border border-slate-800">Fuel Station</th>
                    <th className="py-2 px-2 border border-slate-800">Fill Location</th>
                    <th className="py-2 px-2 border border-slate-800">Vendor</th>
                    <th className="py-2 px-2 border border-slate-800">Mileage (KM/L)</th>
                    <th className="py-2 px-2.5 border border-slate-800">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, index) => (
                    <tr
                      key={r.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                    >
                      <td className="py-2 px-2 text-center text-slate-500 font-mono border-r border-slate-200">
                        {index + 1}
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap font-medium text-slate-800 border-r border-slate-200 text-center">
                        {r.date}
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap border-r border-slate-200 text-center">
                        {r.vehicle}
                      </td>
                      <td className="py-2 px-2.5 font-medium text-slate-700 whitespace-nowrap border-r border-slate-200">
                        <div>{r.userName || r.driver || '-'}</div>
                        {r.organization && (
                          <div className="text-[10px] text-slate-500 font-sans">{r.organization}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.opening.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-600 border-r border-slate-200">
                        {r.closing.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 border-r border-slate-200">
                        {r.totalKm.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-800 border-r border-slate-200">
                        {r.fuel > 0 ? r.fuel.toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-2 text-left text-[11px] font-medium text-slate-800 border-r border-slate-200 truncate max-w-[110px]">
                        {r.fuelStation || '-'}
                      </td>
                      <td className="py-2 px-2 text-left text-[11px] text-slate-600 border-r border-slate-200 truncate max-w-[100px]">
                        {r.fuelLocation || '-'}
                      </td>
                      <td className="py-2 px-2 text-left text-[11px] text-slate-700 border-r border-slate-200 truncate max-w-[90px]">
                        {r.fuelVendor || '-'}
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 border-r border-slate-200">
                        {r.mileage > 0 ? `${r.mileage.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-900">
                        {r.fuelAmount > 0 ? `₹${r.fuelAmount.toLocaleString('en-IN')}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase text-[11px] tracking-wider">
                      Grand Totals ({records.length} records):
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-blue-950">
                      {metrics.totalKm.toLocaleString()} km
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-black text-amber-950">
                      {metrics.totalFuel.toFixed(1)} L
                    </td>
                    <td colSpan={3} className="py-2.5 px-2 text-center text-slate-400">
                      -
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-black text-emerald-800">
                      {metrics.avgMileage.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono font-black text-slate-950">
                      ₹{metrics.totalFuelAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Official Sign-off and Record Certification */}
          <div className="mt-8 pt-6 border-t-2 border-slate-300">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-8 text-center">
              Official Verification & Authorization Sign-off
            </div>

            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-900">Prepared By</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fleet Log Operator</p>
                <div className="h-8"></div>
                <p className="text-[10px] text-slate-400">Signature / Date</p>
              </div>

              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-900">Verified By</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Transport Supervisor</p>
                <div className="h-8"></div>
                <p className="text-[10px] text-slate-400">Signature / Date</p>
              </div>

              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-900">Approved By</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fleet Manager / Management</p>
                <div className="h-8"></div>
                <p className="text-[10px] text-slate-400">Authorized Seal & Signature</p>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-slate-400 border-t border-slate-100 pt-3">
              This document is an authentic certified copy generated from the VJPL Transport Mileage Track Record System.
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 no-print">
          <span>Tip: Select &quot;Save as PDF&quot; in the system print destination dialog</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
