# True or False Game (Firebase + GitHub Pages)

Game kuis benar/salah interaktif menggunakan kamera (motion tracking).

## Struktur File
* `index.html` — Halaman utama game & Dashboard Guru.
* `firebase-config.js` — Konfigurasi Firebase Web App.
* `firestore.rules` — Aturan keamanan Firestore (database terpisah per akun).
* `sw.js` & `manifest.webmanifest` — Konfigurasi PWA (Progressive Web App).
* `icons/` — Ikon aplikasi berbagai ukuran.

## Pemisahan Database Soal Setiap Akun
* Setiap guru yang login memiliki subkoleksi soal tersendiri di path Firestore:
  `users/{userId}/questions/{questionId}`
* Guru A **hanya** dapat melihat, membuat, mengubah, dan menghapus soal miliknya sendiri.
* Guru B tidak akan melihat atau mengganggu soal milik Guru A.
* **Memainkan Kuis di Kelas:**
  * Komputer kelas yang login otomatis memainkan soal akun tersebut.
  * Guru juga dapat membagikan atau mem-bookmark link khusus akun dengan tombol **"Salin Link Kuis Saya"** (format: `?guru=USER_ID`).

## Aturan Keamanan Firestore
Pastikan isi dari `firestore.rules` sudah dipublikasikan di Firebase Console > Firestore Database > Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;

      match /questions/{id} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```
