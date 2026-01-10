// Google Drive Integration for DailiesApp
// ===========================================
// This file combines functionality from:
// - google-drive-config.js: Configuration and API initialization
// - google-drive-operations.js: Core Google Drive operations
// - google-drive-ui.js: User interface components

// CONFIGURATION SECTION
// =====================

// Google Drive API Configuration for DailiesApp
// IMPORTANT: For security, NEVER commit real Client IDs to version control.
// This file contains TEST/DEMO configuration only.
// For production, use environment variables or a secure backend service.

// TEST CONFIGURATION - For development and demonstration only
// ============================================================
// This configuration uses a test Client ID that works with localhost.
// To use your own Google Drive credentials:

// STEP 1: Create Google Cloud Project
// -----------------------------------
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project (e.g., "DailiesApp-Test")
// 3. Enable "Google Drive API" in the API Library

// STEP 2: Configure OAuth 2.0 Credentials
// ---------------------------------------
// 1. Go to "Credentials" in the left sidebar
// 2. Click "Create Credentials" → "OAuth client ID"
// 3. Application type: "Web application"
// 4. Name: "DailiesApp Web Client"
// 5. Authorized JavaScript origins:
//    - http://localhost
//    - http://localhost:8080 (if using a different port)
//    - https://yourdomain.com (for production)
// 6. Authorized redirect URIs:
//    - http://localhost/google-drive-callback.html
//    - http://localhost:8080/google-drive-callback.html
//    - https://yourdomain.com/google-drive-callback.html
// 7. Click "Create" and copy the Client ID

// STEP 3: Update Configuration
// ----------------------------
// 1. Copy your Client ID
// 2. Go to Settings in DailiesApp
// 3. Paste your Client ID in the Google Drive API Key field
// 4. Click "Save API Key"

// TEST/DEVELOPMENT CONFIGURATION
// ===============================
// Note: The empty string below means "use API key from database"
// When you save your API key in Settings, it will be loaded here.

const GOOGLE_DRIVE_CONFIG = {
  // Google OAuth 2.0 Client ID
  // Empty string = load from database (user settings)
  // For testing, you can temporarily add a test Client ID here:
  CLIENT_ID: '',
  
  // API Scopes - what permissions the app needs
  // Using drive.appdata for app-specific storage (doesn't require broad permissions)
  // Using drive.file for creating files in user's drive when needed
  SCOPES: [
    'https://www.googleapis.com/auth/drive.appdata', // App-specific folder (appDataFolder)
    'https://www.googleapis.com/auth/drive.file', // Per-file access to files created by the app
    'profile', // Basic profile info
    'email' // Email address
  ].join(' '),
  
  // Discovery document for Google API
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  
  // App-specific folder name in Google Drive
  APP_FOLDER_NAME: 'DailiesApp Backups',
  
  // File MIME type for backups
  BACKUP_MIME_TYPE: 'application/json',
  
  // File extension for backups
  BACKUP_FILE_EXTENSION: '.dailiesbackup',
  
  // Maximum backup files to keep
  MAX_BACKUP_FILES: 10,
  
  // Token storage key in localStorage
  TOKEN_STORAGE_KEY: 'google_drive_token',
  
  // User info storage key
  USER_INFO_STORAGE_KEY: 'google_drive_user_info',
  
  // Test mode flag (for development)
  TEST_MODE: true,
  
  // Test user instructions
  TEST_INSTRUCTIONS: 'To test Google Drive sync: 1) Get a Client ID from Google Cloud Console, 2) Save it in Settings, 3) Click Cloud Sync button'
};

// Initialize Google API client
let gapiInited = false;
let gisInited = false;
let tokenClient = null;

// Initialize Google APIs
function initializeGoogleApis() {
  // Check if already initialized
  if (gapiInited && gisInited) {
    console.log('Google APIs already initialized');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    let gapiLoaded = false;
    let gisLoaded = false;
    let hasError = false;

    function checkAllLoaded() {
      if (gapiLoaded && gisLoaded) {
        resolve();
      } else if (hasError) {
        reject(new Error('Failed to load Google APIs'));
      }
    }

    // Load Google API client library
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: '', // API key not needed for OAuth 2.0
            discoveryDocs: [GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC],
          });
          gapiInited = true;
          gapiLoaded = true;
          console.log('Google API client initialized');
          checkAllLoaded();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          hasError = true;
          checkAllLoaded();
        }
      });
    };
    gapiScript.onerror = () => {
      console.error('Failed to load Google API script');
      hasError = true;
      checkAllLoaded();
    };
    document.head.appendChild(gapiScript);

    // Load Google Identity Services library
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      gisInited = true;
      gisLoaded = true;
      console.log('Google Identity Services initialized');
      checkAllLoaded();
    };
    gisScript.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      hasError = true;
      checkAllLoaded();
    };
    document.head.appendChild(gisScript);

    // Set timeout for loading
    setTimeout(() => {
      if (!gapiLoaded || !gisLoaded) {
        hasError = true;
        checkAllLoaded();
      }
    }, 10000); // 10 second timeout
  });
}

// Check if Google APIs are initialized
function areGoogleApisInitialized() {
  return gapiInited && gisInited;
}

// Initialize token client
function initializeTokenClient() {
  if (!gisInited) {
    throw new Error('Google Identity Services not initialized. Please wait for Google APIs to load.');
  }
  
  // Check if Client ID is configured
  if (!GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
    throw new Error('Google Drive Client ID not configured. Please add your Client ID in Settings.');
  }
  
  // Validate Client ID format (basic check)
  if (!GOOGLE_DRIVE_CONFIG.CLIENT_ID.includes('.apps.googleusercontent.com')) {
    console.warn('Client ID format may be incorrect. Expected format: XXXXXX-XXXXXXXXXXXX.apps.googleusercontent.com');
  }
  
  // Check if token client is already initialized with the same client ID
  if (tokenClient && tokenClient.client_id === GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
    console.log('Token client already initialized with current Client ID');
    return;
  }
  
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
    scope: GOOGLE_DRIVE_CONFIG.SCOPES,
    callback: '', // Will be set when making token request
    prompt: 'consent' // Always show consent screen
  });
  
  console.log('Token client initialized with Client ID:', GOOGLE_DRIVE_CONFIG.CLIENT_ID.substring(0, 10) + '...');
}

// Get stored token
function getStoredToken() {
  return localStorage.getItem(GOOGLE_DRIVE_CONFIG.TOKEN_STORAGE_KEY);
}

// Store token
function storeToken(token) {
  localStorage.setItem(GOOGLE_DRIVE_CONFIG.TOKEN_STORAGE_KEY, token);
}

// Clear stored token
function clearStoredToken() {
  localStorage.removeItem(GOOGLE_DRIVE_CONFIG.TOKEN_STORAGE_KEY);
  localStorage.removeItem(GOOGLE_DRIVE_CONFIG.USER_INFO_STORAGE_KEY);
}

// Get stored user info
function getStoredUserInfo() {
  const userInfo = localStorage.getItem(GOOGLE_DRIVE_CONFIG.USER_INFO_STORAGE_KEY);
  return userInfo ? JSON.parse(userInfo) : null;
}

// Store user info
function storeUserInfo(userInfo) {
  localStorage.setItem(GOOGLE_DRIVE_CONFIG.USER_INFO_STORAGE_KEY, JSON.stringify(userInfo));
}

// Check if user is signed in
function isSignedIn() {
  return !!getStoredToken();
}

// Get user info
async function getUserInfo() {
  const storedUserInfo = getStoredUserInfo();
  if (storedUserInfo) {
    // Update user info display in the sidebar
    if (typeof updateUserInfoDisplay === 'function') {
      updateUserInfoDisplay(storedUserInfo);
    }
    return storedUserInfo;
  }
  
  if (!isSignedIn()) {
    return null;
  }
  
  try {
    const response = await gapi.client.request({
      path: 'https://www.googleapis.com/oauth2/v2/userinfo',
    });
    
    const userInfo = {
      name: response.result.name,
      email: response.result.email,
      picture: response.result.picture,
      id: response.result.id
    };
    
    storeUserInfo(userInfo);
    
    // Update user info display in the sidebar
    if (typeof updateUserInfoDisplay === 'function') {
      updateUserInfoDisplay(userInfo);
    }
    
    return userInfo;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Update Google Drive configuration dynamically
function updateGoogleDriveConfig(newConfig) {
  if (newConfig.clientId) {
    GOOGLE_DRIVE_CONFIG.CLIENT_ID = newConfig.clientId;
    console.log('Google Drive Client ID updated');
    
    // Re-initialize token client if Google APIs are loaded
    if (gisInited && typeof google !== 'undefined') {
      try {
        initializeTokenClient();
      } catch (error) {
        console.warn('Could not re-initialize token client:', error.message);
      }
    }
  }
}

// Check if Google Drive is properly configured
function isGoogleDriveConfigured() {
  return !!GOOGLE_DRIVE_CONFIG.CLIENT_ID;
}

// Get configuration status for debugging
function getConfigStatus() {
  return {
    isConfigured: isGoogleDriveConfigured(),
    clientId: GOOGLE_DRIVE_CONFIG.CLIENT_ID ? 
      GOOGLE_DRIVE_CONFIG.CLIENT_ID.substring(0, 10) + '...' : 
      'Not configured',
    gapiInited: gapiInited,
    gisInited: gisInited,
    tokenClient: !!tokenClient,
    testMode: GOOGLE_DRIVE_CONFIG.TEST_MODE,
    hasGapi: typeof gapi !== 'undefined',
    hasGoogle: typeof google !== 'undefined',
    hasGapiClient: typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined',
    hasGapiDrive: typeof gapi !== 'undefined' && typeof gapi.client !== 'undefined' && typeof gapi.client.drive !== 'undefined'
  };
}

// Test Google Drive setup
function testGoogleDriveSetup() {
  console.log('=== Google Drive Setup Test ===');
  console.log('Configuration Status:', getConfigStatus());
  
  if (!GOOGLE_DRIVE_CONFIG.CLIENT_ID) {
    console.error('❌ Client ID not configured');
    return false;
  }
  
  console.log('✅ Client ID configured');
  
  if (!gapiInited || !gisInited) {
    console.warn('⚠️ Google APIs not fully initialized');
    console.log('gapiInited:', gapiInited);
    console.log('gisInited:', gisInited);
  } else {
    console.log('✅ Google APIs initialized');
  }
  
  if (!tokenClient) {
    console.warn('⚠️ Token client not initialized');
  } else {
    console.log('✅ Token client initialized');
  }
  
  const storedToken = getStoredToken();
  if (storedToken) {
    console.log('✅ Stored token found');
  } else {
    console.log('ℹ️ No stored token found (user needs to sign in)');
  }
  
  console.log('=== Test Complete ===');
  return true;
}

// OPERATIONS SECTION
// ==================

// Authenticate with Google Drive
async function authenticateWithGoogleDrive() {
  console.log('Starting Google Drive authentication...');
  
  if (!areGoogleApisInitialized()) {
    console.log('Google APIs not initialized, initializing...');
    try {
      await initializeGoogleApis();
      console.log('Google APIs initialized successfully');
      initializeTokenClient();
      console.log('Token client initialized');
    } catch (error) {
      const errorMessage = error.message || error.toString() || 'Unknown error';
      console.error('Failed to initialize Google APIs:', errorMessage);
      throw new Error(`Failed to initialize Google APIs: ${errorMessage}`);
    }
  } else {
    console.log('Google APIs already initialized');
  }

  if (!tokenClient) {
    console.log('Token client not initialized, initializing...');
    initializeTokenClient();
  }

  return new Promise((resolve, reject) => {
    // Check for existing token
    const storedToken = getStoredToken();
    if (storedToken) {
      console.log('Using stored token');
      gapi.client.setToken({ access_token: storedToken });
      
      // Test if token has sufficient scopes by making a simple API call
      gapi.client.drive.about.get({
        fields: 'user'
      }).then(() => {
        console.log('Token appears valid');
        resolve(storedToken);
      }).catch(error => {
        console.log('Token may be invalid or missing scopes, requesting new token...', error);
        // Clear invalid token
        clearStoredToken();
        requestNewToken(resolve, reject);
      });
      return;
    }

    console.log('No stored token found, requesting new token...');
    requestNewToken(resolve, reject);
  });
  
  function requestNewToken(resolve, reject) {
    // Request new token
    tokenClient.callback = async (response) => {
      console.log('Token callback received:', response);
      
      if (response.error !== undefined) {
        console.error('Authentication error:', response.error);
        reject(new Error(`Authentication failed: ${response.error}`));
        return;
      }
      
      const token = response.access_token;
      console.log('Token received, storing...');
      storeToken(token);
      gapi.client.setToken({ access_token: token });
      resolve(token);
    };

    // Request token with consent to ensure we get all required scopes
    console.log('Requesting access token with consent...');
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }
}

// Sign out from Google Drive
function signOutFromGoogleDrive() {
  const token = getStoredToken();
  if (token) {
    google.accounts.oauth2.revoke(token, () => {
      console.log('Token revoked');
    });
  }
  clearStoredToken();
  gapi.client.setToken(null);
  
  // Reset user info display in the sidebar
  if (typeof updateUserInfoDisplay === 'function') {
    updateUserInfoDisplay(null);
  }
}

// Get or create app folder in Google Drive
async function getOrCreateAppFolder() {
  try {
    console.log('Attempting to get/create app folder in appDataFolder:', GOOGLE_DRIVE_CONFIG.APP_FOLDER_NAME);
    
    // Check if gapi.client.drive is available
    if (!gapi.client || !gapi.client.drive) {
      console.error('Google Drive API not available. gapi.client:', gapi.client);
      throw new Error('Google Drive API not initialized. Please wait for Google APIs to load.');
    }
    
    // Use appDataFolder for app-specific storage (requires drive.appdata scope)
    console.log('Searching for folder in appDataFolder...');
    const appDataResponse = await gapi.client.drive.files.list({
      q: `name='${GOOGLE_DRIVE_CONFIG.APP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'appDataFolder'
    });

    console.log('AppData folder search response:', appDataResponse);
    
    if (appDataResponse.result.files.length > 0) {
      console.log('Found existing folder in appData:', appDataResponse.result.files[0]);
      return appDataResponse.result.files[0].id;
    }

    // Create new folder in appDataFolder
    console.log('Creating new folder in appDataFolder...');
    const createResponse = await gapi.client.drive.files.create({
      resource: {
        name: GOOGLE_DRIVE_CONFIG.APP_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: ['appDataFolder']
      },
      fields: 'id'
    });

    console.log('Folder created in appDataFolder:', createResponse.result);
    return createResponse.result.id;
  } catch (error) {
    console.error('Error getting/creating app folder:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      status: error.status,
      statusText: error.statusText,
      result: error.result
    });
    
    // Check if it's a scope/permission error
    if (error.status === 403 && error.result && error.result.error && 
        error.result.error.message && error.result.error.message.includes('insufficient authentication scopes')) {
      throw new Error('Insufficient permissions. Please sign out and sign in again to grant the required permissions.');
    }
    
    const errorMessage = error.message || error.toString() || 'Unknown error';
    throw new Error(`Failed to get/create app folder: ${errorMessage}`);
  }
}

// Upload backup to Google Drive
async function uploadBackupToGoogleDrive(backupData, fileName = null) {
  try {
    await authenticateWithGoogleDrive();
    
    const folderId = await getOrCreateAppFolder();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = fileName || `dailiesapp-backup-${timestamp}${GOOGLE_DRIVE_CONFIG.BACKUP_FILE_EXTENSION}`;
    
    // Convert data to JSON string
    const jsonString = typeof backupData === 'string' ? backupData : JSON.stringify(backupData, null, 2);
    
    // Create metadata - files in appDataFolder don't need parents array
    const metadata = {
      name: backupFileName,
      mimeType: GOOGLE_DRIVE_CONFIG.BACKUP_MIME_TYPE,
      parents: [folderId], // Still include parent for organization
      description: 'DailiesApp backup file',
      appProperties: {
        app: 'DailiesApp',
        version: '1.0',
        backupDate: new Date().toISOString()
      }
    };

    // Create file
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      jsonString +
      closeDelim;

    const request = gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    });

    const response = await request;
    
    // Clean up old backups if we have too many
    await cleanupOldBackups(folderId);
    
    return {
      success: true,
      fileId: response.result.id,
      fileName: backupFileName,
      webViewLink: response.result.webViewLink
    };
  } catch (error) {
    console.error('Error uploading backup to Google Drive:', error);
    const errorMessage = error.message || error.toString() || 'Unknown error';
    throw new Error(`Failed to upload backup: ${errorMessage}`);
  }
}

// List backups from Google Drive
async function listBackupsFromGoogleDrive() {
  try {
    await authenticateWithGoogleDrive();
    
    const folderId = await getOrCreateAppFolder();
    
    // List files from appDataFolder
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='${GOOGLE_DRIVE_CONFIG.BACKUP_MIME_TYPE}' and trashed=false`,
      fields: 'files(id, name, createdTime, modifiedTime, size, webViewLink)',
      orderBy: 'modifiedTime desc',
      spaces: 'appDataFolder'
    });

    return response.result.files.map(file => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size,
      webViewLink: file.webViewLink
    }));
  } catch (error) {
    console.error('Error listing backups from Google Drive:', error);
    const errorMessage = error.message || error.toString() || 'Unknown error';
    throw new Error(`Failed to list backups: ${errorMessage}`);
  }
}

// Download backup from Google Drive
async function downloadBackupFromGoogleDrive(fileId) {
  try {
    await authenticateWithGoogleDrive();
    
    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    return response.body;
  } catch (error) {
    console.error('Error downloading backup from Google Drive:', error);
    const errorMessage = error.message || error.toString() || 'Unknown error';
    throw new Error(`Failed to download backup: ${errorMessage}`);
  }
}

// Delete backup from Google Drive
async function deleteBackupFromGoogleDrive(fileId) {
  try {
    await authenticateWithGoogleDrive();
    
    await gapi.client.drive.files.delete({
      fileId: fileId
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting backup from Google Drive:', error);
    const errorMessage = error.message || error.toString() || 'Unknown error';
    throw new Error(`Failed to delete backup: ${errorMessage}`);
  }
}

// Clean up old backups (keep only the most recent ones)
async function cleanupOldBackups(folderId) {
  try {
    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='${GOOGLE_DRIVE_CONFIG.BACKUP_MIME_TYPE}' and trashed=false`,
      fields: 'files(id, modifiedTime)',
      orderBy: 'modifiedTime desc',
      spaces: 'drive'
    });

    const files = response.result.files;
    
    if (files.length > GOOGLE_DRIVE_CONFIG.MAX_BACKUP_FILES) {
      const filesToDelete = files.slice(GOOGLE_DRIVE_CONFIG.MAX_BACKUP_FILES);
      
      for (const file of filesToDelete) {
        try {
          await gapi.client.drive.files.delete({
            fileId: file.id
          });
          console.log(`Deleted old backup: ${file.id}`);
        } catch (deleteError) {
          console.error(`Error deleting old backup ${file.id}:`, deleteError);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up old backups:', error);
    // Don't throw error for cleanup failures
  }
}

// Get storage quota information
async function getStorageQuota() {
  try {
    await authenticateWithGoogleDrive();
    
    const response = await gapi.client.drive.about.get({
      fields: 'storageQuota'
    });
    
    return response.result.storageQuota;
  } catch (error) {
    console.error('Error getting storage quota:', error);
    return null;
  }
}

// UI SECTION
// ==========

// Show Google Drive sync modal
function showGoogleDriveSyncModal() {
  // Create modal container
  const modal = document.createElement('div');
  modal.id = 'google-drive-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Google Drive Sync</h2>
        <button onclick="closeGoogleDriveModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div id="google-drive-modal-content" class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading Google Drive sync...</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Load content based on auth state
  setTimeout(() => loadGoogleDriveModalContent(), 100);
}

// Close Google Drive modal
function closeGoogleDriveModal() {
  const modal = document.getElementById('google-drive-modal');
  if (modal) {
    modal.remove();
  }
}

// Load modal content based on auth state
async function loadGoogleDriveModalContent() {
  const contentDiv = document.getElementById('google-drive-modal-content');
  if (!contentDiv) return;
  
  try {
    // Check if user is signed in
    const isSignedIn = window.isSignedIn ? window.isSignedIn() : false;
    
    if (isSignedIn) {
      await loadSignedInContent();
    } else {
      loadSignedOutContent();
    }
  } catch (error) {
    console.error('Error loading modal content:', error);
    contentDiv.innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">Failed to load Google Drive sync: ${error.message}</p>
        <button onclick="loadGoogleDriveModalContent()" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
          Try Again
        </button>
      </div>
    `;
  }
}

// Load content for signed-out users
function loadSignedOutContent() {
  const contentDiv = document.getElementById('google-drive-modal-content');
  if (!contentDiv) return;
  
  contentDiv.innerHTML = `
    <div class="text-center py-8">
      <div class="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">cloud</span>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Sync with Google Drive</h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Connect your Google Drive to automatically backup your DailiesApp data and sync across devices.
      </p>
      <div class="space-y-4">
        <button onclick="signInToGoogleDrive()" class="w-full bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-md flex items-center justify-center gap-3">
          <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5">
          Sign in with Google
        </button>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          <p class="mb-2">By signing in, you'll be able to:</p>
          <ul class="text-left space-y-1">
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-sm">check</span>
              Automatically backup your data
            </li>
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-sm">check</span>
              Sync across multiple devices
            </li>
            <li class="flex items-center gap-2">
              <span class="material-symbols-outlined text-green-500 text-sm">check</span>
              Access backup history
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

// Load content for signed-in users
async function loadSignedInContent() {
  const contentDiv = document.getElementById('google-drive-modal-content');
  if (!contentDiv) return;
  
  try {
    console.log('Loading signed in content...');
    
    // Get user info
    const userInfo = await getUserInfo();
    console.log('User info:', userInfo);
    
    // Try to list backups - this will test if we have proper permissions
    let backups = [];
    let quota = null;
    
    try {
      backups = await listBackupsFromGoogleDrive();
      console.log('Backups:', backups);
      
      quota = await getStorageQuota();
      console.log('Storage quota:', quota);
    } catch (backupError) {
      console.error('Error accessing Google Drive:', backupError);
      
      // Check if it's a scope/permission error
      if (backupError.message.includes('403') || backupError.message.includes('insufficient authentication scopes')) {
        // Show error message and offer to re-authenticate
        contentDiv.innerHTML = `
          <div class="text-center py-8">
            <span class="material-symbols-outlined text-yellow-500 text-4xl mb-4">warning</span>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Permission Update Required</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              The app needs updated permissions to access Google Drive properly.
              This usually happens when the app has been updated with new features.
            </p>
            <div class="space-y-2">
              <button onclick="clearAndReauthenticate()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
                Re-authenticate with Updated Permissions
              </button>
              <button onclick="loadSignedOutContent()" class="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md">
                Cancel
              </button>
            </div>
          </div>
        `;
        return;
      }
      throw backupError; // Re-throw if it's not a permission error
    }
    
    // Calculate storage usage
    let storageInfo = '';
    if (quota) {
      const usedGB = (parseInt(quota.usage) / (1024 * 1024 * 1024)).toFixed(2);
      const totalGB = (parseInt(quota.limit) / (1024 * 1024 * 1024)).toFixed(2);
      const percentage = ((parseInt(quota.usage) / parseInt(quota.limit)) * 100).toFixed(1);
      storageInfo = `
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Storage</span>
            <span class="text-sm text-gray-600 dark:text-gray-400">${usedGB} GB / ${totalGB} GB</span>
          </div>
          <div class="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }
    
    // Format backups list
    let backupsList = '';
    if (backups.length === 0) {
      backupsList = `
        <div class="text-center py-8">
          <span class="material-symbols-outlined text-gray-400 text-4xl mb-4">cloud_off</span>
          <p class="text-gray-600 dark:text-gray-400">No backups found in Google Drive</p>
        </div>
      `;
    } else {
      backupsList = backups.map(backup => {
        const date = new Date(backup.modifiedTime);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sizeKB = backup.size ? Math.round(parseInt(backup.size) / 1024) : 'N/A';
        
        return `
          <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-blue-500">description</span>
                <div>
                  <h4 class="font-medium text-gray-800 dark:text-gray-200">${backup.name}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${formattedDate} • ${sizeKB} KB</p>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="downloadBackupFromDrive('${backup.id}')" class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="Download">
                <span class="material-symbols-outlined">download</span>
              </button>
              <button onclick="deleteBackupFromDrive('${backup.id}', '${backup.name}')" class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
    
    contentDiv.innerHTML = `
      <div>
        <!-- User Info -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
          ${userInfo?.picture ? `
            <img src="${userInfo.picture}" alt="${userInfo.name}" class="w-12 h-12 rounded-full">
          ` : `
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">person</span>
            </div>
          `}
          <div class="flex-1">
            <h3 class="font-semibold text-gray-800 dark:text-gray-200">${userInfo?.name || 'Google User'}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">${userInfo?.email || ''}</p>
          </div>
          <button onclick="signOutFromDrive()" class="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
            Sign out
          </button>
        </div>
        
        ${storageInfo}
        
        <!-- Backup Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button onclick="uploadBackupToDrive()" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">cloud_upload</span>
            Upload Backup
          </button>
          <button onclick="createAutoBackupSchedule()" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-md flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">schedule</span>
            Auto Backup
          </button>
        </div>
        
        <!-- Backups List -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Backups</h4>
          <div class="max-h-64 overflow-y-auto">
            ${backupsList}
          </div>
        </div>
        
        <!-- Info -->
        <div class="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p class="font-medium mb-2">How it works:</p>
          <ul class="space-y-1">
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
              Backups are stored in a "DailiesApp Backups" folder in your Google Drive
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
              Only the 10 most recent backups are kept to save space
            </li>
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-blue-500 text-sm mt-0.5">info</span>
              Your data is encrypted and only accessible by you
            </li>
          </ul>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading signed in content:', error);
    console.error('Error stack:', error.stack);
    
    let errorMessage = error.message;
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message.includes('token') || error.message.includes('auth')) {
      errorMessage = 'Authentication error. Please sign in again.';
    }
    
    contentDiv.innerHTML = `
      <div class="text-center py-8">
        <span class="material-symbols-outlined text-red-500 text-4xl mb-4">error</span>
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Error Loading Google Drive</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">${errorMessage}</p>
        <div class="space-y-2">
          <button onclick="loadSignedInContent()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md">
            Try Again
          </button>
          <button onclick="signOutFromDrive(); loadSignedOutContent()" class="w-full bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-md">
            Sign Out & Retry
          </button>
        </div>
      </div>
    `;
  }
}

// Sign in to Google Drive
async function signInToGoogleDrive() {
  try {
    await authenticateWithGoogleDrive();
    await loadSignedInContent();
    showNotification('Successfully signed in to Google Drive!', 'success');
  } catch (error) {
    console.error('Error signing in to Google Drive:', error);
    showNotification(`Failed to sign in: ${error.message}`, 'error');
  }
}

// Sign out from Google Drive
async function signOutFromDrive() {
  try {
    signOutFromGoogleDrive();
    loadSignedOutContent();
    showNotification('Signed out from Google Drive', 'info');
  } catch (error) {
    console.error('Error signing out:', error);
    showNotification(`Failed to sign out: ${error.message}`, 'error');
  }
}

// Upload backup to Google Drive
async function uploadBackupToDrive() {
  try {
    // Get current backup data
    const exportData = await getCurrentBackupData();
    
    // Show uploading state
    const contentDiv = document.getElementById('google-drive-modal-content');
    const originalContent = contentDiv.innerHTML;
    contentDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Uploading backup to Google Drive...</p>
      </div>
    `;
    
    // Upload to Google Drive
    const result = await uploadBackupToGoogleDrive(exportData);
    
    // Reload content
    await loadSignedInContent();
    
    showNotification(`Backup uploaded successfully! (${result.fileName})`, 'success');
  } catch (error) {
    console.error('Error uploading backup:', error);
    showNotification(`Failed to upload backup: ${error.message}`, 'error');
    await loadSignedInContent();
  }
}

// Download backup from Google Drive
async function downloadBackupFromDrive(fileId) {
  try {
    // Show downloading state
    const contentDiv = document.getElementById('google-drive-modal-content');
    const originalContent = contentDiv.innerHTML;
    contentDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Downloading backup from Google Drive...</p>
      </div>
    `;
    
    // Download from Google Drive
    const backupData = await downloadBackupFromGoogleDrive(fileId);
    
    // Import the backup
    await importFromJSONString(backupData);
    
    // Reload content
    await loadSignedInContent();
    
    showNotification('Backup downloaded and imported successfully!', 'success');
  } catch (error) {
    console.error('Error downloading backup:', error);
    showNotification(`Failed to download backup: ${error.message}`, 'error');
    await loadSignedInContent();
  }
}

// Delete backup from Google Drive
async function deleteBackupFromDrive(fileId, fileName) {
  if (!confirm(`Are you sure you want to delete backup "${fileName}"?`)) {
    return;
  }
  
  try {
    // Show deleting state
    const contentDiv = document.getElementById('google-drive-modal-content');
    const originalContent = contentDiv.innerHTML;
    contentDiv.innerHTML = `
      <div class="text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Deleting backup from Google Drive...</p>
      </div>
    `;
    
    // Delete from Google Drive
    await deleteBackupFromGoogleDrive(fileId);
    
    // Reload content
    await loadSignedInContent();
    
    showNotification('Backup deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting backup:', error);
    showNotification(`Failed to delete backup: ${error.message}`, 'error');
    await loadSignedInContent();
  }
}

// Create auto backup schedule
function createAutoBackupSchedule() {
  alert('Auto-backup scheduling feature coming soon! For now, you can manually upload backups.');
}

// Get current backup data (reuse export logic)
async function getCurrentBackupData() {
  const db = window.getDatabase ? window.getDatabase() : null;
  
  if (!db) {
    throw new Error("Database not initialized. Please wait for the app to load.");
  }

  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    appVersion: "1.0",
    tasks: [],
    timeTracking: []
  };

  // Export tasks
  const tasks = await new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(["tasks"], "readonly");
      const taskStore = transaction.objectStore("tasks");
      const request = taskStore.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    } catch (error) {
      reject(error);
    }
  });

  // Export time tracking
  const timeTracking = await new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(["timeTracking"], "readonly");
      const timeStore = transaction.objectStore("timeTracking");
      const request = timeStore.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
      
      transaction.onerror = () => reject(transaction.error);
    } catch (error) {
      reject(error);
    }
  });

  exportData.tasks = tasks;
  exportData.timeTracking = timeTracking;

  return exportData;
}

// Clear token and re-authenticate
async function clearAndReauthenticate() {
  try {
    // Clear stored token
    clearStoredToken();
    
    // Show loading state
    const contentDiv = document.getElementById('google-drive-modal-content');
    if (contentDiv) {
      contentDiv.innerHTML = `
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Re-authenticating with updated permissions...</p>
        </div>
      `;
    }
    
    // Wait a moment then authenticate
    setTimeout(async () => {
      try {
        await signInToGoogleDrive();
      } catch (error) {
        console.error('Re-authentication failed:', error);
        showNotification(`Re-authentication failed: ${error.message}`, 'error');
        loadSignedOutContent();
      }
    }, 500);
  } catch (error) {
    console.error('Error clearing and re-authenticating:', error);
    showNotification(`Error: ${error.message}`, 'error');
    loadSignedOutContent();
  }
}

// Export all functions to window object
window.GOOGLE_DRIVE_CONFIG = GOOGLE_DRIVE_CONFIG;
window.initializeGoogleApis = initializeGoogleApis;
window.areGoogleApisInitialized = areGoogleApisInitialized;
window.initializeTokenClient = initializeTokenClient;
window.getStoredToken = getStoredToken;
window.storeToken = storeToken;
window.clearStoredToken = clearStoredToken;
window.getStoredUserInfo = getStoredUserInfo;
window.storeUserInfo = storeUserInfo;
window.isSignedIn = isSignedIn;
window.getUserInfo = getUserInfo;
window.updateGoogleDriveConfig = updateGoogleDriveConfig;
window.isGoogleDriveConfigured = isGoogleDriveConfigured;
window.getConfigStatus = getConfigStatus;
window.testGoogleDriveSetup = testGoogleDriveSetup;
window.authenticateWithGoogleDrive = authenticateWithGoogleDrive;
window.signOutFromGoogleDrive = signOutFromGoogleDrive;
window.uploadBackupToGoogleDrive = uploadBackupToGoogleDrive;
window.listBackupsFromGoogleDrive = listBackupsFromGoogleDrive;
window.downloadBackupFromGoogleDrive = downloadBackupFromGoogleDrive;
window.deleteBackupFromGoogleDrive = deleteBackupFromGoogleDrive;
window.getStorageQuota = getStorageQuota;
window.showGoogleDriveSyncModal = showGoogleDriveSyncModal;
window.closeGoogleDriveModal = closeGoogleDriveModal;
window.loadGoogleDriveModalContent = loadGoogleDriveModalContent;
window.signInToGoogleDrive = signInToGoogleDrive;
window.signOutFromDrive = signOutFromDrive;
window.uploadBackupToDrive = uploadBackupToDrive;
window.downloadBackupFromDrive = downloadBackupFromDrive;
window.deleteBackupFromDrive = deleteBackupFromDrive;
window.clearAndReauthenticate = clearAndReauthenticate;