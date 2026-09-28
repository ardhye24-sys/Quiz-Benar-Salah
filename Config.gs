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
    props.setProperty('ADMIN_PASSWORD', 'admin123');
  }
  
  return { spreadsheetId: spreadsheetId, adminPasswordSet: !!adminPassword };
}

function initializeDatabase(ss) {
  var qSheet = ss.getSheetByName('QUESTIONS');
  if (!qSheet) {
    qSheet = ss.insertSheet('QUESTIONS');
    qSheet.appendRow(['id', 'question', 'optionA', 'optionB', 'correctAnswer', 'explanation', 'duration', 'active', 'order']);
    qSheet.appendRow(['1', 'Matahari terbit dari arah barat?', 'BENAR', 'SALAH', 'B', 'Matahari tampak terbit dari arah timur.', 10, true, 1]);
  }
  var sSheet = ss.getSheetByName('SETTINGS');
  if (!sSheet) {
    sSheet = ss.insertSheet('SETTINGS');
    sSheet.appendRow(['key', 'value']);
    sSheet.appendRow(['defaultDuration', '10']);
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
      if (data[i][0] === 'defaultDuration') settings.defaultDuration = Number(data[i][1]);
    }
  }
  return settings;
}