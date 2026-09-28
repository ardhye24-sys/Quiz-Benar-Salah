function createQuestion(data) { return saveQuestionData(data, false); }
function updateQuestion(data) { return saveQuestionData(data, true); }
function deleteQuestion(id) { return deleteQuestionData(id); }