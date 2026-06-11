var SPREADSHEET_ID = '1EiMxqSbbN62BVtcP820IbWSFtLONNSdBGYGYl_4no40';
var API_KEY = 'hivedesk-secure-key-2026';

var SHEETS = {
  HiveDeskConfig: ['key','value','type','category','description','updatedBy','updatedAt','editableBy'],
  HiveDeskUsers: ['id','email','name','password','role','domain','buddyId','isActive','createdAt','lastLogin','weeklyTargetQuestions','weeklyTargetReviews'],
  HiveDeskQuestions: ['id','title','prefix','domain','topic','difficulty','creatorId','creatorName','reviewerId','reviewerName','assigneeId','assigneeName','status','qualityTier','qualityScore','testCasesCount','hintsCount','hasStarterCode','hasSolution','hasPseudoCode','completionRate','rating','submissions','createdAt','reviewedAt','publishedAt','tags','notes','problemStatement','starterCode','solutionCode','pseudoCode','dueDate','priority'],
  HiveDeskSprints: ['id','name','weekNumber','startDate','endDate','status','sprintLeadId','sprintLeadName','targetQuestions','actualQuestions','publishedCount','avgQualityScore','avgCompletionRate','createdAt','notes'],
  HiveDeskSprintAssignments: ['id','sprintId','personId','personName','domain','targetCount','actualCount','reviewedCount','status'],
  HiveDeskReviews: ['id','questionId','questionTitle','sprintId','reviewerId','reviewerName','creatorId','creatorName','status','accuracyScore','completenessScore','clarityScore','difficultyCalibration','originalityScore','overallScore','feedback','improvementNotes','reviewedAt','revisionCount'],
  HiveDeskBuddyPairs: ['id','personAId','personAName','personBId','personBName','domain','active','createdAt'],
  HiveDeskWorkLogs: ['id','personId','personName','taskName','taskType','hoursWorked','date','notes'],
  HiveDeskCheckIns: ['id','personId','personName','weekNumber','mood','energy','blockers','notes','createdAt'],
  HiveDeskNotifications: ['id','userId','type','title','message','resourceId','resourceType','fromUserId','fromUserName','isRead','createdAt','link'],
  HiveDeskLogs: ['id','userId','userName','action','resource','resourceId','details','timestamp'],
  HiveDeskKudos: ['id','from','fromId','to','message','likes','likedBy','createdAt'],
  HiveDeskSkills: ['id','personId','personName','skill','level','createdAt'],
  HiveDeskStandups: ['id','personId','personName','date','yesterday','today','blockers','createdAt'],
  HiveDeskGoals: ['id','personId','personName','title','description','targetDate','status','progress','createdAt'],
  HiveDeskWrapped: ['id','personId','personName','weekOf','published','reviewed','hoursLogged','checkInCount','totalCreated','growth','createdAt'],
  HiveDeskBadges: ['id','personId','personName','badgeId','badgeLabel','earnedAt']
};

var DEFAULT_CONFIG = [
  {key:'target_questions_per_person_per_week',value:'5',type:'number',category:'targets',description:'Min questions each curator creates per week',editableBy:'admin'},
  {key:'target_reviews_per_person_per_week',value:'5',type:'number',category:'targets',description:'Min reviews each curator does per week',editableBy:'admin'},
  {key:'target_team_questions_per_week',value:'40',type:'number',category:'targets',description:'Total team question target per sprint week',editableBy:'lead'},
  {key:'target_team_published_per_week',value:'24',type:'number',category:'targets',description:'Questions that should be published per week',editableBy:'lead'},
  {key:'target_sprint_duration_days',value:'7',type:'number',category:'targets',description:'Sprint length in days',editableBy:'admin'},
  {key:'min_quality_score',value:'4.0',type:'number',category:'quality',description:'Minimum quality score to publish (out of 5)',editableBy:'admin'},
  {key:'quality_weight_accuracy',value:'30',type:'number',category:'quality',description:'Accuracy weight in quality score (%)',editableBy:'admin'},
  {key:'quality_weight_completeness',value:'25',type:'number',category:'quality',description:'Completeness weight (%)',editableBy:'admin'},
  {key:'quality_weight_clarity',value:'15',type:'number',category:'quality',description:'Clarity weight (%)',editableBy:'admin'},
  {key:'quality_weight_difficulty_calibration',value:'20',type:'number',category:'quality',description:'Difficulty calibration weight (%)',editableBy:'admin'},
  {key:'quality_weight_originality',value:'10',type:'number',category:'quality',description:'Originality weight (%)',editableBy:'admin'},
  {key:'max_review_turnaround_hours',value:'48',type:'number',category:'quality',description:'Max hours before a review is flagged stale',editableBy:'lead'},
  {key:'sprint_review_phase_days',value:'2',type:'number',category:'sprint',description:'Days allocated for review phase',editableBy:'lead'},
  {key:'sprint_publish_phase_days',value:'1',type:'number',category:'sprint',description:'Days for final polish and publish',editableBy:'lead'},
  {key:'auto_close_sprint',value:'true',type:'boolean',category:'sprint',description:'Auto-close sprint when deadline passes',editableBy:'admin'},
  {key:'require_buddy_review_before_publish',value:'true',type:'boolean',category:'sprint',description:'Buddy must review before lead approves',editableBy:'admin'},
  {key:'dsa_domains',value:'["arrays","strings","linked-lists","sorting","searching","dynamic-programming","recursion","hash-tables"]',type:'json',category:'domains',description:'Available DSA domains',editableBy:'admin'},
  {key:'fullstack_domains',value:'["web-development","database","system-design","devops"]',type:'json',category:'domains',description:'Available full-stack domains',editableBy:'admin'},
  {key:'dashboard_refresh_interval_seconds',value:'30',type:'number',category:'ui',description:'Auto-refresh interval (0 = manual)',editableBy:'all'},
  {key:'questions_per_page',value:'20',type:'number',category:'ui',description:'Pagination size for question bank',editableBy:'all'},
  {key:'can_create_sprints',value:'admin,lead',type:'string',category:'permissions',description:'Roles that can create sprints',editableBy:'admin'},
  {key:'can_publish_questions',value:'admin,lead',type:'string',category:'permissions',description:'Roles that can publish questions',editableBy:'admin'},
  {key:'can_delete_questions',value:'admin',type:'string',category:'permissions',description:'Roles that can delete questions',editableBy:'admin'},
  {key:'can_edit_config',value:'admin',type:'string',category:'permissions',description:'Roles that can modify settings',editableBy:'admin'},
  {key:'can_manage_team',value:'admin,lead',type:'string',category:'permissions',description:'Roles that can manage members',editableBy:'admin'},
  {key:'question_id_counter',value:'0',type:'number',category:'system',description:'Sequential counter for question IDs',editableBy:'admin'}
];

var ADMIN_EMAIL = 'himanshuyadav4596@gmail.com';
var ADMIN_NAME = 'Himanshu Yadav';
var ADMIN_PASSWORD = 'hivedesk-admin-2026';

function doGet(e) {
  try {
    var key = (e.parameter.key || '').trim();
    if (key !== API_KEY) return jsonResponse({error:'Unauthorized'},403);
    var ss = getSpreadsheet();
    ensureAllSheets(ss);
    seedAdminIfNeeded(ss);
    seedConfigIfNeeded(ss);
    var action = e.parameter.action;
    if (action === 'login') return handleLogin(e, ss);
    if (action === 'getConfig') return jsonResponse({data:getSheetRows(ss,'HiveDeskConfig')});
    if (action === 'getConfigByKey') {
      var row = findRowByKey(ss,'HiveDeskConfig',e.parameter.key_name);
      return jsonResponse({data:row||null});
    }
    if (action === 'metrics') return jsonResponse({data:getMetrics(ss)});
    if (action === 'search') return jsonResponse({data:searchAll(ss,e.parameter.q)});
    if (action === 'nextQuestionId') return jsonResponse({data:{id:getNextQuestionId(ss)}});
    if (action === 'formatSheets') { formatAllSheets(ss); return jsonResponse({success:true, message:'All sheets formatted'}); }
    if (action === 'get' && e.parameter.type) {
      var type = e.parameter.type;
      var id = e.parameter.id;
      if (id) return jsonResponse({data:getRecordById(ss,type,id)});
      var filters = {
        status:e.parameter.status, domain:e.parameter.domain,
        difficulty:e.parameter.difficulty, creatorId:e.parameter.creatorId,
        reviewerId:e.parameter.reviewerId, sprintId:e.parameter.sprintId,
        assigneeId:e.parameter.assigneeId, personId:e.parameter.personId,
        userId:e.parameter.userId, isRead:e.parameter.isRead,
        search:e.parameter.search,
        limit:parseInt(e.parameter.limit)||1000,
        offset:parseInt(e.parameter.offset)||0
      };
      return jsonResponse(filterSheetData(ss,type,filters));
    }
    var data = {};
    ss.getSheets().forEach(function(sheet) {
      data[sheet.getName()] = getSheetRows(ss, sheet.getName());
    });
    return jsonResponse(data);
  } catch(err) { return jsonResponse({error:err.message},500); }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var key = payload.key;
    var action = payload.action;
    if (key !== API_KEY) return jsonResponse({error:'Unauthorized'},403);
    var ss = getSpreadsheet();
    ensureAllSheets(ss);
    seedAdminIfNeeded(ss);
    seedConfigIfNeeded(ss);
    if (action === 'login') return handleLoginPost(payload, ss);
    if (action === 'updateConfig') return handleUpdateConfig(payload, ss);
    if (action === 'insert') return jsonResponse(insertRecord(ss, payload.type, payload.data));
    if (action === 'update') return jsonResponse(updateRecord(ss, payload.type, payload.id, payload.data));
    if (action === 'delete') return jsonResponse(deleteRecord(ss, payload.type, payload.id));
    if (action === 'upsert') return jsonResponse(upsertRecords(ss, payload.type, payload.data || []));
    if (action === 'bulkInsert') return jsonResponse(bulkInsert(ss, payload.type, payload.data || []));
    if (action === 'createNotification') return jsonResponse(createNotification(ss, payload.data));
    if (action === 'markNotificationsRead') return jsonResponse(markNotificationsRead(ss, payload.userId, payload.ids));
    return jsonResponse({error:'Unknown action'},400);
  } catch(err) { return jsonResponse({error:err.message},500); }
}

function handleLogin(e, ss) {
  return authenticateUser(e.parameter.email, e.parameter.password, ss);
}

function handleLoginPost(payload, ss) {
  return authenticateUser(payload.email, payload.password, ss);
}

function authenticateUser(email, password, ss) {
  if (!email || !password) return jsonResponse({error:'Email and password required'},400);
  var sheet = ss.getSheetByName('HiveDeskUsers');
  if (!sheet) return jsonResponse({error:'Users sheet not found'},500);
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return jsonResponse({error:'No users found'},404);
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var emailIdx = headers.indexOf('email');
  var passwordIdx = headers.indexOf('password');
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][emailIdx] === email) {
      var storedPw = vals[i][passwordIdx].toString();
      if (storedPw === password) {
        var user = parseRow(vals[i], headers);
        var lastLoginIdx = headers.indexOf('lastLogin');
        if (lastLoginIdx !== -1) {
          sheet.getRange(i+1, lastLoginIdx+1).setValue(new Date().toISOString());
        }
        delete user.password;
        return jsonResponse({success:true, user:user});
      } else {
        return jsonResponse({error:'Invalid password'},401);
      }
    }
  }
  return jsonResponse({error:'User not found'},404);
}

function handleUpdateConfig(payload, ss) {
  var configKey = payload.configKey;
  var configValue = payload.configValue;
  var userName = payload.userName;
  if (!configKey || configValue === undefined) return jsonResponse({error:'configKey and configValue required'},400);
  var sheet = ss.getSheetByName('HiveDeskConfig');
  if (!sheet) return jsonResponse({error:'Config sheet not found'},500);
  var vals = sheet.getDataRange().getValues();
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var keyIdx = headers.indexOf('key');
  var valueIdx = headers.indexOf('value');
  var updatedByIdx = headers.indexOf('updatedBy');
  var updatedAtIdx = headers.indexOf('updatedAt');
  // Try to update existing key
  if (vals.length >= 2) {
    for (var i = 1; i < vals.length; i++) {
      if (vals[i][keyIdx] === configKey) {
        sheet.getRange(i+1, valueIdx+1).setValue(String(configValue));
        if (updatedByIdx !== -1) sheet.getRange(i+1, updatedByIdx+1).setValue(userName||'system');
        if (updatedAtIdx !== -1) sheet.getRange(i+1, updatedAtIdx+1).setValue(new Date().toISOString());
        return jsonResponse({success:true, message:'Config updated'});
      }
    }
  }
  // Key not found — create it
  var newEntry = {};
  headers.forEach(function(h){ newEntry[h] = ''; });
  newEntry.key = configKey;
  newEntry.value = String(configValue);
  newEntry.updatedBy = userName || 'system';
  newEntry.updatedAt = new Date().toISOString();
  var row = headers.map(function(h){ return newEntry[h] || ''; });
  sheet.appendRow(row);
  return jsonResponse({success:true, message:'Config key created'});
}

function getConfigValue(ss, key) {
  var sheet = ss.getSheetByName('HiveDeskConfig');
  if (!sheet) return null;
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return null;
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var keyIdx = headers.indexOf('key');
  var valueIdx = headers.indexOf('value');
  var typeIdx = headers.indexOf('type');
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][keyIdx] === key) {
      var raw = vals[i][valueIdx].toString();
      var type = vals[i][typeIdx] ? vals[i][typeIdx].toString() : 'string';
      if (type === 'number') return Number(raw);
      if (type === 'boolean') return raw === 'true';
      if (type === 'json') { try { return JSON.parse(raw); } catch(e) { return raw; } }
      return raw;
    }
  }
  return null;
}

function findRowByKey(ss, sheetName, keyName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return null;
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var keyIdx = headers.indexOf('key');
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][keyIdx] === keyName) return parseRow(vals[i], headers);
  }
  return null;
}

function getNextQuestionId(ss) {
  var counter = getConfigValue(ss, 'question_id_counter') || 0;
  var next = Number(counter) + 1;
  var sheet = ss.getSheetByName('HiveDeskConfig');
  if (sheet) {
    var vals = sheet.getDataRange().getValues();
    var headers = vals[0].map(function(h){return h.toString().trim()});
    var keyIdx = headers.indexOf('key');
    var valueIdx = headers.indexOf('value');
    for (var i = 1; i < vals.length; i++) {
      if (vals[i][keyIdx] === 'question_id_counter') {
        sheet.getRange(i+1, valueIdx+1).setValue(String(next));
        break;
      }
    }
  }
  return 'HDQ-' + String(next).padStart(3, '0');
}

function createNotification(ss, data) {
  if (!data || !data.userId) return {success:false, error:'userId required'};
  var sheet = ss.getSheetByName('HiveDeskNotifications');
  if (!sheet) {
    sheet = ss.insertSheet('HiveDeskNotifications');
    sheet.appendRow(SHEETS.HiveDeskNotifications);
    sheet.getRange(1,1,1,SHEETS.HiveDeskNotifications.length).setFontWeight('bold');
  }
  var notif = {
    id: Utilities.getUuid(),
    userId: data.userId,
    type: data.type || 'info',
    title: data.title || '',
    message: data.message || '',
    resourceId: data.resourceId || '',
    resourceType: data.resourceType || '',
    fromUserId: data.fromUserId || '',
    fromUserName: data.fromUserName || '',
    isRead: 'false',
    createdAt: new Date().toISOString(),
    link: data.link || ''
  };
  var headers = SHEETS.HiveDeskNotifications;
  var row = headers.map(function(h){return notif[h]||''});
  sheet.appendRow(row);
  return {success:true, id:notif.id};
}

function markNotificationsRead(ss, userId, ids) {
  var sheet = ss.getSheetByName('HiveDeskNotifications');
  if (!sheet) return {success:false, error:'Sheet not found'};
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return {success:true, marked:0};
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var idIdx = headers.indexOf('id');
  var userIdx = headers.indexOf('userId');
  var readIdx = headers.indexOf('isRead');
  var marked = 0;
  var idsToMark = ids && ids.length > 0 ? ids : null;
  for (var i = 1; i < vals.length; i++) {
    var rowUserId = vals[i][userIdx] ? vals[i][userIdx].toString() : '';
    if (rowUserId !== userId) continue;
    if (idsToMark) {
      var rowId = vals[i][idIdx] ? vals[i][idIdx].toString() : '';
      if (idsToMark.indexOf(rowId) === -1) continue;
    }
    sheet.getRange(i+1, readIdx+1).setValue('true');
    marked++;
  }
  return {success:true, marked:marked};
}

function getSpreadsheet() {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID is not set in code.gs');
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureAllSheets(ss) {
  Object.keys(SHEETS).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(SHEETS[sheetName]);
      formatSheet(sheet, sheetName);
    }
  });
}

function formatAllSheets(ss) {
  Object.keys(SHEETS).forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      var rules = [];
      sheet.setConditionalFormatRules(rules);
      formatSheet(sheet, sheetName);
    }
  });
  ss.getSheets().forEach(function(s) { s.autoResizeColumns(1, s.getLastColumn() || 1); });
}

function formatSheet(sheet, sheetName) {
  var lastCol = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  if (lastCol < 1) return;

  // ── Header row ──
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange
    .setFontWeight('bold')
    .setFontSize(11)
    .setFontColor('#ffffff')
    .setBackground('#1a1a2e')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);

  // ── Alternating row colors ──
  if (lastRow >= 2) {
    var bodyRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    bodyRange.setFontSize(10).setVerticalAlignment('middle');
    var altRange = sheet.getRange(2, 1, Math.max(1, lastRow - 1), lastCol);
    var altFormula = '=MOD(ROW(),2)=0';
    var altRule = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(altFormula)
      .setBackground('#f8f9fc')
      .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(altRule);
    sheet.setConditionalFormatRules(rules);
  }

  // ── Find & format known columns ──
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h){return h.toString().trim().toLowerCase()});

  // Status column → colored badges
  var statusIdx = headers.indexOf('status');
  if (statusIdx !== -1) {
    var col = statusIdx + 1;
    if (lastRow >= 2) {
      var statusRange = sheet.getRange(2, col, lastRow - 1, 1);
      var statusRule = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('published').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build();
      var statusRule2 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('completed').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build();
      var statusRule3 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('approved').setBackground('#dbeafe').setFontColor('#1e40af').setFontWeight('bold').build();
      var statusRule4 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('active').setBackground('#dbeafe').setFontColor('#1e40af').setFontWeight('bold').build();
      var statusRule5 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('in-review').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build();
      var statusRule6 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('needs-revision').setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build();
      var statusRule7 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('rejected').setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build();
      var statusRule8 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('draft').setBackground('#f1f5f9').setFontColor('#475569').build();
      var statusRule9 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('review').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build();
      var statusRule10 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('planning').setBackground('#f1f5f9').setFontColor('#475569').build();
      var statusRule11 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('done').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build();
      var statusRule12 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('publish').setBackground('#dbeafe').setFontColor('#1e40af').setFontWeight('bold').build();
      var statusRule13 = SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('pending').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build();
      var current = SpreadsheetApp.getActiveSheet().getConditionalFormatRules();
      var add = [statusRule,statusRule2,statusRule3,statusRule4,statusRule5,statusRule6,statusRule7,statusRule8,statusRule9,statusRule10,statusRule11,statusRule12,statusRule13];
      sheet.setConditionalFormatRules(current.concat(add));
    }
  }

  // Role column
  var roleIdx = headers.indexOf('role');
  if (roleIdx !== -1 && lastRow >= 2) {
    var roleRange = sheet.getRange(2, roleIdx + 1, lastRow - 1, 1);
    var rules = sheet.getConditionalFormatRules();
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('admin').setBackground('#e0e7ff').setFontColor('#3730a3').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('lead').setBackground('#dbeafe').setFontColor('#1e40af').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('curator').setBackground('#f1f5f9').setFontColor('#475569').build());
    sheet.setConditionalFormatRules(rules);
  }

  // Difficulty column
  var diffIdx = headers.indexOf('difficulty');
  if (diffIdx !== -1 && lastRow >= 2) {
    var rules = sheet.getConditionalFormatRules();
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Hard').setFontColor('#dc2626').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Medium').setFontColor('#d97706').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('Easy').setFontColor('#059669').setFontWeight('bold').build());
    sheet.setConditionalFormatRules(rules);
  }

  // Score columns (qualityScore, overallScore, etc.)
  ['qualityscore', 'overallscore', 'accuracyscore', 'completenessscore', 'clarityscore', 'originalityscore', 'finalscore'].forEach(function(scoreName) {
    var idx = headers.indexOf(scoreName);
    if (idx !== -1 && lastRow >= 2) {
      var rules = sheet.getConditionalFormatRules();
      var col = idx + 1;
      var range = col + '2:' + col + lastRow;
      // Green for high scores
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberGreaterThanOrEqualTo(7).setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build());
      // Yellow for medium
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberBetween(4, 6.99).setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build());
      // Red for low
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(4).setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build());
      sheet.setConditionalFormatRules(rules);
    }
  });

  // Boolean / Yes-No columns (isActive, isRead, hasStarterCode, etc.)
  ['isactive', 'isread', 'hasstartercode', 'hassolution', 'haspseudocode', 'certificategenerated', 'sendwelcomeemail'].forEach(function(flag) {
    var idx = headers.indexOf(flag);
    if (idx !== -1 && lastRow >= 2) {
      var rules = sheet.getConditionalFormatRules();
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('true').setFontColor('#059669').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule()
        .whenTextEqualTo('false').setFontColor('#dc2626').build());
      sheet.setConditionalFormatRules(rules);
    }
  });

  // Priority column
  var priIdx = headers.indexOf('priority');
  if (priIdx !== -1 && lastRow >= 2) {
    var rules = sheet.getConditionalFormatRules();
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('high').setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('medium').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build());
    rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('low').setBackground('#f1f5f9').setFontColor('#475569').build());
    sheet.setConditionalFormatRules(rules);
  }

  // Stage/progress columns (for onboarding, internship)
  ['stage', 'level'].forEach(function(stageName) {
    var idx = headers.indexOf(stageName);
    if (idx !== -1 && lastRow >= 2) {
      var rules = sheet.getConditionalFormatRules();
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('completed').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('confirmed').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('active').setBackground('#dbeafe').setFontColor('#1e40af').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('review').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('at-risk').setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('thriving').setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('needs-support').setBackground('#fee2e2').setFontColor('#991b1b').setFontWeight('bold').build());
      rules.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('check-in-recommended').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').build());
      sheet.setConditionalFormatRules(rules);
    }
  });

  // Date columns → format as dates
  var dateCols = ['createdat', 'updatedat', '_updatedat', 'startdate', 'enddate', 'lastlogin', 'applieddate', 'scheduleddate', 'reviewedat', 'publishedat', 'duedate', 'targetdate', 'date', 'weekof', 'earnedat', 'sprintdate'];
  dateCols.forEach(function(key) {
    var idx = headers.indexOf(key);
    if (idx !== -1 && lastRow >= 2) {
      sheet.getRange(2, idx + 1, lastRow - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    }
  });

  // Hours / numeric columns
  var numCols = ['hoursworked', 'hourslogged', 'bountypoints', 'progress', 'likes', 'score', 'sprintnumber', 'weeknumber'];
  numCols.forEach(function(key) {
    var idx = headers.indexOf(key);
    if (idx !== -1 && lastRow >= 2 && idx < lastCol) {
      sheet.getRange(2, idx + 1, lastRow - 1, 1).setNumberFormat('#,##0.0');
    }
  });

  // Percentage columns
  var pctCols = ['attendancepercentage', 'progress', 'completionrate'];
  pctCols.forEach(function(key) {
    var idx = headers.indexOf(key);
    if (idx !== -1 && lastRow >= 2 && idx < lastCol) {
      sheet.getRange(2, idx + 1, lastRow - 1, 1).setNumberFormat('0%');
    }
  });

  // Add alternating row stripes via theme (in addition to conditional format)
  if (lastRow > 1) {
    var banding = sheet.getBandings();
    if (banding.length === 0) {
      var body = sheet.getRange(1, 1, Math.max(1, lastRow), lastCol);
      try { body.applyRowBanding(SpreadsheetApp.BandingTheme.GREY, false, false); } catch(e) {}
    }
  }

  // Column widths (header-adaptive)
  for (var c = 1; c <= lastCol; c++) {
    var headerText = headers[c - 1] || '';
    var width = Math.max(80, Math.min(300, headerText.length * 10 + 20));
    sheet.setColumnWidth(c, width);
  }

  // Add filter to header
  if (lastRow > 1 && lastCol > 0) {
    var filterRange = sheet.getRange(1, 1, lastRow, lastCol);
    try { filterRange.createFilter(); } catch(e) {}
  }
}

function seedAdminIfNeeded(ss) {
  var sheet = ss.getSheetByName('HiveDeskUsers');
  if (!sheet) return;
  var vals = sheet.getDataRange().getValues();
  if (vals.length > 1) return;
  var headers = SHEETS.HiveDeskUsers;
  var rec = {};
  headers.forEach(function(h){rec[h]=''});
  rec.id = 'admin-001';
  rec.email = ADMIN_EMAIL;
  rec.name = ADMIN_NAME;
  rec.password = ADMIN_PASSWORD;
  rec.role = 'admin';
  rec.domain = 'all';
  rec.isActive = 'true';
  rec.createdAt = new Date().toISOString();
  rec.weeklyTargetQuestions = '0';
  rec.weeklyTargetReviews = '0';
  sheet.appendRow(headers.map(function(h){return rec[h]||''}));
}

function seedConfigIfNeeded(ss) {
  var sheet = ss.getSheetByName('HiveDeskConfig');
  if (!sheet) return;
  var vals = sheet.getDataRange().getValues();
  if (vals.length > 1) {
    // For existing installs: ensure new config keys are added
    var headers = vals[0].map(function(h){return h.toString().trim()});
    var keyIdx = headers.indexOf('key');
    var existingKeys = {};
    for (var i = 1; i < vals.length; i++) {
      existingKeys[vals[i][keyIdx]] = true;
    }
    DEFAULT_CONFIG.forEach(function(cfg) {
      if (!existingKeys[cfg.key]) {
        var row = SHEETS.HiveDeskConfig.map(function(h){return cfg[h]||''});
        sheet.appendRow(row);
      }
    });
    return;
  }
  DEFAULT_CONFIG.forEach(function(cfg) {
    var row = SHEETS.HiveDeskConfig.map(function(h){return cfg[h]||''});
    sheet.appendRow(row);
  });
}

function getSheetRows(ss, sheetName, limit) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return [];
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var rows = limit ? vals.slice(1, limit+1) : vals.slice(1);
  return rows.map(function(row){return parseRow(row, headers)});
}

function filterSheetData(ss, sheetName, filters) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {data:[], total:0};
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return {data:[], total:0};
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var rows = parseRows(vals.slice(1), headers);
  if (filters.status) rows = rows.filter(function(r){return r.status === filters.status});
  if (filters.domain) rows = rows.filter(function(r){return r.domain === filters.domain});
  if (filters.difficulty) rows = rows.filter(function(r){return r.difficulty === filters.difficulty});
  if (filters.creatorId) rows = rows.filter(function(r){return r.creatorId === filters.creatorId});
  if (filters.reviewerId) rows = rows.filter(function(r){return r.reviewerId === filters.reviewerId});
  if (filters.sprintId) rows = rows.filter(function(r){return r.sprintId === filters.sprintId});
  if (filters.personId) rows = rows.filter(function(r){return r.personId === filters.personId});
  if (filters.assigneeId) rows = rows.filter(function(r){return r.assigneeId === filters.assigneeId});
  if (filters.userId) rows = rows.filter(function(r){return r.userId === filters.userId});
  if (filters.isRead !== undefined && filters.isRead !== null && filters.isRead !== '') {
    var targetRead = String(filters.isRead).toLowerCase();
    rows = rows.filter(function(r){return String(r.isRead).toLowerCase() === targetRead});
  }
  if (filters.search) {
    var q = filters.search.toLowerCase();
    rows = rows.filter(function(r){
      return Object.values(r).some(function(v){return v && v.toString().toLowerCase().indexOf(q) !== -1});
    });
  }
  var total = rows.length;
  rows = rows.slice(filters.offset||0, (filters.offset||0)+(filters.limit||1000));
  return {data:rows, total:total, offset:filters.offset||0, limit:filters.limit||1000};
}

function getRecordById(ss, sheetName, id) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return null;
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var idIdx = headers.indexOf('id');
  if (idIdx === -1) return null;
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][idIdx].toString() === id.toString()) return parseRow(vals[i], headers);
  }
  return null;
}

function insertRecord(ss, sheetName, data) {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) return {success:false, error:'No data provided'};
  var sheet = ss.getSheetByName(sheetName);
  var isNew = false;
  if (!sheet) {
    isNew = true;
    if (SHEETS[sheetName]) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(SHEETS[sheetName]);
    } else {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(Object.keys(data));
    }
  }
  var vals = sheet.getDataRange().getValues();
  var headers = vals[0].map(function(h){return h.toString().trim()});
  if (!data.id) data.id = Utilities.getUuid();
  if (!data.createdAt) data.createdAt = new Date().toISOString();
  data._updatedAt = new Date().toISOString();
  var row = headers.map(function(h){
    var val = data[h];
    if (val === undefined || val === null) return '';
    return (typeof val === 'object') ? JSON.stringify(val) : val;
  });
  sheet.appendRow(row);
  if (isNew) formatSheet(sheet, sheetName);
  logAction(ss, data._createdBy||'system', 'insert', sheetName, data.id, data);
  return {success:true, message:'Record inserted', id:data.id};
}

function updateRecord(ss, sheetName, id, data) {
  if (!id || !data) return {success:false, error:'id and data required'};
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {success:false, error:'Sheet not found'};
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return {success:false, error:'No data'};
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var idIdx = headers.indexOf('id');
  if (idIdx === -1) return {success:false, error:'No id column'};
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][idIdx].toString() === id.toString()) {
      var rowNum = i + 1;
      data._updatedAt = new Date().toISOString();
      headers.forEach(function(h, colIdx) {
        if (data[h] !== undefined) {
          var val = data[h];
          var cellVal = (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
          sheet.getRange(rowNum, colIdx+1).setValue(cellVal);
        }
      });
      logAction(ss, data._updatedBy||'system', 'update', sheetName, id, data);
      return {success:true, message:'Record updated'};
    }
  }
  return {success:false, error:'Record not found'};
}

function deleteRecord(ss, sheetName, id) {
  if (!id) return {success:false, error:'id required'};
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return {success:false, error:'Sheet not found'};
  var vals = sheet.getDataRange().getValues();
  if (vals.length < 2) return {success:false, error:'No data'};
  var headers = vals[0].map(function(h){return h.toString().trim()});
  var idIdx = headers.indexOf('id');
  if (idIdx === -1) return {success:false, error:'No id column'};
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][idIdx].toString() === id.toString()) {
      sheet.deleteRow(i+1);
      logAction(ss, 'system', 'delete', sheetName, id, {});
      return {success:true, message:'Record deleted'};
    }
  }
  return {success:false, error:'Record not found'};
}

function upsertRecords(ss, sheetName, records) {
  if (!records || records.length === 0) return {success:true, inserted:0, updated:0};
  var inserted = 0, updated = 0;
  records.forEach(function(record) {
    var existing = record.id ? getRecordById(ss, sheetName, record.id) : null;
    if (existing) { updateRecord(ss, sheetName, record.id, record); updated++; }
    else { insertRecord(ss, sheetName, record); inserted++; }
  });
  return {success:true, inserted:inserted, updated:updated, message:inserted+' inserted, '+updated+' updated'};
}

function bulkInsert(ss, sheetName, records) {
  if (!records || records.length === 0) return {success:true, count:0};
  var count = 0;
  records.forEach(function(record) { insertRecord(ss, sheetName, record); count++; });
  return {success:true, count:count};
}

function getMetrics(ss) {
  var users = getSheetRows(ss, 'HiveDeskUsers');
  var questions = getSheetRows(ss, 'HiveDeskQuestions');
  var sprints = getSheetRows(ss, 'HiveDeskSprints');
  var reviews = getSheetRows(ss, 'HiveDeskReviews');
  var activeSprint = null;
  sprints.forEach(function(s) { if (s.status === 'active') activeSprint = s; });
  var totalQuestions = questions.length;
  var publishedQuestions = questions.filter(function(q){return q.status==='published'}).length;
  var inReviewQuestions = questions.filter(function(q){return q.status==='in-review'}).length;
  var draftQuestions = questions.filter(function(q){return q.status==='draft'}).length;
  var needsRevisionQuestions = questions.filter(function(q){return q.status==='needs-revision'}).length;
  var avgQuality = 0;
  var rated = questions.filter(function(q){return q.qualityScore && Number(q.qualityScore) > 0});
  if (rated.length > 0) {
    avgQuality = rated.reduce(function(a,b){return a + Number(b.qualityScore)},0) / rated.length;
  }
  var avgCompletion = 0;
  var ratedComp = questions.filter(function(q){return q.completionRate && Number(q.completionRate) > 0});
  if (ratedComp.length > 0) {
    avgCompletion = ratedComp.reduce(function(a,b){return a + Number(b.completionRate)},0) / ratedComp.length;
  }
  var pendingReviews = reviews.filter(function(r){return r.status==='pending'}).length;
  var teamMembers = users.filter(function(u){return u.isActive==='true' || u.isActive === true});
  var sprintsCompleted = sprints.filter(function(s){return s.status==='done'}).length;
  return {
    totalQuestions: totalQuestions,
    publishedQuestions: publishedQuestions,
    inReviewQuestions: inReviewQuestions,
    draftQuestions: draftQuestions,
    needsRevisionQuestions: needsRevisionQuestions,
    avgQuality: Math.round(avgQuality * 10) / 10,
    avgCompletion: Math.round(avgCompletion * 10) / 10,
    pendingReviews: pendingReviews,
    activeTeamMembers: teamMembers.length,
    totalSprints: sprints.length,
    sprintsCompleted: sprintsCompleted,
    activeSprint: activeSprint
  };
}

function searchAll(ss, query) {
  if (!query) return {results:[]};
  var sheets = ss.getSheets();
  var q = query.toLowerCase();
  var results = [];
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    var vals = sheet.getDataRange().getValues();
    if (vals.length < 2) return;
    var headers = vals[0].map(function(h){return h.toString().trim()});
    for (var i = 1; i < vals.length; i++) {
      var row = parseRow(vals[i], headers);
      var matches = Object.values(row).some(function(v){
        return v && v.toString().toLowerCase().indexOf(q) !== -1;
      });
      if (matches) results.push({sheet:name, data:row});
    }
  });
  return {results:results.slice(0,50)};
}

function logAction(ss, userId, action, resource, resourceId, details) {
  try {
    var sheet = ss.getSheetByName('HiveDeskLogs');
    if (!sheet) return;
    // Try to resolve userName from userId
    var userName = '';
    if (userId && userId !== 'system') {
      var users = getSheetRows(ss, 'HiveDeskUsers');
      var found = users.find(function(u){ return u.id === userId; });
      if (found) userName = found.name || '';
    }
    var logEntry = {
      id: Utilities.getUuid(),
      userId: userId || 'system',
      userName: userName,
      action: action,
      resource: resource,
      resourceId: resourceId || '',
      details: typeof details === 'object' ? JSON.stringify(details).substring(0,500) : String(details).substring(0,500),
      timestamp: new Date().toISOString()
    };
    var headers = SHEETS.HiveDeskLogs;
    var row = headers.map(function(h){return logEntry[h]||''});
    sheet.appendRow(row);
  } catch(e) {}
}

function parseRows(vals, headers) {
  return vals.map(function(row){return parseRow(row, headers)});
}

function parseRow(row, headers) {
  var obj = {};
  headers.forEach(function(key, i) {
    if (!key) return;
    var val = row[i];
    if (typeof val === 'string' && (val.charAt(0) === '{' || val.charAt(0) === '[')) {
      try { val = JSON.parse(val); } catch(e) {}
    }
    obj[key] = val;
  });
  return obj;
}

function jsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
