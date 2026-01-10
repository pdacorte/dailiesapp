# AGENTS.md - DailiesApp Development Guide

This guide provides essential information for AI agents working on the DailiesApp project.

## Project Overview

DailiesApp is a productivity web application with the following features:
- **Task Management**: Add, complete, delete tasks with auto-creation of Non-Negotiable tasks
- **Time Tracking**: Start/stop timer with task-specific time logging
- **Progress Visualization**: Charts for expected vs actual tasks, streak tracking
- **Data Portability**: Export/import JSON, Google Drive sync, clipboard sync
- **Theme Support**: Light/dark mode with persistence

**Technology Stack:**
- **Frontend**: HTML/CSS/JavaScript with IndexedDB storage
- **Styling**: Tailwind CSS v4.0.0
- **Charts**: Chart.js for data visualization
- **Cloud Sync**: Google Drive API integration

## Build & Development Commands

### Frontend Development
```bash
# Development mode - watch for changes and compile Tailwind CSS
npm run dev

# Production build - minify CSS
npm run build

# Install dependencies
npm install

# Check JavaScript syntax
node -c app.js
```

### Testing
```bash
# No formal test framework currently configured
# Manual testing required for all features
# Test files available: test-export.html, test-google-drive.html
```

## Code Style Guidelines

### JavaScript/HTML/CSS

**Imports & Dependencies:**
- Use ES6+ JavaScript features (modules, arrow functions, template literals)
- Import Chart.js for data visualization (already included via CDN)
- Use IndexedDB for client-side storage with proper error handling
- Follow modular approach with clear function separation
- Google Drive API integration uses OAuth 2.0 with minimal permissions

**Formatting:**
- 2-space indentation
- Use semicolons consistently
- Maximum line length: 100 characters
- Use template literals for string interpolation
- Use arrow functions for callbacks and async operations
- Use `const` for variables that won't be reassigned, `let` for others

**Naming Conventions:**
- `camelCase` for variables and functions: `updateDisplay`, `getTodayDate`, `exportDatabase`
- `PascalCase` for classes (if used)
- `UPPER_SNAKE_CASE` for constants: `dbName`, `dbVersion`, `GOOGLE_DRIVE_CONFIG`
- Descriptive names: `motivationalQuotes`, `expectedTasksPerDay`, `timeTrackingEntries`

**Error Handling:**
- Use `try-catch` blocks for IndexedDB operations and API calls
- Log errors to console with descriptive messages using `console.error()`
- Show user-friendly notifications for critical errors via `showNotification()`
- Validate user input before processing with comprehensive checks
- Handle Google Drive API errors with specific error messages

**HTML Structure:**
- Use semantic HTML5 elements (`<main>`, `<aside>`, `<section>`)
- Follow BEM-like naming for CSS classes when not using Tailwind
- Use Tailwind CSS utility classes primarily
- Include proper ARIA attributes for accessibility
- Modal dialogs for user interactions (Google Drive sync, export/import)

**CSS/Tailwind:**
- Use Tailwind CSS utility classes primarily (v4.0.0)
- Custom CSS in `styles.css` only for complex cases not covered by Tailwind
- Dark mode support via `dark:` prefix classes and `class` strategy
- Responsive design with mobile-first approach using Tailwind breakpoints
- Consistent spacing using Tailwind's spacing scale

**Google Drive Integration:**
- Configuration in `google-drive-config.js` with placeholder for Client ID
- Operations in `google-drive-operations.js` for file CRUD operations
- UI integration in `google-drive-ui.js` with modal-based interface
- Follow OAuth 2.0 best practices with token storage in localStorage
- Request minimal permissions: `drive.file`, `drive.appdata`, `profile`, `email`

## Architecture Patterns

### Frontend Architecture
1. **Initialization**: `DOMContentLoaded` event sets up database, event listeners, and auto-save
2. **State Management**: Global variables for timer state, database connection, chart instances
3. **Data Persistence**: IndexedDB with two object stores: `tasks` and `timeTracking`
4. **UI Updates**: Modular functions update specific sections independently
5. **Event Handling**: Centralized setup in `setupEventListeners()` with clear separation
6. **Export/Import System**: JSON-based with validation and error handling
7. **Cloud Sync**: Three-tier approach: clipboard, localStorage, Google Drive

### Data Flow
1. **User Input** → Form validation → IndexedDB transaction
2. **Database Update** → UI refresh functions → DOM updates
3. **Export Process** → IndexedDB query → JSON serialization → File download/clipboard
4. **Import Process** → File selection → JSON validation → IndexedDB batch insert
5. **Google Drive Sync** → OAuth authentication → API calls → File operations

### Common Patterns
- **CRUD Operations**: Consistent create, read, update, delete patterns across all data types
- **Data Validation**: Comprehensive validation before any database or API operations
- **Error Recovery**: Graceful handling with user feedback and retry options
- **User Feedback**: Visual notifications for success/error states
- **Batch Processing**: Large datasets processed in batches to avoid timeouts
- **Progressive Enhancement**: Core features work offline, cloud sync is optional

## File Structure Conventions

```
dailiesapp/
├── index.html          # Main HTML file
├── app.js             # Main JavaScript application
├── styles.css         # Custom CSS styles
├── output.css         # Generated Tailwind CSS (dev)
├── minified.css       # Minified Tailwind CSS (prod)
├── tailwind.config.js # Tailwind configuration
├── postcss.config.js  # PostCSS configuration
├── package.json       # Node.js dependencies
├── icons/             # SVG icons
│   ├── cross.svg
│   └── whitecross.svg
├── google-drive-config.js      # Google Drive API configuration
├── google-drive-operations.js  # Google Drive file operations
├── google-drive-ui.js          # Google Drive UI integration
├── GOOGLE_DRIVE_SETUP.md       # Google Drive setup guide
├── documentation/     # Project documentation
│   ├── shadcn.txt
│   ├── how_to_use_cursorrules.txt
│   ├── .cursorrules.txt
│   └── tailwind_use.txt
├── test-export.html           # Export/import test utility
├── test-google-drive.html     # Google Drive test utility
├── stitch_fe_rework/          # Frontend reference files
    ├── screen.png
    ├── frontend_reference.html
    └── index_v1.html
```

## Development Workflow

1. **Frontend Changes**:
   - Run `npm run dev` to watch for CSS changes
   - Test in browser with live reload
   - Run `npm run build` before committing

2. **Testing Strategy**:
   - Manual testing of all features
   - Cross-browser compatibility testing
   - Mobile responsiveness testing
   - Database persistence testing
   - Export/import functionality testing
   - Google Drive sync testing (requires API setup)

## Key Features to Maintain

1. **Task Management**:
   - Add, complete, delete tasks
   - Non-negotiable tasks auto-create for next day
   - Task type categorization (Goal/Non-Negotiable)

2. **Time Tracking**:
   - Start/stop timer with task name
   - Time distribution pie chart
   - Task history and counters

3. **Progress Visualization**:
   - 30-day expected vs actual chart
   - 7-day overview
   - Current streak counter

4. **Data Portability**:
   - Export all data as JSON file
   - Import data from JSON backup
   - Cloud sync via clipboard/localStorage
   - Auto-backup every 5 minutes

5. **Theme Support**:
   - Light/dark mode toggle
   - Theme persistence in localStorage
   - Icon adaptation for themes

## Security Considerations

1. **Frontend**:
   - Input validation for all user inputs
   - XSS prevention with proper escaping
   - Secure IndexedDB usage
   - No sensitive data in client-side storage

2. **Google Drive Integration**:
   - OAuth 2.0 with minimal permissions
   - Token storage in localStorage with expiration
   - Secure API calls with error handling
   - User consent for data access

3. **General**:
   - Secure API design principles
   - Regular dependency updates
   - No hardcoded secrets in source code

## Performance Guidelines

1. **Frontend**:
   - Minimize DOM manipulations
   - Efficient IndexedDB queries
   - Lazy loading for charts
   - Debounce frequent updates
   - Batch IndexedDB operations
   - Destroy old chart instances before creating new ones

2. **Google Drive Operations**:
   - Batch file operations when possible
   - Clean up old backups automatically
   - Use efficient file listing with filters
   - Handle large files with streaming when possible

## Common Issues & Solutions

1. **Database Connection Issues**:
   - Check if database is initialized
   - Verify transaction completion
   - Handle upgrade scenarios

2. **Date/Timezone Issues**:
   - Use local timezone for date calculations
   - Consistent date formatting (YYYY-MM-DD)
   - Handle timezone offsets properly

3. **Chart.js Issues**:
   - Destroy old chart instances before creating new ones
   - Handle empty data states
   - Update charts on theme changes

4. **Export/Import Issues**:
   - Validate JSON structure before import
   - Handle large datasets with batch processing
   - Provide clear error messages for invalid files

5. **Google Drive Sync Issues**:
   - Check OAuth 2.0 credentials are properly configured
   - Verify authorized origins and redirect URIs
   - Handle token expiration gracefully
   - Check network connectivity for API calls

## Commit Message Convention

Use descriptive commit messages that explain the "why" not just the "what":
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style/formatting
- `refactor:` Code restructuring
- `test:` Test-related changes
- `chore:` Maintenance tasks

Example: `feat: Add dark mode support for time tracking pie chart`

## Export/Import API Reference

### Functions Available:

1. **`exportDatabase()`** - Exports all data as JSON file download
   - Returns: JSON file download with tasks and timeTracking arrays
   - File format: `dailiesapp-backup-YYYY-MM-DD.json`
   - Also saves to localStorage as backup

2. **`importDatabase()`** - Opens file picker to import JSON backup
   - Validates file structure and data types
   - Clears existing data before import
   - Shows confirmation dialog with data counts

3. **`syncWithCloud()`** - Cloud sync options menu
   - Option 1: Save to clipboard and localStorage
   - Option 2: Load from clipboard or localStorage
   - Option 3: Google Drive sync (requires API setup)

4. **`setupAutoSave()`** - Auto-saves data every 5 minutes
   - Runs automatically on app startup
   - Saves to localStorage as `dailiesapp_auto_backup`

### Google Drive Integration:

**Setup Required:**
1. Create Google Cloud project
2. Enable Google Drive API
3. Configure OAuth 2.0 credentials
4. Update `google-drive-config.js` with Client ID

**Main Functions:**
- `showGoogleDriveSyncModal()` - Shows Google Drive sync interface
- `authenticateWithGoogleDrive()` - Handles OAuth 2.0 authentication
- `uploadBackupToGoogleDrive()` - Uploads backup to Google Drive
- `listBackupsFromGoogleDrive()` - Lists available backups
- `downloadBackupFromGoogleDrive()` - Downloads and imports backup

### JSON Data Structure:
```json
{
  "version": "1.0",
  "exportDate": "ISO date string",
  "appVersion": "1.0",
  "tasks": [
    {
      "id": number,
      "title": "string",
      "type": "Goal" | "Non-Negotiable",
      "status": boolean,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD" | null
    }
  ],
  "timeTracking": [
    {
      "id": number,
      "taskName": "string",
      "seconds": number,
      "timestamp": "ISO date string"
    }
  ]
}
```

## Additional Notes

- The project uses Tailwind CSS v4.0.0
- Chart.js is used for data visualization
- Streamlit is used for the Python backend (deprecated)
- SQLite for persistent storage in backend (deprecated)
- IndexedDB for client-side storage in frontend
- Export/Import functionality added for cross-machine data portability
- Google Drive sync provides cloud backup option
- No formal testing framework currently implemented
- Manual testing required for all changes