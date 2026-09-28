function getConfig() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty('SPREADSHEET_ID');

  if (!spreadsheetId) {
    var ss = SpreadsheetApp.create('Interactive_Classroom_Quiz_DB');
    spreadsheetId = ss.getId();
    props.setProperty('SPREADSHEET_ID', spreadsheetId);
    initializeDatabase(ss);
  }

  var adminPassword = props.getProperty('ADMIN_PASSWORD');
  if (!adminPassword) {
    adminPassword = 'admin123';
    props.setProperty('ADMIN_PASSWORD', adminPassword);
  }

  return { spreadsheetId: spreadsheetId, adminPasswordSet: !!adminPassword };
}

function initializeDatabase(ss) {
  var qSheet = ss.getSheetByName('QUESTIONS');
  if (!qSheet) {
    qSheet = ss.insertSheet('QUESTIONS');
    qSheet.appendRow(['id', 'question', 'optionA', 'optionB', 'correctAnswer', 'explanation', 'duration', 'active', 'order']);
    qSheet.appendRow(['1', 'Matahari terbit dari arah barat?', 'SALAH', 'BENAR', 'B', 'Matahari tampak terbit dari arah timur.', 10, true, 1]);
  }
  var sSheet = ss.getSheetByName('SETTINGS');
  if (!sSheet) {
    sSheet = ss.insertSheet('SETTINGS');
    sSheet.appendRow(['key', 'value']);
    sSheet.appendRow(['defaultDuration', '10']);
    sSheet.appendRow(['gameMode', 'GROUP']);
    sSheet.appendRow(['soundEnabled', 'true']);
  }
}

function getGameSettings() {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var sheet = ss.getSheetByName('SETTINGS');
  var settings = { defaultDuration: 10, gameMode: 'GROUP', soundEnabled: true };
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var key = data[i][0];
      var value = data[i][1];
      if (key === 'defaultDuration') settings.defaultDuration = Number(value) || 10;
      else if (key === 'gameMode') settings.gameMode = value;
      else if (key === 'soundEnabled') settings.soundEnabled = String(value).toLowerCase() === 'true';
    }
  }
  return settings;
}

function saveGameSettings(settings) {
  if (!settings) return { success: false, message: 'No settings provided' };

  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.spreadsheetId);
  var sheet = ss.getSheetByName('SETTINGS');
  if (!sheet) {
    initializeDatabase(ss);
    sheet = ss.getSheetByName('SETTINGS');
  }

  var rows = sheet.getDataRange().getValues();
  var keys = { defaultDuration: settings.defaultDuration, gameMode: settings.gameMode, soundEnabled: settings.soundEnabled };

  for (var key in keys) {
    if (keys[key] === undefined) continue;
    var found = false;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(String(keys[key]));
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, String(keys[key])]);
    }
  }

  return { success: true };
}
