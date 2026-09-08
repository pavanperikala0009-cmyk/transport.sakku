import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Copy,
  Check,
  Sparkles,
  Search,
  Building2,
  Apple,
  Chrome,
  ArrowRight,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { User, UserRole, Organization } from '../types';
import {
  authenticateUser,
  registerUser,
  generateUniqueLoginId,
  updateUserLoginId,
} from '../utils/storage';
import { signInWithGoogle } from '../utils/googleDrive';

export type AuthModalMode = 'login' | 'register' | 'directory';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  users: User[];
  onLoginSuccess: (user: User) => void;
  onUsersUpdated: () => void;
  initialMode?: AuthModalMode;
  organizations?: Organization[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onLoginSuccess,
  onUsersUpdated,
  initialMode = 'login',
  organizations = [],
}) => {
  // Current view: 'login' | 'signup' | 'forgot' | 'directory'
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'directory'>(
    initialMode === 'register' ? 'signup' : initialMode === 'directory' ? 'directory' : 'login'
  );

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign up form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('driver');
  const [regOrg, setRegOrg] = useState('VJPL Logistics Division');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Social Auth status
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  // Directory & Quick Demo Accounts state
  const [searchDirectory, setSearchDirectory] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickPills, setShowQuickPills] = useState(false);

  // Sync initialMode when opened
  useEffect(() => {
    if (isOpen) {
      setView(
        initialMode === 'register' ? 'signup' : initialMode === 'directory' ? 'directory' : 'login'
      );
      setLoginError('');
      setRegError('');
      setRegSuccess('');
      setForgotMessage('');
      setForgotError('');
      setSocialNotice(null);
    }
  }, [isOpen, initialMode]);

  // Live detection of existing user in login input
  const detectedUser = useMemo(() => {
    const clean = loginIdentifier.trim().toLowerCase();
    if (!clean) return null;
    return (
      users.find(
        (u) =>
          u.loginId?.trim().toLowerCase() === clean ||
          u.email?.trim().toLowerCase() === clean ||
          (clean.length >= 7 && u.mobile?.replace(/\D/g, '') === clean.replace(/\D/g, ''))
      ) || null
    );
  }, [loginIdentifier, users]);

  if (!isOpen) return null;

  // Exact function names matching the user's template
  const showSignUp = () => {
    setView('signup');
    setRegError('');
    setRegSuccess('');
    setSocialNotice(null);
  };

  const showLogin = () => {
    setView('login');
    setLoginError('');
    setSocialNotice(null);
  };

  // Submit Login Form
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = authenticateUser(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setLoginError(res.error || 'Authentication failed. Please verify your email and password.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit Sign Up Form
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsSigningUp(true);

    try {
      // Auto-generate official sequential Login ID
      const generatedId = generateUniqueLoginId(regRole, users);

      const res = registerUser({
        name: regFullName.trim(),
        loginId: generatedId,
        email: regEmail.trim() || undefined,
        password: regPassword,
        role: regRole,
        organization: regOrg,
      });

      if (res.success && res.user) {
        setRegSuccess(`Account created successfully! Assigned Login ID: ${res.user.loginId}`);
        onUsersUpdated();
        onLoginSuccess(res.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setRegError(res.error || 'Account registration failed. Please try again.');
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    setSocialLoading('google');
    setLoginError('');
    setRegError('');
    setSocialNotice(null);

    try {
      const result = await signInWithGoogle();
      if (!result?.user) {
        throw new Error('Google sign-in was cancelled.');
      }

      const googleEmail = result.user.email || '';
      const googleName = result.user.displayName || 'Google User';

      // Check if user exists with this email
      let matched = users.find(
        (u) => u.email && u.email.toLowerCase() === googleEmail.toLowerCase()
      );

      if (!matched) {
        // Register new user automatically
        const newLoginId = generateUniqueLoginId('driver', users);
        const newReg = registerUser({
          name: googleName,
          email: googleEmail,
          loginId: newLoginId,
          password: 'google_oauth_user',
          role: 'driver',
          organization: 'VJPL Logistics Division',
        });

        if (newReg.success && newReg.user) {
          matched = newReg.user;
          onUsersUpdated();
        }
      }

      if (matched) {
        onLoginSuccess(matched);
        setSocialNotice(`Signed in with Google as ${googleName}!`);
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      const msg = err?.message || 'Google authentication was not completed.';
      if (view === 'signup') {
        setRegError(msg);
      } else {
        setLoginError(msg);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  // Apple OAuth Handler
  const handleAppleAuth = () => {
    setSocialLoading('apple');
    setSocialNotice(null);

    // Apple ID simulated/instant authorization
    setTimeout(() => {
      const appleDemoEmail = 'apple.id.user@icloud.com';
      let matched = users.find((u) => u.email === appleDemoEmail);

      if (!matched) {
        const newLoginId = generateUniqueLoginId('driver', users);
        const res = registerUser({
          name: 'Apple Verified Driver',
          email: appleDemoEmail,
          loginId: newLoginId,
          password: 'apple_oauth_user',
          role: 'driver',
          organization: 'VJPL Logistics Division',
        });
        if (res.success && res.user) {
          matched = res.user;
          onUsersUpdated();
        }
      }

      if (matched) {
        onLoginSuccess(matched);
        setSocialNotice('Signed in with Apple ID (Instant Demo)!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
      setSocialLoading(null);
    }, 600);
  };

  // Forgot Password Submit
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    const clean = forgotEmail.trim().toLowerCase();
    const found = users.find(
      (u) =>
        u.email?.toLowerCase() === clean ||
        u.loginId?.toLowerCase() === clean ||
        u.mobile?.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );

    if (found) {
      setForgotMessage(
        `Account found for ${found.name} (${found.loginId || found.email}). A secure password reset link has been dispatched to ${found.email || 'your registered contact'}. Default password is: admin123`
      );
    } else {
      setForgotError(
        `No account found matching "${forgotEmail}". Please verify your email/Login ID or contact your Fleet Administrator.`
      );
    }
  };

  // Quick 1-Click Profile Selection
  const handleQuickLogin = (demoUser: User) => {
    const idToUse = demoUser.email || demoUser.loginId || demoUser.name;
    setLoginIdentifier(idToUse);
    setLoginPassword(demoUser.password || 'admin123');
    setLoginError('');
  };

  // Filtered Users in Directory
  const filteredDirectoryUsers = users.filter((u) => {
    const q = searchDirectory.toLowerCase();
    return (
      (u.loginId && u.loginId.toLowerCase().includes(q)) ||
      u.name.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.includes(q))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="main fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      {/* Background Decorative Gradient Orbs for Glass Refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-pink-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main Glassmorphism Container */}
      <div className="container relative z-10 max-w-md w-full my-auto rounded-3xl p-6 sm:p-8 glass-card-container text-white border border-white/20 shadow-2xl transition-all duration-300">
        
        {/* Top Controls: Close button & Active Session Status */}
        <div className="flex items-center justify-between mb-4">
          {currentUser ? (
            <div className="flex items-center gap-2 text-xs bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200">Active:</span>
              <strong className="text-white font-medium truncate max-w-[130px]">
                {currentUser.name}
              </strong>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-indigo-300" />
              <span className="font-semibold tracking-wide uppercase text-[10px] text-indigo-200">
                VJPL Secure Portal
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social notice message if any */}
        {socialNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{socialNotice}</span>
          </div>
        )}

        {/* =========================================================================
            1. LOGIN FORM CONTAINER
            ========================================================================= */}
        {view === 'login' && (
          <div className="form-container login-form transition-all duration-300">
            <h2 className="title text-2xl sm:text-3xl font-bold text-center mb-6 tracking-tight text-white drop-shadow-sm">
              Welcome back!
            </h2>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form className="form space-y-4" onSubmit={handleLoginSubmit}>
              {/* Email / Login ID input */}
              <div className="relative">
                <input
                  type="text"
                  className="input glass-input-field w-full px-4 py-3 rounded-xl text-sm font-medium"
                  placeholder="Email or Login ID"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  autoComplete="username"
                />
                {detectedUser && (
                  <span className="absolute right-3 top-3 text-[11px] text-emerald-300 font-semibold flex items-center gap-1 pointer-events-none">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {detectedUser.name.split(' ')[0]}
                  </span>
                )}
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="input glass-input-field w-full px-4 pr-11 py-3 rounded-xl text-sm font-medium"
                  placeholder="Password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-1"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot Password link */}
              <div className="page-link-label text-right">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="page-link text-xs text-indigo-200 hover:text-pink-300 transition-colors font-medium cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="form-btn glass-primary-btn w-full py-3 rounded-xl text-sm font-semibold tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>Log in</span>
              </button>
            </form>

            {/* Toggle to Sign Up */}
            <p className="login-label text-xs text-slate-300 text-center mt-5">
              Don't have an account?{' '}
              <span
                className="login-link font-bold text-white hover:text-pink-300 underline cursor-pointer transition-colors"
                onClick={showSignUp}
              >
                Sign up
              </span>
            </p>

            {/* Social Logins */}
            <div className="buttons-container mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAppleAuth}
                disabled={!!socialLoading}
                className="apple-login-button glass-social-btn w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Apple className="apple-icon w-4 h-4 text-white" />
                <span>Log in with Apple</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={!!socialLoading}
                className="google-login-button glass-social-btn w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Chrome className="google-icon w-4 h-4 text-emerald-300" />
                <span>
                  {socialLoading === 'google' ? 'Connecting to Google...' : 'Log in with Google'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. SIGN UP FORM CONTAINER
            ========================================================================= */}
        {view === 'signup' && (
          <div className="form-container sign-up-form transition-all duration-300">
            <h2 className="title text-2xl sm:text-3xl font-bold text-center mb-6 tracking-tight text-white drop-shadow-sm">
              Create an Account
            </h2>

            {regError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form className="form space-y-3.5" onSubmit={handleSignUpSubmit}>
              {/* Full Name input */}
              <div>
                <input
                  type="text"
                  className="input glass-input-field w-full px-4 py-3 rounded-xl text-sm font-medium"
                  placeholder="Full Name"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                />
              </div>

              {/* Email input */}
              <div>
                <input
                  type="email"
                  className="input glass-input-field w-full px-4 py-3 rounded-xl text-sm font-medium"
                  placeholder="Email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  className="input glass-input-field w-full px-4 pr-11 py-3 rounded-xl text-sm font-medium"
                  placeholder="Password"
                  required
                  minLength={4}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-1"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Role Selection inside Glass card */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-white/50"
                  >
                    <option value="driver" className="bg-slate-900 text-white">Fleet Driver</option>
                    <option value="operator" className="bg-slate-900 text-white">Log Operator</option>
                    <option value="supervisor" className="bg-slate-900 text-white">Supervisor</option>
                    <option value="manager" className="bg-slate-900 text-white">Fleet Manager</option>
                    <option value="admin" className="bg-slate-900 text-white">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-300 mb-1">
                    Organization
                  </label>
                  <select
                    value={regOrg}
                    onChange={(e) => setRegOrg(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:border-white/50 truncate"
                  >
                    <option value="VJPL Logistics Division" className="bg-slate-900 text-white">VJPL Logistics</option>
                    <option value="VJPL Heavy Transport" className="bg-slate-900 text-white">VJPL Transport</option>
                    <option value="VJPL Port Cargo Ops" className="bg-slate-900 text-white">Port Cargo Ops</option>
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSigningUp}
                className="form-btn glass-primary-btn w-full py-3 rounded-xl text-sm font-semibold tracking-wide shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSigningUp ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>Sign Up</span>
              </button>
            </form>

            {/* Toggle to Login */}
            <p className="sign-up-label text-xs text-slate-300 text-center mt-5">
              Already have an account?{' '}
              <span
                className="sign-up-link font-bold text-white hover:text-pink-300 underline cursor-pointer transition-colors"
                onClick={showLogin}
              >
                Log in
              </span>
            </p>

            {/* Social Buttons */}
            <div className="buttons-container mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleAppleAuth}
                disabled={!!socialLoading}
                className="apple-login-button glass-social-btn w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Apple className="apple-icon w-4 h-4 text-white" />
                <span>Sign up with Apple</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={!!socialLoading}
                className="google-login-button glass-social-btn w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <Chrome className="google-icon w-4 h-4 text-emerald-300" />
                <span>
                  {socialLoading === 'google' ? 'Connecting to Google...' : 'Sign up with Google'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. FORGOT PASSWORD CONTAINER
            ========================================================================= */}
        {view === 'forgot' && (
          <div className="form-container forgot-form transition-all duration-300">
            <h2 className="title text-2xl font-bold text-center mb-2 tracking-tight text-white drop-shadow-sm">
              Password Recovery
            </h2>
            <p className="text-xs text-slate-300 text-center mb-6">
              Enter your registered Email, Login ID, or Mobile number to retrieve account access.
            </p>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form className="form space-y-4" onSubmit={handleForgotPasswordSubmit}>
              <div>
                <input
                  type="text"
                  className="input glass-input-field w-full px-4 py-3 rounded-xl text-sm font-medium"
                  placeholder="Enter Email or Login ID (e.g. VJPL-ADM01)"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="form-btn glass-primary-btn w-full py-3 rounded-xl text-sm font-semibold tracking-wide shadow-lg cursor-pointer"
              >
                Send Recovery Details
              </button>
            </form>

            <div className="text-center mt-5">
              <button
                type="button"
                onClick={showLogin}
                className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
              >
                ← Back to Log in
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. LOGIN ID DIRECTORY VIEW
            ========================================================================= */}
        {view === 'directory' && (
          <div className="directory-view space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-300" />
                <span>Login ID Directory</span>
              </h3>
              <button
                type="button"
                onClick={showLogin}
                className="text-xs text-indigo-200 hover:underline"
              >
                Back to Login
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchDirectory}
                onChange={(e) => setSearchDirectory(e.target.value)}
                placeholder="Search Login ID, Name, Role..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:border-white/50"
              />
            </div>

            {/* Directory Cards */}
            <div className="space-y-2">
              {filteredDirectoryUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-300">{u.loginId || 'NO ID'}</span>
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white/10 text-slate-200">
                        {u.role}
                      </span>
                    </div>
                    <p className="text-white font-medium truncate mt-0.5">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.email || u.mobile || 'No contact'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleQuickLogin(u);
                      showLogin();
                    }}
                    className="px-2 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/40 text-indigo-200 text-[11px] font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Testing Drawer / Toggle for Fleet Profiles */}
        {view !== 'directory' && (
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => setShowQuickPills((prev) => !prev)}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{showQuickPills ? 'Hide Quick Profiles' : 'Quick Demo Logins'}</span>
              </button>

              <button
                type="button"
                onClick={() => setView('directory')}
                className="text-indigo-200 hover:text-white transition-colors cursor-pointer font-medium"
              >
                Browse ID Directory ({users.length}) →
              </button>
            </div>

            {showQuickPills && (
              <div className="grid grid-cols-2 gap-2 mt-3 text-left">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      handleQuickLogin(u);
                      if (view !== 'login') showLogin();
                    }}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono font-bold text-indigo-300 group-hover:text-white">
                        {u.loginId || 'ID'}
                      </span>
                      <span className="capitalize text-slate-300">{u.role}</span>
                    </div>
                    <p className="text-white text-xs font-semibold truncate mt-0.5">{u.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
