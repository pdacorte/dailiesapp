// Google Drive API Configuration for DailiesApp
// ==============================================
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
  CLIENT_ID: '431601199553-6ig5dsrvvm2snl1ktfuh72bju7uqq07k.apps.googleusercontent.com',
  
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

// Export configuration and functions
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