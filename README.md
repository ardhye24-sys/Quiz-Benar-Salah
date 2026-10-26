# True or False Game (Firebase + GitHub Pages)

Game kuis benar/salah interaktif menggunakan kamera (motion tracking).

## Struktur File
* `index.html` — Halaman utama game & Dashboard Guru.
* `firebase-config.js` — Konfigurasi Firebase Web App.
* `firestore.rules` — Aturan keamanan Firestore.
* `sw.js` & `manifest.webmanifest` — Konfigurasi PWA (Progressive Web App).
* `icons/` — Ikon aplikasi berbagai ukuran.

## Mengatasi Pesan "Tidak Punya Izin Menulis" (permission-denied)
Pesan ini muncul karena aturan keamanan Firestore di server cloud Firebase Console masih menggunakan aturan lama (atau aturan default yang memblokir penulisan). File `firestore.rules` di laptop Anda tidak otomatis aktif ke server Firebase sebelum dipublikasikan di console.

### Cara Memperbaiki:
1. Buka browser dan pergi ke **[Firebase Console](https://console.firebase.google.com/)**.
2. Pilih proyek Anda: `true-false-96231`.
3. Di menu sebelah kiri, klik **Build** > **Firestore Database**.
4. Klik tab **Rules** di bagian atas.
5. Hapus semua teks yang ada, lalu tempel (*paste*) aturan berikut:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 1. Publik / siswa dapat membaca soal agar kuis bisa dimainkan di kelas
    match /{document=**} {
      allow read: if true;
    }

    // 2. Akun guru yang login (terautentikasi) diizinkan menambah/mengubah/menghapus soal
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```
6. Klik tombol **Publish** di pojok kanan atas.
7. Kembali ke aplikasi dan coba simpan soal lagi. Soal akan langsung tersimpan dengan sukses!
