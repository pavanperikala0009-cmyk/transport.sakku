import React, { useState } from 'react';
import { Trash2, Edit3, ArrowRight, MapPin, Fuel, Clock, MessageSquare, ArrowUpDown, Printer, ShieldCheck, Building, Cloud } from 'lucide-react';
import { TransportRecord, User } from '../types';

interface RecordsTableProps {
  records: TransportRecord[];
  onDelete: (id: number) => void;
  onEdit: (record: TransportRecord) => void;
  onPrintPreview?: () => void;
  onOpenGoogleDrive?: () => void;
  currentUser?: User | null;
}

type SortField = 'date' | 'vehicle' | 'driver' | 'opening' | 'closing' | 'totalKm' | 'fuel' | 'mileage' | 'fuelAmount';
type SortOrder = 'asc' | 'desc';

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  onDelete,
  onEdit,
  onPrintPreview,
  onOpenGoogleDrive,
  currentUser,
}) => {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRemarkRecord, setSelectedRemarkRecord] = useState<TransportRecord | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      aVal = (aVal as string).toLowerCase();
      bVal = ((bVal as string) || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate table view totals
  const totalViewKm = sortedRecords.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
  const totalViewFuel = sortedRecords.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
  const totalViewAmount = sortedRecords.reduce((sum, r) => sum + (Number(r.fuelAmount) || 0), 0);
  const avgViewMileage = totalViewFuel > 0 ? (totalViewKm / totalViewFuel).toFixed(2) : '0.00';

  return (
    <div
      id="records-table-card"
      className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📋 Daily Mileage Records</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {records.length} {records.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete vehicle travel log with odometer values, fuel refills, and efficiency
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenGoogleDrive && (
            <button
              type="button"
              id="btn-table-google-drive"
              onClick={onOpenGoogleDrive}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 bg-indigo-50/70 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Backup and sync these records with Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Drive</span>
            </button>
          )}

          {onPrintPreview && records.length > 0 && (
            <button
              type="button"
              id="btn-table-pdf-preview"
              onClick={onPrintPreview}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Print or preview official PDF record of these results"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF Print Preview</span>
            </button>
          )}
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-base font-semibold text-slate-700">No records found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No entries match your search criteria or no vehicle trips have been saved yet. Use the form above to add a new record.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full border-collapse min-w-[1050px] text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider text-center">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('vehicle')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Vehicle</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('driver')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>User / Driver</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('opening')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Starting ODO</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('closing')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Ending ODO</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalKm')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Total KM</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fuel')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Fuel (L)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">
                  <span>Fuel Station & Location</span>
                </th>
                <th className="py-3 px-3">
                  <span>Fuel Vendor</span>
                </th>
                <th
                  onClick={() => handleSort('mileage')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Mileage (KM/L)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fuelAmount')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Fuel ₹</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Route & Notes</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>

            <tbody id="recordsTable" className="divide-y divide-slate-200">
              {sortedRecords.map((r) => {
                const hasRoute = Boolean(r.startLocation || r.endLocation);
                const hasTime = Boolean(r.startTime || r.endTime);

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 transition-colors text-center group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3 font-mono text-xs sm:text-sm text-slate-700 whitespace-nowrap">
                      {r.date}
                    </td>

                    {/* Vehicle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {r.vehicle}
                      </span>
                    </td>

                    {/* User / Driver */}
                    <td className="py-3 px-3 whitespace-nowrap text-left">
                      <div className="font-medium text-slate-800">
                        {r.userName || r.driver}
                      </div>
                      {r.organization && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{r.organization}</span>
                        </div>
                      )}
                      {r.approvalStatus && (
                        <div className="mt-1">
                          {r.approvalStatus === 'approved' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              ✓ Approved
                            </span>
                          )}
                          {r.approvalStatus === 'pending' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              ⏳ Pending
                            </span>
                          )}
                          {r.approvalStatus === 'rejected' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                              ✕ Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Starting ODO */}
                    <td className="py-3 px-3 font-mono text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                      {r.opening.toLocaleString()}
                    </td>

                    {/* Ending ODO */}
                    <td className="py-3 px-3 font-mono text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                      <div>
                        <span>{r.closing.toLocaleString()}</span>
                        {r.isOdoCorrectedByAdmin && (
                          <span
                            className="ml-1 text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded border border-purple-200 inline-flex items-center gap-0.5"
                            title="Admin ODO Correction"
                          >
                            <ShieldCheck className="w-2.5 h-2.5 text-purple-700" />
                            Admin Adj.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total KM */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 bg-blue-50/70 text-blue-900 px-2 py-0.5 rounded">
                        {r.totalKm.toLocaleString()} km
                      </span>
                    </td>

                    {/* Fuel Litres */}
                    <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {r.fuel > 0 ? `${r.fuel} L` : <span className="text-slate-400">-</span>}
                    </td>

                    {/* Fuel Station & Village */}
                    <td className="py-3 px-3 text-xs text-left max-w-[180px]">
                      {r.fuelStation ? (
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Fuel className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            <span className="truncate">{r.fuelStation}</span>
                          </div>
                          {r.fuelLocation && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{r.fuelLocation}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-center block">-</span>
                      )}
                    </td>

                    {/* Fuel Vendor */}
                    <td className="py-3 px-3 text-xs text-slate-700 whitespace-nowrap">
                      {r.fuelVendor ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-900 rounded font-medium border border-amber-200 text-xs">
                          {r.fuelVendor}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Mileage */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {r.fuel > 0 ? (
                        <span
                          className={`mileage-good inline-block font-mono font-bold px-2 py-0.5 rounded text-xs sm:text-sm ${
                            r.mileage >= 4.0
                              ? 'text-emerald-800 bg-emerald-100/80 border border-emerald-200'
                              : 'text-amber-800 bg-amber-100/80 border border-amber-200'
                          }`}
                        >
                          {r.mileage} KM/L
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">N/A</span>
                      )}
                    </td>

                    {/* Fuel Amount ₹ */}
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {r.fuelAmount > 0 ? (
                        `₹${r.fuelAmount.toLocaleString('en-IN')}`
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Route & Notes */}
                    <td className="py-3 px-3 text-xs text-slate-600 max-w-[200px]">
                      {hasRoute ? (
                        <div className="flex items-center justify-center gap-1 text-slate-800 font-medium truncate">
                          <span>{r.startLocation || 'Start'}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{r.endLocation || 'End'}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No route logged</span>
                      )}

                      {(hasTime || r.remarks) && (
                        <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-500">
                          {hasTime && (
                            <span className="flex items-center gap-0.5" title={`Trip Time: ${r.startTime} - ${r.endTime}`}>
                              <Clock className="w-3 h-3 text-slate-400" />
                              {r.startTime}{r.endTime ? ` - ${r.endTime}` : ''}
                            </span>
                          )}

                          {r.remarks && (
                            <button
                              type="button"
                              onClick={() => setSelectedRemarkRecord(r)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 underline font-medium"
                              title="View full remarks"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Notes
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEdit(r)}
                          className="p-1.5 rounded-md text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit this record"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          className="btn-delete inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                          onClick={() => onDelete(r.id)}
                          title="Delete this record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Table Summary Footer */}
            <tfoot>
              <tr className="bg-slate-100/90 text-slate-900 font-semibold text-xs sm:text-sm border-t-2 border-slate-300 text-center">
                <td colSpan={3} className="py-3 px-3 text-left pl-4 font-bold text-slate-800">
                  Total Summary ({sortedRecords.length} records)
                </td>
                <td colSpan={2} className="py-3 px-3 text-slate-500 font-normal">
                  -
                </td>
                <td className="py-3 px-3 font-mono font-bold text-blue-900 bg-blue-100/60">
                  {totalViewKm.toLocaleString()} km
                </td>
                <td className="py-3 px-3 font-mono font-bold text-amber-900 bg-amber-100/60">
                  {totalViewFuel.toFixed(2)} L
                </td>
                <td colSpan={2} className="py-3 px-3 text-slate-400">
                  -
                </td>
                <td className="py-3 px-3 font-mono font-bold text-emerald-900 bg-emerald-100/60">
                  {avgViewMileage} KM/L
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                  ₹{totalViewAmount.toLocaleString('en-IN')}
                </td>
                <td colSpan={2} className="py-3 px-3 text-slate-400">
                  -
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Remarks View Modal */}
      {selectedRemarkRecord && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span>Trip Details: {selectedRemarkRecord.vehicle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRemarkRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-sm text-slate-700">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Date: <strong>{selectedRemarkRecord.date}</strong></span>
                <span>Driver: <strong>{selectedRemarkRecord.driver}</strong></span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Route:</span>
                <p className="font-medium text-slate-900">
                  {selectedRemarkRecord.startLocation || 'N/A'} → {selectedRemarkRecord.endLocation || 'N/A'}
                </p>
              </div>
              {selectedRemarkRecord.fuelStation && (
                <div>
                  <span className="text-xs text-slate-500 block">Fuel Station:</span>
                  <p className="text-slate-900">{selectedRemarkRecord.fuelStation}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-slate-500 block">Remarks & Cargo Notes:</span>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800">
                  {selectedRemarkRecord.remarks || 'No remarks added.'}
                </p>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedRemarkRecord(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
