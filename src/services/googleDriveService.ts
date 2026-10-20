export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  iconLink?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveAboutInfo {
  user?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: DriveStorageQuota;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Fetch storage quota & user details from Google Drive
 */
export async function getAboutDrive(token: string): Promise<DriveAboutInfo> {
  const res = await fetch(`${DRIVE_API_BASE}/about?fields=user,storageQuota`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Drive details (${res.status})`);
  }
  return res.json();
}

/**
 * List files and folders with query and optional parent folder filter
 */
export async function listDriveFiles(
  token: string,
  options?: {
    folderId?: string;
    searchTerm?: string;
    mimeTypeFilter?: string;
    pageSize?: number;
  }
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const pageSize = options?.pageSize || 40;
  const queries: string[] = ['trashed = false'];

  if (options?.folderId) {
    queries.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchTerm && options.searchTerm.trim()) {
    const escaped = options.searchTerm.replace(/'/g, "\\'");
    queries.push(`name contains '${escaped}'`);
  }

  if (options?.mimeTypeFilter) {
    if (options.mimeTypeFilter === 'folders') {
      queries.push("mimeType = 'application/vnd.google-apps.folder'");
    } else if (options.mimeTypeFilter === 'images') {
      queries.push("mimeType contains 'image/'");
    } else if (options.mimeTypeFilter === 'backups') {
      queries.push("(name contains 'Restaurant-Backup' or name contains 'json')");
    } else if (options.mimeTypeFilter === 'spreadsheets') {
      queries.push("(mimeType contains 'spreadsheet' or name contains '.csv')");
    }
  }

  const q = encodeURIComponent(queries.join(' and '));
  const fields = encodeURIComponent(
    'nextPageToken,files(id,name,mimeType,size,modifiedTime,iconLink,thumbnailLink,webViewLink,webContentLink,owners)'
  );
  const orderBy = encodeURIComponent('folder desc,modifiedTime desc');

  const res = await fetch(
    `${DRIVE_API_BASE}/files?q=${q}&fields=${fields}&orderBy=${orderBy}&pageSize=${pageSize}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to list Drive files (${res.status})`);
  }

  return res.json();
}

/**
 * Create a folder in Google Drive
 */
export async function createDriveFolder(
  token: string,
  folderName: string,
  parentId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create folder (${res.status})`);
  }

  return res.json();
}

/**
 * Find or create designated Restaurant Data folder
 */
export async function findOrCreateRestaurantFolder(
  token: string,
  folderName = 'Restaurant Cloud Backups & Files'
): Promise<string> {
  const q = encodeURIComponent(
    `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const res = await fetch(`${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) {
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }
  const created = await createDriveFolder(token, folderName);
  return created.id;
}

/**
 * Upload JSON data (Restaurant backup) using multipart upload
 */
export async function uploadJsonToDrive(
  token: string,
  fileName: string,
  data: any,
  folderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Automatic restaurant system backup from Admin Dashboard',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    closeDelimiter;

  const res = await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload backup to Drive (${res.status})`);
  }

  return res.json();
}

/**
 * Upload CSV report to Google Drive
 */
export async function uploadCsvToDrive(
  token: string,
  fileName: string,
  csvData: string,
  folderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'text/csv',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/csv\r\n\r\n' +
    csvData +
    closeDelimiter;

  const res = await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload CSV to Drive (${res.status})`);
  }

  return res.json();
}

/**
 * Upload binary file (e.g. food image, PDF receipt) to Google Drive
 */
export async function uploadFileBlobToDrive(
  token: string,
  file: File,
  folderId?: string
): Promise<DriveFile> {
  const metadata: Record<string, any> = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileReader = new FileReader();
  const fileArrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer);
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });

  const metadataPart = new Blob([
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  ]);

  const endPart = new Blob([closeDelimiter]);
  const multipartBlob = new Blob([metadataPart, new Uint8Array(fileArrayBuffer), endPart]);

  const res = await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartBlob,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to upload file to Drive (${res.status})`);
  }

  return res.json();
}

/**
 * Read/Download file content from Drive (e.g. to restore backup JSON)
 */
export async function downloadFileContent(token: string, fileId: string): Promise<string> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to download file (${res.status})`);
  }
  return res.text();
}

/**
 * Delete a file from Google Drive
 * CAUTION: Explicit user confirmation MUST be presented in UI before calling this!
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete file (${res.status})`);
  }
}
