# 🎟️ TicketFlow — Web App Ticketing (Portofolio Project)

> **Stack**: Vue.js 3 (Composition API) + Express.js + MySQL/PostgreSQL  
> **Tipe Proyek**: Full-Stack Web Application (Portofolio)  
> **Target Pengguna**: Event organizer, peserta acara, dan admin pengelola

---

## 📌 Deskripsi Aplikasi

**TicketFlow** adalah platform manajemen tiket berbasis web yang memungkinkan pengguna untuk menjelajahi, membeli, dan mengelola tiket untuk berbagai jenis acara — mulai dari konser musik, seminar, festival, hingga pertandingan olahraga.

Aplikasi ini dibangun menggunakan **Vue.js 3** (dengan Composition API & Pinia untuk state management) pada sisi frontend, dan **Express.js** dengan **REST API** pada sisi backend. Sistem autentikasi menggunakan **JWT (JSON Web Token)** untuk keamanan akses data.

TicketFlow dirancang sebagai solusi end-to-end bagi penyelenggara acara (**Event Organizer**) untuk membuat dan memanajemen event, serta bagi **pengguna umum** untuk mencari dan membeli tiket dengan mudah. Admin platform memiliki akses penuh untuk mengawasi seluruh sistem.

---

## 👥 Tiga Role Pengguna

| Role | Deskripsi |
|---|---|
| 🛡️ **Admin** | Superuser — mengelola seluruh sistem, user, event, dan laporan |
| 🎪 **Event Organizer (EO)** | Membuat & mengelola event, melihat laporan penjualan tiket |
| 🧑 **User / Pembeli** | Menelusuri event, membeli tiket, melihat riwayat transaksi |

---

## 🗂️ Struktur Menu & Halaman

### 🌐 Halaman Publik (Tanpa Login)

#### 1. **Landing Page (`/`)**
- Hero section dengan animasi dan tagline utama
- Highlight event unggulan (featured events carousel)
- Kategori event (Musik, Seminar, Festival, Olahraga, dll.)
- Search bar pencarian event cepat
- Testimoni pengguna
- CTA (Call to Action) daftar / login

#### 2. **Halaman Daftar Event (`/events`)**
- Grid/list semua event yang tersedia
- Filter berdasarkan: kategori, kota/lokasi, tanggal, harga, status
- Sort: terbaru, terpopuler, termurah, termahal
- Pagination / infinite scroll
- Card event menampilkan: nama, tanggal, lokasi, harga mulai dari, sisa tiket

#### 3. **Halaman Detail Event (`/events/:id`)**
- Banner dan galeri foto event
- Informasi lengkap: deskripsi, tanggal, lokasi (dengan Google Maps embed), penyelenggara
- Pilihan kategori tiket (VIP, Regular, VVIP, dll.) dengan harga dan stok
- Countdown timer menuju hari H event
- Tombol **Beli Tiket** (redirect ke login jika belum login)
- Bagian ulasan & rating dari peserta sebelumnya

#### 4. **Halaman Login (`/login`)**
- Form email + password
- Link ke halaman register
- Opsi lupa password

#### 5. **Halaman Register (`/register`)**
- Form registrasi: nama lengkap, email, password, konfirmasi password, no. HP
- Pilihan role: User atau Event Organizer
- Verifikasi email (opsional)

#### 6. **Halaman Forgot Password (`/forgot-password`)**
- Input email → kirim link reset via email

---

### 👤 Dashboard User / Pembeli (`/dashboard/user`)

#### 7. **My Tickets (Tiket Saya)**
- Daftar semua tiket yang dibeli
- Status tiket: `Aktif`, `Digunakan`, `Kadaluarsa`, `Dibatalkan`
- Tombol **Unduh Tiket PDF / QR Code**
- Filter berdasarkan status & tanggal

#### 8. **Detail Tiket**
- QR Code unik untuk check-in di lokasi
- Detail event & kursi/kategori tiket
- Barcode atau kode unik tiket
- Tombol download & bagikan tiket

#### 9. **Riwayat Transaksi**
- Semua riwayat pembayaran
- Status: `Pending`, `Berhasil`, `Gagal`, `Refund`
- Detail invoice per transaksi
- Tombol download invoice PDF

#### 10. **Proses Pembelian Tiket (`/checkout`)**
- Pilih jumlah tiket per kategori
- Form data pemegang tiket (nama, email, no. identitas)
- Ringkasan pesanan
- Metode pembayaran: Transfer Bank, QRIS, Kartu Kredit, E-Wallet (Gopay, OVO, Dana)
- Konfirmasi & redirect ke halaman sukses

#### 11. **Halaman Sukses Pembayaran (`/payment/success`)**
- Pesan konfirmasi
- Ringkasan tiket yang dibeli
- Tombol lihat tiket & kembali ke beranda

#### 12. **Profil Pengguna (`/profile`)**
- Edit nama, foto profil, nomor HP
- Ganti password
- Riwayat email terdaftar

---

### 🎪 Dashboard Event Organizer (`/dashboard/organizer`)

#### 13. **Overview / Beranda EO**
- Statistik ringkasan: total event, total tiket terjual, total pendapatan
- Grafik penjualan per minggu / bulan (Chart.js / ApexCharts)
- Event terbaru & event mendatang

#### 14. **Manajemen Event**
- Daftar semua event milik EO
- Status event: `Draft`, `Published`, `Ongoing`, `Selesai`, `Dibatalkan`
- Tombol: Buat Event, Edit, Hapus, Publikasi, Batalkan

#### 15. **Form Buat / Edit Event**
- Nama event, deskripsi (rich text editor)
- Kategori event
- Tanggal & waktu mulai / selesai
- Lokasi (nama venue + alamat + koordinat maps)
- Upload banner & foto galeri
- Pengaturan kategori tiket:
  - Nama kategori (VIP, Regular, dll.)
  - Harga per tiket
  - Jumlah stok / kuota
  - Deskripsi keuntungan kategori
  - Tanggal mulai & akhir penjualan tiket

#### 16. **Laporan Penjualan Event**
- Tiket terjual per kategori
- Grafik penjualan harian
- Export laporan ke CSV / Excel
- Daftar peserta lengkap (nama, email, kategori tiket, status pembayaran)

#### 17. **Check-in Peserta**
- Scanner QR Code tiket via kamera perangkat
- Manual input kode tiket
- Tampilan status: Valid / Sudah Digunakan / Tidak Valid
- Histori check-in hari ini

#### 18. **Penarikan Dana (Withdraw)**
- Saldo pendapatan tersedia
- Form ajukan penarikan dana
- Riwayat penarikan & status: `Diproses`, `Berhasil`, `Ditolak`

---

### 🛡️ Dashboard Admin (`/dashboard/admin`)

#### 19. **Overview Admin**
- Total pengguna, EO terdaftar, event aktif, transaksi hari ini
- Grafik pertumbuhan pengguna & transaksi
- Notifikasi sistem

#### 20. **Manajemen Pengguna**
- CRUD semua akun (User & EO)
- Filter & search pengguna
- Suspend / aktifkan akun
- Detail aktivitas pengguna

#### 21. **Manajemen Event (Admin Level)**
- Lihat & moderasi semua event dari semua EO
- Approve / Reject event yang baru dipublish
- Tandai event sebagai Featured (tampil di landing page)
- Hapus event yang melanggar kebijakan

#### 22. **Manajemen Transaksi**
- Semua riwayat transaksi platform
- Filter: status, rentang tanggal, EO, user
- Proses refund manual
- Export laporan keuangan platform

#### 23. **Manajemen Kategori Event**
- CRUD kategori event (Musik, Seminar, dll.)
- Upload ikon kategori

#### 24. **Manajemen Penarikan Dana EO**
- Daftar pengajuan penarikan dana dari EO
- Approve / Reject penarikan
- Catatan / alasan penolakan

#### 25. **Pengaturan Sistem**
- Konfigurasi komisi platform (%)
- Pengaturan metode pembayaran aktif
- Manajemen banner/slider homepage
- Pengaturan email notifikasi (template)

---

## ⚙️ Fitur & Fungsionalitas Utama

### 🔐 Autentikasi & Otorisasi
- Registrasi & Login dengan JWT
- Role-based access control (RBAC): Admin, EO, User
- Middleware proteksi route di Express.js
- Route guard di Vue Router (Navigation Guard)
- Refresh token & auto-logout sesi

### 🔍 Pencarian & Filter Event
- Full-text search berdasarkan nama event
- Filter multi-kriteria: kategori, kota, tanggal, harga, ketersediaan tiket
- Sorting fleksibel
- Hasil pencarian real-time (debounce search)

### 🛒 Sistem Pembelian Tiket
- Pemilihan kategori & jumlah tiket
- Pengisian data pemegang tiket
- Lock stok tiket sementara selama proses checkout (expire dalam 10-15 menit)
- Integrasi payment gateway (simulasi atau Midtrans/Xendit sandbox)
- Konfirmasi pembayaran otomatis via webhook

### 🎟️ Generasi Tiket Digital
- QR Code unik per tiket (generated dengan library `qrcode`)
- Download tiket format PDF (menggunakan `PDFKit` atau `jsPDF`)
- Kode booking unik
- Email konfirmasi tiket otomatis (Nodemailer)

### 📊 Dashboard & Laporan
- Visualisasi data dengan grafik interaktif (Chart.js / ApexCharts)
- Statistik real-time penjualan untuk EO
- Export data CSV/Excel untuk EO dan Admin
- Laporan keuangan platform untuk Admin

### 📱 Desain Responsif
- Mobile-first design
- Optimasi tampilan untuk tablet dan desktop
- PWA-ready (Progressive Web App) — opsional

### 🔔 Notifikasi
- Notifikasi in-app (toast/bell notification)
- Email notifikasi: konfirmasi pembelian, pengingat event, reset password
- Notifikasi status penarikan dana untuk EO

### 🔒 Keamanan
- Input validation (frontend & backend)
- Rate limiting pada API (express-rate-limit)
- Helmet.js untuk HTTP security headers
- SQL injection prevention (ORM: Sequelize / Prisma)
- XSS protection
- CORS configuration

---

## 🛠️ Tech Stack Detail

### Frontend (Vue.js 3)
| Teknologi | Kegunaan |
|---|---|
| Vue.js 3 (Composition API) | Framework utama frontend |
| Vue Router 4 | Client-side routing & navigation guards |
| Pinia | State management global (auth, cart, user) |
| Axios | HTTP client untuk konsumsi REST API |
| Vite | Build tool & dev server cepat |
| Chart.js / ApexCharts | Visualisasi data grafik |
| VueUse | Komposabel utilitas Vue (debounce, dll.) |
| Vue-qrcode / qrcode.vue | Generate QR Code tiket |
| jsPDF + html2canvas | Generate PDF tiket di browser |
| SweetAlert2 / Vue Toastification | Notifikasi & alert UI |

### Backend (Express.js)
| Teknologi | Kegunaan |
|---|---|
| Node.js + Express.js | Server & REST API |
| Sequelize ORM / Prisma | ORM untuk interaksi database |
| MySQL / PostgreSQL | Database relasional utama |
| JWT (jsonwebtoken) | Autentikasi stateless |
| Bcrypt.js | Hashing password |
| Multer | Upload file (banner, foto, dll.) |
| Nodemailer | Kirim email notifikasi |
| PDFKit | Generate PDF tiket di server |
| QRCode (npm) | Generate QR Code tiket |
| Midtrans / Xendit SDK | Integrasi payment gateway |
| Express Rate Limit | Pembatasan request API |
| Helmet.js | HTTP security headers |
| CORS | Cross-Origin Resource Sharing |
| Morgan | HTTP request logger |
| Dotenv | Manajemen environment variable |

### Infrastruktur & DevOps (Opsional untuk Portofolio)
| Teknologi | Kegunaan |
|---|---|
| Docker | Containerization |
| Nginx | Reverse proxy & web server |
| Railway / Render / VPS | Deployment backend |
| Vercel / Netlify | Deployment frontend |
| Cloudinary | CDN penyimpanan gambar/file |
| GitHub Actions | CI/CD pipeline |

---

## 🗃️ Struktur Database (ERD Ringkas)

### Tabel Utama

```
users
├── id (PK)
├── name
├── email (UNIQUE)
├── password (hashed)
├── phone
├── role (ENUM: admin, organizer, user)
├── avatar
├── is_active
└── timestamps

events
├── id (PK)
├── organizer_id (FK → users)
├── category_id (FK → event_categories)
├── title
├── slug (UNIQUE)
├── description
├── venue_name
├── venue_address
├── city
├── latitude, longitude
├── start_date, end_date
├── banner_image
├── status (ENUM: draft, published, ongoing, completed, cancelled)
├── is_featured
└── timestamps

ticket_categories
├── id (PK)
├── event_id (FK → events)
├── name (VIP, Regular, dll.)
├── description
├── price
├── quota
├── sold
├── sale_start, sale_end
└── timestamps

transactions
├── id (PK)
├── user_id (FK → users)
├── booking_code (UNIQUE)
├── total_amount
├── payment_method
├── payment_status (ENUM: pending, paid, failed, refunded)
├── payment_proof
├── paid_at
└── timestamps

transaction_items
├── id (PK)
├── transaction_id (FK → transactions)
├── ticket_category_id (FK → ticket_categories)
├── holder_name
├── holder_email
├── quantity
└── subtotal

tickets
├── id (PK)
├── transaction_item_id (FK → transaction_items)
├── ticket_code (UNIQUE, untuk QR)
├── status (ENUM: active, used, expired, cancelled)
├── checked_in_at
└── timestamps

event_categories
├── id (PK)
├── name
├── icon
└── timestamps

withdrawals
├── id (PK)
├── organizer_id (FK → users)
├── amount
├── bank_name, account_number, account_name
├── status (ENUM: pending, approved, rejected)
├── admin_note
└── timestamps

reviews
├── id (PK)
├── user_id (FK → users)
├── event_id (FK → events)
├── rating (1-5)
├── comment
└── timestamps
```

---

## 📁 Struktur Folder Project

### Frontend (Vue.js)
```
frontend/
├── public/
├── src/
│   ├── assets/           # Gambar, font, ikon
│   ├── components/       # Komponen reusable
│   │   ├── common/       # Navbar, Footer, Modal, dll.
│   │   ├── event/        # EventCard, EventFilter, dll.
│   │   ├── ticket/       # TicketCard, QRCodeDisplay, dll.
│   │   └── dashboard/    # Chart, StatCard, Sidebar, dll.
│   ├── composables/      # Custom composables (useAuth, useEvent, dll.)
│   ├── layouts/          # AuthLayout, DashboardLayout, PublicLayout
│   ├── pages/            # Halaman utama per route
│   │   ├── public/       # Home, Events, EventDetail, Login, Register
│   │   ├── user/         # Dashboard user
│   │   ├── organizer/    # Dashboard EO
│   │   └── admin/        # Dashboard admin
│   ├── router/           # index.js + navigation guards
│   ├── stores/           # Pinia stores (auth, event, cart, notification)
│   ├── services/         # API service layer (axios instances)
│   ├── utils/            # Helper functions
│   └── App.vue
├── .env
└── vite.config.js
```

### Backend (Express.js)
```
backend/
├── src/
│   ├── config/           # Database config, Midtrans config, dll.
│   ├── controllers/      # Logic handler per resource
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── ticketController.js
│   │   ├── transactionController.js
│   │   └── adminController.js
│   ├── middleware/        # Auth middleware, error handler, upload
│   ├── models/           # Sequelize/Prisma models
│   ├── routes/           # Express router per resource
│   ├── services/         # Business logic (email, PDF, QR, payment)
│   ├── utils/            # Helper (response formatter, validator, dll.)
│   └── app.js            # Express app setup
├── uploads/              # Local file storage (atau pakai Cloudinary)
├── .env
└── server.js             # Entry point
```

---

## 🌐 API Endpoint (REST API)

### Auth
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login & dapat JWT token |
| POST | `/api/auth/logout` | Invalidate token |
| POST | `/api/auth/forgot-password` | Kirim email reset password |
| POST | `/api/auth/reset-password` | Reset password dengan token |
| GET | `/api/auth/me` | Data user yang login |

### Events (Public)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/events` | List semua event (dengan filter & pagination) |
| GET | `/api/events/:id` | Detail event |
| GET | `/api/events/featured` | Event unggulan untuk homepage |
| GET | `/api/categories` | Semua kategori event |

### Events (EO)
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/organizer/events` | List event milik EO |
| POST | `/api/organizer/events` | Buat event baru |
| PUT | `/api/organizer/events/:id` | Update event |
| DELETE | `/api/organizer/events/:id` | Hapus event |
| GET | `/api/organizer/events/:id/report` | Laporan penjualan event |
| POST | `/api/organizer/checkin` | Check-in tiket peserta |

### Transactions & Tickets (User)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/transactions` | Buat transaksi (beli tiket) |
| GET | `/api/transactions` | Riwayat transaksi user |
| GET | `/api/transactions/:id` | Detail transaksi |
| GET | `/api/tickets` | Semua tiket milik user |
| GET | `/api/tickets/:id` | Detail tiket + QR Code |
| GET | `/api/tickets/:id/download` | Download tiket PDF |

### Admin
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/admin/users` | List semua user |
| PUT | `/api/admin/users/:id/status` | Suspend / aktifkan user |
| GET | `/api/admin/events` | List semua event |
| PUT | `/api/admin/events/:id/approve` | Approve event dari EO |
| GET | `/api/admin/transactions` | Semua transaksi |
| GET | `/api/admin/withdrawals` | Pengajuan penarikan dana |
| PUT | `/api/admin/withdrawals/:id` | Approve/reject penarikan |

### Payment Webhook
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/payments/webhook` | Webhook dari payment gateway |

---

## 🚀 Fitur Unggulan untuk Portofolio

1. **🔄 Real-time Stock Locking** — Stok tiket dikunci sementara selama checkout untuk mencegah overselling
2. **📧 Email Automation** — Tiket otomatis dikirim via email setelah pembayaran berhasil
3. **📱 QR Code Check-in System** — Scanner QR berbasis kamera untuk validasi tiket di lokasi
4. **📊 Analytics Dashboard** — Grafik interaktif penjualan untuk EO dan admin
5. **💰 Multi-payment Gateway** — Dukungan berbagai metode pembayaran (simulasi Midtrans)
6. **🎯 Role-Based Access** — Sistem izin bertingkat yang ketat
7. **📄 PDF Ticket Generation** — Tiket digital bergaya profesional dengan QR Code
8. **🔍 Advanced Search & Filter** — Pencarian real-time dengan multi-filter

---

## 📋 Alur Utama Aplikasi (User Flow)

### Alur Pembeli Tiket
```
Landing Page → Cari Event → Detail Event → Login (jika belum)
→ Pilih Kategori & Jumlah Tiket → Isi Data Pemegang Tiket
→ Pilih Metode Bayar → Konfirmasi Pembayaran → Sukses
→ Tiket dikirim via Email + Tersedia di Dashboard
```

### Alur Event Organizer
```
Register sebagai EO → Buat Event (isi detail, upload banner)
→ Tambah Kategori Tiket → Publish Event
→ Monitor Penjualan (Dashboard) → Hari-H: Scan QR Check-in
→ Event Selesai → Ajukan Penarikan Dana
```

### Alur Admin
```
Login Admin → Monitor Dashboard → Review & Approve Event baru
→ Moderasi User/Konten → Kelola Penarikan Dana EO
→ Export Laporan Keuangan
```

---

## 🎯 Nilai Jual Proyek Ini sebagai Portofolio

- ✅ **Full-Stack**: Menguasai Vue.js 3 (modern Composition API) + Node.js/Express.js
- ✅ **Database Design**: ERD yang terstruktur & relasional
- ✅ **Authentication**: Implementasi JWT + RBAC yang aman
- ✅ **Payment Integration**: Pengalaman integrasi payment gateway nyata
- ✅ **File Handling**: Upload, generate PDF, dan QR Code
- ✅ **Real-world Problem**: Solusi bisnis nyata yang bisa digunakan
- ✅ **Clean Architecture**: Separation of concerns yang baik (MVC pattern)
- ✅ **API Design**: RESTful API yang terstruktur dan terdokumentasi

---

*Proyek ini cocok ditampilkan sebagai portofolio untuk posisi: **Full-Stack Developer**, **Backend Developer (Node.js)**, atau **Frontend Developer (Vue.js)**.*
