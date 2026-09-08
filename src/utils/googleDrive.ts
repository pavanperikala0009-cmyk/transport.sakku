import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DriveFile, TransportRecord } from '../types';
import { generateRecordsCSVString, parseCSVToRecords } from './storage';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (never stored in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If user is restored from session but token is absent, token needs fresh interactive sign-in
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google Auth credential');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const signOutGoogle = async (): Promise<void> => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

export const getCurrentGoogleUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Google Drive API Helpers

/**
 * List files from Google Drive
 */
export const listDriveFiles = async (options?: {
  folderId?: string;
  search?: string;
  pageSize?: number;
}): Promise<DriveFile[]> => {
  const token = await getGoogleAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to access Google Drive.');
  }

  const pageSize = options?.pageSize || 40;
  const queries: string[] = ['trashed = false'];

  if (options?.folderId) {
    queries.push(`'${options.folderId}' in parents`);
  }

  if (options?.search && options.search.trim()) {
    const escaped = options.search.trim().replace(/'/g, "\\'");
    queries.push(`name contains '${escaped}'`);
  }

  const q = queries.join(' and ');
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,thumbnailLink,parents)'
  );
  url.searchParams.set('orderBy', 'folder desc,modifiedTime desc');
  url.searchParams.set('q', q);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.error?.message || `Google Drive API error (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  return (data.files || []) as DriveFile[];
};

/**
 * Create a folder in Google Drive
 */
export const createDriveFolder = async (
  folderName: string,
  parentId?: string
): Promise<DriveFile> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Please sign in with Google to create folders.');

  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    body.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to create folder in Google Drive');
  }

  return await res.json();
};

/**
 * Get or create the dedicated app folder "Transport Fleet Logbook" in user's Drive
 */
export const getOrCreateTransportFolder = async (): Promise<DriveFile> => {
  const FOLDER_NAME = 'Transport Fleet Logbook';
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Please sign in with Google first.');

  const q = `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0] as DriveFile;
    }
  }

  // Create folder if not found
  return await createDriveFolder(FOLDER_NAME);
};

/**
 * Upload a file to Google Drive using multipart upload
 */
export const uploadFileToDrive = async ({
  name,
  mimeType,
  content,
  parentId,
}: {
  name: string;
  mimeType: string;
  content: string | Blob | File;
  parentId?: string;
}): Promise<DriveFile> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Please sign in with Google to upload files.');

  const metadata: any = {
    name,
    mimeType,
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------transport_fleet_logbook_boundary_31415';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let contentData: Blob;
  if (typeof content === 'string') {
    contentData = new Blob([content], { type: mimeType });
  } else {
    contentData = content;
  }

  const metaBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const multipartBody = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      metaBlob,
      delimiter,
      `Content-Type: ${mimeType}\r\n\r\n`,
      contentData,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to upload file to Google Drive');
  }

  return await res.json();
};

/**
 * Delete a file in Google Drive
 * Note: Must always be called after user confirmation!
 */
export const deleteDriveFile = async (fileId: string): Promise<void> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Please sign in with Google to delete files.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to delete file from Google Drive');
  }
};

/**
 * Download a file content from Google Drive
 */
export const downloadDriveFileText = async (fileId: string): Promise<string> => {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('Please sign in with Google to download files.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Failed to download file from Google Drive');
  }

  return await res.text();
};

/**
 * One-Click Backup of all transport records to Google Drive in the app's dedicated folder
 */
export const backupFleetToDrive = async (
  records: TransportRecord[]
): Promise<{ file: DriveFile; folder: DriveFile }> => {
  const folder = await getOrCreateTransportFolder();
  const csvContent = generateRecordsCSVString(records);
  const dateStr = new Date().toISOString().replace(/:/g, '-').slice(0, 19);
  const fileName = `Fleet_Transport_Logbook_${dateStr}.csv`;

  const file = await uploadFileToDrive({
    name: fileName,
    mimeType: 'text/csv',
    content: csvContent,
    parentId: folder.id,
  });

  return { file, folder };
};

/**
 * Import transport records from a Google Drive CSV file
 */
export const importRecordsFromDriveFile = async (
  fileId: string
): Promise<TransportRecord[]> => {
  const csvText = await downloadDriveFileText(fileId);
  const parsed = parseCSVToRecords(csvText);
  if (parsed.length === 0) {
    throw new Error('No valid transport records were found in the selected file.');
  }
  return parsed;
};
