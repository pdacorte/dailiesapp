// Read-only Google Calendar integration for DailiesApp

(function () {
  const GOOGLE_CALENDAR_CONFIG = {
    SCOPES: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'profile',
      'email'
    ].join(' '),
    TOKEN_STORAGE_KEY: 'google_calendar_token',
    USER_INFO_STORAGE_KEY: 'google_calendar_user_info',
    SELECTED_CALENDAR_SETTING_KEY: 'googleCalendarSelectedCalendar',
    EVENTS_LOOKAHEAD_DAYS: 30,
    MAX_EVENTS: 20
  };

  let calendarTokenClient = null;
  let calendarTokenClientId = '';

  function escapeCalendarHTML(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function notifyCalendar(message, type = 'info') {
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
      return;
    }

    console[type === 'error' ? 'error' : 'log'](message);
  }

  function getGoogleCalendarToken() {
    return localStorage.getItem(GOOGLE_CALENDAR_CONFIG.TOKEN_STORAGE_KEY);
  }

  function storeGoogleCalendarToken(token) {
    localStorage.setItem(GOOGLE_CALENDAR_CONFIG.TOKEN_STORAGE_KEY, token);
  }

  function clearGoogleCalendarToken() {
    localStorage.removeItem(GOOGLE_CALENDAR_CONFIG.TOKEN_STORAGE_KEY);
    localStorage.removeItem(GOOGLE_CALENDAR_CONFIG.USER_INFO_STORAGE_KEY);
  }

  function isGoogleCalendarSignedIn() {
    return Boolean(getGoogleCalendarToken());
  }

  function getStoredGoogleCalendarUserInfo() {
    const userInfo = localStorage.getItem(GOOGLE_CALENDAR_CONFIG.USER_INFO_STORAGE_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  function storeGoogleCalendarUserInfo(userInfo) {
    localStorage.setItem(GOOGLE_CALENDAR_CONFIG.USER_INFO_STORAGE_KEY, JSON.stringify(userInfo));
  }

  async function ensureGoogleClientIdLoaded() {
    if (window.GOOGLE_DRIVE_CONFIG?.CLIENT_ID) {
      return window.GOOGLE_DRIVE_CONFIG.CLIENT_ID;
    }

    if (typeof window.loadGoogleDriveApiKey === 'function') {
      const savedClientId = await window.loadGoogleDriveApiKey();
      if (savedClientId) {
        if (typeof window.updateGoogleDriveConfigWithKey === 'function') {
          window.updateGoogleDriveConfigWithKey(savedClientId);
        } else if (typeof window.updateGoogleDriveConfig === 'function') {
          window.updateGoogleDriveConfig({ clientId: savedClientId });
        }
      }

      return savedClientId || '';
    }

    return '';
  }

  async function ensureGoogleCalendarDiscoveryLoaded() {
    if (typeof gapi === 'undefined' || !gapi.client) {
      throw new Error('Google API client is not available. Please refresh and try again.');
    }

    if (gapi.client.calendar) {
      return;
    }

    if (typeof gapi.client.load !== 'function') {
      throw new Error('Google Calendar API client could not be loaded.');
    }

    const loadResult = gapi.client.load('calendar', 'v3');
    if (loadResult && typeof loadResult.then === 'function') {
      await loadResult;
    }
  }

  async function ensureGoogleCalendarApis() {
    const clientId = await ensureGoogleClientIdLoaded();
    if (!clientId) {
      throw new Error('Google API Client ID not configured. Save it in Settings first.');
    }

    if (typeof window.initializeGoogleApis !== 'function') {
      throw new Error('Google API functions are not loaded. Please refresh and try again.');
    }

    if (typeof window.areGoogleApisInitialized !== 'function' || !window.areGoogleApisInitialized()) {
      await window.initializeGoogleApis();
    }

    await ensureGoogleCalendarDiscoveryLoaded();
    initializeGoogleCalendarTokenClient(clientId);
  }

  function initializeGoogleCalendarTokenClient(clientId) {
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services not initialized. Please try again.');
    }

    if (calendarTokenClient && calendarTokenClientId === clientId) {
      return;
    }

    calendarTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_CONFIG.SCOPES,
      callback: ''
    });
    calendarTokenClientId = clientId;
  }

  function requestGoogleCalendarToken() {
    return new Promise((resolve, reject) => {
      if (!calendarTokenClient) {
        reject(new Error('Google Calendar token client is not initialized.'));
        return;
      }

      calendarTokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(`Google Calendar authentication failed: ${response.error}`));
          return;
        }

        const token = response.access_token;
        storeGoogleCalendarToken(token);
        gapi.client.setToken({ access_token: token });
        resolve(token);
      };

      calendarTokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  async function ensureGoogleCalendarToken({ allowPrompt = false } = {}) {
    await ensureGoogleCalendarApis();

    const storedToken = getGoogleCalendarToken();
    if (storedToken) {
      gapi.client.setToken({ access_token: storedToken });

      try {
        await gapi.client.calendar.calendarList.list({ maxResults: 1, fields: 'items(id)' });
        return storedToken;
      } catch (error) {
        console.warn('Stored Google Calendar token is invalid or expired:', error);
        clearGoogleCalendarToken();
        if (!allowPrompt) {
          throw new Error('Google Calendar authorization expired. Reconnect in Settings.');
        }
      }
    }

    if (!allowPrompt) {
      throw new Error('Google Calendar is not connected. Connect it in Settings.');
    }

    return requestGoogleCalendarToken();
  }

  async function authenticateWithGoogleCalendar() {
    await ensureGoogleCalendarToken({ allowPrompt: true });
    await getGoogleCalendarUserInfo();
  }

  function signOutFromGoogleCalendar() {
    const token = getGoogleCalendarToken();
    if (token && window.google?.accounts?.oauth2) {
      google.accounts.oauth2.revoke(token, () => {
        console.log('Google Calendar token revoked');
      });
    }

    clearGoogleCalendarToken();

    if (typeof gapi !== 'undefined' && gapi.client) {
      gapi.client.setToken(null);
    }

    if (typeof window.updateUserInfoDisplay === 'function' && !(window.isSignedIn && window.isSignedIn())) {
      window.updateUserInfoDisplay(null);
    }
  }

  async function getGoogleCalendarUserInfo() {
    const storedUserInfo = getStoredGoogleCalendarUserInfo();
    if (storedUserInfo) {
      if (typeof window.updateUserInfoDisplay === 'function') {
        window.updateUserInfoDisplay(storedUserInfo);
      }
      return storedUserInfo;
    }

    await ensureGoogleCalendarToken({ allowPrompt: false });

    const response = await gapi.client.request({
      path: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });

    const userInfo = {
      name: response.result.name,
      email: response.result.email,
      picture: response.result.picture,
      id: response.result.id
    };

    storeGoogleCalendarUserInfo(userInfo);

    if (typeof window.updateUserInfoDisplay === 'function') {
      window.updateUserInfoDisplay(userInfo);
    }

    return userInfo;
  }

  async function listGoogleCalendars({ allowPrompt = false } = {}) {
    await ensureGoogleCalendarToken({ allowPrompt });

    const response = await gapi.client.calendar.calendarList.list({
      showDeleted: false,
      showHidden: false,
      fields: 'items(id,summary,primary,accessRole,backgroundColor,foregroundColor)'
    });

    return (response.result.items || [])
      .filter((calendar) => ['reader', 'writer', 'owner'].includes(calendar.accessRole))
      .map((calendar) => ({
        id: calendar.id,
        summary: calendar.summary || calendar.id,
        primary: Boolean(calendar.primary),
        accessRole: calendar.accessRole,
        backgroundColor: calendar.backgroundColor || '#6366f1',
        foregroundColor: calendar.foregroundColor || '#ffffff'
      }));
  }

  async function readSelectedGoogleCalendar() {
    if (typeof window.getSettingValue !== 'function') {
      return null;
    }

    return window.getSettingValue(GOOGLE_CALENDAR_CONFIG.SELECTED_CALENDAR_SETTING_KEY);
  }

  async function persistSelectedGoogleCalendar(calendar) {
    if (typeof window.setSettingValue !== 'function' || !calendar?.id) {
      return;
    }

    await window.setSettingValue(GOOGLE_CALENDAR_CONFIG.SELECTED_CALENDAR_SETTING_KEY, {
      id: calendar.id,
      summary: calendar.summary || calendar.id,
      primary: Boolean(calendar.primary)
    });
  }

  async function getSelectedGoogleCalendar(calendars) {
    const savedCalendar = await readSelectedGoogleCalendar();
    if (savedCalendar?.id) {
      const matchingCalendar = calendars.find((calendar) => calendar.id === savedCalendar.id);
      if (matchingCalendar) {
        return matchingCalendar;
      }
    }

    const defaultCalendar = calendars.find((calendar) => calendar.primary) || calendars[0] || null;
    if (defaultCalendar) {
      await persistSelectedGoogleCalendar(defaultCalendar);
    }

    return defaultCalendar;
  }

  function getCalendarSettingsStatusClasses(type) {
    if (type === 'success') {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
    }

    if (type === 'error') {
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20';
    }

    return 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20';
  }

  function showGoogleCalendarSettingsStatus(message, type = 'info') {
    const statusElement = document.getElementById('calendar-settings-status');
    if (!statusElement) return;

    statusElement.className = `p-3 rounded-xl text-sm ${getCalendarSettingsStatusClasses(type)}`;
    statusElement.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-lg">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
        <span>${escapeCalendarHTML(message)}</span>
      </div>
    `;
    statusElement.classList.remove('hidden');
  }

  function hideGoogleCalendarSettingsStatus() {
    const statusElement = document.getElementById('calendar-settings-status');
    if (statusElement) {
      statusElement.classList.add('hidden');
    }
  }

  function setCalendarSettingsControls({ connected, loading, hasClientId }) {
    const connectButton = document.getElementById('google-calendar-connect');
    const disconnectButton = document.getElementById('google-calendar-disconnect');
    const refreshButton = document.getElementById('google-calendar-settings-refresh');
    const selectorWrap = document.getElementById('calendar-selector-wrap');

    if (connectButton) {
      connectButton.disabled = loading || !hasClientId;
      connectButton.hidden = connected;
      connectButton.style.display = connected ? 'none' : '';
      connectButton.classList.toggle('hidden', connected);
      connectButton.textContent = loading ? 'Connecting...' : 'Connect Calendar';
    }

    if (disconnectButton) {
      disconnectButton.disabled = loading;
      disconnectButton.hidden = !connected;
      disconnectButton.style.display = connected ? '' : 'none';
      disconnectButton.classList.toggle('hidden', !connected);
    }

    if (refreshButton) {
      refreshButton.disabled = loading || !connected;
      refreshButton.hidden = !connected;
      refreshButton.style.display = connected ? '' : 'none';
      refreshButton.classList.toggle('hidden', !connected);
    }

    if (selectorWrap) {
      selectorWrap.hidden = !connected;
      selectorWrap.classList.toggle('hidden', !connected);
    }
  }

  function renderCalendarAuthStatus({ state, message, userInfo }) {
    const statusElement = document.getElementById('calendar-auth-status');
    if (!statusElement) return;

    const icon = state === 'connected' ? 'event_available' : state === 'loading' ? 'hourglass_empty' : 'event_busy';
    const badgeClasses = state === 'connected'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300';

    statusElement.innerHTML = `
      <div class="flex items-start gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4">
        <span class="material-symbols-outlined rounded-xl p-2 ${badgeClasses}">${icon}</span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-zinc-800 dark:text-zinc-100">${escapeCalendarHTML(message)}</p>
          ${userInfo?.email ? `<p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">${escapeCalendarHTML(userInfo.email)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function populateGoogleCalendarSelect(calendars, selectedCalendar) {
    const select = document.getElementById('google-calendar-select');
    if (!select) return;

    select.innerHTML = calendars.map((calendar) => `
      <option value="${escapeCalendarHTML(calendar.id)}" data-primary="${calendar.primary ? 'true' : 'false'}" ${calendar.id === selectedCalendar?.id ? 'selected' : ''}>
        ${escapeCalendarHTML(calendar.summary)}${calendar.primary ? ' (Primary)' : ''}
      </option>
    `).join('');
  }

  async function loadGoogleCalendarSettingsUI() {
    const statusElement = document.getElementById('calendar-auth-status');
    if (!statusElement) return;

    hideGoogleCalendarSettingsStatus();
    setCalendarSettingsControls({ connected: false, loading: true, hasClientId: true });
    renderCalendarAuthStatus({ state: 'loading', message: 'Checking Google Calendar connection...' });

    try {
      const clientId = await ensureGoogleClientIdLoaded();
      if (!clientId) {
        renderCalendarAuthStatus({ state: 'disconnected', message: 'Save a Google API Client ID first.' });
        setCalendarSettingsControls({ connected: false, loading: false, hasClientId: false });
        return;
      }

      if (!isGoogleCalendarSignedIn()) {
        renderCalendarAuthStatus({ state: 'disconnected', message: 'Google Calendar is not connected.' });
        setCalendarSettingsControls({ connected: false, loading: false, hasClientId: true });
        return;
      }

      await ensureGoogleCalendarToken({ allowPrompt: false });
      const userInfo = await getGoogleCalendarUserInfo();
      const calendars = await listGoogleCalendars({ allowPrompt: false });
      const selectedCalendar = await getSelectedGoogleCalendar(calendars);

      populateGoogleCalendarSelect(calendars, selectedCalendar);
      renderCalendarAuthStatus({
        state: 'connected',
        message: selectedCalendar
          ? `Connected to ${selectedCalendar.summary}`
          : 'Connected to Google Calendar',
        userInfo
      });
      setCalendarSettingsControls({ connected: true, loading: false, hasClientId: true });
    } catch (error) {
      console.error('Error loading Google Calendar settings:', error);
      renderCalendarAuthStatus({ state: 'disconnected', message: error.message });
      setCalendarSettingsControls({ connected: false, loading: false, hasClientId: true });
      showGoogleCalendarSettingsStatus(error.message, 'error');
    }
  }

  async function connectGoogleCalendarFromSettings() {
    showGoogleCalendarSettingsStatus('Connecting to Google Calendar...', 'info');
    setCalendarSettingsControls({ connected: false, loading: true, hasClientId: true });

    try {
      await authenticateWithGoogleCalendar();
      const calendars = await listGoogleCalendars({ allowPrompt: false });
      await getSelectedGoogleCalendar(calendars);
      await loadGoogleCalendarSettingsUI();
      await refreshGoogleCalendarEvents({ showLoading: true });
      showGoogleCalendarSettingsStatus('Google Calendar connected.', 'success');
      notifyCalendar('Google Calendar connected.', 'success');
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      await loadGoogleCalendarSettingsUI();
      showGoogleCalendarSettingsStatus(error.message, 'error');
      notifyCalendar(`Failed to connect Google Calendar: ${error.message}`, 'error');
    }
  }

  async function disconnectGoogleCalendarFromSettings() {
    signOutFromGoogleCalendar();
    await loadGoogleCalendarSettingsUI();
    renderGoogleCalendarConnectState('Connect Google Calendar in Settings to show your own events.');
    showGoogleCalendarSettingsStatus('Google Calendar disconnected.', 'success');
    notifyCalendar('Google Calendar disconnected.', 'info');
  }

  async function saveSelectedGoogleCalendar() {
    const select = document.getElementById('google-calendar-select');
    if (!select || !select.value) return;

    const selectedOption = select.selectedOptions[0];
    const selectedSummary = selectedOption
      ? selectedOption.textContent.trim().replace(/\s+\(Primary\)$/, '')
      : select.value;
    const selectedCalendar = {
      id: select.value,
      summary: selectedSummary,
      primary: selectedOption?.dataset.primary === 'true'
    };

    try {
      await persistSelectedGoogleCalendar(selectedCalendar);
      await refreshGoogleCalendarEvents({ showLoading: true });
      await loadGoogleCalendarSettingsUI();
      showGoogleCalendarSettingsStatus('Calendar selection saved.', 'success');
    } catch (error) {
      console.error('Error saving selected calendar:', error);
      showGoogleCalendarSettingsStatus(error.message, 'error');
    }
  }

  function getEventDate(dateLike) {
    if (dateLike?.dateTime) {
      return new Date(dateLike.dateTime);
    }

    if (dateLike?.date) {
      const [year, month, day] = dateLike.date.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    return null;
  }

  function formatEventDate(event) {
    const startDate = getEventDate(event.start);
    if (!startDate) return 'No date';

    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(startDate);
  }

  function formatEventTime(event) {
    if (event.start?.date) {
      return 'All day';
    }

    const startDate = getEventDate(event.start);
    const endDate = getEventDate(event.end);
    if (!startDate) return 'Time TBD';

    const timeFormatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return endDate
      ? `${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`
      : timeFormatter.format(startDate);
  }

  async function fetchGoogleCalendarEvents(calendarId) {
    await ensureGoogleCalendarToken({ allowPrompt: false });

    const now = new Date();
    const timeMax = new Date(now.getTime() + GOOGLE_CALENDAR_CONFIG.EVENTS_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
    const response = await gapi.client.calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: GOOGLE_CALENDAR_CONFIG.MAX_EVENTS,
      fields: 'items(id,summary,location,htmlLink,start,end,status)'
    });

    return (response.result.items || []).filter((event) => event.status !== 'cancelled');
  }

  function renderGoogleCalendarLoading() {
    const contentElement = document.getElementById('calendar-content');
    if (!contentElement) return;

    contentElement.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p class="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Loading your Google Calendar...</p>
      </div>
    `;
  }

  function renderGoogleCalendarConnectState(message) {
    const contentElement = document.getElementById('calendar-content');
    const accountElement = document.getElementById('calendar-account-summary');
    if (accountElement) {
      accountElement.textContent = 'Not connected';
    }
    if (!contentElement) return;

    contentElement.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <span class="material-symbols-outlined text-5xl text-indigo-400 mb-4">calendar_add_on</span>
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Connect your Google Calendar</h3>
        <p class="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">${escapeCalendarHTML(message)}</p>
        <button type="button" onclick="setActiveView('settings')" class="btn-primary h-10 px-4 mt-5 text-sm">
          Open Settings
        </button>
      </div>
    `;
  }

  function renderGoogleCalendarError(message) {
    const contentElement = document.getElementById('calendar-content');
    const accountElement = document.getElementById('calendar-account-summary');
    if (accountElement) {
      accountElement.textContent = 'Calendar unavailable';
    }
    if (!contentElement) return;

    contentElement.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <span class="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
        <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Could not load Calendar</h3>
        <p class="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">${escapeCalendarHTML(message)}</p>
      </div>
    `;
  }

  function renderGoogleCalendarEvents(events, calendar, userInfo) {
    const contentElement = document.getElementById('calendar-content');
    const accountElement = document.getElementById('calendar-account-summary');
    if (!contentElement) return;

    if (accountElement) {
      accountElement.textContent = userInfo?.email
        ? `${calendar.summary} - ${userInfo.email}`
        : calendar.summary;
    }

    if (events.length === 0) {
      contentElement.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <span class="material-symbols-outlined text-5xl text-zinc-300 dark:text-zinc-600 mb-4">event_available</span>
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">No upcoming events</h3>
          <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No events found in the next ${GOOGLE_CALENDAR_CONFIG.EVENTS_LOOKAHEAD_DAYS} days.</p>
        </div>
      `;
      return;
    }

    contentElement.innerHTML = `
      <div class="space-y-3">
        ${events.map((event) => {
          const eventLink = event.htmlLink || '';
          const eventTitle = event.summary || 'Untitled event';
          return `
            <article class="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/50 p-4 transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-500/30">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span>${escapeCalendarHTML(formatEventDate(event))}</span>
                    <span class="text-zinc-300 dark:text-zinc-600">/</span>
                    <span>${escapeCalendarHTML(formatEventTime(event))}</span>
                  </div>
                  <h3 class="mt-2 text-base font-semibold text-zinc-900 dark:text-white truncate">${escapeCalendarHTML(eventTitle)}</h3>
                  ${event.location ? `<p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400 truncate">${escapeCalendarHTML(event.location)}</p>` : ''}
                </div>
                ${eventLink ? `
                  <a href="${escapeCalendarHTML(eventLink)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300">
                    Open
                    <span class="material-symbols-outlined text-base">open_in_new</span>
                  </a>
                ` : ''}
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  async function refreshGoogleCalendarEvents({ showLoading = true } = {}) {
    const contentElement = document.getElementById('calendar-content');
    if (!contentElement) return;

    const refreshButton = document.getElementById('calendar-refresh-button');
    if (refreshButton) {
      refreshButton.disabled = true;
    }

    try {
      if (!isGoogleCalendarSignedIn()) {
        renderGoogleCalendarConnectState('Connect Calendar from Settings to show the signed-in user\'s Google Calendar.');
        return;
      }

      if (showLoading) {
        renderGoogleCalendarLoading();
      }

      await ensureGoogleCalendarToken({ allowPrompt: false });
      const calendars = await listGoogleCalendars({ allowPrompt: false });
      const selectedCalendar = await getSelectedGoogleCalendar(calendars);
      if (!selectedCalendar) {
        renderGoogleCalendarError('No readable calendars were found for this Google account.');
        return;
      }

      const [events, userInfo] = await Promise.all([
        fetchGoogleCalendarEvents(selectedCalendar.id),
        getGoogleCalendarUserInfo().catch(() => null)
      ]);

      renderGoogleCalendarEvents(events, selectedCalendar, userInfo);
    } catch (error) {
      console.error('Error refreshing Google Calendar events:', error);
      if (error.message.includes('not connected') || error.message.includes('expired') || error.message.includes('Client ID')) {
        renderGoogleCalendarConnectState(error.message);
      } else {
        renderGoogleCalendarError(error.message);
      }
    } finally {
      if (refreshButton) {
        refreshButton.disabled = false;
      }
    }
  }

  window.GOOGLE_CALENDAR_CONFIG = GOOGLE_CALENDAR_CONFIG;
  window.getGoogleCalendarToken = getGoogleCalendarToken;
  window.clearGoogleCalendarToken = clearGoogleCalendarToken;
  window.isGoogleCalendarSignedIn = isGoogleCalendarSignedIn;
  window.authenticateWithGoogleCalendar = authenticateWithGoogleCalendar;
  window.signOutFromGoogleCalendar = signOutFromGoogleCalendar;
  window.getGoogleCalendarUserInfo = getGoogleCalendarUserInfo;
  window.listGoogleCalendars = listGoogleCalendars;
  window.loadGoogleCalendarSettingsUI = loadGoogleCalendarSettingsUI;
  window.connectGoogleCalendarFromSettings = connectGoogleCalendarFromSettings;
  window.disconnectGoogleCalendarFromSettings = disconnectGoogleCalendarFromSettings;
  window.saveSelectedGoogleCalendar = saveSelectedGoogleCalendar;
  window.refreshGoogleCalendarEvents = refreshGoogleCalendarEvents;
  window.renderGoogleCalendarConnectState = renderGoogleCalendarConnectState;
})();
