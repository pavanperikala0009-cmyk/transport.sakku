import React from 'react';
import { motion } from 'motion/react';
import {
  FileSpreadsheet,
  Calendar,
  Truck,
  PlusCircle,
  Printer,
  Download,
  Fuel,
  Gauge,
  ShieldCheck,
  KeyRound,
  Bell,
  Cloud,
} from 'lucide-react';
import { User } from '../types';

export type RibbonTabType = 'daily' | 'monthly' | 'fleet';

interface TopRibbonNavigationProps {
  activeTab: RibbonTabType;
  onTabChange: (tab: RibbonTabType) => void;
  totalRecordsCount: number;
  filteredRecordsCount: number;
  fleetVehiclesCount: number;
  monthsCount: number;
  onNewTripClick: () => void;
  onPrintPreview: () => void;
  onExportCsv: () => void;
  onOpenVehicleManager: () => void;
  onOpenFuelMaster?: () => void;
  onOpenLoginId?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenGoogleDrive?: () => void;
  isDriveConnected?: boolean;
  currentUser: User | null;
}

export const TopRibbonNavigation: React.FC<TopRibbonNavigationProps> = ({
  activeTab,
  onTabChange,
  totalRecordsCount,
  filteredRecordsCount,
  fleetVehiclesCount,
  monthsCount,
  onNewTripClick,
  onPrintPreview,
  onExportCsv,
  onOpenVehicleManager,
  onOpenFuelMaster,
  onOpenLoginId,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenGoogleDrive,
  isDriveConnected = false,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  const menuOptions = [
    {
      id: 'daily' as RibbonTabType,
      title: 'Daily Mileage & Trip Log',
      shortTitle: 'Daily Trip Log',
      subtitle: 'ODO continuity, trip entries & live search',
      icon: FileSpreadsheet,
      badge: `${filteredRecordsCount} Records`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      accentColor: 'text-blue-400',
    },
    {
      id: 'monthly' as RibbonTabType,
      title: 'Month-Wise Mileage Report',
      shortTitle: 'Monthly Report',
      subtitle: 'Monthly ODO audit, fill villages & vendors',
      icon: Calendar,
      badge: `${monthsCount} Months Audit`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      accentColor: 'text-emerald-400',
    },
    {
      id: 'fleet' as RibbonTabType,
      title: 'Fleet Performance & Vehicles',
      shortTitle: 'Fleet Performance',
      subtitle: 'Vehicle mileage status, cost/KM & fleet master',
      icon: Truck,
      badge: `${fleetVehiclesCount} Vehicles`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accentColor: 'text-amber-400',
    },
  ];

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800 shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Main Ribbon Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2.5 gap-3">
          {/* 3 Main Slide / Menu Navigation Tabs */}
          <div
            role="tablist"
            aria-label="Application Main Modules"
            className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800/80 shadow-inner flex-1 max-w-4xl"
          >
            {menuOptions.map((option) => {
              const Icon = option.icon;
              const isActive = activeTab === option.id;

              return (
                <button
                  key={option.id}
                  id={`ribbon-tab-${option.id}`}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => onTabChange(option.id)}
                  className={`relative flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-lg text-left transition-all duration-150 group overflow-hidden ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {/* Sliding animated background indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeRibbonTabIndicator"
                      className="absolute inset-0 bg-slate-800/95 border border-blue-500/40 rounded-lg shadow-sm"
                      transition={{ type: 'spring', bounce: 0.18, duration: 0.35 }}
                    >
                      {/* Top subtle highlight line */}
                      <div className="absolute top-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 rounded-full" />
                    </motion.div>
                  )}

                  {/* Icon container */}
                  <div
                    className={`relative z-10 p-2 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800/80 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>

                  {/* Labels and Badge */}
                  <div className="relative z-10 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs sm:text-sm tracking-tight truncate block">
                        <span className="hidden sm:inline">{option.title}</span>
                        <span className="sm:hidden">{option.shortTitle}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden md:block">
                        {option.subtitle}
                      </p>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium whitespace-nowrap ml-auto ${
                          option.badgeColor
                        }`}
                      >
                        {option.badge}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ribbon Quick Action Utility Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 self-end lg:self-center flex-wrap">
            {/* 1. Quick New Entry Button */}
            <button
              type="button"
              id="btn-ribbon-new-entry"
              onClick={onNewTripClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition-all active:scale-98"
              title="Add a new daily vehicle trip record"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Trip</span>
            </button>

            {/* 2. PDF Print Preview */}
            <button
              type="button"
              id="btn-ribbon-print-pdf"
              onClick={onPrintPreview}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
              title="View and print official mileage statement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* 3. Export CSV */}
            <button
              type="button"
              id="btn-ribbon-export-csv"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
              title="Download records as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            {/* 4. Manage Fleet */}
            <button
              type="button"
              id="btn-ribbon-manage-vehicles"
              onClick={onOpenVehicleManager}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors"
              title="Add, edit or configure fleet vehicles"
            >
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Vehicles</span>
            </button>

            {/* 5. Master Data Manager (Admin Only) */}
            {isAdmin && onOpenFuelMaster && (
              <button
                type="button"
                id="btn-ribbon-fuel-master"
                onClick={onOpenFuelMaster}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-800/80 transition-colors"
                title="Admin: Manage Fuel Stations, Villages & Fuel Vendors"
              >
                <Fuel className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline">Master Data</span>
              </button>
            )}

            {/* 6. Login ID Interface */}
            {onOpenLoginId && (
              <button
                type="button"
                id="btn-ribbon-login-id"
                onClick={onOpenLoginId}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/50 transition-colors"
                title="Open Login ID Interface & Switch / Manage Accounts"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">ID:</span>
                <span className="font-mono text-blue-300 font-bold text-[11px]">
                  {currentUser?.loginId || 'Portal'}
                </span>
              </button>
            )}

            {/* 7. Google Drive Integration */}
            {onOpenGoogleDrive && (
              <button
                type="button"
                id="btn-ribbon-google-drive"
                onClick={onOpenGoogleDrive}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-indigo-500/60 transition-colors"
                title="Google Drive Cloud Workspace & Backups"
              >
                <Cloud className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Drive</span>
                {isDriveConnected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
                )}
              </button>
            )}

            {/* 8. Admin Approvals & Activity Notification Bell */}
            {onOpenNotifications && (
              <button
                type="button"
                id="btn-ribbon-notifications"
                onClick={onOpenNotifications}
                className="relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-500/60 transition-colors"
                title="Admin Notifications & Pending Approvals"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Approvals</span>
                {unreadNotificationsCount > 0 && (
                  <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
