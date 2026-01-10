# Google Drive Sync Setup Guide

To enable Google Drive sync in DailiesApp, you need to set up Google API credentials. Follow these steps:

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "DailiesApp Sync")
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "DailiesApp Web Client")

## Step 4: Configure Authorized Origins and Redirects

### For Local Development:
```
Authorized JavaScript origins:
- http://localhost
- http://localhost:8000

Authorized redirect URIs:
- http://localhost/google-drive-callback.html
- http://localhost:8000/google-drive-callback.html
```

### For Production (if deployed):
```
Authorized JavaScript origins:
- https://yourdomain.com

Authorized redirect URIs:
- https://yourdomain.com/google-drive-callback.html
```

## Step 5: Get Your Client ID

1. After creating credentials, you'll see your Client ID
2. It will look like: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

## Step 6: Update Configuration

1. Open `google-drive.js` (or use Settings in the app)
2. Replace the Client ID with your actual Client ID (or save it in Settings):
```javascript
CLIENT_ID: 'xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
```

## Step 7: Test the Setup

1. Open DailiesApp in your browser
2. Click "Cloud Sync" in the sidebar
3. Select "Google Drive Sync"
4. Click "Sign in with Google"
5. Grant the requested permissions

## Troubleshooting

### Common Issues:

1. **"Invalid Client ID" error**
   - Make sure you copied the entire Client ID correctly
   - Check that the Client ID is for a "Web application"

2. **"Redirect URI mismatch" error**
   - Ensure the redirect URI in your code matches exactly what you configured
   - For localhost testing, use `http://localhost/google-drive-callback.html`

3. **"API not enabled" error**
   - Go back to Step 2 and make sure Google Drive API is enabled

4. **"Origin not allowed" error**
   - Make sure you added your origin (localhost or domain) to Authorized JavaScript origins

## Security Notes

1. **Never commit your actual Client ID to public repositories**
2. For production, consider:
   - Using environment variables
   - Setting up a backend proxy for API calls
   - Restricting API keys to specific domains

## API Permissions

The app requests these permissions:
- `drive.file` - Access to files created by the app
- `drive.appdata` - Access to app-specific folder
- `profile` - Basic profile information
- `email` - Email address

These are minimal permissions needed for the app to function.

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Ensure you're using the latest version of the app

For additional help, check the Google Drive API documentation or create an issue in the project repository.