import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  XCircle,
  AlertCircle,
  FileEdit,
  Trash2,
  UserCheck,
  Clock,
  CheckCheck,
  ShieldCheck,
  Calendar,
  Truck,
  User,
  ArrowRight,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';

interface NotificationBellModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onApproveTrip?: (notification: AppNotification) => void;
  onRejectTrip?: (notification: AppNotification) => void;
  onApproveUser?: (notification: AppNotification) => void;
  onDismissNotification?: (notificationId: string) => void;
  onMarkAllRead?: () => void;
  isAdmin: boolean;
}

export const NotificationBellModal: React.FC<NotificationBellModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onApproveTrip,
  onRejectTrip,
  onApproveUser,
  onDismissNotification,
  onMarkAllRead,
  isAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'approvals' | 'modifications' | 'users' | 'deletions'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');

  if (!isOpen) return null;

  const filteredList = notifications.filter((n) => {
    // Category filter
    if (activeTab === 'approvals' && n.type !== 'trip_approval') return false;
    if (activeTab === 'modifications' && n.type !== 'record_modified') return false;
    if (activeTab === 'users' && n.type !== 'user_approval') return false;
    if (activeTab === 'deletions' && n.type !== 'record_deleted') return false;

    // Status filter
    if (filterStatus === 'pending' && n.status !== 'pending') return false;
    if (filterStatus === 'resolved' && n.status === 'pending') return false;

    return true;
  });

  const pendingCount = notifications.filter((n) => n.status === 'pending').length;
  const approvalsCount = notifications.filter((n) => n.type === 'trip_approval' && n.status === 'pending').length;
  const modificationsCount = notifications.filter((n) => n.type === 'record_modified' && n.status === 'pending').length;
  const userRequestsCount = notifications.filter((n) => n.type === 'user_approval' && n.status === 'pending').length;
  const deletionsCount = notifications.filter((n) => n.type === 'record_deleted').length;

  const formatTimestamp = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoDate;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Notifications & Approvals
                </h2>
                {pendingCount > 0 && (
                  <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-semibold">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Trip log sign-offs, odometer modification alerts, deletion notices & user requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              title="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 pt-2.5 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80 px-1 bg-black/10 rounded">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('approvals')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'approvals'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Trip Approvals</span>
              {approvalsCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {approvalsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('modifications')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'modifications'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Modifications</span>
              {modificationsCount > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {modificationsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>User Requests</span>
              {userRequestsCount > 0 && (
                <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                  {userRequestsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('deletions')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'deletions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>Deleted Records</span>
              <span className="text-[10px] opacity-80 px-1 bg-black/10 rounded">
                {deletionsCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 pb-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Status: All</option>
              <option value="pending">Only Pending</option>
              <option value="resolved">Only Resolved</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-3">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-700">No notifications found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                There are currently no active approval requests or alerts under this filter.
              </p>
            </div>
          ) : (
            filteredList.map((notif) => {
              const isPending = notif.status === 'pending';
              const isTrip = notif.type === 'trip_approval';
              const isMod = notif.type === 'record_modified';
              const isUser = notif.type === 'user_approval';
              const isDel = notif.type === 'record_deleted';

              return (
                <div
                  key={notif.id}
                  className={`pt-3 first:pt-0 pb-1 rounded-xl transition-all ${
                    !notif.read ? 'bg-amber-50/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isTrip
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : isMod
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : isUser
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isTrip && <Clock className="w-4 h-4" />}
                      {isMod && <FileEdit className="w-4 h-4" />}
                      {isUser && <UserCheck className="w-4 h-4" />}
                      {isDel && <Trash2 className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {notif.title}
                          </h4>
                          {isPending ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                              Pending Review
                            </span>
                          ) : notif.status === 'approved' ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                              Approved
                            </span>
                          ) : notif.status === 'rejected' ? (
                            <span className="text-[10px] bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                              Rejected
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              Dismissed
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Detail Pill Chips */}
                      {notif.details && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px] text-slate-600">
                          {notif.details.vehicle && (
                            <span className="inline-flex items-center gap-1 font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                              <Truck className="w-3 h-3 text-slate-500" />
                              {notif.details.vehicle}
                            </span>
                          )}
                          {notif.details.driver && (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              <User className="w-3 h-3 text-slate-500" />
                              {notif.details.driver}
                            </span>
                          )}
                          {notif.details.userLoginId && (
                            <span className="inline-flex items-center gap-1 font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                              ID: {notif.details.userLoginId}
                            </span>
                          )}
                          {notif.details.totalKm !== undefined && (
                            <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
                              {notif.details.totalKm} KM
                            </span>
                          )}
                          {notif.details.oldClosing !== undefined && notif.details.newClosing !== undefined && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-mono">
                              ODO: {notif.details.oldClosing} <ArrowRight className="w-3 h-3" /> {notif.details.newClosing} KM
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Buttons for Admins */}
                      {isAdmin && isPending && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                          {/* Trip Approval Actions */}
                          {isTrip && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApproveTrip?.(notif)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve Trip</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectTrip?.(notif)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {/* Record Modification Actions */}
                          {isMod && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApproveTrip?.(notif)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Acknowledge & Confirm Change</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onDismissNotification?.(notif.id)}
                                className="px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors"
                              >
                                Dismiss
                              </button>
                            </>
                          )}

                          {/* User Approval Actions */}
                          {isUser && (
                            <>
                              <button
                                type="button"
                                onClick={() => onApproveUser?.(notif)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Approve User Access</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectTrip?.(notif)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Deny</span>
                              </button>
                            </>
                          )}

                          {/* Deletion Notice Action */}
                          {isDel && (
                            <button
                              type="button"
                              onClick={() => onDismissNotification?.(notif.id)}
                              className="px-3 py-1 rounded-md text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                            >
                              Dismiss Notice
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            {isAdmin
              ? 'Administrator Mode: You have permission to approve/reject log actions.'
              : 'Viewer Mode: Only administrators can sign-off or dismiss approval items.'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
