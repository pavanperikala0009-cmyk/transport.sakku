import React, { useState } from 'react';
import { Truck, Plus, Trash2, Edit2, Check, X, AlertCircle, ShieldAlert } from 'lucide-react';
import { FleetVehicle, TransportRecord } from '../types';

interface VehicleManagerModalProps {
  vehicles: FleetVehicle[];
  records: TransportRecord[];
  isOpen: boolean;
  onClose: () => void;
  onAddVehicle: (newVehicle: Omit<FleetVehicle, 'id'>) => boolean;
  onUpdateVehicle: (id: string, updated: Partial<FleetVehicle>) => void;
  onDeleteVehicle: (id: string) => boolean;
  onFilterByVehicle?: (vehicleNumber: string) => void;
}

const VEHICLE_TYPES = [
  '10-Wheeler Cargo Truck',
  '12-Wheeler Heavy Truck',
  '16-Wheeler Multi-Axle',
  'Container Hauler',
  'Fuel Tanker',
  'Flatbed Trailer',
  'Mini Truck (Ace / Bolero)',
  'Cargo Delivery Van',
  'Tipper / Dumper',
  'Other Transport Vehicle',
];

export const VehicleManagerModal: React.FC<VehicleManagerModalProps> = ({
  vehicles,
  records,
  isOpen,
  onClose,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onFilterByVehicle,
}) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState(VEHICLE_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [defaultDriver, setDefaultDriver] = useState('');
  const [fuelType, setFuelType] = useState<'Diesel' | 'Petrol' | 'CNG' | 'EV'>('Diesel');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVehicleNumber, setEditVehicleNumber] = useState('');
  const [editType, setEditType] = useState('');
  const [editDriver, setEditDriver] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'maintenance' | 'inactive'>('active');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNumber = vehicleNumber.trim().toUpperCase();
    if (!cleanNumber) {
      setErrorMessage('Please enter a vehicle registration number.');
      return;
    }

    const selectedType = type === 'Other Transport Vehicle' && customType.trim() ? customType.trim() : type;

    const ok = onAddVehicle({
      vehicleNumber: cleanNumber,
      type: selectedType,
      defaultDriver: defaultDriver.trim(),
      fuelType,
      status,
      notes: notes.trim(),
    });

    if (!ok) {
      setErrorMessage(`Vehicle "${cleanNumber}" is already registered in your fleet.`);
      return;
    }

    setSuccessMessage(`Vehicle "${cleanNumber}" registered successfully!`);
    setVehicleNumber('');
    setDefaultDriver('');
    setNotes('');
    setCustomType('');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const startEdit = (v: FleetVehicle) => {
    setEditingId(v.id);
    setEditVehicleNumber(v.vehicleNumber);
    setEditType(v.type);
    setEditDriver(v.defaultDriver || '');
    setEditStatus(v.status);
  };

  const saveEdit = (id: string) => {
    const cleanNumber = editVehicleNumber.trim().toUpperCase();
    if (!cleanNumber) return;

    onUpdateVehicle(id, {
      vehicleNumber: cleanNumber,
      type: editType,
      defaultDriver: editDriver.trim(),
      status: editStatus,
    });
    setEditingId(null);
  };

  const handleDelete = (v: FleetVehicle) => {
    const tripCount = records.filter(
      (r) => r.vehicle.toUpperCase() === v.vehicleNumber.toUpperCase()
    ).length;

    const confirmMsg = tripCount > 0
      ? `Remove vehicle "${v.vehicleNumber}"? Warning: It currently has ${tripCount} trip record(s) logged.`
      : `Remove vehicle "${v.vehicleNumber}" from fleet?`;

    if (window.confirm(confirmMsg)) {
      onDeleteVehicle(v.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Manage Fleet Vehicles
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                  {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Create new vehicle numbers, modify details, and manage fleet roster
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Messages */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form: Create New Vehicle */}
          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Create New Vehicle Number</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Vehicle Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP 39 TB 4589"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm font-mono uppercase bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle Category / Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Driver */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Default Driver (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={defaultDriver}
                    onChange={(e) => setDefaultDriver(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="EV">EV / Electric</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active (On Road)</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="inactive">Inactive / Standby</option>
                  </select>
                </div>

                {/* Custom Type field if 'Other' selected */}
                {type === 'Other Transport Vehicle' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Specify Custom Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Refrigerated Van"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  New vehicles immediately become available in the daily entry dropdown and filter chips.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Vehicle to Fleet</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registered Vehicles List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fleet Roster ({vehicles.length})
              </h3>
              <span className="text-xs text-slate-500">
                Click a vehicle number to view / filter its logs
              </span>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                <p className="text-sm font-medium">No fleet vehicles registered.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add vehicle numbers above to populate your official fleet list.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {vehicles.map((v) => {
                  const trips = records.filter(
                    (r) => r.vehicle.toUpperCase() === v.vehicleNumber.toUpperCase()
                  );
                  const isEditing = editingId === v.id;

                  return (
                    <div
                      key={v.id}
                      className="p-3.5 bg-white hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={editVehicleNumber}
                            onChange={(e) => setEditVehicleNumber(e.target.value.toUpperCase())}
                            className="px-2 py-1 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded"
                            placeholder="Vehicle Number"
                          />
                          <input
                            type="text"
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            placeholder="Vehicle Type"
                          />
                          <input
                            type="text"
                            value={editDriver}
                            onChange={(e) => setEditDriver(e.target.value)}
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                            placeholder="Default Driver"
                          />
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as any)}
                            className="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded"
                          >
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              onFilterByVehicle?.(v.vehicleNumber);
                              onClose();
                            }}
                            className="font-mono font-bold text-sm text-slate-900 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 px-2.5 py-1 rounded border border-slate-200 transition-colors"
                            title="Filter records by this vehicle"
                          >
                            {v.vehicleNumber}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                              <span>{v.type}</span>
                              {v.fuelType && (
                                <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {v.fuelType}
                                </span>
                              )}
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                                  v.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : v.status === 'maintenance'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {v.status === 'active'
                                  ? 'Active'
                                  : v.status === 'maintenance'
                                  ? 'Maintenance'
                                  : 'Inactive'}
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                              {v.defaultDriver && (
                                <span>Driver: <strong>{v.defaultDriver}</strong></span>
                              )}
                              <span>
                                {trips.length} {trips.length === 1 ? 'trip logged' : 'trips logged'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(v.id)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(v)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Modify vehicle details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(v)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Remove vehicle from fleet"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Fleet vehicles automatically sync to local storage</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
