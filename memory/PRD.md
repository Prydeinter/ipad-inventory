# PRD — AAIIBS iPad Lungsuran System

## Original Problem Statement
Sistem manajemen distribusi iPad untuk Al Azhar International Islamic Boarding School (AAIIBS) dengan metode "lungsuran" (hand-me-down). iPad baru (Gen 10, 256GB) dibeli sekolah dan didistribusi ke guru senior/wali kelas; iPad lama mereka dilungsurkan ke guru baru secara berkala. Butuh sistem rapi tapi tertutup (bisa dilihat, tidak bisa diedit), pengisian pakta digital berbasis token/kode, tanda tangan digital, dashboard futuristik dengan chart & trace lengkap, PDF pakta ukuran F4.

## Architecture
- Backend: FastAPI + MongoDB (motor). JWT admin auth (Bearer via localStorage). PDF via reportlab (F4 210x330mm).
- Frontend: React 19 + Tailwind + shadcn/ui, recharts, framer-motion, react-signature-canvas.
- Theme: "Institutional Futurism" — navy #002D62 + cyan glow, Outfit/Plus Jakarta Sans/JetBrains Mono.

## User Personas
1. Admin (pengelola/Koordinator Digital) — login password, kelola iPad, generate kode, lihat semua pakta.
2. Guru/Karyawan — tanpa login, isi pakta via kode aktif, tanda tangan, download PDF.
3. Publik — lihat dashboard read-only & trace lungsuran.

## Core Requirements (static)
- Trace berbasis serial number (rantai kepemilikan otomatis dari pakta).
- Kode akses singkat single-use, bisa generate banyak sekaligus (pengisian bersama).
- Pakta permanen (tidak dapat diedit).
- PDF F4, 2 halaman sesuai format resmi + tanda tangan + nama terang.
- Dashboard futuristik dengan chart & trace.

## Implemented (2026-06)
- JWT admin auth (login/me/logout), admin seeding, brute-force lockout.
- iPad CRUD (serial unik, versi, penyimpanan, tahun beli, warna).
- Generate/hapus kode akses (multi), single-use enforcement.
- Token-gated pakta form + tanda tangan digital, submit permanen.
- Public dashboard: stats, bar chart (per tahun), pie (per penyimpanan), registry + trace drawer (timeline lungsuran).
- Pakta detail view + F4 PDF download (reportlab, logo AAIIBS).
- Demo data seeded (5 iPad, rantai lungsuran F9FZ2BBBB04).
- Tested: backend 100% (13/13), frontend 100% (all flows).

## Credentials
Admin: admin@aaiibs.sch.id / AAIIBS@2026 (see /app/memory/test_credentials.md)

## Backlog (P1/P2)
- P1: Export daftar/rekap ke Excel/CSV; filter dashboard per unit (SMP/SMA).
- P1: Notifikasi/histori aktivitas admin.
- P2: Foto kondisi iPad saat serah terima; materai e-sign; masa pinjam & pengembalian.
- P2: Multi-admin roles.

## Next Tasks
- Await user feedback on demo, then prioritize backlog.
