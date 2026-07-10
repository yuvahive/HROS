/**
 * HROS Cloud Bridge v9.2
 * Full-featured: CRUD, search, metrics, filtering, notifications
 * Auto-creates missing sheets with headers on first load
 * 
 * DEPLOYMENT (critical for CORS):
 *   Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone  (NOT "Anyone with the link")
 *   Click Deploy, copy the new URL
 */

const SHEET_ID = '19Ki5EaHbAZPQcWQgvwvzcvDNzqa3I4CytSHiYgQgN-4';

function getApiKey() {
  return PropertiesService.getScriptProperties().getProperty('API_KEY') || '';
}

// Required sheets and their headers (auto-created if missing)
const REQUIRED_SHEETS = {
  People: ['id', 'name', 'email', 'role', 'team', 'teamId', 'status', 'seniority', 'manager', 'startDate', 'skills', 'lastCheckInDate', 'notes'],
  Teams: ['id', 'name', 'description', 'teamLeadId', 'memberIds', 'createdAt', 'createdBy'],
  Users: ['id', 'name', 'email', 'password', 'role', 'teamId', 'isActive', 'createdAt', 'idpProvider'],
  Config: ['provider', 'name', 'providerUrl', 'clientId', 'clientSecret', 'scopes', 'enabled'],
  HiringPipeline: ['id', 'name', 'role', 'email', 'phone', 'source', 'appliedDate', 'stage', 'screeningScore', 'interviewDate', 'interviewer', 'interviewNotes', 'offerSalary', 'offerDate', 'notes'],
  Internships: ['id', 'name', 'email', 'role', 'team', 'teamId', 'startDate', 'endDate', 'status', 'supervisor', 'goals', 'evaluation', 'notes'],
  Onboarding: ['id', 'name', 'email', 'role', 'team', 'teamId', 'startDate', 'status', 'progress', 'mentor', 'checklist', 'notes'],
  Exits: ['id', 'name', 'email', 'role', 'team', 'teamId', 'lastDay', 'reason', 'exitType', 'alumni', 'notes'],
  WorkLogs: ['id', 'personId', 'personName', 'taskName', 'hoursWorked', 'hoursEstimated', 'status', 'team', 'teamId', 'date', 'notes'],
  Projects: ['id', 'name', 'owner', 'lead', 'team', 'teamId', 'status', 'progress', 'startDate', 'deadline', 'description', 'blockers', 'notes'],
  Tasks: ['id', 'title', 'assignee', 'team', 'teamId', 'status', 'priority', 'dueDate', 'description', 'notes'],
  TaskComments: ['id', 'taskId', 'author', 'text', 'createdAt'],
  CheckIns: ['id', 'personId', 'personName', 'date', 'mood', 'energy', 'blockers', 'notes'],
  OneOnOnes: ['id', 'personId', 'personName', 'managerId', 'managerName', 'scheduledDate', 'scheduledTime', 'duration', 'meetingType', 'status', 'requestedBy', 'topic', 'topicsToDiscuss', 'prepNotes', 'shippingUpdate', 'growthFeedback', 'wellbeingScore', 'wellbeingNotes', 'blockers', 'blockerHelp', 'decisions', 'actionItems', 'nextMeetingDate', 'completionDate', 'duration_actual', 'notes', 'createdAt'],
  Decisions: ['id', 'title', 'description', 'decidedBy', 'date', 'status', 'impact', 'notes'],
  ActionItems: ['id', 'title', 'description', 'assignee', 'team', 'teamId', 'status', 'priority', 'dueDate', 'notes'],
  Skills: ['id', 'personId', 'personName', 'skill', 'level', 'category', 'notes'],
  TimeOff: ['id', 'personId', 'personName', 'startDate', 'endDate', 'type', 'status', 'approvedBy', 'notes'],
  CompensationHistory: ['id', 'personId', 'personName', 'effectiveDate', 'previousSalary', 'newSalary', 'changeType', 'approvedBy', 'notes'],
  TeamDynamics: ['id', 'team', 'teamId', 'date', 'sentiment', 'collaboration', 'conflicts', 'notes'],
  RedFlags: ['id', 'personId', 'personName', 'flag', 'severity', 'date', 'status', 'resolution', 'notes'],
  Events: ['id', 'title', 'date', 'type', 'description', 'attendees', 'notes'],
  Logs: ['id', 'userId', 'userName', 'action', 'resource', 'details', 'timestamp'],
  WorkUploads: ['id', 'uploaderId', 'uploaderName', 'uploaderRole', 'teamId', 'title', 'description', 'category', 'projectId', 'taskId', 'fileName', 'fileSize', 'fileType', 'fileData', 'driveFileId', 'driveFileUrl', 'externalLink', 'status', 'reviewerId', 'reviewerName', 'reviewDate', 'reviewComments', 'reviewRating', 'uploadDate', 'lastModifiedDate', 'version', 'tags', 'isArchived']
};

// ==================== CORS PREFLIGHT ====================
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ==================== GET HANDLER ====================
function doGet(e) {
  try {
    const key = e.parameter.key;
    if (key !== getApiKey()) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const action = e.parameter.action;
    const type = e.parameter.type;
    const id = e.parameter.id;
    const callback = e.parameter.callback;

    // Action: Get specific record
    if (action === 'get' && type && id) {
      const record = getRecordById(ss, type, id);
      return respondWithJson({ data: record }, callback);
    }

    // Action: Get sheet with filtering and pagination
    if (action === 'filter' && type) {
      const filters = {
        status: e.parameter.status,
        department: e.parameter.department,
        search: e.parameter.search,
        limit: parseInt(e.parameter.limit) || 1000,
        offset: parseInt(e.parameter.offset) || 0
      };
      const result = filterSheetData(ss, type, filters);
      return respondWithJson(result, callback);
    }

    // Action: Get metrics for dashboard
    if (action === 'metrics') {
      const metrics = getMetrics(ss);
      return respondWithJson(metrics, callback);
    }

    // Action: Search across all sheets
    if (action === 'search') {
      const query = e.parameter.q;
      const results = searchAllSheets(ss, query);
      return respondWithJson(results, callback);
    }

    // Default: Get all sheets as flat arrays
    ensureAllSheets(ss);
    const sheets = ss.getSheets();
    const data = {};
    sheets.forEach(sheet => {
      const name = sheet.getName();
      data[name] = getSheetRows(ss, name);
    });
    return respondWithJson(data, callback);

  } catch (err) {
    return respondWithJson({ error: err.message }, e.parameter.callback);
  }
}

// ==================== POST HANDLER ====================
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { key, action, type, id, data } = payload;

    if (key !== getApiKey()) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    ensureAllSheets(ss);

    // Notification
    if (action === 'notify') {
      return handleNotification(data);
    }

    // Delete
    if (action === 'delete') {
      const result = deleteRecord(ss, type, id);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Insert new record
    if (action === 'insert') {
      const result = insertRecord(ss, type, data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Update existing record
    if (action === 'update') {
      const result = updateRecord(ss, type, id, data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Bulk upsert (insert or update)
    if (action === 'upsert') {
      const result = upsertRecords(ss, type, data || []);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Upload file to Google Drive folder
    if (action === 'uploadFile') {
      const result = uploadFileToDrive(data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // List files in a Drive folder
    if (action === 'listDriveFiles') {
      const result = listDriveFiles(data.folderId);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== DATA OPERATIONS ====================

/**
 * Get all rows from a sheet as flat array
 */
function getSheetRows(ss, sheetName, limit) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  const headers = vals[0].map(h => h.toString().trim());
  const rows = limit ? vals.slice(1, limit + 1) : vals.slice(1);
  return rows.map(row => parseRow(row, headers));
}

/**
 * Get sheet data with filtering and pagination
 */
function filterSheetData(ss, sheetName, filters) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { data: [], total: 0 };

  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return { data: [], total: 0 };

  const headers = vals[0].map(h => h.toString().trim());
  let rows = parseRows(vals.slice(1), headers);

  // Apply filters
  if (filters.status) {
    rows = rows.filter(r => r.Status === filters.status);
  }

  if (filters.department) {
    rows = rows.filter(r => r.Department === filters.department);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(r =>
      Object.values(r).some(v =>
        v && v.toString().toLowerCase().includes(q)
      )
    );
  }

  const total = rows.length;

  // Pagination
  rows = rows.slice(filters.offset, filters.offset + filters.limit);

  return { data: rows, total, offset: filters.offset, limit: filters.limit };
}

/**
 * Get single record by ID
 */
function getRecordById(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;

  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return null;

  const headers = vals[0].map(h => h.toString().trim());
  const idIndex = headers.indexOf('id');

  if (idIndex === -1) return null;

  for (let i = 1; i < vals.length; i++) {
    if (vals[i][idIndex] == id) {
      return parseRow(vals[i], headers);
    }
  }
  return null;
}

/**
 * Insert new record (appends row)
 */
function insertRecord(ss, sheetName, data) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(Object.keys(data));
  }

  const vals = sheet.getDataRange().getValues();
  const headers = vals[0].map(h => h.toString().trim());

  // Add timestamp
  data._createdAt = new Date().toISOString();
  data._updatedAt = new Date().toISOString();

  const row = headers.map(h => {
    const val = data[h];
    return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : (val === undefined ? '' : val);
  });

  sheet.appendRow(row);
  return { success: true, message: 'Record inserted' };
}

/**
 * Update existing record by ID (row-level)
 */
function updateRecord(ss, sheetName, id, data) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found' };

  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return { success: false, error: 'No data' };

  const headers = vals[0].map(h => h.toString().trim());
  const idIndex = headers.indexOf('id');

  if (idIndex === -1) return { success: false, error: 'No id column' };

  // Find the row
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][idIndex] == id) {
      const rowNum = i + 1;

      // Add timestamp
      data._updatedAt = new Date().toISOString();

      // Update only provided fields
      headers.forEach((h, colIdx) => {
        if (data[h] !== undefined) {
          const val = data[h];
          const cellVal = (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
          sheet.getRange(rowNum, colIdx + 1).setValue(cellVal);
        }
      });

      return { success: true, message: 'Record updated' };
    }
  }

  return { success: false, error: 'Record not found' };
}

/**
 * Upsert multiple records (insert or update by ID)
 */
function upsertRecords(ss, sheetName, records) {
  if (!records || records.length === 0) return { success: true, inserted: 0, updated: 0 };

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(Object.keys(records[0]));
  }

  const vals = sheet.getDataRange().getValues();
  const headers = vals[0].map(h => h.toString().trim());
  const idIndex = headers.indexOf('id');

  let inserted = 0;
  let updated = 0;

  records.forEach(record => {
    record._updatedAt = new Date().toISOString();

    if (idIndex !== -1 && record.id) {
      // Try to find existing row
      let found = false;
      for (let i = 1; i < vals.length; i++) {
        if (vals[i][idIndex] == record.id) {
          const rowNum = i + 1;
          headers.forEach((h, colIdx) => {
            if (record[h] !== undefined) {
              const val = record[h];
              const cellVal = (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
              sheet.getRange(rowNum, colIdx + 1).setValue(cellVal);
            }
          });
          found = true;
          updated++;
          break;
        }
      }

      if (!found) {
        record._createdAt = new Date().toISOString();
        const row = headers.map(h => {
          const val = record[h];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : (val === undefined ? '' : val);
        });
        sheet.appendRow(row);
        inserted++;
      }
    } else {
      record._createdAt = record._createdAt || new Date().toISOString();
      const row = headers.map(h => {
        const val = record[h];
        return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : (val === undefined ? '' : val);
      });
      sheet.appendRow(row);
      inserted++;
    }
  });

  return { success: true, inserted, updated, message: inserted + ' inserted, ' + updated + ' updated' };
}

/**
 * Delete record by ID (single match)
 */
function deleteRecord(ss, sheetName, id) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { success: false, error: 'Sheet not found' };

  const vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return { success: false, error: 'No data' };

  const headers = vals[0].map(h => h.toString().trim());
  const idIndex = headers.indexOf('id');

  if (idIndex === -1) return { success: false, error: 'No id column' };

  // Find and delete first match
  for (let i = 1; i < vals.length; i++) {
    if (vals[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Record deleted' };
    }
  }

  return { success: false, error: 'Record not found' };
}

/**
 * Search across all sheets
 */
function searchAllSheets(ss, query) {
  if (!query) return { results: [] };

  const sheets = ss.getSheets();
  const q = query.toLowerCase();
  const results = [];

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const vals = sheet.getDataRange().getValues();
    if (vals.length < 2) return;

    const headers = vals[0].map(h => h.toString().trim());

    for (let i = 1; i < vals.length; i++) {
      const row = parseRow(vals[i], headers);
      const matches = Object.values(row).some(v =>
        v && v.toString().toLowerCase().includes(q)
      );

      if (matches) {
        results.push({ sheet: name, data: row });
      }
    }
  });

  return { results: results.slice(0, 50) };
}

/**
 * Get metrics for dashboard
 */
function getMetrics(ss) {
  const sheets = ss.getSheets();
  const metrics = {};

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const vals = sheet.getDataRange().getValues();
    if (vals.length < 2) {
      metrics[name] = { count: 0 };
      return;
    }

    const headers = vals[0].map(h => h.toString().trim());
    const rows = parseRows(vals.slice(1), headers);

    // Status breakdown if Status column exists
    const statusCounts = {};
    const statusIdx = headers.indexOf('Status');
    if (statusIdx !== -1) {
      rows.forEach(r => {
        const s = r.Status || 'Unknown';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
    }

    // Department breakdown
    const deptCounts = {};
    const deptIdx = headers.indexOf('Department');
    if (deptIdx !== -1) {
      rows.forEach(r => {
        const d = r.Department || 'Unknown';
        deptCounts[d] = (deptCounts[d] || 0) + 1;
      });
    }

    metrics[name] = {
      count: rows.length,
      statusCounts,
      deptCounts
    };
  });

  return metrics;
}

// ==================== AUTO-CREATE SHEETS ====================

/**
 * Ensures all required sheets exist with proper headers.
 * Skips sheets that already exist. Safe to call on every request.
 */
function ensureAllSheets(ss) {
  if (!ss) return;
  Object.keys(REQUIRED_SHEETS).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(REQUIRED_SHEETS[sheetName]);
      // Bold the header row
      sheet.getRange(1, 1, 1, REQUIRED_SHEETS[sheetName].length).setFontWeight('bold');
      Logger.log('[AUTO-CREATE] Created sheet: ' + sheetName);
    }
  });
}

// ==================== HELPER FUNCTIONS ====================

function respondWithJson(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    // JSONP response: callback({"key":"value"})
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function parseRows(vals, headers) {
  return vals.map(row => parseRow(row, headers));
}

function parseRow(row, headers) {
  let obj = {};
  headers.forEach((key, i) => {
    if (!key) return;
    let val = row[i];
    // Convert Date objects to clean strings
    if (val instanceof Date) {
      const hours = val.getHours();
      const minutes = val.getMinutes();
      const seconds = val.getSeconds();
      // If time is midnight (00:00:00), treat as a date-only value
      if (hours === 0 && minutes === 0 && seconds === 0) {
        val = val.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        // Has a time component — output as HH:MM (24h)
        val = String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0');
      }
    } else if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch (e) {}
    }
    obj[key] = val;
  });
  return obj;
}

// ==================== GOOGLE DRIVE FILE OPERATIONS ====================

/**
 * Upload a file to a Google Drive folder
 * @param {Object} data - File data with base64 content
 * @returns {Object} Result with file ID and URL
 */
function uploadFileToDrive(data) {
  try {
    const { fileName, fileType, fileData, folderId, uploaderName, title } = data;
    
    if (!fileData || !fileName) {
      return { success: false, error: 'No file data provided' };
    }

    // Extract base64 content from data URL
    let base64Content = fileData;
    let mimeType = fileType || 'application/octet-stream';
    
    if (fileData.startsWith('data:')) {
      const parts = fileData.split(',');
      mimeType = parts[0].split(':')[1].split(';')[0];
      base64Content = parts[1];
    }

    // Decode base64 to blob
    const decoded = Utilities.base64Decode(base64Content);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);

    // Create file in the specified folder
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    
    // Set sharing to anyone with link can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const fileUrl = 'https://drive.google.com/file/d/' + fileId + '/view';
    const downloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;

    return {
      success: true,
      fileId: fileId,
      fileUrl: fileUrl,
      downloadUrl: downloadUrl,
      fileName: fileName,
      fileSize: decoded.length,
      message: 'File uploaded successfully'
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * List files in a Google Drive folder
 * @param {string} folderId - Google Drive folder ID
 * @returns {Object} List of files
 */
function listDriveFiles(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    const fileList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      fileList.push({
        id: file.getId(),
        name: file.getName(),
        size: file.getSize(),
        mimeType: file.getMimeType(),
        created: file.getDateCreated().toISOString(),
        url: 'https://drive.google.com/file/d/' + file.getId() + '/view'
      });
    }

    return { success: true, files: fileList };
  } catch (err) {
    return { success: false, error: err.message, files: [] };
  }
}

// ==================== NOTIFICATION ENGINE ====================

function handleNotification(notif) {
  try {
    var subject = "";
    var body = "";

    if (notif.type === 'nudge') {
      subject = "Action Required: Onboarding Status for " + notif.name;
      body = '<div style="font-family:Inter,sans-serif;padding:25px;border:1px solid #eef2f6;border-radius:15px;color:#1e293b;"><div style="background:#fbbf24;width:40px;height:40px;border-radius:10px;display:inline-block;text-align:center;line-height:40px;font-size:20px;">&#x1f514;</div><h2 style="color:#0f172a;margin-top:20px;">Support Your New Hire</h2><p>This is an automated status update for <b>' + notif.name + '</b>.</p><div style="background:#f8fafc;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #f1f5f9;"><p style="margin:5px 0;"><b>Current Readiness:</b> ' + notif.progress + '%</p><p style="margin:5px 0;"><b>Days in Flow:</b> ' + notif.days + '/30</p></div><p style="color:#64748b;font-size:13px;">Please check in with ' + notif.name + ' to ensure they have everything they need.</p><hr style="border:0;border-top:1px solid #f1f5f9;margin:25px 0;"/><p style="color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Sent via YuvaHive HROS Cloud</p></div>';
    } else if (notif.type === 'welcome') {
      subject = "Welcome to the Team, " + notif.name + "!";
      body = '<div style="font-family:Inter,sans-serif;padding:25px;border:1px solid #eef2f6;border-radius:15px;color:#1e293b;"><h1 style="color:#2563eb;">Welcome aboard!</h1><p>Hi ' + notif.name + ', we are thrilled to have you join our team as <b>' + notif.role + '</b>.</p><p>Your 30-day success roadmap is now live on the HROS dashboard.</p><div style="background:#eff6ff;padding:20px;border-radius:12px;margin:20px 0;color:#1e40af;"><p style="margin:0;"><b>Orientation Start:</b> Today</p><p style="margin:5px 0 0 0;"><b>Department:</b> ' + notif.department + '</p></div><hr style="border:0;border-top:1px solid #f1f5f9;margin:25px 0;"/><p style="color:#94a3b8;font-size:11px;">YuvaHive HROS</p></div>';
    } else if (notif.type === 'status_update') {
      subject = "Status Update: " + notif.name;
      body = '<div style="font-family:Inter,sans-serif;padding:25px;border:1px solid #eef2f6;border-radius:15px;color:#1e293b;"><h2 style="color:#0f172a;">Status Update</h2><p><b>' + notif.name + '</b> has a status update:</p><div style="background:#f0fdf4;padding:20px;border-radius:12px;margin:20px 0;border:1px solid #bbf7d0;"><p style="margin:0;"><b>Status:</b> ' + notif.status + '</p><p style="margin:5px 0 0 0;"><b>Notes:</b> ' + (notif.notes || 'None') + '</p></div><hr style="border:0;border-top:1px solid #f1f5f9;margin:25px 0;"/><p style="color:#94a3b8;font-size:11px;">YuvaHive HROS</p></div>';
    } else {
      subject = "HROS: " + (notif.type || "Notification");
      body = '<div style="font-family:Inter,sans-serif;padding:25px;border:1px solid #eef2f6;border-radius:15px;color:#1e293b;"><p>' + JSON.stringify(notif) + '</p></div>';
    }

    MailApp.sendEmail({
      to: notif.to,
      subject: subject,
      htmlBody: body
    });

    return { success: true, message: 'Email sent' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
