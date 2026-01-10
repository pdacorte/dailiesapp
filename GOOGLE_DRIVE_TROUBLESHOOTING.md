# Google Drive Sync Troubleshooting Guide

If you're getting the error "error loading google drive" or "Failed to list backups: failed to get/create app folder: undefined", follow these steps to diagnose and fix the issue.

## Quick Diagnosis

Open your browser's developer console (F12) and run this command:
```javascript
testGoogleDriveSetup()
```

This will show you the current status of your Google Drive setup.

## Common Issues and Solutions

### 1. **Google Drive API Not Enabled**
**Symptoms**: Error messages about API not being available
**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search for "Google Drive API" and enable it

### 2. **Invalid or Missing Client ID**
**Symptoms**: "Invalid Client ID" or authentication failures
**Solution**:
1. Check that you have a Client ID in `google-drive-config.js`
2. Verify the Client ID format: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
3. Make sure the Client ID is for a "Web application"

### 3. **Missing Redirect URI Configuration**
**Symptoms**: "Redirect URI mismatch" errors
**Solution**:
1. In Google Cloud Console, go to "APIs & Services" → "Credentials"
2. Edit your OAuth 2.0 Client ID
3. Add these Authorized redirect URIs:
   - `http://localhost/google-drive-callback.html`
   - `http://localhost:8080/google-drive-callback.html` (if using port 8080)

### 4. **Missing Authorized JavaScript Origins**
**Symptoms**: "Origin not allowed" errors
**Solution**:
1. In Google Cloud Console, edit your OAuth 2.0 Client ID
2. Add these Authorized JavaScript origins:
   - `http://localhost`
   - `http://localhost:8080` (if using port 8080)

### 5. **Browser Console Errors**
Check the browser console for these specific errors:

#### **"gapi is not defined"**
- Google APIs failed to load
- Check your internet connection
- Make sure you're not blocking Google scripts

#### **"Failed to fetch" or Network Errors**
- Check your internet connection
- Make sure you're not behind a firewall blocking Google APIs

#### **"Invalid scope" or "Permission denied"**
- The app is requesting permissions it shouldn't need
- Make sure the scopes in `google-drive-config.js` are correct

## Step-by-Step Fix

### Step 1: Clear Browser Data
1. Clear browser cache and cookies
2. Clear localStorage for the site
3. Restart the browser

### Step 2: Verify Configuration
1. Open `google-drive-config.js`
2. Make sure `CLIENT_ID` has your actual Client ID
3. Check that `TEST_MODE` is `true` for development

### Step 3: Test in Browser Console
1. Open DailiesApp
2. Open Developer Console (F12)
3. Run: `testGoogleDriveSetup()`
4. Check the output for issues

### Step 4: Manual Testing
1. Try to sign in to Google Drive from the app
2. Check if the authentication popup appears
3. Check the browser console for any errors

## Advanced Debugging

### Check Google API Status
```javascript
console.log('Google Drive Config Status:', getConfigStatus());
```

### Manual Authentication Test
```javascript
// Try to authenticate manually
authenticateWithGoogleDrive()
  .then(token => console.log('Authentication successful:', token))
  .catch(error => console.error('Authentication failed:', error));
```

### Check Folder Creation
```javascript
// Test folder creation (requires authentication first)
getOrCreateAppFolder()
  .then(folderId => console.log('Folder ID:', folderId))
  .catch(error => console.error('Folder error:', error));
```

## Common Error Messages

### "Failed to get/create app folder: undefined"
- Google Drive API not properly initialized
- Authentication token missing or expired
- Network issues preventing API calls

### "Failed to list backups: [error message]"
- Permission issues with Google Drive
- Network connectivity problems
- API quota exceeded

### "Authentication failed: [error]"
- Invalid Client ID
- Missing redirect URIs
- User denied permissions

## Reset Everything

If nothing works, try a complete reset:

1. Clear browser cache and cookies
2. Delete `google_drive_token` from localStorage
3. Restart the browser
4. Get a new Client ID from Google Cloud Console
5. Update `google-drive-config.js` with the new Client ID
6. Try again

## Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Take screenshots of any error messages
3. Check if you can access other Google services
4. Try a different browser
5. Check your internet connection

## Notes for Development

- The app uses OAuth 2.0 for authentication
- Tokens are stored in localStorage (not secure for production)
- For production, consider using a backend server
- Always test with `TEST_MODE: true` during development