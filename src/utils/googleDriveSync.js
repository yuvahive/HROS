// Optional Cloud Sync - Save to Google Drive (no backend needed, direct OAuth)
// User grants permission, we save directly to their Google Drive

const DRIVE_API_KEY = 'YOUR_GOOGLE_DRIVE_API_KEY' // User configures their own
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID' // User configures their own

// Initialize Google Drive integration
export const initGoogleDrive = async (clientId, apiKey) => {
  try {
    // Load Google API client
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })

    // Initialize Google API client
    gapi.client.init({
      clientId: clientId,
      apiKey: apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scopes: 'https://www.googleapis.com/auth/drive.file'
    })

    console.log('Google Drive integration initialized')
    return true
  } catch (error) {
    console.error('Failed to initialize Google Drive:', error)
    return false
  }
}

// Authenticate with Google Drive
export const authenticateGoogleDrive = async () => {
  try {
    const authResult = await gapi.auth2.getAuthInstance().signIn()
    console.log('Google Drive authentication successful')
    return true
  } catch (error) {
    console.error('Google Drive authentication failed:', error)
    return false
  }
}

// Check if google drive is authenticated
export const isGoogleDriveAuthenticated = () => {
  return gapi?.auth2?.getAuthInstance?.()?.isSignedIn?.get() || false
}

// Save events to Google Drive
export const saveToGoogleDrive = async (events) => {
  try {
    if (!isGoogleDriveAuthenticated()) {
      throw new Error('Not authenticated with Google Drive')
    }

    const fileContent = JSON.stringify(events, null, 2)
    const blob = new Blob([fileContent], { type: 'application/json' })
    const fileName = `HROS-backup-${new Date().toISOString().split('T')[0]}.json`

    // Create FormData for multipart upload
    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify({
      name: fileName,
      mimeType: 'application/json'
    })], { type: 'application/json' }))
    form.append('file', blob)

    // Upload to Google Drive
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token}`
      },
      body: form
    })

    if (response.ok) {
      console.log('Events saved to Google Drive successfully')
      return true
    } else {
      throw new Error('Failed to save to Google Drive')
    }
  } catch (error) {
    console.error('Google Drive save failed:', error)
    return false
  }
}

// Load events from Google Drive
export const loadFromGoogleDrive = async () => {
  try {
    if (!isGoogleDriveAuthenticated()) {
      throw new Error('Not authenticated with Google Drive')
    }

    // List files matching pattern
    const response = await gapi.client.drive.files.list({
      q: "name contains 'HROS-backup' and trashed=false",
      spaces: 'drive',
      fields: 'files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 10
    })

    return response.result.files
  } catch (error) {
    console.error('Failed to load files from Google Drive:', error)
    return []
  }
}

// Sync back to Google Drive periodically
export const setupGoogleDriveSync = (getEvents, intervalMinutes = 120) => {
  if (!isGoogleDriveAuthenticated()) {
    console.log('Google Drive sync unavailable - not authenticated')
    return null
  }

  const syncInterval = setInterval(async () => {
    console.log('Google Drive sync triggered')
    const events = getEvents()
    await saveToGoogleDrive(events)
  }, intervalMinutes * 60 * 1000)

  return syncInterval
}

// Disable Google Drive sync
export const disableGoogleDriveSync = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId)
  }
}

// Helper: Setup Google Drive with API credentials
export const setupGoogleDriveIntegration = async (clientId, apiKey) => {
  return await initGoogleDrive(clientId, apiKey)
}
