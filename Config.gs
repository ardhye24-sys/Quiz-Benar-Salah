/**
 * Database.gs - Core Google Sheets data management with auto-seeding
 */

function getSpreadsheet() {
  var config = getConfig();
  return SpreadsheetApp.openById(config.spreadsheetId);
}

/**
 * Pastikan kolom 'imageUrl' ada di sheet QUESTIONS.
 * Untuk database lama, kolom ditambahkan otomatis di ujung kanan header.
 * Mengembalikan nomor kolom (mulai dari 1).
 */
function ensureImageColumn(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = headers.indexOf('imageUrl');
  if (idx === -1) {
    sheet.getRange(1, lastCol + 1).setValue('imageUrl');
    return lastCol + 1;
  }
  return idx + 1;
}

function getQuestions() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('QUESTIONS');

  if (!sheet) {
    initializeDatabase(ss);
    sheet = ss.getSheetByName('QUESTIONS');
  }

  ensureImageColumn(sheet);

  var rows = sheet.getDataRange().getValues();

  if (rows.length <= 1) {
    // Auto-seed soal default jika kosong
    sheet.appendRow([
      '1',
      'Matahari terbit dari arah barat?',
      'SALAH',
      'BENAR',
      'B',
      'Matahari tampak terbit dari arah timur.',
      10,
      true,
      1,
      ''
    ]);
    rows = sheet.getDataRange().getValues();
  }

  var headers = rows[0];
  var questions = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var q = {};
    for (var j = 0; j < headers.length; j++) {
      q[headers[j]] = row[j];
    }

    q.duration = Number(q.duration) || 10;
    q.active = (q.active === true || String(q.active).toLowerCase() === 'true' || String(q.active) === '1');
    q.order = Number(q.order) || i;
    q.imageUrl = q.imageUrl ? String(q.imageUrl) : '';
    questions.push(q);
  }

  questions.sort(function(a, b) { return a.order - b.order; });
  return questions;
}

function getActiveQuestions() {
  var all = getQuestions();
  var active = [];

  for (var i = 0; i < all.length; i++) {
    if (all[i].active) active.push(all[i]);
  }

  // Jika tidak ada yang aktif, paksa aktifkan baris pertama atau berikan soal default
  if (active.length === 0 && all.length > 0) {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName('QUESTIONS');
    sheet.getRange(2, 8).setValue(true); // set active = true pada baris pertama
    all[0].active = true;
    active.push(all[0]);
  } else if (active.length === 0) {
    active.push({
      id: 1,
      question: "Matahari terbit dari arah barat?",
      optionA: "SALAH",
      optionB: "BENAR",
      correctAnswer: "B",
      explanation: "Matahari tampak terbit dari timur.",
      duration: 10,
      active: true,
      order: 1,
      imageUrl: ''
    });
  }

  return active;
}

function saveQuestionData(questionData, isEdit) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('QUESTIONS');

  if (!sheet) {
    initializeDatabase(ss);
    sheet = ss.getSheetByName('QUESTIONS');
  }

  var imgCol = ensureImageColumn(sheet);
  var rows = sheet.getDataRange().getValues();

  if (isEdit && questionData.id) {
    var rowIndex = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(questionData.id)) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 2).setValue(questionData.question);
      sheet.getRange(rowIndex, 3).setValue(questionData.optionA);
      sheet.getRange(rowIndex, 4).setValue(questionData.optionB);
      sheet.getRange(rowIndex, 5).setValue(questionData.correctAnswer);
      sheet.getRange(rowIndex, 6).setValue(questionData.explanation);
      sheet.getRange(rowIndex, 7).setValue(questionData.duration);
      sheet.getRange(rowIndex, 8).setValue(questionData.active);
      sheet.getRange(rowIndex, 9).setValue(questionData.order);
      sheet.getRange(rowIndex, imgCol).setValue(questionData.imageUrl || '');
      return { success: true, id: questionData.id };
    }
  }

  var newId = '1';
  if (rows.length > 1) {
    var maxId = 0;
    for (var i = 1; i < rows.length; i++) {
      var idNum = Number(rows[i][0]) || 0;
      if (idNum > maxId) maxId = idNum;
    }
    newId = String(maxId + 1);
  }

  sheet.appendRow([
    newId,
    questionData.question,
    questionData.optionA,
    questionData.optionB,
    questionData.correctAnswer,
    questionData.explanation || '',
    questionData.duration || 10,
    questionData.active !== false,
    questionData.order || rows.length,
    questionData.imageUrl || ''
  ]);

  return { success: true, id: newId };
}

function deleteQuestionData(id) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return { success: false };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Question not found' };
}

function setQuestionActiveStatus(id, active) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName('QUESTIONS');
  if (!sheet) return { success: false };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.getRange(i + 1, 8).setValue(Boolean(active));
      return { success: true };
    }
  }
  return { success: false };
}
