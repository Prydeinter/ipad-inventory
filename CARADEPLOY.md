# Cara Deploy AAIIBS iPad Lungsuran System

Halo mas, panduan ini akan menuntun mas dari nol sampai aplikasi berjalan online. Semua layanan gratis, tanpa perlu kartu kredit. Total waktu sekitar 30 menit.

Yang akan mas siapkan hanya tiga hal:

1. Akun MongoDB Atlas untuk database
2. Akun GitHub untuk menyimpan kode
3. Akun Vercel untuk menjalankan aplikasi

Ikuti urutannya. Jangan loncat, karena tiap langkah bergantung pada langkah sebelumnya.

---

## Bagian 1. Menyiapkan Database di MongoDB Atlas

Database ini yang akan menyimpan data iPad, kode akses, pakta, dan admin. MongoDB Atlas memberikan tier gratis 512 MB yang cukup untuk ratusan iPad dan ribuan pakta.

### Langkah 1.1. Buat Akun MongoDB Atlas

Buka https://cloud.mongodb.com lalu klik Sign Up. Mas bisa daftar pakai akun Google supaya lebih cepat. Setelah masuk, MongoDB Atlas akan otomatis memandu mas membuat organization dan project pertama. Nama bebas, misal Dyo's Org dan Project 0.

### Langkah 1.2. Buat Cluster Database

Setelah masuk dashboard, mas akan melihat pilihan tipe cluster. Pilih M0 FREE. Ini yang gratis selamanya. Region pilih yang paling dekat dengan lokasi mas, misal Singapore atau Jakarta. Nama cluster bebas, misal DyoDevAlzhar. Klik Create Deployment.

Proses pembuatan cluster butuh sekitar 3 menit. Sambil menunggu, MongoDB Atlas akan langsung minta mas membuat user database. Lanjut ke langkah berikutnya.

### Langkah 1.3. Buat User Database

Di menu kiri klik Database Access, lalu Add New Database User.

Untuk metode autentikasi pilih Password. Isikan:

- Username: aaiibs (atau bebas, tapi catat)
- Password: klik tombol Autogenerate Secure Password, lalu klik Show untuk melihat password yang dihasilkan. COPY password ini ke Notepad dan simpan. Kalau hilang mas harus reset ulang.
- Database User Privileges: pilih Read and write to any database

Klik Add User. Tunggu status hijau Active.

Penting: Jangan pakai password yang mengandung simbol seperti @, /, :, ? karena bisa bikin connection string bermasalah. Autogenerate biasanya aman karena pakai kombinasi huruf dan angka.

### Langkah 1.4. Izinkan Akses dari Vercel

Vercel menjalankan aplikasi mas dari server-server yang IP-nya berubah-ubah. Jadi mas harus mengizinkan akses dari semua IP.

Di menu kiri klik Network Access, lalu Add IP Address. Klik tombol Allow Access from Anywhere. IP akan otomatis terisi 0.0.0.0/0. Beri comment "Vercel serverless" biar tidak lupa. JANGAN centang opsi "This entry is temporary" karena akan otomatis hilang setelah waktu tertentu. Klik Confirm.

Tunggu status jadi hijau Active, sekitar 30 detik.

Ini aman karena database tetap terkunci oleh username dan password yang tadi mas buat.

### Langkah 1.5. Ambil Connection String

Kembali ke menu Database, lalu klik tombol Connect di cluster mas. Pilih Drivers pada opsi metode koneksi. Akan muncul connection string seperti ini:

```
mongodb+srv://aaiibs:<db_password>@dyodevalzhar.qzigdhk.mongodb.net/?appName=DyoDevAlzhar
```

Copy string tersebut. Simpan di Notepad. Nanti mas harus mengganti `<db_password>` dengan password beneran yang tadi mas simpan. Hasilnya harus seperti ini (tanpa tanda kurung siku):

```
mongodb+srv://aaiibs:passwordAsliMas@dyodevalzhar.qzigdhk.mongodb.net/?appName=DyoDevAlzhar
```

Klik Done untuk menutup popup. Bagian MongoDB selesai.

---

## Bagian 2. Menyiapkan Kode di GitHub

Kalau mas sudah punya repo di GitHub, langsung ke Bagian 3. Kalau belum, ikuti langkah berikut.

### Langkah 2.1. Push Kode ke GitHub

Pastikan mas sudah punya akun GitHub. Buat repository baru di https://github.com/new. Beri nama bebas misal ipad-inventory, biarkan Public atau Private terserah mas, JANGAN centang opsi initialize dengan README karena repo mas sudah punya file sendiri.

Setelah repo dibuat, dari terminal komputer mas jalankan:

```
cd /path/ke/folder/proyek
git init
git add .
git commit -m "initial deploy setup"
git branch -M main
git remote add origin https://github.com/USERNAME_MAS/NAMA_REPO.git
git push -u origin main
```

Ganti USERNAME_MAS dan NAMA_REPO sesuai punya mas.

Kalau repo mas sudah ada isi, cukup pastikan file-file berikut sudah masuk:

- Folder api dengan index.py, pdf_pakta.py, requirements.txt, dan assets/logo.png
- Folder frontend dengan seluruh source React
- File vercel.json di root
- File .gitignore

---

## Bagian 3. Deploy ke Vercel

### Langkah 3.1. Buat Akun Vercel

Buka https://vercel.com/signup. Login pakai akun GitHub mas supaya nanti Vercel bisa langsung baca repo mas tanpa perlu setting tambahan.

### Langkah 3.2. Import Repository

Di dashboard Vercel klik Add New, lalu Project. Vercel akan menampilkan daftar repo GitHub mas. Cari repo ipad-inventory (atau nama yang mas kasih) lalu klik Import.

Kalau repo mas tidak muncul, klik Adjust GitHub App Permissions, lalu berikan akses ke repo tersebut.

### Langkah 3.3. Konfigurasi Project

Di halaman Configure Project, isi seperti ini:

- Project Name: bebas, misal aaiibs-ipad
- Framework Preset: pilih Other. JANGAN pilih Create React App, karena struktur project mas gabungan frontend + backend.
- Root Directory: biarkan default (titik / root), JANGAN diubah ke frontend.
- Build and Output Settings: biarkan default, karena semua config sudah ada di vercel.json.

### Langkah 3.4. Isi Environment Variables

Ini bagian paling penting. Ekspand section Environment Variables, lalu tambahkan lima variable berikut satu per satu:

Variable pertama:
- Key: MONGO_URL
- Value: connection string MongoDB yang tadi mas siapkan, dengan password beneran, contoh: `mongodb+srv://aaiibs:passwordAsliMas@dyodevalzhar.qzigdhk.mongodb.net/?appName=DyoDevAlzhar`

Variable kedua:
- Key: DB_NAME
- Value: aaiibs_ipad

Variable ketiga:
- Key: JWT_SECRET
- Value: string random panjang, contoh: aaiibs-secret-2026-ganti-string-ini-jadi-lebih-panjang-xyz. Semakin panjang dan random semakin aman.

Variable keempat:
- Key: ADMIN_EMAIL
- Value: admin@aaiibs.sch.id (atau email admin sekolah lain)

Variable kelima:
- Key: ADMIN_PASSWORD
- Value: password admin default, misal AAIIBS@2026. Password ini yang mas pakai untuk login pertama kali.

Penting: JANGAN menambahkan variable REACT_APP_BACKEND_URL. Frontend akan otomatis memanggil backend di domain yang sama.

### Langkah 3.5. Klik Deploy

Setelah semua environment variable terisi, klik tombol Deploy. Vercel akan mulai proses build. Tunggu sekitar 3 sampai 5 menit.

Kalau berhasil, mas akan diarahkan ke halaman Congratulations dengan preview aplikasi. URL aplikasi mas akan seperti https://aaiibs-ipad.vercel.app atau nama serupa.

---

## Bagian 4. Verifikasi Aplikasi Berjalan

### Langkah 4.1. Cek Backend Health

Buka di browser: https://URL-APLIKASI-MAS.vercel.app/api/health

Kalau muncul JSON seperti ini berarti backend jalan:

```
{"status":"ok","env":{"MONGO_URL":"SET","DB_NAME":"aaiibs_ipad","JWT_SECRET":"SET","ADMIN_EMAIL":"SET","ADMIN_PASSWORD":"SET"}}
```

Kalau ada MISSING artinya ada environment variable yang belum diisi. Kembali ke Vercel Settings dan cek.

### Langkah 4.2. Cek Koneksi Database

Buka: https://URL-APLIKASI-MAS.vercel.app/api/health/db

Kalau muncul `{"status":"ok","db":"aaiibs_ipad","mongodb":"connected"}` berarti MongoDB Atlas terhubung.

Kalau error, kemungkinan besar:
- Password di MONGO_URL salah paste
- Network Access di Atlas belum 0.0.0.0/0
- Format connection string masih ada tanda `<>` yang belum diganti

### Langkah 4.3. Test Login Admin

Buka aplikasi mas dari halaman utama. Klik tombol Admin di kanan atas, lalu masukkan:

- Email: admin@aaiibs.sch.id (sesuai ADMIN_EMAIL yang mas set)
- Password: AAIIBS@2026 (sesuai ADMIN_PASSWORD yang mas set)

Klik Masuk. Kalau berhasil, mas langsung masuk ke halaman dashboard admin.

### Langkah 4.4. Test Flow End-to-End

Setelah masuk dashboard admin, coba flow lengkap:

1. Tambah 1 iPad baru dengan data dummy
2. Generate 1 kode akses untuk iPad tersebut
3. Copy kode yang muncul
4. Buka tab browser baru, kunjungi https://URL-APLIKASI-MAS.vercel.app/pakta
5. Masukkan kode akses tadi
6. Isi form (nama, NIK, jabatan, unit, tanggal), lalu tanda tangan di kotak signature
7. Klik Submit
8. Coba download PDF pakta yang muncul

Kalau semua langkah di atas sukses, aplikasi mas resmi hidup dan siap dipakai.

---

## Bagian 5. Update Aplikasi ke Depannya

Setelah setup selesai, setiap kali mas mau update aplikasi, cukup edit kode di komputer mas lalu:

```
git add .
git commit -m "keterangan perubahan"
git push origin main
```

Vercel akan otomatis rebuild dan redeploy dalam 2 sampai 3 menit. Tidak perlu setting apa-apa lagi.

Kalau mas mau ganti environment variable (misal ganti password admin), masuk ke Vercel Dashboard, pilih project, klik Settings, Environment Variables, edit value yang mau diubah, lalu klik Redeploy dari tab Deployments untuk apply perubahan.

---

## Bagian 6. Kalau Ada Masalah

### Deploy Vercel error "Project framework is set to services, but no services are declared"

Ini terjadi kalau repo mas sebelumnya pernah pakai template Emergent, dan Vercel menyimpan setting framework sebagai "services" (bukan format Vercel resmi).

Fix:

1. Pastikan file vercel.json di repo mas sudah versi terbaru (yang punya key buildCommand, functions, dan rewrites, BUKAN key services)
2. Kalau vercel.json sudah benar tapi error tetap muncul, itu artinya Vercel cache setting project lama. Buka Vercel Dashboard, pilih project yang error, masuk Settings, General, cari section Framework Preset, ganti dari services ke Other, klik Save
3. Balik ke tab Deployments, klik menu tiga titik di deployment paling atas, klik Redeploy

Setelah redeploy, error harusnya hilang dan deploy sukses.

### Login gagal dengan pesan "Terjadi kesalahan"

Cek dulu /api/health dan /api/health/db seperti di Langkah 4.1 dan 4.2. Biasanya ini bermasalah karena environment variable salah atau MongoDB tidak terhubung.

### PDF tidak muncul, error 500

Buka Vercel Dashboard, klik project mas, klik tab Logs. Lihat error yang muncul saat request PDF. Biasanya karena file logo tidak ke-bundle. Pastikan folder api/assets/logo.png ada di repo mas.

### Semua endpoint balik 500 setelah update kode

Kemungkinan ada dependency baru yang tidak compatible. Cek Vercel Logs untuk pesan error import. Kalau perlu rollback, di tab Deployments klik deployment yang terakhir berhasil lalu klik Promote to Production.

### MongoDB Atlas terlihat pakai storage besar (misal 100+ MB) padahal fresh

Kemungkinan mas tak sengaja klik Load Sample Data saat pertama masuk Atlas. Buka Browse Collections di Atlas, lalu hapus database yang namanya sample_mflix, sample_airbnb, dan sejenisnya. Sisakan hanya database aaiibs_ipad.

### Cold start pertama kali lambat sekitar 3 detik

Ini normal untuk serverless. Setelah request pertama, function akan warm dan cepat. Aplikasi sekolah dengan traffic rendah akan sering cold start, tapi tetap responsif.

---

## Bagian 7. Ganti Password Admin

Password admin yang mas set di ADMIN_PASSWORD otomatis di-seed ke database saat backend pertama kali start. Kalau nanti mas mau ganti:

1. Buka Vercel Dashboard, Settings, Environment Variables
2. Edit ADMIN_PASSWORD, isi password baru
3. Buka tab Deployments, klik menu tiga titik di deployment terakhir, klik Redeploy
4. Setelah redeploy selesai, password admin otomatis update

---

## Bagian 8. Custom Domain (Opsional)

Kalau mas mau URL profesional seperti pakta.aaiibs.sch.id, bukan yang default .vercel.app:

1. Beli domain (misal di Niagahoster atau Cloudflare Registrar)
2. Di Vercel Dashboard, buka Settings, Domains
3. Ketik domain yang mau mas pakai, klik Add
4. Vercel akan kasih instruksi DNS record yang harus mas tambahkan di penyedia domain
5. Setelah propagasi DNS (bisa 1 jam sampai 24 jam), domain siap dipakai

Vercel otomatis kasih HTTPS gratis via Let's Encrypt.

---

Sampai di sini semua sudah selesai mas. Aplikasi AAIIBS iPad Lungsuran System siap dipakai untuk mengelola distribusi iPad guru sekolah. Kalau ada pertanyaan atau kendala, cek dulu bagian troubleshooting, atau balik ke chat ini untuk saya bantu lebih lanjut.

Selamat mencoba mas.
