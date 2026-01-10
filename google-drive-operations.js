// Google Drive Operations for DailiesApp

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

// Export functions
window.authenticateWithGoogleDrive = authenticateWithGoogleDrive;
window.signOutFromGoogleDrive = signOutFromGoogleDrive;
window.uploadBackupToGoogleDrive = uploadBackupToGoogleDrive;
window.listBackupsFromGoogleDrive = listBackupsFromGoogleDrive;
window.downloadBackupFromGoogleDrive = downloadBackupFromGoogleDrive;
window.deleteBackupFromGoogleDrive = deleteBackupFromGoogleDrive;
window.getStorageQuota = getStorageQuota;