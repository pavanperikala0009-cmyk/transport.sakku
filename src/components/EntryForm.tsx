import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
  Calculator,
  X,
  Plus,
  Truck,
  ArrowRight,
  Fuel,
  MapPin,
  Building,
  Shield,
} from 'lucide-react';
import {
  TransportRecord,
  FleetVehicle,
  User,
  FuelStation,
  FuelLocation,
  FuelVendor,
  Organization,
} from '../types';
import { getVehicleLatestOdo } from '../utils/storage';

interface EntryFormProps {
  onSave: (record: Omit<TransportRecord, 'id'>, editId?: number) => void;
  onExport: () => void;
  editingRecord?: TransportRecord | null;
  onCancelEdit?: () => void;
  fleetVehicles?: FleetVehicle[];
  onOpenVehicleManager?: () => void;
  records?: TransportRecord[];
  currentUser?: User | null;
  fuelStations?: FuelStation[];
  fuelLocations?: FuelLocation[];
  fuelVendors?: FuelVendor[];
  organizations?: Organization[];
  onOpenMasterDataModal?: () => void;
  users?: User[];
}

export const EntryForm: React.FC<EntryFormProps> = ({
  onSave,
  onExport,
  editingRecord,
  onCancelEdit,
  fleetVehicles = [],
  onOpenVehicleManager,
  records = [],
  currentUser,
  fuelStations = [],
  fuelLocations = [],
  fuelVendors = [],
  organizations = [],
  onOpenMasterDataModal,
  users = [],
}) => {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const isAdmin = currentUser?.role === 'admin';

  const [date, setDate] = useState(getTodayString());
  const [vehicle, setVehicle] = useState('');
  const [driver, setDriver] = useState(currentUser?.name || '');
  const [selectedUserId, setSelectedUserId] = useState(currentUser?.id || 'usr-1');
  const [organization, setOrganization] = useState(
    currentUser?.organization || 'VJPL Logistics Division'
  );
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [openingKm, setOpeningKm] = useState<string>('');
  const [closingKm, setClosingKm] = useState<string>('');
  const [fuel, setFuel] = useState<string>('');
  const [fuelAmount, setFuelAmount] = useState<string>('');
  const [fuelStation, setFuelStation] = useState('');
  const [fuelLocation, setFuelLocation] = useState('');
  const [fuelVendor, setFuelVendor] = useState('');
  const [remarks, setRemarks] = useState('');

  // Admin ODO correction override permission checkbox
  const [adminOdoOverride, setAdminOdoOverride] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync when editingRecord changes
  useEffect(() => {
    if (editingRecord) {
      setDate(editingRecord.date);
      setVehicle(editingRecord.vehicle);
      setDriver(editingRecord.driver);
      setSelectedUserId(editingRecord.userId || currentUser?.id || 'usr-1');
      setOrganization(editingRecord.organization || 'VJPL Logistics Division');
      setStartTime(editingRecord.startTime || '');
      setEndTime(editingRecord.endTime || '');
      setStartLocation(editingRecord.startLocation || '');
      setEndLocation(editingRecord.endLocation || '');
      setOpeningKm(String(editingRecord.opening));
      setClosingKm(String(editingRecord.closing));
      setFuel(editingRecord.fuel > 0 ? String(editingRecord.fuel) : '');
      setFuelAmount(editingRecord.fuelAmount > 0 ? String(editingRecord.fuelAmount) : '');
      setFuelStation(editingRecord.fuelStation || '');
      setFuelLocation(editingRecord.fuelLocation || '');
      setFuelVendor(editingRecord.fuelVendor || '');
      setRemarks(editingRecord.remarks || '');
      setAdminOdoOverride(Boolean(editingRecord.isOdoCorrectedByAdmin));
      setErrorMessage(null);
    } else {
      if (currentUser && !isAdmin) {
        setDriver(currentUser.name);
        setSelectedUserId(currentUser.id);
        if (currentUser.organization) {
          setOrganization(currentUser.organization);
        }
      }
    }
  }, [editingRecord, currentUser, isAdmin]);

  // Clean vehicle identifier
  const cleanVehicle = vehicle.trim().toUpperCase();

  // Latest saved ODO for the vehicle (excluding this record if editing)
  const latestVehicleOdo = cleanVehicle
    ? getVehicleLatestOdo(records, cleanVehicle, editingRecord?.id)
    : 0;

  // Live calculations
  const numOpening = Number(openingKm) || 0;
  const numClosing = Number(closingKm) || 0;
  const numFuel = Number(fuel) || 0;
  const numFuelAmount = Number(fuelAmount) || 0;

  const liveTotalKm =
    openingKm !== '' && closingKm !== '' ? numClosing - numOpening : 0;
  const isOdometerValid =
    openingKm === '' || closingKm === '' || numClosing > numOpening;
  const liveMileage =
    numFuel > 0 && liveTotalKm > 0
      ? (liveTotalKm / numFuel).toFixed(2)
      : '0.00';
  const liveCostPerKm =
    liveTotalKm > 0 && numFuelAmount > 0
      ? (numFuelAmount / liveTotalKm).toFixed(2)
      : '0.00';

  const handleVehicleSelect = (selectedVal: string) => {
    const upper = selectedVal.toUpperCase();
    setVehicle(upper);
    const matched = fleetVehicles.find((f) => f.vehicleNumber.toUpperCase() === upper);
    if (matched?.defaultDriver && !driver) {
      setDriver(matched.defaultDriver);
    }
    // Auto-populate opening ODO from previous latest ODO for this vehicle
    const prevOdo = getVehicleLatestOdo(records, upper, editingRecord?.id);
    if (prevOdo > 0 && (!openingKm || openingKm === '0')) {
      setOpeningKm(String(prevOdo));
    }
  };

  // When a Fuel Station is selected, auto-link its village and vendor
  const handleStationChange = (stationNameSelected: string) => {
    setFuelStation(stationNameSelected);
    const matchedStation = fuelStations.find((s) => s.name === stationNameSelected);
    if (matchedStation) {
      if (matchedStation.locationVillage) {
        setFuelLocation(matchedStation.locationVillage);
      }
      if (matchedStation.vendorName) {
        setFuelVendor(matchedStation.vendorName);
      }
    }
  };

  const resetForm = () => {
    setDate(getTodayString());
    setVehicle('');
    setDriver(currentUser?.name || '');
    setSelectedUserId(currentUser?.id || 'usr-1');
    setOrganization(currentUser?.organization || 'VJPL Logistics Division');
    setStartTime('');
    setEndTime('');
    setStartLocation('');
    setEndLocation('');
    setOpeningKm('');
    setClosingKm('');
    setFuel('');
    setFuelAmount('');
    setFuelStation('');
    setFuelLocation('');
    setFuelVendor('');
    setRemarks('');
    setAdminOdoOverride(false);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const opening = Number(openingKm);
    const closing = Number(closingKm);
    const fuelVal = Number(fuel || 0);
    const fuelAmountVal = Number(fuelAmount || 0);

    if (isNaN(opening) || opening < 0) {
      setErrorMessage('Please enter a valid Opening Odometer reading.');
      return;
    }

    if (isNaN(closing) || closing < 0) {
      setErrorMessage('Please enter a valid Closing Odometer reading.');
      return;
    }

    // --- STRICT ODO KM VALIDATION (As explicitly requested by user) ---
    // Rule 1: Same ODO KM entered again (Closing equals opening or duplicate)
    // Rule 2: Lower ODO KM entered (Closing < opening or Closing < latestVehicleOdo)
    // Rule 3: Separately for each vehicle
    // Rule 4: Only Admin can correct or modify an incorrect ODO entry.

    const isDuplicateOdo =
      closing === opening ||
      (latestVehicleOdo > 0 && closing === latestVehicleOdo);

    const isLowerOdo =
      closing < opening ||
      (latestVehicleOdo > 0 && closing < latestVehicleOdo);

    if (isDuplicateOdo) {
      if (!isAdmin || !adminOdoOverride) {
        setErrorMessage(
          'This ODO reading has already been entered. Please enter a different and higher ODO reading.'
        );
        return;
      }
    }

    if (isLowerOdo) {
      if (!isAdmin || !adminOdoOverride) {
        setErrorMessage(
          'Invalid ODO reading. ODO KM cannot be lower than the previous reading.'
        );
        return;
      }
    }

    const totalKm = closing - opening;
    const mileage = fuelVal > 0 ? Number((totalKm / fuelVal).toFixed(2)) : 0;

    // Determine user assignment
    const matchedUser = users.find((u) => u.id === selectedUserId);
    const effectiveUserName = matchedUser ? matchedUser.name : driver.trim() || currentUser?.name || 'Driver';
    const effectiveUserId = matchedUser ? matchedUser.id : currentUser?.id || 'usr-1';

    const recordData: Omit<TransportRecord, 'id'> = {
      userId: effectiveUserId,
      userName: effectiveUserName,
      organization: organization.trim() || 'VJPL Logistics Division',
      date,
      vehicle: vehicle.trim().toUpperCase(),
      driver: driver.trim() || effectiveUserName,
      startTime,
      endTime,
      startLocation: startLocation.trim(),
      endLocation: endLocation.trim(),
      opening,
      closing,
      totalKm,
      fuel: fuelVal,
      fuelAmount: fuelAmountVal,
      fuelStation: fuelStation.trim(),
      fuelLocation: fuelLocation.trim(),
      fuelVendor: fuelVendor.trim(),
      mileage,
      remarks: remarks.trim(),
      isOdoCorrectedByAdmin: isAdmin && adminOdoOverride,
    };

    onSave(recordData, editingRecord ? editingRecord.id : undefined);

    setSuccessMessage(
      editingRecord
        ? 'Daily mileage entry updated successfully!'
        : 'Daily mileage entry saved successfully!'
    );

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    if (!editingRecord) {
      resetForm();
    }
  };

  return (
    <div
      id="vehicle-entry-card"
      className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{editingRecord ? '✏️ Edit Vehicle Entry' : '🚛 Daily Vehicle Entry'}</span>
            </h2>
            {editingRecord && editingRecord.isOdoCorrectedByAdmin && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Admin ODO Corrected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log vehicle odometer readings, fuel station refills, and trip records with instant ODO validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMasterDataModal && isAdmin && (
            <button
              type="button"
              id="btn-entry-manage-master"
              onClick={onOpenMasterDataModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              title="Manage Fuel Stations, Locations, and Vendors"
            >
              <Fuel className="w-3.5 h-3.5 text-blue-600" />
              <span>Manage Master Data</span>
            </button>
          )}

          {onOpenVehicleManager && (
            <button
              type="button"
              id="btn-entry-fleet-manager"
              onClick={onOpenVehicleManager}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
            >
              <Truck className="w-3.5 h-3.5 text-slate-600" />
              <span>Fleet Vehicles</span>
            </button>
          )}

          {editingRecord && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Alert Notices */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
            {isAdmin && (
              <p className="text-xs text-rose-700 mt-1">
                As an Admin, you can enable <strong>"Admin Permission: Allow ODO Correction/Modification"</strong> below to override and correct this entry.
              </p>
            )}
          </div>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form id="mileageForm" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Vehicle Number */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="vehicle"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Vehicle Number <span className="text-rose-500">*</span>
              </label>
              {latestVehicleOdo > 0 && (
                <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Latest ODO: {latestVehicleOdo} KM
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                id="vehicle"
                required
                placeholder="e.g. AP 39 TB 4589"
                value={vehicle}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                className="w-full px-3 py-2.5 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                list="fleet-vehicles-list"
              />
              <datalist id="fleet-vehicles-list">
                {fleetVehicles.map((v) => (
                  <option key={v.id} value={v.vehicleNumber}>
                    {v.type} {v.defaultDriver ? `(${v.defaultDriver})` : ''}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Driver / User */}
          <div>
            <label
              htmlFor="driver"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Driver / User <span className="text-rose-500">*</span>
            </label>
            {isAdmin && users.length > 0 ? (
              <select
                id="select-driver-user"
                value={selectedUserId}
                onChange={(e) => {
                  const uId = e.target.value;
                  setSelectedUserId(uId);
                  const selectedU = users.find((u) => u.id === uId);
                  if (selectedU) {
                    setDriver(selectedU.name);
                    if (selectedU.organization) {
                      setOrganization(selectedU.organization);
                    }
                  }
                }}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.loginId ? `[${u.loginId}] ` : ''}{u.name} ({u.role}) - {u.organization || 'General'}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="driver"
                required
                placeholder="Driver Name"
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                readOnly={!isAdmin && Boolean(currentUser)}
                className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                  !isAdmin && currentUser
                    ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                }`}
              />
            )}
          </div>

          {/* Organization */}
          <div>
            <label
              htmlFor="organization"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Organization / Division
            </label>
            {organizations.length > 0 ? (
              <select
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name} {org.code ? `(${org.code})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="organization"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. VJPL Logistics Division"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            )}
          </div>

          {/* Route Start Location */}
          <div>
            <label
              htmlFor="startLocation"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Trip Start Location
            </label>
            <input
              type="text"
              id="startLocation"
              placeholder="e.g. Hyderabad Terminal"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Route End Location */}
          <div>
            <label
              htmlFor="endLocation"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Trip End Location
            </label>
            <input
              type="text"
              id="endLocation"
              placeholder="e.g. Vijayawada Hub"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Opening Odometer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="openingKm"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
              >
                Opening ODO (KM) <span className="text-rose-500">*</span>
              </label>
              {latestVehicleOdo > 0 && !openingKm && (
                <button
                  type="button"
                  onClick={() => setOpeningKm(String(latestVehicleOdo))}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  Use Prev: {latestVehicleOdo}
                </button>
              )}
            </div>
            <input
              type="number"
              id="openingKm"
              min="0"
              required
              placeholder="e.g. 45200"
              value={openingKm}
              onChange={(e) => setOpeningKm(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Closing Odometer */}
          <div>
            <label
              htmlFor="closingKm"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Closing ODO (KM) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              id="closingKm"
              min="0"
              required
              placeholder="e.g. 45480"
              value={closingKm}
              onChange={(e) => setClosingKm(e.target.value)}
              className={`w-full px-3 py-2.5 text-sm font-mono bg-slate-50 border rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 transition-colors ${
                !isOdometerValid
                  ? 'border-rose-400 focus:ring-rose-400'
                  : 'border-slate-300 focus:ring-blue-500'
              }`}
            />
            {!isOdometerValid && (
              <span className="text-[11px] text-rose-600 mt-1 block font-medium">
                Invalid ODO reading. ODO KM cannot be lower than the previous reading.
              </span>
            )}
          </div>

          {/* Total KM (Read only calculation) */}
          <div>
            <label
              htmlFor="totalKmDisplay"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Total Trip KM (Auto)
            </label>
            <input
              type="text"
              id="totalKmDisplay"
              readOnly
              value={liveTotalKm >= 0 ? `${liveTotalKm} KM` : 'Invalid ODO'}
              className={`w-full px-3 py-2.5 text-sm font-mono font-bold rounded-lg border cursor-not-allowed ${
                liveTotalKm >= 0 ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-rose-50 text-rose-600 border-rose-300'
              }`}
            />
          </div>

          {/* Fuel Litres */}
          <div>
            <label
              htmlFor="fuel"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Fuel Litres (L)
            </label>
            <input
              type="number"
              id="fuel"
              step="0.01"
              min="0"
              placeholder="e.g. 65.0"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Fuel Amount ₹ */}
          <div>
            <label
              htmlFor="fuelAmount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Fuel Amount ₹
            </label>
            <input
              type="number"
              id="fuelAmount"
              step="0.01"
              min="0"
              placeholder="e.g. 6370"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
              className="w-full px-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Calculated Mileage */}
          <div>
            <label
              htmlFor="mileageDisplay"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Calculated Mileage (Auto)
            </label>
            <input
              type="text"
              id="mileageDisplay"
              readOnly
              value={`${liveMileage} KM/L`}
              className="w-full px-3 py-2.5 text-sm font-mono font-bold bg-emerald-50/70 border border-emerald-200 text-emerald-800 rounded-lg cursor-not-allowed"
            />
          </div>

          {/* MASTER DATA FIELD 1: Fuel Station Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="select-fuel-station"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1"
              >
                <Fuel className="w-3.5 h-3.5 text-blue-600" />
                <span>Fuel Station Name</span>
              </label>
              {isAdmin && onOpenMasterDataModal && (
                <button
                  type="button"
                  onClick={onOpenMasterDataModal}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  + Add Station
                </button>
              )}
            </div>
            {fuelStations.length > 0 ? (
              <select
                id="select-fuel-station"
                value={fuelStation}
                onChange={(e) => handleStationChange(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800"
              >
                <option value="">-- Select Fuel Station --</option>
                {fuelStations.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.locationVillage ? `[${st.locationVillage}]` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="input-fuel-station-text"
                placeholder="e.g. HPCL Highway Autocare"
                value={fuelStation}
                onChange={(e) => setFuelStation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            )}
          </div>

          {/* MASTER DATA FIELD 2: Fuel Fill Location (Village) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="select-fuel-location"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fuel Fill Location (Village)</span>
              </label>
              {isAdmin && onOpenMasterDataModal && (
                <button
                  type="button"
                  onClick={onOpenMasterDataModal}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  + Add Village
                </button>
              )}
            </div>
            {fuelLocations.length > 0 ? (
              <select
                id="select-fuel-location"
                value={fuelLocation}
                onChange={(e) => setFuelLocation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800"
              >
                <option value="">-- Select Village Location --</option>
                {fuelLocations.map((loc) => (
                  <option key={loc.id} value={loc.villageName}>
                    {loc.villageName} {loc.district ? `(${loc.district})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="input-fuel-location-text"
                placeholder="e.g. Kanchikacherla Village"
                value={fuelLocation}
                onChange={(e) => setFuelLocation(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            )}
          </div>

          {/* MASTER DATA FIELD 3: Fuel Vendor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="select-fuel-vendor"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1"
              >
                <Building className="w-3.5 h-3.5 text-amber-600" />
                <span>Fuel Vendor</span>
              </label>
              {isAdmin && onOpenMasterDataModal && (
                <button
                  type="button"
                  onClick={onOpenMasterDataModal}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  + Add Vendor
                </button>
              )}
            </div>
            {fuelVendors.length > 0 ? (
              <select
                id="select-fuel-vendor"
                value={fuelVendor}
                onChange={(e) => setFuelVendor(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800"
              >
                <option value="">-- Select Fuel Vendor --</option>
                {fuelVendors.map((vend) => (
                  <option key={vend.id} value={vend.name}>
                    {vend.name} {vend.vendorCode ? `[${vend.vendorCode}]` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="input-fuel-vendor-text"
                placeholder="e.g. Hindustan Petroleum (HPCL)"
                value={fuelVendor}
                onChange={(e) => setFuelVendor(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            )}
          </div>

          {/* Remarks */}
          <div className="md:col-span-2 lg:col-span-3">
            <label
              htmlFor="remarks"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Remarks / Cargo Notes
            </label>
            <textarea
              id="remarks"
              rows={2}
              placeholder="Any remarks, cargo details, toll notes, or maintenance notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* ADMIN ODO CORRECTION PERMISSION BANNER */}
        {isAdmin && (
          <div className="mt-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-amber-900">
              <label className="flex items-center gap-2 cursor-pointer font-bold select-none text-slate-900">
                <input
                  type="checkbox"
                  id="checkbox-admin-odo-override"
                  checked={adminOdoOverride}
                  onChange={(e) => setAdminOdoOverride(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Admin Permission: Allow ODO Correction / Modification</span>
              </label>
              <p className="mt-1 text-slate-600 text-[11px]">
                Only Admin has permission to correct or modify an incorrect ODO entry. When checked, administrative privilege overrides standard duplicate and lower-ODO validation blocks.
              </p>
            </div>
          </div>
        )}

        {/* Live Calculation Preview Banner */}
        {(openingKm !== '' || closingKm !== '' || fuel !== '') && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-1.5 font-semibold text-blue-900">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Trip Summary:</span>
            </div>
            <div>
              Distance:{' '}
              <span className={`font-mono font-bold ${liveTotalKm <= 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {liveTotalKm > 0 ? `${liveTotalKm} km` : '0 km'}
              </span>
            </div>
            <div>
              Mileage:{' '}
              <span className="font-mono font-bold text-emerald-700">
                {liveMileage} KM/L
              </span>
            </div>
            {fuelStation && (
              <div>
                Station:{' '}
                <span className="font-semibold text-slate-900">{fuelStation}</span>
              </div>
            )}
            {fuelLocation && (
              <div>
                Village:{' '}
                <span className="font-semibold text-slate-900">{fuelLocation}</span>
              </div>
            )}
            {fuelVendor && (
              <div>
                Vendor:{' '}
                <span className="font-semibold text-slate-900">{fuelVendor}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center">
          <button
            type="submit"
            id="btn-save-entry"
            className="btn-save inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-all focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
          >
            <Save className="w-4 h-4" />
            <span>{editingRecord ? '💾 Update Record' : '💾 Save Daily Entry'}</span>
          </button>

          <button
            type="button"
            id="btn-clear-form"
            onClick={resetForm}
            className="btn-clear inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            id="btn-export-form"
            onClick={onExport}
            className="btn-export inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <Download className="w-4 h-4" />
            <span>📥 Export Excel / CSV</span>
          </button>
        </div>
      </form>
    </div>
  );
};
