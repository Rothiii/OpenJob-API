# OpenJob RESTful API — Versi 2

RESTful API untuk aplikasi rekrutmen internal perusahaan. Menangani data lowongan
kerja, lamaran, profil kandidat, profil perusahaan, kategori, bookmark, dan
unggahan dokumen PDF.

Submission kelas **Back-End Fundamental dengan JavaScript** — Dicoding.

Repositori ini berisi **dua proyek yang berdiri sendiri**, masing-masing dengan
`package.json` dan `.env` sendiri:

| Proyek              | Peran                                                          |
| ------------------- | -------------------------------------------------------------- |
| `openjob-api/`      | HTTP server. Menerima request, menulis database, mem-*publish* pesan ke RabbitMQ. |
| `openjob-consumer/` | Proses terpisah. Meng-*consume* pesan dari RabbitMQ lalu mengirim email notifikasi. |

Keduanya tidak saling meng-import kode. Penghubungnya hanya **RabbitMQ** (antrean
pesan) dan **PostgreSQL** (database yang sama).

---

## Daftar Isi

- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [ERD](#erd)
- [Instalasi](#instalasi)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Migrasi Database](#migrasi-database)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Daftar Scripts](#daftar-scripts)
- [Autentikasi](#autentikasi)
- [Daftar Endpoint](#daftar-endpoint)
- [Format Response](#format-response)
- [Aturan Validasi](#aturan-validasi)
- [Pengujian Postman](#pengujian-postman)
- [Pemenuhan Kriteria Submission](#pemenuhan-kriteria-submission)

---

## Tech Stack

| Komponen        | Teknologi                  | Dipakai di          |
| --------------- | -------------------------- | ------------------- |
| Runtime         | Node.js >= 20 (ESM)        | keduanya            |
| Framework       | Express 5                  | api                 |
| Database        | PostgreSQL                 | keduanya            |
| Database Client | `pg` (connection pool)     | keduanya            |
| Migration       | `node-pg-migrate`          | api                 |
| Cache           | Redis (`redis`)            | api                 |
| Message Queue   | RabbitMQ (`amqplib`)       | keduanya            |
| Upload berkas   | `multer`                   | api                 |
| Email           | `nodemailer`               | consumer            |
| Validasi        | Joi                        | api                 |
| Autentikasi     | JWT (`jsonwebtoken`)       | api                 |
| Hashing         | bcrypt                     | api                 |
| Konfigurasi     | dotenv                     | keduanya            |
| Linter          | ESLint                     | keduanya            |

---

## Struktur Proyek

Dua proyek terpisah di dalam satu repositori. Di dalam API, kode dipisah menjadi
beberapa lapisan agar setiap berkas punya satu tanggung jawab:
**route → controller → service → repository**.

```
OpenJob-API/
├── README.md
├── ERD-OpenJob-versi-1.png            # ERD submission versi 1
├── ERD-OpenJob-versi-2.png            # ERD terbaru (+ documents, companies.user_id)
├── OpenJob RESTful API V2 Test.zip    # collection & environment Postman
│
├── openjob-api/                       # ── PROYEK 1: HTTP server ──
│   ├── package.json
│   ├── eslint.config.js
│   ├── .env                           # kredensial lokal (tidak di-commit)
│   ├── .env.example
│   ├── uploads/                       # berkas PDF hasil unggahan (tidak di-commit)
│   ├── migrations/                    # node-pg-migrate, berprefiks timestamp
│   │   ├── 1785166161186_uuid-extentions.js
│   │   ├── 1785167161186_create-table-users.js
│   │   ├── 1785169855217_create-table-authentications.js
│   │   ├── 1785169900643_create-table-categories.js
│   │   ├── 1785169907130_create-table-companies.js
│   │   ├── 1785170056692_create-table-jobs.js
│   │   ├── 1785170063921_create-table-bookmarks.js
│   │   ├── 1785170071904_create-table-applications.js
│   │   ├── 1785337892869_create-table-documents.js
│   │   ├── 1785346179134_add-file-details-to-documents.js
│   │   ├── 1785346180134_add-owner-to-companies.js
│   │   └── 1785346181134_unique-application-per-user-job.js
│   └── src/
│       ├── app.js                     # instance Express + middleware global
│       ├── server.js                  # HTTP listener + graceful shutdown
│       ├── config/
│       │   ├── env.js                 # pembacaan & validasi environment variable
│       │   └── database.js            # PostgreSQL connection pool
│       ├── routes/                    # definisi endpoint
│       │   ├── index.js               # barrel: memasang seluruh sub-router
│       │   ├── users.route.js
│       │   ├── auth.route.js
│       │   ├── companies.route.js
│       │   ├── categories.route.js
│       │   ├── jobs.route.js
│       │   ├── applications.route.js
│       │   ├── bookmarks.route.js
│       │   ├── profile.route.js
│       │   └── documents.route.js
│       ├── controllers/               # membaca request, mengirim response
│       ├── services/                  # aturan bisnis, melempar error domain
│       ├── repositories/              # satu-satunya lapisan yang menulis SQL
│       ├── validators/                # skema Joi (+ common/ untuk yang dipakai ulang)
│       ├── middlewares/
│       │   ├── auth.middleware.js     # verifikasi Bearer access token
│       │   ├── validate.middleware.js # validasi payload dengan Joi
│       │   ├── cache.middleware.js    # cache GET di Redis + header X-Data-Source
│       │   ├── upload.middleware.js   # multer: PDF, maksimal 5 MB
│       │   ├── notFound.middleware.js # route tidak dikenal → 404
│       │   └── error.middleware.js    # error handler terpusat
│       ├── errors/                    # ClientError, NotFoundError, dll.
│       └── utils/
│           ├── uuid.js
│           ├── response.js
│           ├── redis.js               # client + get/set/delete cache
│           ├── cacheKeys.js           # seluruh nama key cache
│           └── rabbitmq.js            # koneksi + publish
│
└── openjob-consumer/                  # ── PROYEK 2: pengirim email ──
    ├── package.json
    ├── eslint.config.js
    ├── .env
    ├── .env.example
    └── src/
        ├── consumer.js                # entry point: subscribe + graceful shutdown
        ├── config/
        │   ├── env.js
        │   └── database.js            # pool kecil (max 2), hanya membaca
        ├── repositories/
        │   └── applications.repository.js   # query detail lamaran + pemilik lowongan
        ├── services/
        │   └── notification.service.js      # menyusun & mengirim email
        └── utils/
            ├── rabbitmq.js            # koneksi + consume + ack/nack
            └── mailer.js              # transport nodemailer
```

### Alur sebuah request

```
Request
   ↓
route          → menentukan endpoint, memasang middleware auth, cache & validasi
   ↓
controller     → mengambil data dari req, memanggil service, menulis response
   ↓
service        → aturan bisnis, invalidasi cache, publish pesan ke RabbitMQ
   ↓
repository     → menjalankan query SQL, mengembalikan baris
   ↓
PostgreSQL
```

Error yang dilempar service tidak ditangkap di controller. Express 5 meneruskan
promise yang rejected ke `error.middleware.js`, sehingga controller tetap ringkas
tanpa blok `try/catch`.

### Alur notifikasi antar proyek

```
openjob-api                          openjob-consumer
    │                                       │
POST /applications                          │
    │ simpan lamaran ke PostgreSQL          │
    │ hapus cache terkait                   │
    │ publish { application_id } ───────────┼──► queue "job_application_queue"
    │                                       │        (durable, persistent)
    └─► 201 Created (tidak menunggu email)  │
                                            ▼
                                    baca pesan, query database:
                                    pelamar → lowongan → perusahaan → pemilik
                                            │
                                            ▼
                                    kirim email ke pemilik lowongan (SMTP)
                                            │
                                            ▼
                                          ack
```

Isi pesan hanya `application_id`. Seluruh data email — nama pelamar, email
pelamar, tanggal lamaran, alamat tujuan — diambil consumer dari database, tidak
pernah dari isi pesan maupun ditulis langsung di kode.

---

## ERD

Diagram relasi antar tabel tersedia pada berkas **`ERD-OpenJob-versi-2.png`** di
root repositori. Versi lama tetap disimpan sebagai `ERD-OpenJob-versi-1.png`.

Ringkasan relasi:

| Tabel             | Relasi                                                        |
| ----------------- | ------------------------------------------------------------- |
| `users`           | 1 user memiliki banyak `applications`, `bookmarks`, `authentications`, `documents` |
| `companies`       | 1 company memiliki banyak `jobs`, dan dimiliki 1 `user` (pemilik) |
| `categories`      | 1 category memiliki banyak `jobs`                             |
| `jobs`            | milik 1 `company` dan 1 `category`                            |
| `applications`    | menghubungkan `users` ↔ `jobs`                                |
| `bookmarks`       | menghubungkan `users` ↔ `jobs`                                |
| `authentications` | menyimpan refresh token milik `users`                         |
| `documents`       | menyimpan metadata berkas PDF milik `users`                   |

Seluruh foreign key memakai `ON DELETE CASCADE` dan diberi index tersendiri,
kecuali `companies.user_id` yang memakai `ON DELETE SET NULL` — menghapus akun
pemilik tidak boleh ikut menghapus perusahaan beserta seluruh lowongannya.

**Unique constraint:**

| Tabel             | Kolom                  |
| ----------------- | ---------------------- |
| `users`           | `email`                |
| `categories`      | `name`                 |
| `authentications` | `token`                |
| `bookmarks`       | `(user_id, job_id)`    |
| `applications`    | `(user_id, job_id)`    |

---

## Instalasi

Prasyarat: **Node.js >= 20**, **PostgreSQL**, **Redis**, dan **RabbitMQ** yang
sudah berjalan.

Setiap proyek punya dependensi sendiri, jadi `npm install` dijalankan dua kali:

```bash
git clone https://github.com/Rothiii/OpenJob-API.git
cd OpenJob-API

npm install --prefix openjob-api
npm install --prefix openjob-consumer
```

Buat database:

```bash
createdb openjob
```

---

## Konfigurasi Environment

Masing-masing proyek punya `.env` sendiri. Salin kedua template lalu sesuaikan:

```bash
cp openjob-api/.env.example openjob-api/.env
cp openjob-consumer/.env.example openjob-consumer/.env
```

### `openjob-api/.env`

```env
# Server configuration
NODE_ENV=development
HOST=localhost
PORT=3000

# Database configuration (juga dipakai node-pg-migrate)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=
PGDATABASE=openjob

# JWT secret — generate dengan: openssl rand -hex 32
ACCESS_TOKEN_KEY=
REFRESH_TOKEN_KEY=
ACCESS_TOKEN_AGE=3h

# Redis cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# RabbitMQ — AMQP_URL opsional dan menang atas variabel di atasnya
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
AMQP_URL=
```

| Variabel            | Wajib | Default     | Keterangan                              |
| ------------------- | ----- | ----------- | --------------------------------------- |
| `NODE_ENV`          | tidak | development | Mode aplikasi                           |
| `HOST`              | tidak | localhost   | Host HTTP server                        |
| `PORT`              | tidak | 3000        | Port HTTP server                        |
| `PGHOST`            | ya    | —           | Host PostgreSQL                         |
| `PGPORT`            | tidak | 5432        | Port PostgreSQL                         |
| `PGUSER`            | ya    | —           | User PostgreSQL                         |
| `PGPASSWORD`        | tidak | (kosong)    | Password PostgreSQL                     |
| `PGDATABASE`        | ya    | —           | Nama database                           |
| `ACCESS_TOKEN_KEY`  | ya    | —           | Secret key access token                 |
| `REFRESH_TOKEN_KEY` | ya    | —           | Secret key refresh token                |
| `ACCESS_TOKEN_AGE`  | tidak | 3h          | Masa berlaku access token               |
| `REDIS_HOST`        | tidak | localhost   | Host Redis untuk caching                |
| `REDIS_PORT`        | tidak | 6379        | Port Redis                              |
| `REDIS_PASSWORD`    | tidak | (kosong)    | Password Redis bila diaktifkan          |
| `RABBITMQ_HOST`     | tidak | localhost   | Host RabbitMQ                           |
| `RABBITMQ_PORT`     | tidak | 5672        | Port RabbitMQ                           |
| `RABBITMQ_USER`     | tidak | guest       | User RabbitMQ                           |
| `RABBITMQ_PASSWORD` | tidak | guest       | Password RabbitMQ                       |
| `AMQP_URL`          | tidak | (kosong)    | URL AMQP utuh; menimpa `RABBITMQ_*`     |

### `openjob-consumer/.env`

```env
NODE_ENV=development

# Database — database yang sama dengan API (skema dimiliki openjob-api)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=
PGDATABASE=openjob

# RabbitMQ — harus menunjuk broker yang sama dengan API
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
AMQP_URL=

# Mail — untuk Gmail, MAIL_PASSWORD wajib App Password, bukan password akun
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=
```

| Variabel            | Wajib | Default     | Keterangan                              |
| ------------------- | ----- | ----------- | --------------------------------------- |
| `PGHOST`            | ya    | —           | Host PostgreSQL                         |
| `PGUSER`            | ya    | —           | User PostgreSQL                         |
| `PGDATABASE`        | ya    | —           | Nama database                           |
| `RABBITMQ_HOST`     | tidak | localhost   | Host RabbitMQ                           |
| `RABBITMQ_PORT`     | tidak | 5672        | Port RabbitMQ                           |
| `RABBITMQ_USER`     | tidak | guest       | User RabbitMQ                           |
| `RABBITMQ_PASSWORD` | tidak | guest       | Password RabbitMQ                       |
| `AMQP_URL`          | tidak | (kosong)    | URL AMQP utuh; menimpa `RABBITMQ_*`     |
| `MAIL_HOST`         | tidak | localhost   | Host SMTP                               |
| `MAIL_PORT`         | tidak | 587         | Port SMTP                               |
| `MAIL_USER`         | tidak | (kosong)    | User SMTP                               |
| `MAIL_PASSWORD`     | tidak | (kosong)    | Password SMTP / App Password            |
| `MAIL_FROM`         | tidak | `MAIL_USER` | Alamat pengirim email notifikasi        |

Nilai `PG*` dan `RABBITMQ_*` di kedua berkas harus menunjuk ke database dan broker
yang sama, karena di situlah kedua proyek bertemu.

Kredensial tidak pernah ditulis di dalam kode. `src/config/env.js` di masing-masing
proyek membaca seluruh variabel di atas dan **menghentikan proses saat startup**
jika ada variabel wajib yang kosong, sehingga kesalahan konfigurasi ketahuan sejak
awal.

Berkas `.env` sudah masuk `.gitignore`; hanya `.env.example` yang di-commit.

---

## Migrasi Database

Skema database dimiliki **openjob-api**; seluruh perintah migrasi dijalankan dari
sana. Consumer hanya membaca, tidak pernah mengubah struktur tabel.

```bash
cd openjob-api

npm run migrate:up       # jalankan seluruh migrasi
npm run migrate:down     # batalkan satu migrasi terakhir
npm run migrate:reset    # turunkan semua lalu naikkan lagi dari awal
```

Membuat migrasi baru:

```bash
npm run migrate:create -- create-table-example
```

Pengelolaan struktur tabel memakai **node-pg-migrate**. Nama setiap berkas migrasi
berprefiks timestamp yang dibuat otomatis oleh CLI, dan urutan itulah yang
menentukan urutan eksekusi.

node-pg-migrate membaca koneksi dari variabel `PGHOST`, `PGPORT`, `PGUSER`,
`PGPASSWORD`, dan `PGDATABASE` di `openjob-api/.env`, jadi tidak perlu
`DATABASE_URL`.

Urutan tabel yang dibuat: `uuid-ossp` extension → `users` → `authentications` →
`categories` → `companies` → `jobs` → `bookmarks` → `applications` → `documents`,
lalu tiga migrasi tambahan versi 2: detail berkas pada `documents`, kolom pemilik
pada `companies`, dan unique constraint `(user_id, job_id)` pada `applications`.

---

## Menjalankan Aplikasi

Dua proyek = dua proses, jadi butuh dua terminal. Keduanya berdiri sendiri:
API tetap melayani request walau consumer mati, dan consumer tetap memproses
antrean walau API sedang berhenti.

**Terminal 1 — API**

```bash
cd openjob-api
npm run start:dev        # atau: npm start
```

**Terminal 2 — Consumer**

```bash
cd openjob-consumer
npm run start:dev        # atau: npm start
```

Server berjalan di `http://localhost:3000` (mengikuti `HOST` dan `PORT`).
Cek kesehatan server:

```bash
curl http://localhost:3000/health
```

Consumer tidak membuka port. Tanda dia siap adalah baris log:

```
RabbitMQ connected
Consumer is waiting for job application messages...
```

Consumer wajib nyala saat menguji notifikasi email. Kalau dimatikan, pesan tetap
aman menumpuk di queue (`durable` + `persistent`) dan akan diproses begitu
dinyalakan kembali.

---

## Daftar Scripts

### `openjob-api`

| Perintah                 | Kegunaan                                        |
| ------------------------ | ----------------------------------------------- |
| `npm run start:dev`      | Menjalankan server dengan nodemon (development) |
| `npm run dev`            | Alias dari `start:dev`                          |
| `npm start`              | Menjalankan server tanpa watcher                |
| `npm run lint`           | Menjalankan ESLint pada `src` dan `migrations`  |
| `npm run migrate:up`     | Menjalankan seluruh migrasi                     |
| `npm run migrate:down`   | Membatalkan satu migrasi terakhir               |
| `npm run migrate:reset`  | Reset seluruh skema database                    |
| `npm run migrate:create` | Membuat berkas migrasi baru                     |

### `openjob-consumer`

| Perintah            | Kegunaan                                          |
| ------------------- | ------------------------------------------------- |
| `npm start`         | Menjalankan consumer (pengirim email notifikasi)  |
| `npm run start:dev` | Consumer dengan nodemon (development)             |
| `npm run dev`       | Alias dari `start:dev`                            |
| `npm run lint`      | Menjalankan ESLint pada `src`                     |

---

## Autentikasi

Autentikasi memakai **JWT**, bukan session maupun cookie.

- **Access token** — payload berisi `{ id }` milik user, ditandatangani dengan
  `ACCESS_TOKEN_KEY`, berlaku **3 jam**.
- **Refresh token** — ditandatangani dengan `REFRESH_TOKEN_KEY`, **disimpan di
  tabel `authentications`**. Refresh hanya berhasil jika signature valid *dan*
  token tersebut masih terdaftar di database.

Endpoint yang diproteksi memerlukan header:

```
Authorization: Bearer <access_token>
```

Middleware `auth.middleware.js` memverifikasi token lalu menaruh `{ id }` pada
`req.user`. Bila header hilang atau token tidak valid, request dijawab `401`
sebelum menyentuh database.

Alur token:

```
POST   /authentications   → login, menerbitkan accessToken + refreshToken
PUT    /authentications   → menukar refreshToken menjadi accessToken baru
DELETE /authentications   → logout, menghapus refreshToken dari database
```

`DELETE /authentications` diautentikasi oleh refresh token pada body, bukan oleh
access token pada header.

---

## Daftar Endpoint

### Public (tanpa autentikasi)

| Method | Endpoint                        | Keterangan                     |
| ------ | ------------------------------- | ------------------------------ |
| POST   | `/users`                        | Registrasi user baru           |
| GET    | `/users/:id`                    | Detail user                    |
| POST   | `/authentications`              | Login                          |
| PUT    | `/authentications`              | Perbarui access token          |
| GET    | `/companies`                    | Daftar perusahaan              |
| GET    | `/companies/:id`                | Detail perusahaan              |
| GET    | `/categories`                   | Daftar kategori                |
| GET    | `/categories/:id`               | Detail kategori                |
| GET    | `/jobs`                         | Daftar lowongan (+ pencarian)  |
| GET    | `/jobs/:id`                     | Detail lowongan                |
| GET    | `/jobs/company/:companyId`      | Lowongan berdasarkan perusahaan |
| GET    | `/jobs/category/:categoryId`    | Lowongan berdasarkan kategori  |
| GET    | `/documents`                    | Daftar dokumen yang diunggah   |
| GET    | `/documents/:id`                | Menampilkan berkas PDF         |
| GET    | `/health`                       | Status server                  |

### Protected (butuh `Authorization: Bearer <access_token>`)

| Method | Endpoint                        | Keterangan                        |
| ------ | ------------------------------- | --------------------------------- |
| DELETE | `/authentications`              | Logout                            |
| GET    | `/profile`                      | Profil user yang sedang login      |
| GET    | `/profile/applications`         | Daftar lamaran milik user          |
| GET    | `/profile/bookmarks`            | Daftar bookmark milik user         |
| POST   | `/companies`                    | Tambah perusahaan                  |
| PUT    | `/companies/:id`                | Ubah perusahaan                    |
| DELETE | `/companies/:id`                | Hapus perusahaan                   |
| POST   | `/categories`                   | Tambah kategori                    |
| PUT    | `/categories/:id`               | Ubah kategori                      |
| DELETE | `/categories/:id`               | Hapus kategori                     |
| POST   | `/jobs`                         | Tambah lowongan                    |
| PUT    | `/jobs/:id`                     | Ubah lowongan                      |
| DELETE | `/jobs/:id`                     | Hapus lowongan                     |
| POST   | `/applications`                 | Melamar pekerjaan                  |
| GET    | `/applications`                 | Daftar seluruh lamaran             |
| GET    | `/applications/:id`             | Detail lamaran                     |
| GET    | `/applications/user/:userId`    | Lamaran berdasarkan user           |
| GET    | `/applications/job/:jobId`      | Lamaran berdasarkan lowongan       |
| PUT    | `/applications/:id`             | Ubah status lamaran                |
| POST   | `/documents`                    | Unggah dokumen PDF (field `document`) |
| DELETE | `/documents/:id`                | Hapus dokumen milik sendiri        |
| DELETE | `/applications/:id`             | Hapus lamaran                      |
| POST   | `/jobs/:jobId/bookmark`         | Simpan lowongan                    |
| GET    | `/jobs/:jobId/bookmark/:id`     | Detail bookmark                    |
| DELETE | `/jobs/:jobId/bookmark`         | Hapus bookmark pada lowongan       |
| GET    | `/bookmarks`                    | Seluruh bookmark milik user        |

### Pencarian lowongan

`GET /jobs` menerima dua query parameter opsional yang dapat digabungkan.
Pencocokan bersifat *case-insensitive* dan parsial (`ILIKE`).

| Parameter      | Keterangan                          |
| -------------- | ----------------------------------- |
| `title`        | Mencari lowongan berdasarkan judul  |
| `company-name` | Mencari lowongan berdasarkan nama perusahaan |

```bash
curl "http://localhost:3000/jobs?title=Backend"
curl "http://localhost:3000/jobs?company-name=Tech%20Corp"
curl "http://localhost:3000/jobs?title=Developer&company-name=Tech"
```

Parameter kosong (`?title=&company-name=`) diabaikan sehingga seluruh lowongan
dikembalikan.

---

## Format Response

Berhasil — satu objek:

```json
{
  "status": "success",
  "data": { "id": "...", "name": "John Doe" }
}
```

Berhasil — kumpulan data (dibungkus nama koleksi):

```json
{
  "status": "success",
  "data": { "jobs": [] }
}
```

Gagal karena kesalahan klien (`4xx`):

```json
{
  "status": "failed",
  "message": "\"email\" is required"
}
```

Gagal karena kesalahan server (`5xx`):

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

### Kode status

| Kode  | Kapan digunakan                                                  |
| ----- | ---------------------------------------------------------------- |
| `200` | Permintaan berhasil                                              |
| `201` | Resource berhasil dibuat                                         |
| `400` | Payload gagal validasi, JSON rusak, atau refresh token tidak sah  |
| `401` | Token hilang/tidak valid, atau kredensial login salah            |
| `404` | Resource atau route tidak ditemukan                              |
| `500` | Kesalahan tak terduga di sisi server                             |

Seluruh error dipusatkan di `src/middlewares/error.middleware.js`. Middleware ini
memetakan `ClientError` ke status masing-masing, menerjemahkan kode error
PostgreSQL (`23505` unique violation, `23503` foreign key violation, `22P02`
invalid input syntax) menjadi `400`, dan menutup sisanya sebagai `500`. Pesan
error asli hanya ditampilkan di luar mode produksi.

---

## Aturan Validasi

Validasi payload dilakukan oleh middleware `validate(schema)` memakai **Joi**.
Middleware ini berjalan setelah middleware auth, sehingga request tanpa token
tetap dijawab `401` — bukan `400`. Field yang tidak dikenal dibuang dari payload.

| Resource        | Field wajib                          | Catatan                                                     |
| --------------- | ------------------------------------ | ----------------------------------------------------------- |
| Register user   | `name`, `email`, `password`          | `name` min 3 karakter, `email` format valid, `password` min 6, `role` opsional (`user`/`admin`/`company`, default `user`) |
| Login           | `email`, `password`                  | Password tidak dibatasi panjangnya agar kredensial salah menghasilkan `401`, bukan `400` |
| Refresh/Logout  | `refreshToken`                       | —                                                           |
| Company create  | `name`, `location`                   | `description` opsional                                      |
| Company update  | minimal satu field                   | Mendukung pembaruan sebagian                                |
| Category        | `name`                               | Tidak boleh string kosong                                   |
| Job create      | `company_id`, `category_id`, `title` | Kedua id harus UUID v4; sisanya opsional                    |
| Job update      | minimal satu field                   | Field yang tidak dikirim mempertahankan nilai lama          |
| Application     | `job_id`                             | `user_id` pada body diabaikan — pelamar selalu diambil dari access token |
| Update lamaran  | `status`                             | `pending`, `accepted`, atau `rejected`                      |

Id berformat bukan UUID langsung dijawab tanpa menyentuh database: endpoint
detail mengembalikan `404`, sedangkan endpoint daftar (`/applications/user/:userId`,
`/jobs/company/:companyId`, `/jobs/category/:categoryId`) mengembalikan `200`
dengan array kosong.

---

## Pengujian Postman

Berkas koleksi dan environment tersedia pada
`OpenJob RESTful API V1 Test.zip`.

1. Ekstrak berkas zip.
2. Import `[271] OpenJob API Test V1.postman_collection.json` ke Postman.
3. Import `OpenJob API.postman_environment.json`, lalu pilih environment
   **OpenJob API**.
4. Sesuaikan variabel `port` bila server tidak berjalan di `3000`.
5. Pastikan database sudah dimigrasi dan server sudah berjalan.
6. Jalankan koleksi memakai **Collection Runner** secara berurutan dari atas ke
   bawah — banyak request memakai variabel yang di-set oleh request sebelumnya.

Disarankan menjalankan `npm run migrate:reset` sebelum pengujian agar database
berada dalam keadaan bersih.

Untuk versi 2, koleksinya adalah `OpenJob RESTful API V2 Test.zip`. Folder
**[Mandatory] Documents** tidak boleh ikut dijalankan lewat Collection Runner —
request unggah berkas harus dijalankan manual dengan memilih berkas PDF pada
field `document`.

---

## Pemenuhan Kriteria Submission

Kecuali disebut lain, seluruh path pada tabel di bawah relatif terhadap
**`openjob-api/`**.

### Kriteria 1 — Menggunakan Database untuk Menyimpan Data

| Ketentuan                                                     | Implementasi                                                    |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Data disimpan di PostgreSQL                                   | `src/config/database.js` (connection pool `pg`)                 |
| Pengelolaan tabel dengan `node-pg-migrate`                    | Direktori `migrations/`                                          |
| Nama berkas migrasi berprefiks timestamp                      | Contoh: `1785167161186_create-table-users.js`                    |
| Kredensial tidak hardcoded                                    | `.env` + `src/config/env.js`                                     |
| Variabel `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGHOST`, `PGPORT` | Tersedia di `.env` dan `.env.example`                        |
| Variabel `HOST` dan `PORT`                                    | Tersedia di `.env` dan `.env.example`                            |
| Dijalankan dengan `npm run start:dev`                         | Terdaftar di `package.json`                                      |
| Library data validation                                       | Joi                                                              |
| Middleware validasi data dengan Joi                           | `src/middlewares/validate.middleware.js`                         |
| Middleware error handling                                     | `src/middlewares/error.middleware.js`                            |
| Unique constraint                                             | `users.email`, `categories.name`, `authentications.token`, `bookmarks(user_id, job_id)` |
| Normalisasi & relasi antar tabel                              | 7 tabel dengan foreign key ber-`CASCADE`                         |
| ERD dilampirkan                                               | `ERD-OpenJob-versi-1.png`, diperbarui pada `ERD-OpenJob-versi-2.png` |
| Query parameter `?title` dan `?company-name` pada `GET /jobs` | `src/repositories/jobs.repository.js`                            |

### Kriteria 2 — Autentikasi dan Otorisasi

| Ketentuan                                                | Implementasi                                             |
| -------------------------------------------------------- | -------------------------------------------------------- |
| Autentikasi memakai JWT (bukan session/cookie)           | `src/services/auth.service.js`                            |
| Payload JWT berisi `id` user                             | `jwt.sign({ id: user.id }, ...)`                          |
| Refresh token bersignature valid dan terdaftar di database | Tabel `authentications`                                 |
| Middleware auth                                          | `src/middlewares/auth.middleware.js`                      |
| Protected route `GET /profile`                           | `src/routes/profile.route.js`                             |
| Protected route `GET /profile/applications`              | `src/routes/profile.route.js`                             |
| Protected route `GET /profile/bookmarks`                 | `src/routes/profile.route.js`                             |
| Secret key dari `ACCESS_TOKEN_KEY` & `REFRESH_TOKEN_KEY` | `src/config/env.js`                                       |
| Access token berlaku 3 jam                               | `ACCESS_TOKEN_AGE=3h`                                     |

---

## Submission Versi 2

### Layanan pendukung

Selain PostgreSQL, versi 2 membutuhkan **Redis** dan **RabbitMQ** berjalan lokal.
Consumer kini menjadi **proyek terpisah** dengan `package.json` sendiri, dan
dijalankan sebagai proses tersendiri:

```bash
cd openjob-api      && npm run start:dev   # terminal 1 — REST API
cd openjob-consumer && npm start           # terminal 2 — consumer + pengirim email
```

Server tetap melayani permintaan meski Redis atau RabbitMQ mati: cache akan
selalu meleset ke database, dan publish message hanya dicatat di log.

### Kriteria 1 — Unggah Berkas Dokumen PDF

| Ketentuan                          | Implementasi                                                     |
| ---------------------------------- | ---------------------------------------------------------------- |
| Unggah berkas PDF                  | `POST /documents` (form-data, field `document`)                   |
| Library multer                     | `src/middlewares/upload.middleware.js`                            |
| Validasi ukuran maksimal 5 MB      | `limits.fileSize` pada multer                                     |
| Validasi MIME type                 | `fileFilter` menolak selain `application/pdf`                     |
| Nama berkas disimpan di tabel      | Tabel `documents` (`filename`, `original_filename`, `file_path`)  |
| Menampilkan berkas yang diunggah   | `GET /documents/:id` mengirim PDF beserta `Content-Disposition`    |

Berkas fisik disimpan di direktori `uploads/` (di-`gitignore`) dengan nama unik,
sementara nama asli tetap dicatat di database untuk keperluan unduhan.

### Kriteria 2 — Caching dengan Redis

| Ketentuan                             | Implementasi                                              |
| ------------------------------------- | ---------------------------------------------------------- |
| Caching memakai Redis                 | `src/utils/redis.js`, `src/middlewares/cache.middleware.js` |
| Masa simpan cache 1 jam               | `DEFAULT_TTL = 3600`                                        |
| Kredensial di environment variables   | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`                |
| Header `X-Data-Source: cache`         | Diset saat cache hit; `database` saat miss                  |

Endpoint yang di-cache: `GET /companies/:id`, `GET /users/:id`,
`GET /applications/:id`, `GET /applications/user/:userId`,
`GET /applications/job/:jobId`, dan `GET /bookmarks` (kunci per user).

Invalidasi cache dilakukan di service, satu keluarga kunci sekaligus:

| Aksi                                  | Kunci yang dihapus |
| ------------------------------------- | ------------------ |
| CREATE/UPDATE/DELETE perusahaan       | `companies:*`      |
| CREATE/UPDATE/DELETE lamaran          | `applications:*`   |
| CREATE/DELETE bookmark                | `bookmarks:user:<id>` |

### Kriteria 3 — Message Queue dengan RabbitMQ

| Ketentuan                                   | Implementasi                                          |
| ------------------------------------------- | ------------------------------------------------------ |
| Publish saat kandidat melamar               | `openjob-api/src/services/applications.service.js`      |
| Payload hanya `application_id`              | `publishToQueue({ application_id })`                    |
| Program consumer asynchronous               | Proyek terpisah `openjob-consumer/` (`npm start`)       |
| Kredensial di environment variables         | `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, opsional `AMQP_URL` |
| Pengiriman email memakai Nodemailer         | `openjob-consumer/src/utils/mailer.js`                  |
| Kredensial email di environment variables   | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` di `openjob-consumer/.env` |
| Email dikirim ke pemilik lowongan           | `openjob-consumer/src/repositories/applications.repository.js` menelusuri lamaran → lowongan → perusahaan → pemilik |
| Isi email diambil dari database             | Nama pelamar, email pelamar, dan tanggal lamaran        |

Kepemilikan lowongan berasal dari kolom `companies.user_id`, yaitu user yang
membuat perusahaan tersebut. Publish berjalan di luar jalur respons sehingga
pelamar tidak menunggu proses email.

Kedua proyek tidak saling meng-import kode. Nama queue (`job_application_queue`)
dideklarasikan `durable` di kedua sisi, jadi tidak masalah proses mana yang lebih
dulu dijalankan.

---

## Lisensi

ISC — dikembangkan oleh [rothiii](https://github.com/Rothiii).
