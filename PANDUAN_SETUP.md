
# MULTI GMAIL WETAN - PANDUAN LENGKAP

## ⚠️ BAGIAN YANG HARUS DILAKUKAN DI BROWSER (TIDAK BISA LEWAT TERMINAL)

Google Cloud Console tidak bisa di setup sepenuhnya lewat terminal - kamu harus buka browser!

---

## 📖 STEP BY STEP GOOGLE CLOUD CONSOLE

### 1. Buka Google Cloud Console
Buka di browser: https://console.cloud.google.com

### 2. Buat Project Baru
- Klik dropdown project di pojok kiri atas
- Klik **NEW PROJECT**
- Isi nama: `Multi Gmail Wetan` (atau terserah kamu)
- Klik **CREATE**

### 3. Aktifkan API yang Dibutuhkan
- Di menu kiri, buka **APIs & Services** > **Library**
- Cari **Gmail API** → klik **Enable**
- Cari **Google People API** → klik **Enable**

### 4. Buat OAuth Consent Screen
- Di menu kiri, buka **APIs & Services** > **OAuth consent screen**
- Pilih **External** → klik **CREATE**
- Isi:
  - App name: `Multi Gmail Wetan`
  - User support email: email kamu
  - Developer contact information: email kamu
- Klik **SAVE AND CONTINUE**
- Di **Scopes**, klik **ADD OR REMOVE SCOPES**
- Cari dan tambahkan:
  - `.../auth/gmail.send`
  - `.../auth/userinfo.email`
  - `.../auth/userinfo.profile`
- Klik **SAVE AND CONTINUE**
- Di **Test users**, klik **ADD USERS**, tambahkan email kamu sendiri
- Klik **SAVE AND CONTINUE**

### 5. Buat OAuth Client ID
- Di menu kiri, buka **APIs & Services** > **Credentials**
- Klik **+ CREATE CREDENTIALS** → **OAuth client ID**
- **Application type**: pilih **Web application**
- Isi nama: `Multi Gmail Wetan Client`
- Di **Authorized redirect URIs**, klik **ADD URI**
  - Isi: `http://localhost:3001/api/auth/google/callback`
- Klik **CREATE**
- Salin **Client ID** dan **Client Secret** yang muncul!

---

## 🖥️ BAGIAN YANG BISA DILAKUKAN DI TERMINAL

### 1. Jalankan Setup Script
Di PowerShell (asumsikan kamu sudah di folder `multigmail`):
```powershell
.\setup.ps1
```

### 2. Edit .env.local
Buka file `.env.local` dan isikan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=client-id-kamu.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=client-secret-kamu
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. Jalankan Migrasi Supabase
- Buka Supabase Dashboard → SQL Editor
- Paste isi file `supabase-schema.sql`
- Klik **Run**

### 4. Jalankan Aplikasi!
```powershell
npm run dev
```

---

## 🎉 SELESAI!
Buka http://localhost:3001 di browser dan mulai pakai aplikasi!

