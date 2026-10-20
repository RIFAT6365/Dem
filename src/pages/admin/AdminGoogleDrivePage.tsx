import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  HardDrive,
  Cloud,
  CloudUpload,
  Download,
  Trash2,
  FolderPlus,
  RefreshCw,
  Search,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Folder,
  FileCode,
  File,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  ChevronRight,
  LogOut,
  LayoutGrid,
  List,
} from 'lucide-react';
import { GoogleSignInButton } from '../../components/common/GoogleSignInButton';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logoutGoogle,
} from '../../services/googleDriveAuth';
import {
  DriveFile,
  DriveAboutInfo,
  getAboutDrive,
  listDriveFiles,
  createDriveFolder,
  findOrCreateRestaurantFolder,
  uploadJsonToDrive,
  uploadCsvToDrive,
  uploadFileBlobToDrive,
  downloadFileContent,
  deleteDriveFile,
} from '../../services/googleDriveService';
import { useRestaurant } from '../../context/RestaurantContext';

export const AdminGoogleDrivePage: React.FC = () => {
  const {
    products,
    categories,
    orders,
    reservations,
    reviews,
    coupons,
    gallery,
    settings,
    navLinks,
    restoreRestaurantBackup,
    showToast,
  } = useRestaurant();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Drive state
  const [aboutInfo, setAboutInfo] = useState<DriveAboutInfo | null>(null);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'backups' | 'spreadsheets' | 'images' | 'folders'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Navigation state (folders)
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<Array<{ id?: string; name: string }>>([
    { id: undefined, name: 'My Drive' },
  ]);

  // Modals & Action States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  // Destructive Action Confirmation Modals (MANDATORY per guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [backupToRestore, setBackupToRestore] = useState<DriveFile | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setAuthInitialized(true);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setAuthInitialized(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Drive Data when token changes or folder changes
  const fetchDriveData = async (token = accessToken, folderId = currentFolderId) => {
    if (!token) return;
    setIsLoadingFiles(true);
    try {
      // 1. Fetch about info
      try {
        const about = await getAboutDrive(token);
        setAboutInfo(about);
      } catch (e) {
        console.warn('Could not fetch about quota', e);
      }

      // 2. Fetch files
      const result = await listDriveFiles(token, {
        folderId,
        searchTerm: searchTerm.trim() ? searchTerm : undefined,
        mimeTypeFilter: activeFilter === 'all' ? undefined : activeFilter,
        pageSize: 50,
      });
      setFiles(result.files || []);
    } catch (err: any) {
      console.error('Error fetching Drive files:', err);
      showToast(`Drive fetch error: ${err.message}`, 'error');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDriveData(accessToken, currentFolderId);
    }
  }, [accessToken, currentFolderId, activeFilter]);

  // Login handler
  const handleLogin = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        showToast(`Connected to Google Drive as ${res.user.displayName || res.user.email}!`, 'success');
        fetchDriveData(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(err.message || 'Failed to sign in with Google.', 'error');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setFiles([]);
    setAboutInfo(null);
    showToast('Signed out of Google Drive', 'info');
  };

  // Folder navigation
  const openFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const navigateBreadcrumb = (index: number) => {
    const target = folderBreadcrumbs[index];
    setCurrentFolderId(target.id);
    setFolderBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // 1. One-Click Full Restaurant Backup to Google Drive
  const handleFullBackup = async () => {
    if (!accessToken) return;
    setIsBackingUp(true);
    try {
      // Find or create dedicated folder
      const targetFolderId = await findOrCreateRestaurantFolder(accessToken, 'Restaurant Cloud Backups & Files');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `Restaurant-Backup-${timestamp}.json`;

      const backupPayload = {
        exportedAt: new Date().toISOString(),
        version: '2.0',
        restaurantName: settings.restaurantName,
        products,
        categories,
        orders,
        reservations,
        reviews,
        coupons,
        gallery,
        settings,
        navLinks,
      };

      const result = await uploadJsonToDrive(accessToken, fileName, backupPayload, targetFolderId);
      showToast(`Backup saved to Google Drive: "${result.name}"`, 'success');
      // Refresh current folder or open backups folder
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('Backup failed:', err);
      showToast(`Backup failed: ${err.message}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // 2. Export Orders to CSV on Drive
  const handleExportOrdersCsv = async () => {
    if (!accessToken) return;
    setIsExportingCsv(true);
    try {
      const targetFolderId = await findOrCreateRestaurantFolder(accessToken, 'Restaurant Cloud Backups & Files');
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Orders-Report-${timestamp}.csv`;

      // Build CSV
      const headers = ['Order Number', 'Date', 'Type', 'Customer Name', 'Phone', 'Items', 'Total', 'Payment', 'Status'];
      const rows = orders.map((o) => {
        const itemsSummary = o.items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
        return [
          `#${o.orderNumber}`,
          `"${new Date(o.createdAt).toLocaleString()}"`,
          `"${o.fulfillmentType}"`,
          `"${o.customer?.fullName || ''}"`,
          `"${o.customer?.phone || ''}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          o.total,
          `"${o.paymentMethod} (${o.paymentStatus})"`,
          `"${o.orderStatus}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const result = await uploadCsvToDrive(accessToken, fileName, csvContent, targetFolderId);
      showToast(`Orders CSV saved to Google Drive: "${result.name}"`, 'success');
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('Export CSV failed:', err);
      showToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 3. Export Menu to CSV on Drive
  const handleExportMenuCsv = async () => {
    if (!accessToken) return;
    setIsExportingCsv(true);
    try {
      const targetFolderId = await findOrCreateRestaurantFolder(accessToken, 'Restaurant Cloud Backups & Files');
      const timestamp = new Date().toISOString().slice(0, 10);
      const fileName = `Menu-Catalog-${timestamp}.csv`;

      const headers = ['ID', 'Name', 'Category', 'Price', 'Sale Price', 'Status', 'Is Featured', 'Description'];
      const rows = products.map((p) => {
        const categoryName = categories.find((c) => c.id === p.categoryId)?.name || p.categoryId;
        return [
          `"${p.id}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${categoryName.replace(/"/g, '""')}"`,
          p.price,
          p.salePrice ?? '',
          p.isAvailable ? 'In Stock' : 'Out of Stock',
          p.isFeatured ? 'Yes' : 'No',
          `"${(p.shortDescription || p.fullDescription || '').replace(/"/g, '""')}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const result = await uploadCsvToDrive(accessToken, fileName, csvContent, targetFolderId);
      showToast(`Menu Catalog CSV saved to Google Drive: "${result.name}"`, 'success');
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('Export menu failed:', err);
      showToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 4. Custom file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setIsUploading(true);
    try {
      const result = await uploadFileBlobToDrive(accessToken, file, currentFolderId);
      showToast(`Uploaded "${result.name}" to Google Drive successfully!`, 'success');
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('File upload failed:', err);
      showToast(`Upload failed: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 5. Create new folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const folder = await createDriveFolder(accessToken, newFolderName.trim(), currentFolderId);
      showToast(`Created folder "${folder.name}"`, 'success');
      setNewFolderName('');
      setShowFolderModal(false);
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('Folder creation failed:', err);
      showToast(`Failed to create folder: ${err.message}`, 'error');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // 6. Restore from Google Drive Backup (with Confirmation Modal)
  const confirmRestoreBackup = async () => {
    if (!backupToRestore || !accessToken) return;
    setIsRestoring(true);
    try {
      const text = await downloadFileContent(accessToken, backupToRestore.id);
      const parsed = JSON.parse(text);
      const result = restoreRestaurantBackup(parsed);
      if (result.success) {
        setBackupToRestore(null);
      }
    } catch (err: any) {
      console.error('Restore error:', err);
      showToast(`Failed to restore backup: ${err.message}`, 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // 7. Delete File from Drive (with Mandatory Confirmation Modal)
  const confirmDeleteFile = async () => {
    if (!fileToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showToast(`Deleted "${fileToDelete.name}" from Google Drive`, 'info');
      setFileToDelete(null);
      fetchDriveData(accessToken, currentFolderId);
    } catch (err: any) {
      console.error('Delete failed:', err);
      showToast(`Delete failed: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper: Format file size
  const formatBytes = (bytes?: string | number) => {
    if (!bytes) return '—';
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num)) return '—';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    if (num < 1024 * 1024 * 1024) return `${(num / (1024 * 1024)).toFixed(1)} MB`;
    return `${(num / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Helper: File Icon
  const getFileIcon = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-5 h-5 text-amber-500 fill-amber-100" />;
    }
    if (file.mimeType.includes('image/')) {
      return <ImageIcon className="w-5 h-5 text-purple-600" />;
    }
    if (file.name.endsWith('.json') || file.mimeType.includes('json')) {
      return <FileCode className="w-5 h-5 text-emerald-600" />;
    }
    if (file.name.endsWith('.csv') || file.mimeType.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    if (file.mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4285F4]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans text-2xl font-bold text-gray-900 not-italic flex items-center gap-2">
                Google Drive Cloud Storage
                {accessToken && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Connected
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Securely store restaurant database backups, export order reports, and manage media assets in Google Drive
              </p>
            </div>
          </div>
        </div>

        {/* Right header buttons */}
        <div className="flex items-center gap-2">
          {accessToken ? (
            <>
              <button
                type="button"
                onClick={() => fetchDriveData()}
                disabled={isLoadingFiles}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </>
          ) : (
            <GoogleSignInButton
              onClick={handleLogin}
              loading={isAuthenticating}
              text="Connect Google Drive"
            />
          )}
        </div>
      </div>

      {/* When NOT Connected: Hero & Connect Prompt */}
      {!accessToken ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xs text-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500/10 via-amber-500/10 to-green-500/10 border border-gray-200 flex items-center justify-center mx-auto mb-4 text-[#4285F4]">
            <Cloud className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-sans text-gray-900 not-italic">
            Connect Your Restaurant to Google Drive
          </h2>
          <p className="text-xs text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
            Link your Google Drive account with one click to enable automatic cloud backups, export spreadsheet-ready sales reports, and manage restaurant food photos.
          </p>

          <div className="mt-6 flex justify-center">
            <GoogleSignInButton
              onClick={handleLogin}
              loading={isAuthenticating}
              text="Sign in with Google to Connect"
              className="py-3 px-6 shadow-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-gray-100 text-left">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/60">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                <FileCode className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 font-sans">Full Cloud Backups</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Save complete store states including menus, categories, orders, and customer records.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/60">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 font-sans">Export Reports (CSV)</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Export orders and food catalog reports directly into Google Sheets or Drive CSV files.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/60">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                <ImageIcon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 font-sans">Media Management</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Upload and organize dish photographs, receipts, and documents in Drive folders.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* When CONNECTED */
        <div className="space-y-6">
          {/* Top Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* User Account Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
              {aboutInfo?.user?.photoLink || currentUser?.photoURL ? (
                <img
                  src={aboutInfo?.user?.photoLink || currentUser?.photoURL || ''}
                  alt="Google Profile"
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-2xs">
                  {currentUser?.displayName?.[0] || 'G'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Connected Google Account
                </span>
                <p className="font-sans font-bold text-sm text-gray-900 truncate not-italic mt-0.5">
                  {aboutInfo?.user?.displayName || currentUser?.displayName || 'Google User'}
                </p>
                <p className="text-xs text-gray-500 truncate font-sans">
                  {aboutInfo?.user?.emailAddress || currentUser?.email}
                </p>
              </div>
            </div>

            {/* Storage Quota Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Google Drive Storage
                </span>
                <span className="text-xs font-bold text-blue-600 font-sans tabular-nums">
                  {formatBytes(aboutInfo?.storageQuota?.usage)} / {formatBytes(aboutInfo?.storageQuota?.limit)}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      aboutInfo?.storageQuota?.limit
                        ? Math.min(
                            100,
                            Math.round(
                              (parseInt(aboutInfo.storageQuota.usage || '0', 10) /
                                parseInt(aboutInfo.storageQuota.limit, 10)) *
                                100
                            )
                          )
                        : 25
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-2 flex items-center justify-between font-sans">
                <span>Free cloud space available</span>
                <span className="font-bold text-gray-700">
                  {files.length} items loaded
                </span>
              </p>
            </div>

            {/* Quick Sync Status Card */}
            <div className="bg-gradient-to-br from-[#07131A] to-[#12232E] text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B51B] block">
                  Restaurant Cloud Sync
                </span>
                <h4 className="font-sans font-bold text-sm text-white mt-1 not-italic">
                  {settings.restaurantName}
                </h4>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Ready to backup {products.length} menu items & {orders.length} orders
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10 text-[11px] text-[#F5B51B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Drive OAuth active</span>
              </div>
            </div>
          </div>

          {/* Action Hub Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* One Click Full Backup */}
              <button
                type="button"
                onClick={handleFullBackup}
                disabled={isBackingUp}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
              >
                <CloudUpload className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
                {isBackingUp ? 'Saving Backup...' : 'Backup Restaurant to Drive'}
              </button>

              {/* Export Orders CSV */}
              <button
                type="button"
                onClick={handleExportOrdersCsv}
                disabled={isExportingCsv}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                Export Orders (CSV)
              </button>

              {/* Export Menu CSV */}
              <button
                type="button"
                onClick={handleExportMenuCsv}
                disabled={isExportingCsv}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Export Menu (CSV)
              </button>

              {/* Upload Local File */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300 disabled:opacity-50"
              >
                <CloudUpload className="w-4 h-4 text-purple-600" />
                {isUploading ? 'Uploading...' : 'Upload File / Photo'}
              </button>

              {/* New Folder */}
              <button
                type="button"
                onClick={() => setShowFolderModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-300"
              >
                <FolderPlus className="w-4 h-4 text-amber-600" />
                New Folder
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden p-0.5 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drive Explorer Container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {/* Explorer Toolbar */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-1.5 text-xs font-sans font-semibold text-gray-600 overflow-x-auto py-1">
                {folderBreadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id || 'root'}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                    <button
                      type="button"
                      onClick={() => navigateBreadcrumb(idx)}
                      className={`hover:text-blue-600 transition-colors whitespace-nowrap ${
                        idx === folderBreadcrumbs.length - 1 ? 'text-gray-900 font-bold' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>

              {/* Search & Filter pills */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Drive files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDriveData()}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 w-44 sm:w-56 font-sans"
                  />
                </div>

                <select
                  value={activeFilter}
                  onChange={(e: any) => setActiveFilter(e.target.value)}
                  className="text-xs py-1.5 px-2.5 rounded-xl border border-gray-300 bg-white font-sans font-medium text-gray-700 focus:outline-none"
                >
                  <option value="all">All Files</option>
                  <option value="backups">Backups (JSON)</option>
                  <option value="spreadsheets">Spreadsheets / CSV</option>
                  <option value="images">Photos / Images</option>
                  <option value="folders">Folders Only</option>
                </select>
              </div>
            </div>

            {/* Explorer Content */}
            {isLoadingFiles ? (
              <div className="p-16 text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-xs font-bold text-gray-700 font-sans">Accessing Google Drive files...</p>
                <p className="text-[11px] text-gray-400 mt-1">Listing files, backups, and folders</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Folder className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold font-sans text-gray-900">No files found in this folder</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Click "Backup Restaurant to Drive" above to create your first cloud backup or upload files.
                </p>
              </div>
            ) : viewMode === 'list' ? (
              /* List Table View */
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 uppercase font-semibold text-[10px] tracking-wider">
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Size</th>
                      <th className="p-3.5">Last Modified</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const isBackupJson = file.name.endsWith('.json') || file.name.includes('Restaurant-Backup');

                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                          onClick={() => {
                            if (isFolder) openFolder(file);
                          }}
                        >
                          {/* File Name */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              {getFileIcon(file)}
                              <div className="min-w-0">
                                <span className="font-sans font-bold text-gray-900 group-hover:text-blue-600 transition-colors block truncate max-w-md not-italic">
                                  {file.name}
                                </span>
                                {isBackupJson && (
                                  <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                    Restaurant Database Backup
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="p-3.5 text-gray-500 font-sans">
                            {isFolder ? 'Folder' : file.mimeType.split('/').pop()?.toUpperCase()}
                          </td>

                          {/* Size */}
                          <td className="p-3.5 text-gray-600 font-sans tabular-nums font-medium">
                            {formatBytes(file.size)}
                          </td>

                          {/* Modified */}
                          <td className="p-3.5 text-gray-500 font-sans">
                            {new Date(file.modifiedTime).toLocaleDateString()} {new Date(file.modifiedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          {/* Actions */}
                          <td
                            className="p-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              {/* Open in Drive link */}
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}

                              {/* Restore Button (if backup json) */}
                              {isBackupJson && (
                                <button
                                  type="button"
                                  onClick={() => setBackupToRestore(file)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Restore restaurant data from this backup"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Restore
                                </button>
                              )}

                              {/* Delete Button (Opens mandatory user confirmation dialog) */}
                              <button
                                type="button"
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete from Drive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  const isBackupJson = file.name.endsWith('.json') || file.name.includes('Restaurant-Backup');

                  return (
                    <div
                      key={file.id}
                      onClick={() => {
                        if (isFolder) openFolder(file);
                      }}
                      className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-xs transition-all group cursor-pointer bg-white flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        {getFileIcon(file)}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFileToDelete(file);
                          }}
                          className="text-gray-300 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3">
                        <span className="font-sans font-bold text-xs text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 not-italic">
                          {file.name}
                        </span>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-sans">
                          <span>{formatBytes(file.size)}</span>
                          <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isBackupJson && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBackupToRestore(file);
                          }}
                          className="mt-3 w-full py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Restore Backup
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE OPERATION (DELETE FILE) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-sans text-gray-900 not-italic">
              Delete file from Google Drive?
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-gray-900 font-semibold font-sans">"{fileToDelete.name}"</strong>? This action cannot be undone and the file will be removed from your Google Drive.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 space-y-1 font-sans">
              <div className="flex justify-between">
                <span className="text-gray-400">File Type:</span>
                <span className="font-medium text-gray-800">{fileToDelete.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="font-medium text-gray-800">{formatBytes(fileToDelete.size)}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL FOR RESTORE BACKUP */}
      {backupToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-sans text-gray-900 not-italic">
              Restore Restaurant Data from Backup?
            </h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              You are about to restore the restaurant database using{' '}
              <strong className="text-gray-900 font-semibold font-sans">"{backupToRestore.name}"</strong>.
              This will update your current products, categories, orders, reservations, and settings with the records stored in this backup.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBackupToRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRestoreBackup}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Restoring Database...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Restore
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFolder}
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold font-sans text-gray-900 not-italic">
              Create New Folder in Google Drive
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Enter a folder name to organize restaurant files and records.
            </p>

            <input
              type="text"
              placeholder="e.g. Invoices 2026"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
              autoFocus
              className="mt-4 w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 font-sans"
            />

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFolderModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreatingFolder || !newFolderName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
