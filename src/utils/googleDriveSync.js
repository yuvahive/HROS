// Google Drive Sync - Upload work files to HROS Drive folder
// Uses GAS backend for file uploads (no OAuth needed on frontend)

const GAS_URL = import.meta.env.VITE_GAS_URL;
const GAS_API_KEY = import.meta.env.VITE_GAS_API_KEY;

if (!GAS_URL || !GAS_API_KEY) {
  console.warn('[DRIVE] Missing VITE_GAS_URL or VITE_GAS_API_KEY in environment');
}

// HROS Work Uploads Drive Folder
export const WORK_UPLOADS_FOLDER_ID = import.meta.env.VITE_WORK_FOLDER_ID;
export const WORK_UPLOADS_FOLDER_URL = WORK_UPLOADS_FOLDER_ID
  ? `https://drive.google.com/drive/folders/${WORK_UPLOADS_FOLDER_ID}`
  : '';

/**
 * Upload a file to the HROS Work Uploads Drive folder via GAS backend
 * @param {File} file - The file to upload
 * @param {string} uploaderName - Name of the person uploading
 * @param {string} title - Work title
 * @returns {Promise<{success: boolean, fileId?: string, fileUrl?: string, error?: string}>}
 */
export const uploadToWorkDrive = async (file, uploaderName, title) => {
  try {
    const reader = new FileReader()
    const base64Data = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const payload = {
      key: GAS_API_KEY,
      action: 'uploadFile',
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: base64Data,
        folderId: WORK_UPLOADS_FOLDER_ID,
        uploaderName,
        title
      }
    }

    const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Drive upload failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * List files in the Work Uploads Drive folder
 * @returns {Promise<Array>}
 */
export const listWorkDriveFiles = async () => {
  try {
    const response = await fetch(
      `${GAS_URL}?key=${GAS_API_KEY}&action=listDriveFiles&folderId=${WORK_UPLOADS_FOLDER_ID}`
    )
    const result = await response.json()
    return result.files || []
  } catch (error) {
    console.error('Failed to list Drive files:', error)
    return []
  }
}

/**
 * Get a shareable view URL for a Drive file
 * @param {string} fileId - Google Drive file ID
 * @returns {string}
 */
export const getDriveFileUrl = (fileId) => {
  return `https://drive.google.com/file/d/${fileId}/view`
}

/**
 * Get a direct download URL for a Drive file
 * @param {string} fileId - Google Drive file ID
 * @returns {string}
 */
export const getDriveDownloadUrl = (fileId) => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}
