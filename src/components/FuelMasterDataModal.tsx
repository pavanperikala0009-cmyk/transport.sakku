import React, { useState } from 'react';
import {
  FuelStation,
  FuelLocation,
  FuelVendor,
  Organization,
  User,
} from '../types';
import {
  X,
  Fuel,
  MapPin,
  Building,
  Building2,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface FuelMasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  fuelStations: FuelStation[];
  fuelLocations: FuelLocation[];
  fuelVendors: FuelVendor[];
  organizations: Organization[];
  onSaveFuelStations: (stations: FuelStation[]) => void;
  onSaveFuelLocations: (locations: FuelLocation[]) => void;
  onSaveFuelVendors: (vendors: FuelVendor[]) => void;
  onSaveOrganizations: (orgs: Organization[]) => void;
}

type MasterTab = 'stations' | 'locations' | 'vendors' | 'organizations';

export const FuelMasterDataModal: React.FC<FuelMasterDataModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  fuelStations,
  fuelLocations,
  fuelVendors,
  organizations,
  onSaveFuelStations,
  onSaveFuelLocations,
  onSaveFuelVendors,
  onSaveOrganizations,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('stations');
  const [searchQuery, setSearchQuery] = useState('');

  // Station Form State
  const [stationName, setStationName] = useState('');
  const [stationLocationVillage, setStationLocationVillage] = useState('');
  const [stationVendorId, setStationVendorId] = useState('');
  const [editingStationId, setEditingStationId] = useState<string | null>(null);

  // Location Form State
  const [locationVillageName, setLocationVillageName] = useState('');
  const [locationDistrict, setLocationDistrict] = useState('');
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  // Vendor Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorCode, setVendorCode] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Organization Form State
  const [orgName, setOrgName] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Fuel Station Handlers
  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('Access Denied: Only Admin can create and manage Master Data.', 'error');
      return;
    }
    const cleanName = stationName.trim();
    if (!cleanName) return;

    const matchedVendor = fuelVendors.find((v) => v.id === stationVendorId);

    if (editingStationId) {
      const updated = fuelStations.map((s) =>
        s.id === editingStationId
          ? {
              ...s,
              name: cleanName,
              locationVillage: stationLocationVillage,
              vendorId: stationVendorId,
              vendorName: matchedVendor ? matchedVendor.name : s.vendorName,
            }
          : s
      );
      onSaveFuelStations(updated);
      showFeedback(`Fuel Station "${cleanName}" updated successfully!`);
      setEditingStationId(null);
    } else {
      const newStation: FuelStation = {
        id: `fstat-${Date.now()}`,
        name: cleanName,
        locationVillage: stationLocationVillage,
        vendorId: stationVendorId,
        vendorName: matchedVendor ? matchedVendor.name : undefined,
        status: 'active',
      };
      onSaveFuelStations([newStation, ...fuelStations]);
      showFeedback(`Fuel Station "${cleanName}" added to Master Data.`);
    }

    setStationName('');
    setStationLocationVillage('');
    setStationVendorId('');
  };

  const handleEditStation = (station: FuelStation) => {
    setEditingStationId(station.id);
    setStationName(station.name);
    setStationLocationVillage(station.locationVillage || '');
    setStationVendorId(station.vendorId || '');
  };

  const handleDeleteStation = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Are you sure you want to remove Fuel Station "${name}" from master data?`)) {
      onSaveFuelStations(fuelStations.filter((s) => s.id !== id));
      showFeedback(`Fuel Station "${name}" removed.`);
    }
  };

  // Location Handlers
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('Access Denied: Only Admin can create and manage Master Data.', 'error');
      return;
    }
    const cleanVillage = locationVillageName.trim();
    if (!cleanVillage) return;

    if (editingLocationId) {
      const updated = fuelLocations.map((l) =>
        l.id === editingLocationId
          ? { ...l, villageName: cleanVillage, district: locationDistrict.trim() }
          : l
      );
      onSaveFuelLocations(updated);
      showFeedback(`Village Location "${cleanVillage}" updated.`);
      setEditingLocationId(null);
    } else {
      const newLoc: FuelLocation = {
        id: `floc-${Date.now()}`,
        villageName: cleanVillage,
        district: locationDistrict.trim(),
        status: 'active',
      };
      onSaveFuelLocations([newLoc, ...fuelLocations]);
      showFeedback(`Village Location "${cleanVillage}" added.`);
    }

    setLocationVillageName('');
    setLocationDistrict('');
  };

  const handleEditLocation = (loc: FuelLocation) => {
    setEditingLocationId(loc.id);
    setLocationVillageName(loc.villageName);
    setLocationDistrict(loc.district || '');
  };

  const handleDeleteLocation = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Remove Village Location "${name}"?`)) {
      onSaveFuelLocations(fuelLocations.filter((l) => l.id !== id));
      showFeedback(`Location "${name}" removed.`);
    }
  };

  // Vendor Handlers
  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showFeedback('Access Denied: Only Admin can create and manage Master Data.', 'error');
      return;
    }
    const cleanName = vendorName.trim();
    if (!cleanName) return;

    if (editingVendorId) {
      const updated = fuelVendors.map((v) =>
        v.id === editingVendorId
          ? {
              ...v,
              name: cleanName,
              vendorCode: vendorCode.trim(),
              contactNumber: vendorContact.trim(),
            }
          : v
      );
      onSaveFuelVendors(updated);
      showFeedback(`Fuel Vendor "${cleanName}" updated.`);
      setEditingVendorId(null);
    } else {
      const newVendor: FuelVendor = {
        id: `fvend-${Date.now()}`,
        name: cleanName,
        vendorCode: vendorCode.trim(),
        contactNumber: vendorContact.trim(),
        status: 'active',
      };
      onSaveFuelVendors([newVendor, ...fuelVendors]);
      showFeedback(`Fuel Vendor "${cleanName}" added.`);
    }

    setVendorName('');
    setVendorCode('');
    setVendorContact('');
  };

  const handleEditVendor = (vendor: FuelVendor) => {
    setEditingVendorId(vendor.id);
    setVendorName(vendor.name);
    setVendorCode(vendor.vendorCode || '');
    setVendorContact(vendor.contactNumber || '');
  };

  const handleDeleteVendor = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Remove Fuel Vendor "${name}"?`)) {
      onSaveFuelVendors(fuelVendors.filter((v) => v.id !== id));
      showFeedback(`Fuel Vendor "${name}" removed.`);
    }
  };

  // Organization Handlers
  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const clean = orgName.trim();
    if (!clean) return;

    if (editingOrgId) {
      const updated = organizations.map((o) =>
        o.id === editingOrgId ? { ...o, name: clean, code: orgCode.trim() } : o
      );
      onSaveOrganizations(updated);
      showFeedback(`Organization "${clean}" updated.`);
      setEditingOrgId(null);
    } else {
      const newOrg: Organization = {
        id: `org-${Date.now()}`,
        name: clean,
        code: orgCode.trim(),
      };
      onSaveOrganizations([newOrg, ...organizations]);
      showFeedback(`Organization "${clean}" added.`);
    }
    setOrgName('');
    setOrgCode('');
  };

  const handleEditOrg = (org: Organization) => {
    setEditingOrgId(org.id);
    setOrgName(org.name);
    setOrgCode(org.code || '');
  };

  const handleDeleteOrg = (id: string, name: string) => {
    if (!isAdmin) return;
    if (window.confirm(`Remove Organization "${name}"?`)) {
      onSaveOrganizations(organizations.filter((o) => o.id !== id));
      showFeedback(`Organization "${name}" removed.`);
    }
  };

  // Filtered lists based on search query
  const q = searchQuery.toLowerCase().trim();

  const filteredStations = fuelStations.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.locationVillage && s.locationVillage.toLowerCase().includes(q)) ||
      (s.vendorName && s.vendorName.toLowerCase().includes(q))
  );

  const filteredLocations = fuelLocations.filter(
    (l) =>
      l.villageName.toLowerCase().includes(q) ||
      (l.district && l.district.toLowerCase().includes(q))
  );

  const filteredVendors = fuelVendors.filter(
    (v) =>
      v.name.toLowerCase().includes(q) ||
      (v.vendorCode && v.vendorCode.toLowerCase().includes(q))
  );

  const filteredOrgs = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      (o.code && o.code.toLowerCase().includes(q))
  );

  return (
    <div
      id="fuel-master-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        id="fuel-master-modal-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Fuel & Operations Master Data
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3 text-rose-400" />
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Created & managed exclusively by Admin. Drivers & users select from this official list.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-master-data-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
                : 'bg-rose-50 text-rose-800 border-b border-rose-100'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Non-Admin Protection Notice */}
        {!isAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 text-amber-900 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Read-Only Mode:</strong> You are viewing Master Data as a non-admin. Fuel Station, Fuel Fill Location, and Fuel Vendor master data can only be created or modified by an Admin.
            </span>
          </div>
        )}

        {/* Tab Navigation & Search */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              id="tab-fuel-stations"
              onClick={() => {
                setActiveTab('stations');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'stations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Fuel Stations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'stations' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {fuelStations.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-fuel-locations"
              onClick={() => {
                setActiveTab('locations');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'locations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Villages / Locations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'locations' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {fuelLocations.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-fuel-vendors"
              onClick={() => {
                setActiveTab('vendors');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'vendors'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Fuel Vendors</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'vendors' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {fuelVendors.length}
              </span>
            </button>

            <button
              type="button"
              id="tab-organizations"
              onClick={() => {
                setActiveTab('organizations');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeTab === 'organizations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organizations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'organizations' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {organizations.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-master-data"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search master data..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: FUEL STATIONS */}
          {activeTab === 'stations' && (
            <div className="space-y-5">
              {isAdmin && (
                <form
                  onSubmit={handleSaveStation}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-blue-600" />
                      <span>{editingStationId ? 'Edit Fuel Station' : 'Add New Fuel Station'}</span>
                    </h3>
                    {editingStationId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStationId(null);
                          setStationName('');
                          setStationLocationVillage('');
                          setStationVendorId('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fuel Station Name *
                      </label>
                      <input
                        type="text"
                        id="input-master-station-name"
                        required
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        placeholder="e.g. HPCL Highway Autocare"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Location (Village)
                      </label>
                      <select
                        id="select-master-station-village"
                        value={stationLocationVillage}
                        onChange={(e) => setStationLocationVillage(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
                      >
                        <option value="">-- Select Village Location --</option>
                        {fuelLocations.map((loc) => (
                          <option key={loc.id} value={loc.villageName}>
                            {loc.villageName} {loc.district ? `(${loc.district})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fuel Vendor
                      </label>
                      <select
                        id="select-master-station-vendor"
                        value={stationVendorId}
                        onChange={(e) => setStationVendorId(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
                      >
                        <option value="">-- Select Vendor --</option>
                        {fuelVendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="btn-save-master-station"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {editingStationId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Station</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Fuel Station</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Table of Fuel Stations */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Station Name</th>
                      <th className="py-2.5 px-3">Location (Village)</th>
                      <th className="py-2.5 px-3">Fuel Vendor</th>
                      <th className="py-2.5 px-3">Status</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStations.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-400">
                          No fuel stations found.
                        </td>
                      </tr>
                    ) : (
                      filteredStations.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {st.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {st.locationVillage ? (
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {st.locationVillage}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not set</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {st.vendorName ? (
                              <span className="font-medium text-slate-700">{st.vendorName}</span>
                            ) : (
                              <span className="text-slate-400 italic">Not set</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Active
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditStation(st)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStation(st.id, st.name)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: FUEL FILL LOCATIONS (VILLAGES) */}
          {activeTab === 'locations' && (
            <div className="space-y-5">
              {isAdmin && (
                <form
                  onSubmit={handleSaveLocation}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{editingLocationId ? 'Edit Fuel Fill Location' : 'Add Village Location'}</span>
                    </h3>
                    {editingLocationId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLocationId(null);
                          setLocationVillageName('');
                          setLocationDistrict('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fuel Fill Location (Village Name) *
                      </label>
                      <input
                        type="text"
                        id="input-master-village-name"
                        required
                        value={locationVillageName}
                        onChange={(e) => setLocationVillageName(e.target.value)}
                        placeholder="e.g. Kanchikacherla Village"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        District / State
                      </label>
                      <input
                        type="text"
                        id="input-master-district"
                        value={locationDistrict}
                        onChange={(e) => setLocationDistrict(e.target.value)}
                        placeholder="e.g. NTR District (AP)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="btn-save-master-location"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {editingLocationId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Location</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Location</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Locations Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Village Name</th>
                      <th className="py-2.5 px-3">District / State</th>
                      <th className="py-2.5 px-3">Status</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLocations.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-slate-400">
                          No village locations found.
                        </td>
                      </tr>
                    ) : (
                      filteredLocations.map((loc) => (
                        <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {loc.villageName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {loc.district || <span className="text-slate-400 italic">None</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Active
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditLocation(loc)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLocation(loc.id, loc.villageName)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FUEL VENDORS */}
          {activeTab === 'vendors' && (
            <div className="space-y-5">
              {isAdmin && (
                <form
                  onSubmit={handleSaveVendor}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-blue-600" />
                      <span>{editingVendorId ? 'Edit Fuel Vendor' : 'Add New Fuel Vendor'}</span>
                    </h3>
                    {editingVendorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVendorId(null);
                          setVendorName('');
                          setVendorCode('');
                          setVendorContact('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Fuel Vendor Name *
                      </label>
                      <input
                        type="text"
                        id="input-master-vendor-name"
                        required
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g. Hindustan Petroleum (HPCL)"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Vendor Code
                      </label>
                      <input
                        type="text"
                        id="input-master-vendor-code"
                        value={vendorCode}
                        onChange={(e) => setVendorCode(e.target.value)}
                        placeholder="e.g. HPCL-IND"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Contact / Support Helpline
                      </label>
                      <input
                        type="text"
                        id="input-master-vendor-contact"
                        value={vendorContact}
                        onChange={(e) => setVendorContact(e.target.value)}
                        placeholder="e.g. 1800-22-1200"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="btn-save-master-vendor"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {editingVendorId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Vendor</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Vendor</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Vendors Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Vendor Name</th>
                      <th className="py-2.5 px-3">Vendor Code</th>
                      <th className="py-2.5 px-3">Contact</th>
                      <th className="py-2.5 px-3">Status</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVendors.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-400">
                          No fuel vendors found.
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((vend) => (
                        <tr key={vend.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {vend.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {vend.vendorCode || <span className="text-slate-400 italic">None</span>}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {vend.contactNumber || <span className="text-slate-400 italic">None</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Active
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditVendor(vend)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVendor(vend.id, vend.name)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ORGANIZATIONS */}
          {activeTab === 'organizations' && (
            <div className="space-y-5">
              {isAdmin && (
                <form
                  onSubmit={handleSaveOrg}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{editingOrgId ? 'Edit Organization' : 'Add Organization'}</span>
                    </h3>
                    {editingOrgId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOrgId(null);
                          setOrgName('');
                          setOrgCode('');
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Organization / Division Name *
                      </label>
                      <input
                        type="text"
                        id="input-master-org-name"
                        required
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="e.g. VJPL Logistics Division"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Division Code
                      </label>
                      <input
                        type="text"
                        id="input-master-org-code"
                        value={orgCode}
                        onChange={(e) => setOrgCode(e.target.value)}
                        placeholder="e.g. LOG-01"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      id="btn-save-master-org"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {editingOrgId ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Update Organization</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Organization</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Orgs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Organization / Division</th>
                      <th className="py-2.5 px-3">Code</th>
                      {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrgs.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 3 : 2} className="py-8 text-center text-slate-400">
                          No organizations found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrgs.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {o.name}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {o.code || <span className="text-slate-400 italic">None</span>}
                          </td>
                          {isAdmin && (
                            <td className="py-2.5 px-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditOrg(o)}
                                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrg(o.id, o.name)}
                                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isAdmin ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Admin privileges active: Changes immediately update entry forms for all users.
              </span>
            ) : (
              <span>Only system administrators can modify master data records.</span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
