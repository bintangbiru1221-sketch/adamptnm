# Multi Gmail Broadcast - UI Prototype

Frontend-only prototype (Next.js App Router + TypeScript + Tailwind CSS), mobile-first, dummy data - sesuai gaya visual referensi yang diberikan (monokrom, kartu lembut, bottom nav).

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000 - paling baik dilihat dalam lebar mobile (~ 390px) atau lewat device toolbar di browser.

## Struktur halaman

- `/` - Dashboard (statistik, progress campaign, recent activity, subscription status)
- `/contacts` - Contact management (upload CSV, search, list, pagination)
- `/campaigns` - Campaign list + progress bar + estimated completion + campaign logs
- `/sender-accounts` - Daftar Gmail terhubung, status kuota, reconnect/hapus
- `/billing` - Plan saat ini + perbandingan paket Trial/Basic/Pro

## Catatan

Ini adalah prototipe tampilan (UI shell) dengan data dummy di `lib/data.ts`. Belum ada autentikasi, OAuth Gmail, database, atau pengiriman email sungguhan - sesuai cakupan yang diminta (UI/Frontend saja).
