import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Shield,
  Key,
  Calendar,
} from 'lucide-react';
import { User } from '../types';

interface ManageUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onOpenRegister: () => void;
}

export const ManageUsersModal: React.FC<ManageUsersModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSwitchUser,
  onDeleteUser,
  onOpenRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Registered Website Users</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                  {users.length} {users.length === 1 ? 'user' : 'users'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Accounts registered with Mail ID or Mobile Number for this system
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-600">
            Click any account to switch active user session or register new drivers/operators.
          </span>
          <button
            type="button"
            id="btn-add-user-modal"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Register New User</span>
          </button>
        </div>

        {/* Users List */}
        <div className="p-5 overflow-y-auto flex-1 divide-y divide-slate-100">
          {users.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                className={`py-3.5 px-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrent ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-2xs ${
                      u.avatarColor || 'bg-slate-700'
                    }`}
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{u.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                          Active Session
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700 capitalize">
                        {u.role}
                      </span>
                      {u.loginId && (
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          ID: {u.loginId}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      {u.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{u.email}</span>
                        </span>
                      )}
                      {u.mobile && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.mobile}</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Registered: {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {!isCurrent ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSwitchUser(u);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-blue-500 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                    >
                      Switch to User
                    </button>
                  ) : (
                    <span className="text-xs text-blue-700 font-semibold px-3 py-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Logged In</span>
                    </span>
                  )}

                  {users.length > 1 && !isCurrent && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete user account for "${u.name}"?`)) {
                          onDeleteUser(u.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove this user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
