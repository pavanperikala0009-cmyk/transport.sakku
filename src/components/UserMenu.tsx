import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  LogOut,
  UserPlus,
  Users,
  Shield,
  Phone,
  Mail,
  ChevronDown,
  Check,
  Building2,
  KeyRound,
  Copy,
  QrCode,
} from 'lucide-react';
import { User } from '../types';

interface UserMenuProps {
  currentUser: User | null;
  users: User[];
  onOpenAuth: (mode?: 'login' | 'register' | 'directory') => void;
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  onOpenManageUsers: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  currentUser,
  users,
  onOpenAuth,
  onSwitchUser,
  onLogout,
  onOpenManageUsers,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          id="btn-login-trigger"
          onClick={() => onOpenAuth('login')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          title="Sign in using your VJPL Login ID"
        >
          <KeyRound className="w-4 h-4" />
          <span>Login ID</span>
        </button>
        <button
          type="button"
          id="btn-register-trigger"
          onClick={() => onOpenAuth('register')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          title="Create a new Driver or Operator Login ID"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>New ID</span>
        </button>
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-900/60 text-rose-300 border-rose-700',
    manager: 'bg-purple-900/60 text-purple-300 border-purple-700',
    supervisor: 'bg-amber-900/60 text-amber-300 border-amber-700',
    driver: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    operator: 'bg-blue-900/60 text-blue-300 border-blue-700',
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Current User Pill Button */}
      <button
        type="button"
        id="btn-current-user-menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs sm:text-sm font-medium transition-colors"
        title="View user profile, Login ID, or switch accounts"
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            currentUser.avatarColor || 'bg-blue-600'
          }`}
        >
          {currentUser.name.charAt(0).toUpperCase()}
        </span>

        <div className="text-left hidden md:block">
          <div className="flex items-center gap-1.5">
            <span className="block text-xs font-bold leading-none text-white">
              {currentUser.name}
            </span>
            {currentUser.loginId && (
              <span className="font-mono text-[9px] font-bold bg-blue-900/80 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700">
                {currentUser.loginId}
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 font-mono capitalize block mt-0.5">
            {currentUser.role}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-84 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 text-slate-900 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Active User Banner with Official Login ID */}
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800">
            <div className="flex items-start gap-3">
              <span
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-xs flex-shrink-0 ${
                  currentUser.avatarColor || 'bg-blue-600'
                }`}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-sm text-white truncate">
                    {currentUser.name}
                  </h3>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border capitalize ${
                      roleColors[currentUser.role] || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>

                {currentUser.organization && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {currentUser.organization}
                  </p>
                )}

                {currentUser.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0 text-slate-500" />
                    <span className="truncate">{currentUser.email}</span>
                  </p>
                )}

                {currentUser.mobile && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <Phone className="w-3 h-3 flex-shrink-0 text-slate-500" />
                    <span>{currentUser.mobile}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Prominent Login ID badge container */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/50 -mx-4 -mb-4 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] text-slate-400">Login ID:</span>
                <span className="font-mono font-bold text-xs text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700">
                  {currentUser.loginId || 'VJPL-ID'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentUser.loginId || '')}
                className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                title="Copy Login ID to clipboard"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Switch User Section */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                <span>Switch User Account</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {users.length} {users.length === 1 ? 'account' : 'accounts'}
              </span>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      if (!isSelected) {
                        onSwitchUser(u);
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                          u.avatarColor || 'bg-slate-600'
                        }`}
                      >
                        {u.name.charAt(0)}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate block leading-tight font-medium">
                            {u.name}
                          </span>
                          {u.loginId && (
                            <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded">
                              {u.loginId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {u.mobile || u.email || u.role}
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                    ) : (
                      <span className="text-[10px] capitalize text-slate-400 flex-shrink-0 ml-2">
                        {u.role}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Links */}
          <div className="p-2 space-y-0.5 text-xs font-medium text-slate-700">
            {/* Primary Login ID Interface Button */}
            <button
              type="button"
              id="btn-open-login-id-interface"
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('login');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 transition-colors text-blue-700 font-semibold"
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Login ID Interface & Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('register');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-colors text-slate-800"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>Create / Issue New Login ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenAuth('directory');
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-colors text-slate-800"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Login ID Directory & Badges</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenManageUsers();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition-colors text-slate-800"
            >
              <Shield className="w-4 h-4 text-slate-600" />
              <span>Manage User Accounts</span>
            </button>

            <div className="border-t border-slate-100 my-1"></div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
