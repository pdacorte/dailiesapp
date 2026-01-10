// Google Drive UI Integration for DailiesApp

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

// Export functions
window.showGoogleDriveSyncModal = showGoogleDriveSyncModal;
window.closeGoogleDriveModal = closeGoogleDriveModal;
window.loadGoogleDriveModalContent = loadGoogleDriveModalContent;
window.signInToGoogleDrive = signInToGoogleDrive;
window.signOutFromDrive = signOutFromDrive;
window.uploadBackupToDrive = uploadBackupToDrive;
window.downloadBackupFromDrive = downloadBackupFromDrive;
window.deleteBackupFromDrive = deleteBackupFromDrive;
window.clearAndReauthenticate = clearAndReauthenticate;