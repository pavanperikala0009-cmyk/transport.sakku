import React, { useRef } from 'react';
import { Truck, Download, Upload, RotateCcw, Printer, BarChart3, KeyRound, Bell, Cloud } from 'lucide-react';
import { exportRecordsToCSV, parseCSVToRecords, INITIAL_SAMPLE_RECORDS } from '../utils/storage';
import { TransportRecord, User } from '../types';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  records: TransportRecord[];
  onImportRecords: (newRecords: TransportRecord[]) => void;
  onResetSample: () => void;
  onClearAll: () => void;
  onToggleVehicleStats: () => void;
  showVehicleStats: boolean;
  onOpenVehicleManager?: () => void;
  vehicleCount?: number;
  onPrintPreview?: () => void;
  currentUser: User | null;
  users: User[];
  onOpenAuth: (mode?: 'login' | 'register' | 'directory') => void;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  onOpenManageUsers: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenGoogleDrive?: () => void;
  isDriveConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  records,
  onImportRecords,
  onResetSample,
  onClearAll,
  onToggleVehicleStats,
  showVehicleStats,
  onOpenVehicleManager,
  vehicleCount,
  onPrintPreview,
  currentUser,
  users,
  onOpenAuth,
  onSwitchUser,
  onLogout,
  onOpenManageUsers,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenGoogleDrive,
  isDriveConnected = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSVToRecords(text);
        if (parsed.length > 0) {
          onImportRecords(parsed);
          alert(`Successfully imported ${parsed.length} record(s)!`);
        } else {
          alert('Could not parse any valid records from this CSV file.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title & Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Daily Transport Mileage Track Record
            </h1>
            <p className="text-xs text-slate-400">
              Fleet Odometer, Trip Log, and Fuel Performance System
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center flex-wrap gap-2 text-sm">
          {onOpenVehicleManager && (
            <button
              type="button"
              id="btn-header-manage-vehicles"
              onClick={onOpenVehicleManager}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              title="Create new vehicle numbers, edit details, or remove vehicles"
            >
              <Truck className="w-4 h-4" />
              <span>Vehicles {vehicleCount !== undefined ? `(${vehicleCount})` : ''}</span>
            </button>
          )}

          <button
            type="button"
            id="btn-toggle-fleet-stats"
            onClick={onToggleVehicleStats}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm transition-colors border ${
              showVehicleStats
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="View fleet vehicle efficiency breakdown"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Fleet Breakdown</span>
          </button>

          <button
            type="button"
            id="btn-header-export-csv"
            onClick={() => exportRecordsToCSV(records)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Export records to CSV file"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Hidden File Input for CSV Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
            id="csv-file-importer"
          />

          <button
            type="button"
            id="btn-header-import-csv"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Import records from CSV file"
          >
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            id="btn-print-records"
            onClick={onPrintPreview || (() => window.print())}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Print or view official PDF mileage sheet"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>PDF Print</span>
          </button>

          {records.length === 0 ? (
            <button
              type="button"
              id="btn-load-sample"
              onClick={onResetSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-emerald-700 text-white hover:bg-emerald-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Load Sample Data</span>
            </button>
          ) : (
            <button
              type="button"
              id="btn-clear-all"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
              title="Clear all stored records"
            >
              Clear All
            </button>
          )}

          {/* User Account / Profile & Switcher */}
          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          <button
            type="button"
            id="btn-header-login-id"
            onClick={() => onOpenAuth('login')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
            title="Open Login ID Interface & Switch / Manage IDs"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Login ID</span>
            {currentUser?.loginId && (
              <span className="font-mono text-[10px] text-blue-300 font-bold bg-blue-900/60 px-1 rounded border border-blue-700">
                {currentUser.loginId}
              </span>
            )}
          </button>

          {/* Google Drive Workspace & Sync */}
          {onOpenGoogleDrive && (
            <button
              type="button"
              id="btn-header-google-drive"
              onClick={onOpenGoogleDrive}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="Google Drive Cloud Workspace & Backups"
            >
              <Cloud className="w-4 h-4 text-indigo-400" />
              {isDriveConnected && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-slate-800" title="Connected to Drive" />
              )}
            </button>
          )}

          {/* Admin Approvals & Activity Notification Bell */}
          {onOpenNotifications && (
            <button
              type="button"
              id="btn-header-notification-bell"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center justify-center"
              title={`Admin Notifications & Approvals${unreadNotificationsCount > 0 ? ` (${unreadNotificationsCount} pending)` : ''}`}
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center border border-slate-900 shadow-sm animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          <UserMenu
            currentUser={currentUser}
            users={users}
            onOpenAuth={onOpenAuth}
            onSwitchUser={onSwitchUser}
            onLogout={onLogout}
            onOpenManageUsers={onOpenManageUsers}
          />
        </div>
      </div>
    </header>
  );
};
