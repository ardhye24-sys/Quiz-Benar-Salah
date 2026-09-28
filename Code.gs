/**
 * Code.gs - REST API Router for External Frontend
 */

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  var result = {};
  
  try {
    if (action === 'getActiveQuestions') {
      result = getActiveQuestions();
    } else if (action === 'getQuestions') {
      result = getQuestions();
    } else if (action === 'getSettings') {
      result = getGameSettings();
    } else {
      result = { status: 'error', message: 'Invalid action or missing endpoint' };
    }
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    body = e.parameter || {};
  }
  
  var action = body.action;
  var result = { success: false, message: 'Invalid action' };
  
  try {
    if (action === 'createQuestion') {
      result = createQuestion(body.payload);
    } else if (action === 'updateQuestion') {
      result = updateQuestion(body.payload);
    } else if (action === 'deleteQuestion') {
      result = deleteQuestionData(body.id);
    } else if (action === 'authenticate') {
      result = authenticateTeacher(body.password);
    } else if (action === 'saveSettings') {
      result = saveGameSettings(body.settings);
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}