/**
 * ImageService.gs - Upload gambar soal ke Google Drive
 *
 * PENTING: jalankan fungsi getImageFolder() sekali dari editor Apps Script
 * untuk memberi izin akses Google Drive, lalu deploy ulang (New version).
 */

var MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB

function getImageFolder() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('IMAGE_FOLDER_ID');

  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* folder terhapus, buat baru */ }
  }

  var folder = DriveApp.createFolder('Quiz_Images');
  props.setProperty('IMAGE_FOLDER_ID', folder.getId());
  return folder;
}

function uploadQuestionImage(payload) {
  if (!payload || !payload.data) {
    return { success: false, message: 'Data gambar kosong' };
  }

  var mime = payload.mimeType || 'image/jpeg';
  if (!/^image\/(jpeg|png|webp)$/.test(mime)) {
    return { success: false, message: 'Format harus JPG, PNG, atau WEBP' };
  }

  var bytes = Utilities.base64Decode(payload.data);
  if (bytes.length > MAX_IMAGE_BYTES) {
    return { success: false, message: 'Ukuran gambar maksimal 3 MB' };
  }

  var ext = mime === 'image/png' ? '.png' : (mime === 'image/webp' ? '.webp' : '.jpg');
  var blob = Utilities.newBlob(bytes, mime, 'soal_' + Date.now() + ext);
  var file = getImageFolder().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    success: true,
    fileId: file.getId(),
    url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200'
  };
}
