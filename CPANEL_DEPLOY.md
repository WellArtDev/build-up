# BuildUp — cPanel Deployment Guide

Panduan lengkap deploy Next.js app ke cPanel hosting dengan Node.js + MySQL.

---

## Prasyarat cPanel

Pastikan hosting cPanel Anda memiliki:
- **Node.js Selector** (Setup Node.js App)
- **MySQL Databases**
- **File Manager** atau SSH access
- **Terminal/SSH** (lebih disarankan)

---

## Step 1: Setup Database

### 1.1 Buat Database via cPanel

1. Login cPanel → **MySQL® Databases**
2. Buat database baru: `buildup_db`
3. Buat user baru: `buildup_user` dengan password kuat
4. Add user ke database dengan **ALL PRIVILEGES**
5. Catat: `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### 1.2 Import Schema (via phpMyAdmin)

1. Buka **phpMyAdmin** di cPanel
2. Pilih database `buildup_db`
3. Tab **Import** → Choose File → pilih `src/lib/db/schema.sql`
4. Klik **Go**

Alternatif via SSH:
```bash
mysql -u buildup_user -p buildup_db < src/lib/db/schema.sql
```

### 1.3 Import Indexes (opsional, untuk production)

```bash
# Via phpMyAdmin Import, atau:
mysql -u buildup_user -p buildup_db < src/lib/db/indexes.sql
```

---

## Step 2: Setup Environment Variables

### 2.1 Generate NEXTAUTH_SECRET

Jalankan di laptop lokal:
```bash
openssl rand -base64 64
```

Copy output, pakai sebagai `NEXTAUTH_SECRET`.

### 2.2 Buat `.env` file di server

Di folder aplikasi, buat file `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=buildup_user
DB_PASSWORD=your_cpanel_db_password
DB_NAME=buildup_db

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-generated-64-char-secret

# WhatsApp Gateway (Wablas) — optional
WABLAS_TOKEN=
WABLAS_SECRET_KEY=
```

> ⚠️ **PENTING:** Jangan commit `.env` ke git. Pastikan ada di `.gitignore`.

---

## Step 3: Upload & Install

### Method A: Git Clone (SSH — Disarankan)

```bash
# SSH ke cPanel
cd ~/public_html

# Clone repo
git clone https://github.com/WellArtDev/build-up.git .
# ATAU ke subfolder:
# git clone https://github.com/WellArtDev/build-up.git buildup

# Install dependencies
npm install

# Copy .env (buat manual atau upload)
nano .env

# Build
npm run build
```

### Method B: Upload ZIP (tanpa SSH)

1. Download repo sebagai ZIP dari GitHub
2. Di cPanel → **File Manager** → `public_html/`
3. Upload ZIP → Extract
4. Untuk build: gunakan **Setup Node.js App** (Step 5)

### Method C: FTP (FileZilla)

Upload semua file kecuali `node_modules/`, `.next/`, `.env.local` via FTP.

---

## Step 4: Build Application

### Via SSH (cPanel Terminal):

```bash
cd ~/public_html  # atau folder aplikasi Anda
npm install
npm run build
```

### Via Node.js Selector (cPanel UI):

1. cPanel → **Setup Node.js App**
2. Klik **Create Application**
3. Isi:
   - **Node.js version:** 18.x atau 20.x
   - **Application mode:** Production
   - **Application root:** `/home/username/public_html` (atau folder aplikasi)
   - **Application URL:** pilih domain
   - **Application startup file:** `server.js` (lihat Step 5)
4. Klik **Create**
5. Setelah dibuat, klik **Run NPM Install**
6. Lalu jalankan: `npm run build` di bagian **Scripts**

---

## Step 5: Custom Server (untuk cPanel)

Next.js di cPanel butuh custom server karena shared hosting tidak support `next start` langsung seperti VPS.

Buat file `server.js` di root project:

```javascript
// server.js — Custom server untuk cPanel
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> BuildUp running on http://${hostname}:${port}`);
  });
});
```

Update `package.json` scripts:
```json
"scripts": {
  "start": "NODE_ENV=production node server.js",
  "build": "next build"
}
```

---

## Step 6: Setup Application via Node.js Selector

1. Buka cPanel → **Setup Node.js App**
2. Find/edit aplikasi Anda
3. Pastikan:
   - **Startup file:** `server.js`
   - **Environment variables:** tambahkan semua dari `.env`
   - Klik **Save** → **Restart**

---

## Step 7: Configure Passenger (jika pakai Apache)

Buat file `.htaccess` di root `public_html/`:

```apache
# .htaccess
<IfModule mod_passenger.c>
  PassengerAppRoot /home/username/public_html
  PassengerAppType node
  PassengerStartupFile server.js
  PassengerNodejs /home/username/nodevenv/public_html/18/bin/node
</IfModule>

# Redirect all to Node.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
</IfModule>
```

> Sesuaikan `username` dan path `PassengerNodejs` dengan environment cPanel Anda.

---

## Step 8: File Upload Directory

Buat direktori upload dengan permission:

```bash
# Via SSH atau File Manager
mkdir -p public/uploads/tenants
chmod -R 755 public/uploads
```

Upload file akan disimpan di `public/uploads/{tenantId}/{type}/`.

---

## Step 9: Database Seed (Opsional)

Untuk data demo:

```bash
# Via SSH
cd ~/public_html
npm run db:seed
```

Atau via phpMyAdmin: import SQL manual dari data demo.

---

## Step 10: Verify Deploy

1. Buka `https://yourdomain.com` — landing page muncul
2. Buka `https://yourdomain.com/auth/login` — login page
3. Login dengan `superadmin@buildup.id` / `password123`
4. Test: buat student, assessment, schedule

---

## Troubleshooting

### halaman 500 / blank
```bash
# Cek log
cat ~/public_html/.next/server.log 2>/dev/null
# atau via cPanel Errors page
```

### Database connection error
- Cek `.env` credentials
- Pastikan database user punya privileges
- Cek `DB_HOST` — di cPanel biasanya `localhost`

### Node version mismatch
- cPanel → Setup Node.js → pilih versi 18.x atau 20.x
- Hapus `node_modules/` dan `npm install` ulang

### Build error (next build gagal)
```bash
# Cek memory limit
NODE_OPTIONS="--max-old-space-size=512" npm run build

# Atau build di lokal lalu upload folder .next/
```

### Cannot find module 'next'
```bash
# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### File upload permission denied
```bash
chmod -R 755 public/uploads
chown -R username:username public/uploads
```

### 404 on all pages
- Pastikan `server.js` direferensikan dengan benar di Node.js Selector
- Cek `.htaccess` rules

---

## Post-Deploy Checklist

- [ ] Ganti password default semua user demo (`password123`)
- [ ] Hapus seed data jika tidak diperlukan
- [ ] Enable SSL (cPanel → SSL/TLS → AutoSSL)
- [ ] Setup daily MySQL backup (cPanel → Backup → MySQL)
- [ ] Set `NEXTAUTH_URL` ke domain HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Test WhatsApp gateway (jika digunakan)
- [ ] Monitor error logs di cPanel

---

## Struktur Post-Deploy

```
public_html/
├── .env                  # Environment (JANGAN commit!)
├── .htaccess             # Apache/Passenger config
├── server.js             # Custom server
├── package.json
├── next.config.js
├── .next/                # Build output (auto-generated)
├── node_modules/         # Dependencies (auto-installed)
├── public/
│   └── uploads/          # User uploads (chmod 755)
└── src/                  # Source code (opsional di production)
```

---

## Monitoring

### Cek status aplikasi:
- cPanel → **Setup Node.js App** → lihat status aplikasi
- cPanel → **Metrics** → **Errors**

### Restart aplikasi:
```bash
# Via cPanel: klik Restart di Setup Node.js App
# Atau touch restart file:
touch ~/public_html/tmp/restart.txt
```

### Cek proses Node:
```bash
ps aux | grep node
```

---

## Deploy Ulang (Update Code)

```bash
cd ~/public_html
git pull
npm install  # jika ada dependency baru
npm run build  # rebuild
# Restart via cPanel atau touch tmp/restart.txt
```

---

Punya masalah? Buka issue di [GitHub](https://github.com/WellArtDev/build-up/issues).
