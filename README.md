# AAIIBS iPad Lungsuran System

Sistem manajemen distribusi & pelacakan iPad milik **Al Azhar International Islamic Boarding School (AAIIBS)** dengan metode _lungsuran_ (hand-me-down).

> iPad baru dibagikan ke guru senior. iPad lama mereka diturunkan ke guru berikutnya. Setiap perpindahan direkam via **pakta digital ber-tanda tangan** + menghasilkan **PDF ukuran F4** yang bisa diarsipkan.

---

## 🚀 Deploy: Vercel + MongoDB Atlas (GRATIS)

Hanya **2 layanan gratis** yang dibutuhkan — tanpa kartu kredit:

```
┌────────────────────────────────────────────┐
│              VERCEL (SATU DOMAIN)          │
│                                            │
│   /            → React frontend (static)   │
│   /api/*       → FastAPI serverless        │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  MongoDB Atlas (M0)  │
        │  Free 512MB cloud DB │
        └──────────────────────┘
```

**Zero CORS issue** karena backend & frontend satu domain. Auto-deploy dari GitHub. Panduan lengkap: **[DEPLOY.md](./DEPLOY.md)**.

---

## 🧩 Fitur

### Admin (perlu login)
- Kelola master iPad (serial, versi, storage, tahun beli, warna, catatan)
- Import massal iPad via Excel (`.xlsx`)
- Generate **kode akses** single-use — per iPad atau batch banyak sekaligus
- Lihat & hapus kode aktif / kode terpakai
- Lihat seluruh riwayat pakta

### Guru / Karyawan (tanpa login)
- Masukkan **kode akses** yang diberikan admin
- Isi identitas (nama, NIK, jabatan, unit, tanggal peminjaman)
- Tanda tangan digital di canvas
- Kode otomatis dinonaktifkan (single-use) setelah submit
- Download **PDF F4** dengan logo AAIIBS + peraturan lengkap

### Publik (tanpa login)
- Dashboard statistik: total iPad, jumlah pakta, iPad tersedia, jumlah lungsuran, kode aktif
- Chart per tahun beli, per storage, per versi
- Registry iPad + **trace lungsuran** (rantai kepemilikan berdasarkan serial number)

---

## 📁 Struktur Repo

```
/
├── api/                     ← Backend serverless untuk Vercel
│   ├── index.py             ← FastAPI app (semua endpoint /api/*)
│   ├── pdf_pakta.py         ← Generator PDF F4 (reportlab)
│   ├── requirements.txt     ← Python deps
│   └── assets/logo.png      ← Logo untuk PDF
│
├── backend/                 ← Copy untuk dev lokal (Emergent supervisor)
│   ├── server.py            ← Sama dengan api/index.py
│   ├── pdf_pakta.py
│   └── requirements.txt
│
├── frontend/                ← React 19 + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── pages/           ← Home, Admin, Login, Pakta, Trace
│   │   ├── components/      ← UI (shadcn) + custom
│   │   ├── context/         ← AuthContext
│   │   └── lib/api.js       ← axios client (auto-detect base URL)
│   ├── public/logo-*.png
│   └── package.json
│
├── vercel.json              ← Config Vercel (build + routing)
├── DEPLOY.md                ← Panduan deploy A–Z
└── README.md                ← File ini
```

> **Kenapa ada dua folder backend?**
> `api/` untuk **production di Vercel** (serverless).
> `backend/` untuk **dev lokal di Emergent** (long-running uvicorn via supervisor).
> Isinya identik — kalau edit satu, sync ke yang lain.

---

## 🏗️ Arsitektur Teknis

**Frontend** — React 19 + Create React App (CRACO), Tailwind, shadcn/ui, framer-motion, recharts, react-signature-canvas. State via React Query + Context.

**Backend** — FastAPI + motor (async MongoDB driver). Auth JWT + bcrypt. PDF via reportlab (F4, 210×330mm). Excel import via openpyxl.

**Database** — MongoDB. Koleksi: `users`, `ipads`, `codes`, `paktas`, `login_attempts`.

**API routes** (semua prefix `/api`):

| Group | Endpoint | Auth |
|---|---|---|
| Auth | `POST /auth/login` `GET /auth/me` `POST /auth/logout` | ✋ Public / JWT |
| Admin iPad | `POST/PUT/DELETE/GET /admin/ipads*` + `/admin/ipads/template` + `/admin/ipads/bulk` | 🔒 JWT |
| Admin Code | `POST /admin/codes` `POST /admin/codes/batch` `GET/DELETE /admin/codes*` | 🔒 JWT |
| Admin Pakta | `GET /admin/paktas` | 🔒 JWT |
| Public Pakta | `POST /codes/validate` `POST /pakta/submit` `GET /pakta/{id}` `GET /pakta/{id}/pdf` | ✋ Public |
| Public Dashboard | `GET /public/ipads` `GET /public/trace/{serial}` `GET /public/stats` | ✋ Public |

---

## ⚙️ Environment Variables

Set di **Vercel Dashboard → Settings → Environment Variables**:

| Key | Value | Contoh |
|---|---|---|
| `MONGO_URL` | Connection string MongoDB Atlas | `mongodb+srv://user:pass@cluster.xxx.mongodb.net/?retryWrites=true` |
| `DB_NAME` | Nama database | `aaiibs_ipad` |
| `JWT_SECRET` | Random string 32+ karakter | `aaiibs-super-secret-random-xyz-2026` |
| `ADMIN_EMAIL` | Email admin default | `admin@aaiibs.sch.id` |
| `ADMIN_PASSWORD` | Password admin default | `AAIIBS@2026` |

> ⚠️ **JANGAN set** `REACT_APP_BACKEND_URL` di Vercel — dikosongkan biar frontend pakai relative `/api/*` ke domain yang sama.

---

## 🛠️ Development Lokal

```bash
# Backend (di terminal 1)
cd backend
pip install -r requirements.txt
# buat file .env dengan MONGO_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
uvicorn server:app --reload --port 8001

# Frontend (di terminal 2)
cd frontend
yarn install
yarn start   # buka http://localhost:3000
```

Frontend memanggil `http://localhost:8001/api/*` (jika `REACT_APP_BACKEND_URL` diset di `frontend/.env`).

---

## 🔐 Default Admin

- Email: `admin@aaiibs.sch.id`
- Password: `AAIIBS@2026`

Otomatis di-seed saat backend pertama kali start (cek `ensure_seed()` di `api/index.py`).

---

## 📄 Lisensi

Internal AAIIBS. Silakan hubungi pengelola untuk penggunaan di luar sekolah.
