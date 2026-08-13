# 🚀 Panduan Deploy — AAIIBS iPad Lungsuran

**Vercel (frontend + backend) + MongoDB Atlas (database)** — semua GRATIS tanpa kartu kredit.

Satu domain, tanpa CORS issue, deploy sekali klik dari GitHub. 🎯

---

## 📝 Prasyarat
- GitHub repo (Anda sudah punya)
- MongoDB Atlas cluster + user + IP `0.0.0.0/0` ✅ sudah selesai
- Akun Vercel gratis → https://vercel.com

---

## 1️⃣ MongoDB Atlas ✅ SUDAH SIAP

Connection string Anda:
```
mongodb+srv://<username>:<password>@dyodevalzhar.qzigdhk.mongodb.net/?appName=DyoDevAlzhar
```
Ganti `<username>` & `<password>` dengan value beneran (tanpa `<>`).

---

## 2️⃣ Struktur Repo untuk Vercel

```
/
├── api/                  ← Backend serverless (FastAPI)
│   ├── index.py          ← Entry point Vercel Python
│   ├── pdf_pakta.py      ← Generator PDF F4
│   ├── requirements.txt  ← Dependency Python
│   └── assets/
│       └── logo.png      ← Logo untuk PDF
├── frontend/             ← React app
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/              ← (untuk dev lokal Emergent, tidak di-deploy Vercel)
└── vercel.json           ← Konfigurasi Vercel
```

---

## 3️⃣ Deploy ke Vercel (5 menit)

### Kalau sebelumnya sudah ada project Vercel yang bermasalah:
1. Buka Vercel dashboard → project lama → **Settings** → **Delete Project** (atau abaikan saja)
2. Buat baru ⬇️

### Setup baru:
1. https://vercel.com/new → **Import** repo GitHub Anda
2. **Configure Project** — setting berikut:
   - **Project Name**: bebas, misal `aaiibs-ipad`
   - **Framework Preset**: **Other** (JANGAN pilih Create React App)
   - **Root Directory**: **`.`** (root, JANGAN diubah ke frontend)
   - **Build and Output Settings**: biarkan default (di-override oleh `vercel.json`)

3. **Environment Variables** — klik expand, tambah 5 variabel:

   | Key | Value |
   |---|---|
   | `MONGO_URL` | `mongodb+srv://user:pass@dyodevalzhar.qzigdhk.mongodb.net/...` (yang lengkap) |
   | `DB_NAME` | `aaiibs_ipad` |
   | `JWT_SECRET` | random string panjang, misal: `aaiibs-jwt-secret-2026-ganti-string-random-xyzabcdefgh` |
   | `ADMIN_EMAIL` | `admin@aaiibs.sch.id` |
   | `ADMIN_PASSWORD` | `AAIIBS@2026` |

   > ⚠️ **JANGAN set** `REACT_APP_BACKEND_URL` — dikosongkan biar frontend pakai relative `/api/*` ke domain yang sama.

4. Klik **Deploy** → tunggu ~5 menit (build React + Python function)

5. Selesai! Buka URL: `https://aaiibs-ipad-xxx.vercel.app`

---

## ✅ Test End-to-End

1. Buka URL Vercel Anda
2. Klik **Admin** → login `admin@aaiibs.sch.id` / `AAIIBS@2026`
3. Tambah 1 iPad → generate kode akses
4. Buka tab baru → `/pakta` → masukkan kode → isi + tanda tangan → Submit
5. Download PDF — harus keluar file F4 dengan logo

Kalau berhasil → **DEPLOY SUKSES** 🎉

---

## 🔄 Update Ke Depan

Setiap `git push` ke branch `main`:
- Vercel auto rebuild frontend + backend
- Total waktu: ~3-5 menit

Tidak perlu setting apa-apa lagi.

---

## ⚠️ Batasan yang Perlu Diketahui (Vercel Hobby Free)

| Aspek | Limit | Impact |
|---|---|---|
| Timeout per request | 60 detik | Cukup untuk semua fitur, kecuali bulk import Excel >200 baris |
| Memory function | 1024 MB | Aman |
| Bandwidth | 100 GB/bulan | Aman untuk skala sekolah |
| Cold start | ~1-3 detik | Setelah idle beberapa menit |
| Serverless invocations | 100k/bulan | Aman |

**Untuk AAIIBS (traffic rendah, ratusan iPad, puluhan guru)** — semua limit ini jauh dari tercapai. ✅

---

## 🆘 Troubleshooting

### Build error: "Module not found: pdf_pakta"
- Pastikan `api/pdf_pakta.py` ada di git repo
- Cek `git ls-files api/`

### Build error: "logo.png not found" saat generate PDF
- Pastikan `api/assets/logo.png` di-commit ke git
- Cek vercel.json ada `"includeFiles": "api/assets/**"`

### 500 Internal Server Error saat login
- Cek Vercel dashboard → project → **Logs** tab
- Kemungkinan `MONGO_URL` salah / masih ada `<db_password>` placeholder

### "Authentication failed" ke MongoDB
- Password Atlas ada karakter spesial (`@:/`) yang perlu URL-encode
- Solusi: generate password baru tanpa simbol di MongoDB Atlas → update `MONGO_URL` di Vercel env → Redeploy

### Frontend loading tapi API 404
- Cek `vercel.json` → pastikan ada `rewrites` untuk `/api/:path*`
- Redeploy setelah update `vercel.json`

### Login berhasil tapi refresh langsung logout
- Cookie `access_token` gagal terset
- Biasanya karena browser blok third-party cookie (harusnya tidak masalah karena same-domain di Vercel)
- Cek Application → Cookies di DevTools

### PDF error 500
- Cek Vercel logs
- Kemungkinan `logo.png` tidak ke-bundle → pastikan `includeFiles` di vercel.json
- Atau reportlab crash → cek deps version di `api/requirements.txt`

---

## 💡 Kenapa Struktur Ini?

**Vercel Python** butuh folder `api/` di root repo dengan file `.py` sebagai serverless function.

- `api/index.py` → di-treat sebagai satu function
- `vercel.json` rewrite semua `/api/*` → `/api/index` biar FastAPI internal router yang handle
- Frontend build ke `frontend/build/` → di-serve sebagai static
- Assets (`logo.png`) di-bundle via `includeFiles`

**Folder `backend/`** tetap dipertahankan untuk **dev lokal di Emergent** (yang pakai supervisor). Kalau edit backend, sync file dari `backend/server.py` ke `api/index.py` (atau sebaliknya).

---

## 🎯 Ringkasan

```
GitHub push  →  Vercel auto-deploy  →  Live di https://xxx.vercel.app
                        ↓
                MongoDB Atlas (data)
```

Update env vars kapan pun di Vercel dashboard → auto re-deploy.

Good luck! 🚀
