import React, { useState } from 'react';
import {
  Search,
  Calendar,
  User as UserIcon,
  Truck,
  X,
  Plus,
  Filter,
  SlidersHorizontal,
  MapPin,
  Gauge,
  Fuel,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { FilterOptions, FleetVehicle, User, FuelStation, FuelVendor, Organization } from '../types';

interface SearchFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
  uniqueVehicles: string[];
  fleetVehicles: FleetVehicle[];
  onOpenVehicleManager?: () => void;
  totalResultsCount: number;
  totalRecordsCount: number;
  currentUser?: User | null;
  users?: User[];
  fuelStations?: FuelStation[];
  fuelVendors?: FuelVendor[];
  organizations?: Organization[];
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  uniqueVehicles,
  fleetVehicles,
  onOpenVehicleManager,
  totalResultsCount,
  totalRecordsCount,
  currentUser,
  users = [],
  fuelStations = [],
  fuelVendors = [],
  organizations = [],
}) => {
  const [showAddFilterMenu, setShowAddFilterMenu] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Combine vehicles from fleet list and historical records
  const allKnownVehicles = React.useMemo(() => {
    const set = new Set<string>();
    fleetVehicles.forEach((v) => set.add(v.vehicleNumber.toUpperCase()));
    uniqueVehicles.forEach((v) => set.add(v.toUpperCase()));
    return Array.from(set).sort();
  }, [fleetVehicles, uniqueVehicles]);

  // Check if any filter is active
  const hasActiveFilters =
    filters.vehicles.length > 0 ||
    Boolean(filters.driver.trim()) ||
    Boolean(filters.userId) ||
    Boolean(filters.organization) ||
    Boolean(filters.fuelStation) ||
    Boolean(filters.fuelVendor) ||
    Boolean(filters.fuelLocation) ||
    Boolean(filters.date.trim()) ||
    Boolean(filters.startDate?.trim()) ||
    Boolean(filters.endDate?.trim()) ||
    Boolean(filters.location?.trim()) ||
    filters.minKm !== undefined ||
    filters.maxKm !== undefined ||
    filters.minMileage !== undefined ||
    filters.period !== 'all';

  // Toggle vehicle in multi-select filter (Add or Remove vehicle)
  const toggleVehicleFilter = (veh: string) => {
    const upperVeh = veh.toUpperCase();
    if (filters.vehicles.includes(upperVeh)) {
      // Remove vehicle from filter
      onFilterChange({
        vehicles: filters.vehicles.filter((v) => v !== upperVeh),
      });
    } else {
      // Add vehicle to filter
      onFilterChange({
        vehicles: [...filters.vehicles, upperVeh],
      });
    }
  };

  // Remove a specific vehicle filter
  const removeVehicleFilter = (veh: string) => {
    onFilterChange({
      vehicles: filters.vehicles.filter((v) => v !== veh.toUpperCase()),
    });
  };

  // Quick period labels
  const PERIOD_OPTIONS = [
    { key: 'all', label: 'All Records' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7days', label: 'Last 7 Days' },
    { key: '30days', label: 'Last 30 Days' },
    { key: 'this_month', label: 'This Month' },
  ] as const;

  return (
    <div
      id="search-records-card"
      className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6 transition-all"
    >
      {/* Top Bar: Title, Result Counter, Add/Remove Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Filter & Search Records
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Showing {totalResultsCount} of {totalRecordsCount} records
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Filter by vehicle numbers, drivers, date ranges, and performance criteria
            </p>
          </div>
        </div>

        {/* Action buttons: Add Filter, Advanced Toggle, Reset All */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Add Filter Menu Button */}
          <div className="relative">
            <button
              type="button"
              id="btn-open-add-filter"
              onClick={() => setShowAddFilterMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Filter</span>
            </button>

            {/* Dropdown Menu to Add Specific Filters */}
            {showAddFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-20 text-xs">
                <div className="px-3 py-1 text-[11px] font-bold uppercase text-slate-400">
                  Select Filter to Add
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    // focus vehicle
                    document.getElementById('filter-vehicle-input')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Vehicle Numbers</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    document.getElementById('searchDriver')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Driver Name</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    document.getElementById('filter-start-date')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Date Range</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    document.getElementById('filter-location')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Route / Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    document.getElementById('filter-min-km')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Gauge className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Distance (Min/Max KM)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvancedFilters(true);
                    setShowAddFilterMenu(false);
                    document.getElementById('filter-min-mileage')?.focus();
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                  <span>Filter by Min Mileage (KM/L)</span>
                </button>
              </div>
            )}
          </div>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              showAdvancedFilters
                ? 'bg-slate-800 text-white border-slate-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Fewer Filters' : 'More Filters'}</span>
          </button>

          {/* Manage Vehicles Shortcut */}
          {onOpenVehicleManager && (
            <button
              type="button"
              onClick={onOpenVehicleManager}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Add or remove vehicle numbers from the fleet"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Vehicles ({fleetVehicles.length})</span>
            </button>
          )}

          {/* Clear / Reset All Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Remove all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE FILTER CHIPS WITH INDIVIDUAL REMOVE BUTTONS (X) */}
      {hasActiveFilters && (
        <div className="py-3 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Filters:
          </span>

          {/* Vehicles chips (each can be individually removed) */}
          {filters.vehicles.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 shadow-xs"
            >
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Vehicle: {v}</span>
              <button
                type="button"
                onClick={() => removeVehicleFilter(v)}
                className="hover:text-rose-600 hover:bg-blue-100 rounded-full p-0.5 ml-0.5"
                title={`Remove filter for ${v}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Driver chip */}
          {filters.driver.trim() && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-xs">
              <UserIcon className="w-3 h-3 text-indigo-600" />
              <span>Driver: {filters.driver}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ driver: '' })}
                className="hover:text-rose-600 hover:bg-indigo-100 rounded-full p-0.5 ml-0.5"
                title="Remove driver filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* User ID chip (Admin filter) */}
          {filters.userId && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 shadow-xs">
              <UserIcon className="w-3 h-3 text-purple-600" />
              <span>User: {users.find((u) => u.id === filters.userId)?.name || filters.userId}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ userId: undefined })}
                className="hover:text-rose-600 hover:bg-purple-100 rounded-full p-0.5 ml-0.5"
                title="Remove user filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Organization chip (Admin filter) */}
          {filters.organization && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-200 shadow-xs">
              <Building className="w-3 h-3 text-sky-600" />
              <span>Org: {filters.organization}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ organization: undefined })}
                className="hover:text-rose-600 hover:bg-sky-100 rounded-full p-0.5 ml-0.5"
                title="Remove organization filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Fuel Station chip (Admin filter) */}
          {filters.fuelStation && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs">
              <Fuel className="w-3 h-3 text-emerald-600" />
              <span>Station: {filters.fuelStation}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ fuelStation: undefined })}
                className="hover:text-rose-600 hover:bg-emerald-100 rounded-full p-0.5 ml-0.5"
                title="Remove fuel station filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Fuel Vendor chip (Admin filter) */}
          {filters.fuelVendor && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
              <Building className="w-3 h-3 text-amber-600" />
              <span>Vendor: {filters.fuelVendor}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ fuelVendor: undefined })}
                className="hover:text-rose-600 hover:bg-amber-100 rounded-full p-0.5 ml-0.5"
                title="Remove fuel vendor filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Exact Date chip */}
          {filters.date.trim() && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>Date: {filters.date}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ date: '' })}
                className="hover:text-rose-600 hover:bg-emerald-100 rounded-full p-0.5 ml-0.5"
                title="Remove exact date filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Date Range chips */}
          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>
                Range: {filters.startDate || 'Any'} to {filters.endDate || 'Any'}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ startDate: '', endDate: '' })}
                className="hover:text-rose-600 hover:bg-emerald-100 rounded-full p-0.5 ml-0.5"
                title="Remove date range filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Period chip (if not all) */}
          {filters.period !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
              <span>
                Period:{' '}
                {PERIOD_OPTIONS.find((p) => p.key === filters.period)?.label ||
                  filters.period}
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ period: 'all' })}
                className="hover:text-rose-600 hover:bg-amber-100 rounded-full p-0.5 ml-0.5"
                title="Remove period filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Location chip */}
          {filters.location?.trim() && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-900 border border-violet-200 shadow-xs">
              <MapPin className="w-3 h-3 text-violet-600" />
              <span>Location: {filters.location}</span>
              <button
                type="button"
                onClick={() => onFilterChange({ location: '' })}
                className="hover:text-rose-600 hover:bg-violet-100 rounded-full p-0.5 ml-0.5"
                title="Remove location filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Distance Min/Max */}
          {(filters.minKm !== undefined || filters.maxKm !== undefined) && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-900 border border-cyan-200 shadow-xs">
              <Gauge className="w-3 h-3 text-cyan-600" />
              <span>
                Distance: {filters.minKm ?? 0} - {filters.maxKm ?? '∞'} km
              </span>
              <button
                type="button"
                onClick={() => onFilterChange({ minKm: undefined, maxKm: undefined })}
                className="hover:text-rose-600 hover:bg-cyan-100 rounded-full p-0.5 ml-0.5"
                title="Remove distance filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Min Mileage */}
          {filters.minMileage !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 shadow-xs">
              <Fuel className="w-3 h-3 text-teal-600" />
              <span>Min Mileage: &ge; {filters.minMileage} km/l</span>
              <button
                type="button"
                onClick={() => onFilterChange({ minMileage: undefined })}
                className="hover:text-rose-600 hover:bg-teal-100 rounded-full p-0.5 ml-0.5"
                title="Remove min mileage filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* VEHICLE QUICK TOGGLES (Add / Remove vehicles with 1 click) */}
      <div className="pt-4 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Filter by Vehicle (Click to Add / Remove):
            </span>
          </div>
          {onOpenVehicleManager && (
            <button
              type="button"
              onClick={onOpenVehicleManager}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Create New Vehicle Number</span>
            </button>
          )}
        </div>

        {/* Vehicle Pills to Add or Remove from filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange({ vehicles: [] })}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              filters.vehicles.length === 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Vehicles
          </button>

          {allKnownVehicles.map((veh) => {
            const isSelected = filters.vehicles.includes(veh);
            const fleetMeta = fleetVehicles.find(
              (f) => f.vehicleNumber.toUpperCase() === veh
            );

            return (
              <button
                key={veh}
                type="button"
                onClick={() => toggleVehicleFilter(veh)}
                className={`group inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                }`}
                title={
                  isSelected
                    ? `Click to remove ${veh} from filter`
                    : `Click to add ${veh} to filter`
                }
              >
                <span>{veh}</span>
                {fleetMeta && (
                  <span
                    className={`text-[10px] px-1 rounded ${
                      isSelected
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {fleetMeta.type.split(' ')[0]}
                  </span>
                )}
                {isSelected ? (
                  <X className="w-3 h-3 text-white/80 group-hover:text-white" />
                ) : (
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ADMIN MASTER FILTERS (User, Organization, Fuel Station, Fuel Vendor) */}
      {isAdmin && (
        <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Admin Fleet Filters (Filter all user records)
              </span>
            </div>
            <span className="text-[11px] text-purple-700 font-medium">
              Filter by User, Vehicle, Organization, Fuel Station, Fuel Vendor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Filter by User */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                Filter by User
              </label>
              <select
                id="admin-filter-user"
                value={filters.userId || ''}
                onChange={(e) => onFilterChange({ userId: e.target.value || undefined })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Users ({users.length})</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filter by Organization */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                Filter by Organization
              </label>
              <select
                id="admin-filter-org"
                value={filters.organization || ''}
                onChange={(e) => onFilterChange({ organization: e.target.value || undefined })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.name}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Filter by Fuel Station */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                Filter by Fuel Station
              </label>
              <select
                id="admin-filter-station"
                value={filters.fuelStation || ''}
                onChange={(e) => onFilterChange({ fuelStation: e.target.value || undefined })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Fuel Stations</option>
                {fuelStations.map((st) => (
                  <option key={st.id} value={st.name}>
                    {st.name} {st.locationVillage ? `(${st.locationVillage})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filter by Fuel Vendor */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-900 mb-1">
                Filter by Fuel Vendor
              </label>
              <select
                id="admin-filter-vendor"
                value={filters.fuelVendor || ''}
                onChange={(e) => onFilterChange({ fuelVendor: e.target.value || undefined })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-purple-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Fuel Vendors</option>
                {fuelVendors.map((vnd) => (
                  <option key={vnd.id} value={vnd.name}>
                    {vnd.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MAIN SEARCH INPUT FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {/* Driver Search */}
        <div>
          <label
            htmlFor="searchDriver"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Driver Name</span>
          </label>
          <div className="relative">
            <input
              type="text"
              id="searchDriver"
              placeholder="Search driver (e.g. Ramesh)..."
              value={filters.driver}
              onChange={(e) => onFilterChange({ driver: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {filters.driver && (
              <button
                type="button"
                onClick={() => onFilterChange({ driver: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Remove driver filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Exact Date Search */}
        <div>
          <label
            htmlFor="searchDate"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Single Specific Date</span>
          </label>
          <div className="relative">
            <input
              type="date"
              id="searchDate"
              value={filters.date}
              onChange={(e) => onFilterChange({ date: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {filters.date && (
              <button
                type="button"
                onClick={() => onFilterChange({ date: '' })}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Remove date filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Period Buttons */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Period Preset</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {PERIOD_OPTIONS.slice(0, 6).map((p) => {
              const active = filters.period === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => onFilterChange({ period: p.key })}
                  className={`text-xs px-2 py-2 rounded-lg font-medium transition-colors text-center truncate ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title={p.label}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADVANCED FILTERS SECTION (Collapsible) */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-5 sm:p-6 rounded-b-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Advanced Range & Attribute Filters</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Combine multiple parameters to pinpoint specific fleet journeys
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="filter-start-date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFilterChange({ startDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {filters.startDate && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ startDate: '' })}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="filter-end-date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFilterChange({ endDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {filters.endDate && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ endDate: '' })}
                    className="absolute right-7 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Location / Route Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location / Route
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="filter-location"
                  placeholder="e.g. Hyderabad, Vijayawada"
                  value={filters.location || ''}
                  onChange={(e) => onFilterChange({ location: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {filters.location && (
                  <button
                    type="button"
                    onClick={() => onFilterChange({ location: '' })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Min KM & Max KM */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trip Distance (KM)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  id="filter-min-km"
                  placeholder="Min"
                  value={filters.minKm ?? ''}
                  onChange={(e) =>
                    onFilterChange({
                      minKm: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxKm ?? ''}
                  onChange={(e) =>
                    onFilterChange({
                      maxKm: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-1/2 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
