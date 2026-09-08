import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cloud,
  FolderPlus,
  Upload,
  RefreshCw,
  ExternalLink,
  Trash2,
  FileText,
  FileSpreadsheet,
  Folder,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  DownloadCloud,
  Search,
  LogIn,
  LogOut,
  ShieldCheck,
  HardDrive,
  FileUp,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { DriveFile, TransportRecord } from '../types';
import {
  signInWithGoogle,
  signOutGoogle,
  getGoogleAccessToken,
  getCurrentGoogleUser,
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  deleteDriveFile,
  backupFleetToDrive,
  importRecordsFromDriveFile,
  getOrCreateTransportFolder,
  setCachedAccessToken,
} from '../utils/googleDrive';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TransportRecord[];
  onImportRecords: (importedRecords: TransportRecord[]) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  records,
  onImportRecords,
}) => {
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(() => getCurrentGoogleUser());
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'backup' | 'explorer'>('backup');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Files & Drive State
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<DriveFile | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupFile, setLastBackupFile] = useState<DriveFile | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Folder State
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Destructive Delete Confirmation Modal State (MANDATORY WORKSPACE REQUIREMENT)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check token status on mount and when modal opens
  useEffect(() => {
    if (!isOpen) return;
    checkAuthStatus();
  }, [isOpen]);

  const checkAuthStatus = async () => {
    const token = await getGoogleAccessToken();
    const user = getCurrentGoogleUser();
    setGoogleUser(user);
    setHasToken(!!token);
    if (token) {
      loadDriveFiles();
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setHasToken(true);
        setSuccessMessage(`Connected to Google Drive as ${result.user.email}`);
        await loadDriveFiles();
      }
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      setError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setHasToken(false);
      setFiles([]);
      setSuccessMessage('Signed out of Google Drive.');
    } catch (err: any) {
      setError(err?.message || 'Sign out failed');
    }
  };

  const loadDriveFiles = async (folderId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const driveFiles = await listDriveFiles({
        folderId: folderId || currentFolder?.id,
        search: searchQuery,
      });
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
      if (err?.message?.includes('sign in') || err?.message?.includes('401')) {
        setHasToken(false);
      }
      setError(err?.message || 'Failed to load files from Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupNow = async () => {
    if (!hasToken) {
      setError('Please connect your Google Drive first.');
      return;
    }
    setIsBackingUp(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { file, folder } = await backupFleetToDrive(records);
      setLastBackupFile(file);
      setSuccessMessage(
        `Successfully backed up ${records.length} records to Google Drive in folder "${folder.name}"!`
      );
      // Refresh files list
      await loadDriveFiles();
    } catch (err: any) {
      console.error('Backup failed:', err);
      setError(err?.message || 'Backup to Google Drive failed.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const uploaded = await uploadFileToDrive({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        content: file,
        parentId: currentFolder?.id,
      });
      setSuccessMessage(`Uploaded "${uploaded.name}" to Google Drive.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadDriveFiles();
    } catch (err: any) {
      console.error('File upload failed:', err);
      setError(err?.message || 'Failed to upload file to Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await createDriveFolder(newFolderName.trim(), currentFolder?.id);
      setSuccessMessage(`Created folder "${newFolderName.trim()}" in Google Drive.`);
      setNewFolderName('');
      setShowNewFolderModal(false);
      await loadDriveFiles();
    } catch (err: any) {
      setError(err?.message || 'Failed to create folder.');
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit user confirmation before deleting from Drive
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteDriveFile(fileToDelete.id);
      setSuccessMessage(`Deleted "${fileToDelete.name}" from Google Drive.`);
      setFileToDelete(null);
      await loadDriveFiles();
    } catch (err: any) {
      console.error('Delete file error:', err);
      setError(err?.message || 'Failed to delete file from Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportFile = async (file: DriveFile) => {
    if (!window.confirm(`Import transport records from "${file.name}" into your fleet logbook?`)) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const importedRecords = await importRecordsFromDriveFile(file.id);
      onImportRecords(importedRecords);
      setSuccessMessage(
        `Successfully imported ${importedRecords.length} records from Google Drive!`
      );
    } catch (err: any) {
      console.error('Import from drive error:', err);
      setError(err?.message || 'Failed to import records from this file.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    }
    if (
      file.mimeType.includes('csv') ||
      file.mimeType.includes('spreadsheet') ||
      file.name.endsWith('.csv')
    ) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    }
    if (file.mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    }
    if (file.mimeType.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
    }
    return <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />;
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '—';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div
        id="modal-google-drive"
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-2 backdrop-blur-sm border border-white/10">
              {/* Google Drive Multi-Color Icon */}
              <svg viewBox="0 0 87.3 78" className="w-full h-full">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Google Drive Integration</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Cloud Workspace
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Backup fleet records, manage documents & sync vehicle logs with Google Drive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account / Connection Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {hasToken && googleUser ? (
            <div className="flex items-center gap-3">
              {googleUser.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt={googleUser.displayName || 'Google User'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {googleUser.displayName?.[0] || googleUser.email?.[0] || 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    {googleUser.displayName || 'Google Drive Connected'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{googleUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs text-slate-600">
                Connect your Google Drive account with user permission to enable cloud backups and file storage.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {hasToken ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                Disconnect
              </button>
            ) : (
              /* Official "Sign in with Google" Button */
              <button
                type="button"
                id="btn-sign-in-google-drive"
                onClick={handleSignIn}
                disabled={isLoading}
                className="gsi-material-button inline-flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-500 hover:text-emerald-700 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'backup'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Cloud className="w-4 h-4" />
              Fleet Backup & Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'explorer'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              Drive Explorer & Uploads
            </button>
          </div>

          {hasToken && (
            <button
              type="button"
              onClick={() => loadDriveFiles()}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Refresh Drive files"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!hasToken ? (
            /* Unauthenticated Prompt */
            <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                <Cloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Connect Google Drive to your Fleet App
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  With your permission, sign in with your Google account to automatically backup daily trip logs, export CSV spreadsheets to Drive, and upload vehicle documents directly to your cloud storage.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="gsi-material-button inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>{isLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Firebase Auth
                </span>
                <span>•</span>
                <span>In-memory Token Only</span>
                <span>•</span>
                <span>Permission-Based Access</span>
              </div>
            </div>
          ) : activeTab === 'backup' ? (
            /* TAB 1: FLEET CLOUD BACKUP & SYNC */
            <div className="space-y-6">
              {/* Primary Action Card: 1-Click Backup */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Sync Current Fleet Logbook to Google Drive
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    Saves all <strong className="text-slate-700">{records.length} transport records</strong> as a formatted CSV spreadsheet into your dedicated Google Drive folder (<strong>Transport Fleet Logbook</strong>).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="btn-backup-to-google-drive"
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
                  >
                    <Cloud className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
                    {isBackingUp ? 'Uploading to Drive...' : 'Backup to Google Drive'}
                  </button>
                </div>
              </div>

              {lastBackupFile && (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-semibold">Latest Backup Created: </span>
                      <span>{lastBackupFile.name}</span>
                    </div>
                  </div>
                  {lastBackupFile.webViewLink && (
                    <a
                      href={lastBackupFile.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      <span>Open in Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Saved Fleet Backups in Drive */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Drive Backup Files & Spreadsheets
                  </h4>
                  <span className="text-xs text-slate-400">
                    {files.filter((f) => f.name.endsWith('.csv') || f.mimeType.includes('csv')).length} CSV files
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
                  {files.filter((f) => f.name.endsWith('.csv') || f.mimeType.includes('csv')).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No CSV backups found in Google Drive yet. Click "Backup to Google Drive" to generate your first cloud backup.
                    </div>
                  ) : (
                    files
                      .filter((f) => f.name.endsWith('.csv') || f.mimeType.includes('csv'))
                      .map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {file.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>
                                  {file.modifiedTime
                                    ? new Date(file.modifiedTime).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : 'Recent'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleImportFile(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                              title="Import records from this CSV into your fleet database"
                            >
                              <DownloadCloud className="w-3.5 h-3.5" />
                              <span>Import</span>
                            </button>

                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete file from Google Drive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: DRIVE EXPLORER & UPLOAD */
            <div className="space-y-4">
              {/* Controls bar: Search, New Folder, Upload File */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadDriveFiles()}
                    placeholder="Search files in Google Drive..."
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewFolderModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-slate-600" />
                    <span>New Folder</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <FileUp className={`w-3.5 h-3.5 ${isUploading ? 'animate-bounce' : ''}`} />
                    <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                  </button>
                </div>
              </div>

              {/* Files Table / List */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 grid grid-cols-12 gap-2">
                  <div className="col-span-6 sm:col-span-7">Name</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Size</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Loading Google Drive files...
                    </div>
                  ) : files.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No files found in Google Drive. Use "Upload File" or "Backup to Google Drive".
                    </div>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className="px-4 py-3 hover:bg-slate-50/80 transition-colors grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        <div className="col-span-6 sm:col-span-7 flex items-center gap-2.5 min-w-0">
                          {getFileIcon(file)}
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {file.modifiedTime
                                ? new Date(file.modifiedTime).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-3 sm:col-span-2 text-right text-slate-500 text-[11px]">
                          {formatFileSize(file.size)}
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-1.5">
                          {(file.name.endsWith('.csv') || file.mimeType.includes('csv')) && (
                            <button
                              type="button"
                              onClick={() => handleImportFile(file)}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200"
                              title="Import records from this CSV"
                            >
                              Import
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              title="Open in Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => setFileToDelete(file)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete file from Google Drive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Google Drive API v3 (OAuth2 Enabled)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      {/* New Folder Modal Dialog */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm bg-white rounded-xl shadow-xl p-5 space-y-4 border border-slate-200"
          >
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              Create Folder in Google Drive
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Fleet Inspection Reports 2026"
                autoFocus
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newFolderName.trim()}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Delete File from Google Drive?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900 font-semibold">{fileToDelete.name}</strong> from
                your Google Drive? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
