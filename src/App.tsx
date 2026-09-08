import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { TopRibbonNavigation, RibbonTabType } from './components/TopRibbonNavigation';
import { DashboardStats } from './components/DashboardStats';
import { EntryForm } from './components/EntryForm';
import { SearchFilter } from './components/SearchFilter';
import { RecordsTable } from './components/RecordsTable';
import { FleetBreakdown } from './components/FleetBreakdown';
import { MonthWiseReportView } from './components/MonthWiseReportView';
import { FuelMasterDataModal } from './components/FuelMasterDataModal';
import { VehicleManagerModal } from './components/VehicleManagerModal';
import { OfficialPdfPreviewModal } from './components/OfficialPdfPreviewModal';
import { AuthModal } from './components/AuthModal';
import { ManageUsersModal } from './components/ManageUsersModal';
import { NotificationBellModal } from './components/NotificationBellModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import {
  TransportRecord,
  FilterOptions,
  DashboardMetrics,
  FleetVehicle,
  User,
  FuelStation,
  FuelLocation,
  FuelVendor,
  Organization,
  AppNotification,
} from './types';
import { initGoogleAuth, getGoogleAccessToken } from './utils/googleDrive';
import {
  getStoredRecords,
  saveStoredRecords,
  getStoredVehicles,
  saveStoredVehicles,
  getStoredUsers,
  saveStoredUsers,
  getCurrentUser,
  saveCurrentUser,
  getStoredFuelStations,
  saveStoredFuelStations,
  getStoredFuelLocations,
  saveStoredFuelLocations,
  getStoredFuelVendors,
  saveStoredFuelVendors,
  getStoredOrganizations,
  saveStoredOrganizations,
  getStoredNotifications,
  saveStoredNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotificationStatus,
  clearDismissedNotifications,
  exportRecordsToCSV,
  INITIAL_SAMPLE_RECORDS,
} from './utils/storage';

const INITIAL_FILTERS: FilterOptions = {
  vehicles: [],
  driver: '',
  date: '',
  startDate: '',
  endDate: '',
  location: '',
  minKm: undefined,
  maxKm: undefined,
  minMileage: undefined,
  period: 'all',
};

export default function App() {
  const [records, setRecords] = useState<TransportRecord[]>(() => getStoredRecords());
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(() => getStoredVehicles());
  const [editingRecord, setEditingRecord] = useState<TransportRecord | null>(null);
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTabType>('daily');
  const [showVehicleManager, setShowVehicleManager] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [showFuelMasterModal, setShowFuelMasterModal] = useState(false);

  // Master Data State (Fuel Stations, Locations, Vendors, Organizations)
  const [fuelStations, setFuelStations] = useState<FuelStation[]>(() => getStoredFuelStations());
  const [fuelLocations, setFuelLocations] = useState<FuelLocation[]>(() => getStoredFuelLocations());
  const [fuelVendors, setFuelVendors] = useState<FuelVendor[]>(() => getStoredFuelVendors());
  const [organizations, setOrganizations] = useState<Organization[]>(() => getStoredOrganizations());

  // User Accounts & Authentication State
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'directory'>('login');
  const [showManageUsers, setShowManageUsers] = useState(false);

  // Admin Notification Bell & Approvals State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStoredNotifications());
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Google Drive Integration State
  const [showGoogleDriveModal, setShowGoogleDriveModal] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);

  // Google Drive Auth Listener (non-blocking)
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      () => setIsDriveConnected(true),
      () => setIsDriveConnected(false)
    );
    getGoogleAccessToken().then((token) => {
      setIsDriveConnected(!!token);
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Keep localStorage synced whenever records or fleet vehicles change
  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  useEffect(() => {
    saveStoredVehicles(fleetVehicles);
  }, [fleetVehicles]);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    saveCurrentUser(user);
  };

  const handleDeleteUser = (userId: string) => {
    const next = users.filter((u) => u.id !== userId);
    setUsers(next);
    saveStoredUsers(next);
    if (currentUser?.id === userId) {
      const fallback = next[0] || null;
      setCurrentUser(fallback);
      saveCurrentUser(fallback);
    }
  };

  // Notification & Approval Action Handlers
  const handleApproveTrip = (notification: AppNotification) => {
    if (notification.details?.recordId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === notification.details?.recordId
            ? { ...r, approvalStatus: 'approved' }
            : r
        )
      );
    }
    updateNotificationStatus(notification.id, 'approved');
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: 'approved', read: true } : n
      )
    );
  };

  const handleRejectTrip = (notification: AppNotification) => {
    if (notification.details?.recordId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === notification.details?.recordId
            ? { ...r, approvalStatus: 'rejected' }
            : r
        )
      );
    }
    updateNotificationStatus(notification.id, 'rejected');
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: 'rejected', read: true } : n
      )
    );
  };

  const handleApproveUser = (notification: AppNotification) => {
    updateNotificationStatus(notification.id, 'approved');
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, status: 'approved', read: true } : n
      )
    );
  };

  const handleDismissNotification = (notificationId: string) => {
    updateNotificationStatus(notificationId, 'dismissed');
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, status: 'dismissed', read: true } : n
      )
    );
  };

  const handleMarkAllNotificationsRead = () => {
    markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => n.status === 'pending' || !n.read).length;
  }, [notifications]);

  // Unique vehicle list from records for quick filtering chips
  const uniqueVehicles = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.vehicle) set.add(r.vehicle.toUpperCase());
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered records based on active filters
  const filteredRecords = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const currentMonth = today.slice(0, 7); // YYYY-MM

    const dQuery = filters.driver.trim().toLowerCase();
    const exactDate = filters.date.trim();

    return records.filter((r) => {
      // 1. Multi-vehicle selection filter (if any vehicle selected, must match one of them)
      if (filters.vehicles.length > 0) {
        if (!filters.vehicles.includes(r.vehicle.toUpperCase())) {
          return false;
        }
      }

      // 2. Driver filter
      if (dQuery && !r.driver.toLowerCase().includes(dQuery)) {
        return false;
      }

      // 3. Exact single date
      if (exactDate && r.date !== exactDate) {
        return false;
      }

      // 4. Date range (from - to)
      if (filters.startDate?.trim() && r.date < filters.startDate.trim()) {
        return false;
      }
      if (filters.endDate?.trim() && r.date > filters.endDate.trim()) {
        return false;
      }

      // 5. Location / route search
      if (filters.location?.trim()) {
        const locQuery = filters.location.trim().toLowerCase();
        const combined = `${r.startLocation} ${r.endLocation} ${r.fuelStation} ${r.remarks}`.toLowerCase();
        if (!combined.includes(locQuery)) {
          return false;
        }
      }

      // 6. Distance thresholds
      if (filters.minKm !== undefined && r.totalKm < filters.minKm) {
        return false;
      }
      if (filters.maxKm !== undefined && r.totalKm > filters.maxKm) {
        return false;
      }

      // 7. Minimum Mileage threshold
      if (filters.minMileage !== undefined && r.mileage < filters.minMileage) {
        return false;
      }

      // 8. Preset Periods
      if (filters.period === 'today' && r.date !== today) return false;
      if (filters.period === 'yesterday' && r.date !== yesterday) return false;
      if (filters.period === '7days' && r.date < sevenDaysAgo) return false;
      if (filters.period === '30days' && r.date < thirtyDaysAgo) return false;
      if (filters.period === 'this_month' && !r.date.startsWith(currentMonth))
        return false;

      return true;
    });
  }, [records, filters]);

  // Aggregate metrics (based on filtered view for contextual accuracy)
  const metrics: DashboardMetrics = useMemo(() => {
    const totalEntries = filteredRecords.length;
    const totalKm = filteredRecords.reduce((sum, r) => sum + (Number(r.totalKm) || 0), 0);
    const totalFuel = filteredRecords.reduce((sum, r) => sum + (Number(r.fuel) || 0), 0);
    const totalFuelAmount = filteredRecords.reduce(
      (sum, r) => sum + (Number(r.fuelAmount) || 0),
      0
    );

    const avgMileage = totalFuel > 0 ? Number((totalKm / totalFuel).toFixed(2)) : 0;
    const avgCostPerKm = totalKm > 0 ? Number((totalFuelAmount / totalKm).toFixed(2)) : 0;

    return {
      totalEntries,
      totalKm,
      totalFuel,
      avgMileage,
      totalFuelAmount,
      avgCostPerKm,
    };
  }, [filteredRecords]);

  // Record CRUD Handlers
  const handleSaveRecord = (
    data: Omit<TransportRecord, 'id'>,
    editId?: number
  ) => {
    // If vehicle isn't registered in fleet yet, automatically register it
    const upperVeh = data.vehicle.trim().toUpperCase();
    if (upperVeh && !fleetVehicles.some((f) => f.vehicleNumber.toUpperCase() === upperVeh)) {
      const autoVehicle: FleetVehicle = {
        id: `veh-${Date.now()}`,
        vehicleNumber: upperVeh,
        type: 'Commercial Transport Vehicle',
        defaultDriver: data.driver,
        fuelType: 'Diesel',
        status: 'active',
      };
      setFleetVehicles((prev) => [autoVehicle, ...prev]);
    }

    if (editId) {
      // Check if ODO or key fields were modified
      if (editingRecord) {
        const isModified =
          editingRecord.opening !== data.opening ||
          editingRecord.closing !== data.closing ||
          editingRecord.totalKm !== data.totalKm ||
          editingRecord.fuel !== data.fuel;

        if (isModified) {
          const modNotif = addNotification({
            type: 'record_modified',
            title: `Trip ODO Modified: ${data.vehicle}`,
            message: `Trip entry on ${data.date} was updated by ${currentUser?.name || 'Operator'}. Opening ODO: ${editingRecord.opening} → ${data.opening} KM, Closing ODO: ${editingRecord.closing} → ${data.closing} KM.`,
            details: {
              recordId: editId,
              vehicle: data.vehicle,
              driver: data.driver,
              oldOpening: editingRecord.opening,
              newOpening: data.opening,
              oldClosing: editingRecord.closing,
              newClosing: data.closing,
              reason: data.remarks || 'Log correction',
            },
            read: false,
            status: 'pending',
            createdBy: currentUser?.name || data.driver,
          });
          setNotifications((prev) => [modNotif, ...prev]);
        }
      }

      // Update existing record
      setRecords((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...data,
                id: editId,
                approvalStatus: currentUser?.role === 'admin' ? 'approved' : 'pending',
              }
            : item
        )
      );
      setEditingRecord(null);
    } else {
      // Create new record with timestamp ID
      const newId = Date.now();
      const initialStatus = currentUser?.role === 'admin' ? 'approved' : 'pending';
      const newRecord: TransportRecord = {
        ...data,
        id: newId,
        approvalStatus: initialStatus,
      };
      setRecords((prev) => [newRecord, ...prev]);

      // If entered by driver/operator, create a pending trip approval notification for admin
      if (currentUser?.role !== 'admin') {
        const tripNotif = addNotification({
          type: 'trip_approval',
          title: `Trip Log Submitted: ${data.vehicle}`,
          message: `Driver ${data.driver} logged ${data.totalKm} KM (${data.startLocation || 'Origin'} → ${data.endLocation || 'Destination'}). Fuel: ${data.fuel}L. Pending admin review.`,
          details: {
            recordId: newId,
            vehicle: data.vehicle,
            driver: data.driver,
            totalKm: data.totalKm,
            fuel: data.fuel,
            date: data.date,
          },
          read: false,
          status: 'pending',
          createdBy: currentUser?.name || data.driver,
        });
        setNotifications((prev) => [tripNotif, ...prev]);
      }
    }
  };

  const handleDeleteRecord = (id: number) => {
    const target = records.find((r) => r.id === id);
    if (window.confirm('Delete this record?')) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (editingRecord?.id === id) {
        setEditingRecord(null);
      }
      if (target) {
        const delNotif = addNotification({
          type: 'record_deleted',
          title: `Trip Record Deleted: ${target.vehicle}`,
          message: `Trip entry on ${target.date} (${target.driver}, ${target.totalKm} KM) was deleted by ${currentUser?.name || 'Operator'}.`,
          details: {
            recordId: id,
            vehicle: target.vehicle,
            driver: target.driver,
            date: target.date,
          },
          read: false,
          status: 'dismissed',
          createdBy: currentUser?.name || 'User',
        });
        setNotifications((prev) => [delNotif, ...prev]);
      }
    }
  };

  const handleEditRecord = (record: TransportRecord) => {
    setEditingRecord(record);
    // Smooth scroll to form
    const formCard = document.getElementById('vehicle-entry-card');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Fleet Vehicle CRUD Handlers
  const handleAddVehicle = (newVehicleData: Omit<FleetVehicle, 'id'>): boolean => {
    const exists = fleetVehicles.some(
      (v) => v.vehicleNumber.toUpperCase() === newVehicleData.vehicleNumber.toUpperCase()
    );
    if (exists) {
      return false;
    }
    const newVehicle: FleetVehicle = {
      ...newVehicleData,
      id: `veh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setFleetVehicles((prev) => [newVehicle, ...prev]);
    return true;
  };

  const handleUpdateVehicle = (id: string, updated: Partial<FleetVehicle>) => {
    setFleetVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
    );
  };

  const handleDeleteVehicle = (id: string): boolean => {
    setFleetVehicles((prev) => prev.filter((v) => v.id !== id));
    return true;
  };

  // Filter Handlers
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleImportRecords = (newRecords: TransportRecord[]) => {
    // Merge new records, preventing duplicate IDs
    setRecords((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const filteredNew = newRecords.map((r) => ({
        ...r,
        id: existingIds.has(r.id) ? Date.now() + Math.random() : r.id,
      }));
      return [...filteredNew, ...prev];
    });

    // Auto-register any new vehicles from imported records
    setFleetVehicles((prev) => {
      const existingNumbers = new Set(prev.map((f) => f.vehicleNumber.toUpperCase()));
      const added: FleetVehicle[] = [];

      newRecords.forEach((r, idx) => {
        const vNum = r.vehicle.trim().toUpperCase();
        if (vNum && !existingNumbers.has(vNum)) {
          existingNumbers.add(vNum);
          added.push({
            id: `veh-${Date.now()}-${idx}`,
            vehicleNumber: vNum,
            type: 'Commercial Transport Vehicle',
            defaultDriver: r.driver,
            fuelType: 'Diesel',
            status: 'active',
          });
        }
      });

      return added.length > 0 ? [...added, ...prev] : prev;
    });
  };

  const handleResetSample = () => {
    setRecords(INITIAL_SAMPLE_RECORDS);
    setEditingRecord(null);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all saved transport records? This cannot be undone.'
      )
    ) {
      setRecords([]);
      setEditingRecord(null);
    }
  };

  const monthsCount = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.date) set.add(r.date.slice(0, 7));
    });
    return set.size;
  }, [records]);

  const handleNewTripClick = () => {
    setActiveRibbonTab('daily');
    setEditingRecord(null);
    setTimeout(() => {
      const el = document.getElementById('vehicle-entry-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const activeFilterCount =
    filters.vehicles.length +
    (filters.driver ? 1 : 0) +
    (filters.userId ? 1 : 0) +
    (filters.organization ? 1 : 0) +
    (filters.fuelStation ? 1 : 0) +
    (filters.fuelVendor ? 1 : 0) +
    (filters.date ? 1 : 0) +
    (filters.startDate || filters.endDate ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.minKm !== undefined || filters.maxKm !== undefined ? 1 : 0) +
    (filters.minMileage !== undefined ? 1 : 0) +
    (filters.period !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Top Brand Header */}
      <Header
        records={filteredRecords.length > 0 ? filteredRecords : records}
        onImportRecords={handleImportRecords}
        onResetSample={handleResetSample}
        onClearAll={handleClearAll}
        onToggleVehicleStats={() =>
          setActiveRibbonTab(activeRibbonTab === 'fleet' ? 'daily' : 'fleet')
        }
        showVehicleStats={activeRibbonTab === 'fleet'}
        onOpenVehicleManager={() => setShowVehicleManager(true)}
        vehicleCount={fleetVehicles.length}
        onPrintPreview={() => setShowPdfPreview(true)}
        currentUser={currentUser}
        users={users}
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setShowAuthModal(true);
        }}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onOpenManageUsers={() => setShowManageUsers(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
        isDriveConnected={isDriveConnected}
      />

      {/* 2. Top Ribbon Navigation with 3 Main Slide/Menu Options */}
      <TopRibbonNavigation
        activeTab={activeRibbonTab}
        onTabChange={setActiveRibbonTab}
        totalRecordsCount={records.length}
        filteredRecordsCount={filteredRecords.length}
        fleetVehiclesCount={fleetVehicles.length}
        monthsCount={monthsCount}
        onNewTripClick={handleNewTripClick}
        onPrintPreview={() => setShowPdfPreview(true)}
        onExportCsv={() => exportRecordsToCSV(filteredRecords)}
        onOpenVehicleManager={() => setShowVehicleManager(true)}
        onOpenFuelMaster={() => setShowFuelMasterModal(true)}
        onOpenLoginId={() => {
          setAuthModalMode('login');
          setShowAuthModal(true);
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationsModal(true)}
        onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
        isDriveConnected={isDriveConnected}
        currentUser={currentUser}
      />

      {/* 3. Main Dynamic Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeRibbonTab === 'daily' && (
            <motion.div
              key="tab-daily"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Dashboard Stat Metrics */}
              <DashboardStats
                metrics={metrics}
                activeFilterCount={activeFilterCount}
                onPrintPreview={() => setShowPdfPreview(true)}
              />

              {/* Daily Vehicle Entry Form */}
              <EntryForm
                onSave={handleSaveRecord}
                onExport={() => exportRecordsToCSV(filteredRecords)}
                editingRecord={editingRecord}
                onCancelEdit={() => setEditingRecord(null)}
                fleetVehicles={fleetVehicles}
                onOpenVehicleManager={() => setShowVehicleManager(true)}
                records={records}
                currentUser={currentUser}
                fuelStations={fuelStations}
                fuelLocations={fuelLocations}
                fuelVendors={fuelVendors}
                organizations={organizations}
                onOpenMasterDataModal={() => setShowFuelMasterModal(true)}
                users={users}
              />

              {/* Search Records Card (With dynamic Add / Remove filters) */}
              <SearchFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                uniqueVehicles={uniqueVehicles}
                fleetVehicles={fleetVehicles}
                onOpenVehicleManager={() => setShowVehicleManager(true)}
                totalResultsCount={filteredRecords.length}
                totalRecordsCount={records.length}
                currentUser={currentUser}
                users={users}
                fuelStations={fuelStations}
                fuelVendors={fuelVendors}
                organizations={organizations}
              />

              {/* Daily Mileage Records Table */}
              <RecordsTable
                records={filteredRecords}
                onDelete={handleDeleteRecord}
                onEdit={handleEditRecord}
                onPrintPreview={() => setShowPdfPreview(true)}
                onOpenGoogleDrive={() => setShowGoogleDriveModal(true)}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {activeRibbonTab === 'monthly' && (
            <motion.div
              key="tab-monthly"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MonthWiseReportView
                records={currentUser?.role === 'admin' ? records : records.filter((r) => r.userId === currentUser?.id)}
                onSelectVehicleForDaily={(veh) => {
                  setFilters((prev) => ({ ...prev, vehicles: [veh.toUpperCase()] }));
                  setActiveRibbonTab('daily');
                }}
                onPrintPreview={() => setShowPdfPreview(true)}
                currentUser={currentUser}
              />
            </motion.div>
          )}

          {activeRibbonTab === 'fleet' && (
            <motion.div
              key="tab-fleet"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FleetBreakdown
                records={currentUser?.role === 'admin' ? records : records.filter((r) => r.userId === currentUser?.id)}
                onSelectVehicle={(veh) => {
                  setFilters((prev) => ({ ...prev, vehicles: [veh.toUpperCase()] }));
                  setActiveRibbonTab('daily');
                }}
                onOpenVehicleManager={() => setShowVehicleManager(true)}
                isStandaloneView={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Master Data Manager Modal (Fuel Stations, Fill Locations/Villages, Vendors, Orgs) */}
      <FuelMasterDataModal
        isOpen={showFuelMasterModal}
        onClose={() => setShowFuelMasterModal(false)}
        currentUser={currentUser}
        fuelStations={fuelStations}
        fuelLocations={fuelLocations}
        fuelVendors={fuelVendors}
        organizations={organizations}
        onSaveFuelStations={(st) => {
          setFuelStations(st);
          saveStoredFuelStations(st);
        }}
        onSaveFuelLocations={(loc) => {
          setFuelLocations(loc);
          saveStoredFuelLocations(loc);
        }}
        onSaveFuelVendors={(vnd) => {
          setFuelVendors(vnd);
          saveStoredFuelVendors(vnd);
        }}
        onSaveOrganizations={(orgs) => {
          setOrganizations(orgs);
          saveStoredOrganizations(orgs);
        }}
      />

      {/* Vehicle Manager Modal */}
      <VehicleManagerModal
        vehicles={fleetVehicles}
        records={records}
        isOpen={showVehicleManager}
        onClose={() => setShowVehicleManager(false)}
        onAddVehicle={handleAddVehicle}
        onUpdateVehicle={handleUpdateVehicle}
        onDeleteVehicle={handleDeleteVehicle}
        onFilterByVehicle={(veh) => {
          setFilters((prev) => ({ ...prev, vehicles: [veh.toUpperCase()] }));
        }}
      />

      {/* Official PDF Print Preview & Record Statement Modal */}
      <OfficialPdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        records={filteredRecords}
        metrics={metrics}
        filters={filters}
      />

      {/* User Login & Registration Interface Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onUsersUpdated={() => setUsers(getStoredUsers())}
        initialMode={authModalMode}
        organizations={organizations}
      />

      {/* Manage Registered Website Users Modal */}
      <ManageUsersModal
        isOpen={showManageUsers}
        onClose={() => setShowManageUsers(false)}
        users={users}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onDeleteUser={handleDeleteUser}
        onOpenRegister={() => {
          setAuthModalMode('register');
          setShowAuthModal(true);
        }}
      />

      {/* Admin Activity & Approvals Notification Bell Modal */}
      <NotificationBellModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        notifications={notifications}
        onApproveTrip={handleApproveTrip}
        onRejectTrip={handleRejectTrip}
        onApproveUser={handleApproveUser}
        onDismissNotification={handleDismissNotification}
        onMarkAllRead={handleMarkAllNotificationsRead}
        isAdmin={currentUser?.role === 'admin'}
      />

      {/* Google Drive Integration & Cloud Backup Modal */}
      <GoogleDriveModal
        isOpen={showGoogleDriveModal}
        onClose={() => setShowGoogleDriveModal(false)}
        records={records}
        onImportRecords={handleImportRecords}
      />

      {/* Subtle Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          Transport Mileage Track Record System &bull; Local Offline Persistence &bull; Standard KM/L Fleet Standard
        </p>
      </footer>
    </div>
  );
}
