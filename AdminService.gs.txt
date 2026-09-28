function authenticateTeacher(password) {
  var props = PropertiesService.getScriptProperties();
  var adminPassword = props.getProperty('ADMIN_PASSWORD') || 'admin123';
  if (password === adminPassword) {
    return { success: true, token: 'AUTH_TOKEN_' + new Date().getTime() };
  } else {
    return { success: false, message: 'Password salah. Silakan coba lagi.' };
  }
}