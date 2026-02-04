# DEPLOYMENT GUIDE

## 🚀 Deploy ke Vercel + Supabase (Gratis)

### Step 1: Setup Supabase Database

1. **Buat Account Supabase**
   - Kunjungi [supabase.com](https://supabase.com)
   - Sign up gratis

2. **Buat Project Baru**
   - Klik "New Project"
   - Pilih organization
   - Set nama project: `eduspecial-db`
   - Set password database (simpan dengan aman!)
   - Pilih region terdekat (Singapore)
   - Klik "Create new project"

3. **Copy Database URL**
   - Tunggu setup selesai (~2 menit)
   - Go to Settings → Database
   - Copy "Connection String" (URI mode)
   - Format: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

### Step 2: Setup Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd c:\git\edu_project
   vercel
   ```

4. **Jawab Pertanyaan:**
   - Set up and deploy? → Y
   - Which scope? → Your account
   - Link to existing project? → N
   - Project name? → eduspecial (atau nama lain)
   - Directory? → ./ (default)
   - Override settings? → N

5. **Setup Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste DATABASE_URL dari Supabase
   
   ```bash
   vercel env add NEXTAUTH_URL
   ```
   Value: URL Vercel Anda (misal: https://eduspecial.vercel.app)
   
   ```bash
   vercel env add NEXTAUTH_SECRET
   ```
   Generate dengan: `openssl rand -base64 32` (Windows: gunakan online generator)
   
   ```bash
   vercel env add NEXT_PUBLIC_APP_URL
   ```
   Value: sama dengan NEXTAUTH_URL

6. **Deploy Production**
   ```bash
   vercel --prod
   ```

### Step 3: Setup Database Schema

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Push Schema ke Database**
   ```bash
   npx prisma db push
   ```

3. **Verify di Supabase**
   - Go to Table Editor
   - Lihat semua tabel sudah terbuat

### Step 4: Create Admin User (Manual)

1. **Generate Password Hash**
   
   Buat file `scripts/hash-password.js`:
   ```javascript
   const bcrypt = require('bcryptjs');
   const password = 'admin123'; // Ganti dengan password Anda
   const hash = bcrypt.hashSync(password, 10);
   console.log(hash);
   ```
   
   Run:
   ```bash
   node scripts/hash-password.js
   ```

2. **Insert Admin via Supabase SQL Editor**
   
   Go to SQL Editor di Supabase, run:
   ```sql
   INSERT INTO users (id, email, password, role, name, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'admin@eduspecial.com',
     '[PASTE_HASH_DARI_STEP_1]',
     'ADMIN',
     'Administrator',
     NOW(),
     NOW()
   );
   ```

### Step 5: Test Website

1. **Buka URL Vercel**
   - https://eduspecial.vercel.app (atau domain Anda)

2. **Login sebagai Admin**
   - Email: admin@eduspecial.com
   - Password: admin123 (atau yang Anda set)

3. **Test Register**
   - Daftar sebagai Guru atau Parent
   - Login dengan akun baru

### Step 6: Custom Domain (Opsional)

1. **Beli Domain**
   - Niagahoster: .my.id (~Rp 15.000/tahun)
   - Atau provider lain

2. **Setup di Vercel**
   - Go to Project Settings → Domains
   - Add domain
   - Follow DNS setup instructions

## 📝 Environment Variables Checklist

Pastikan semua ini ter-set di Vercel:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
NEXTAUTH_URL=https://eduspecial.vercel.app
NEXTAUTH_SECRET=[GENERATED_SECRET]
NEXT_PUBLIC_APP_URL=https://eduspecial.vercel.app
```

## 🐛 Troubleshooting

### Error: "Database connection failed"
- Check DATABASE_URL di Vercel env
- Pastikan tidak ada typo
- Test connection di Prisma Studio: `npx prisma studio`

### Error: "NextAuth session error"
- Regenerate NEXTAUTH_SECRET
- Redeploy: `vercel --prod`

### Error: "Page not found"
- Check build logs di Vercel dashboard
- Pastikan semua dependencies terinstall

### Database Schema Outdated
```bash
# Update schema
npx prisma db push --force-reset
```

## 🔄 Update Deployment

Setiap kali ada perubahan code:

```bash
# Push ke Git (jika sudah setup)
git add .
git commit -m "Update feature"
git push

# Atau deploy langsung
vercel --prod
```

Vercel akan auto-deploy jika connected dengan Git repo.

## 📊 Monitoring

1. **Vercel Dashboard**
   - https://vercel.com/dashboard
   - Lihat analytics, logs, errors

2. **Supabase Dashboard**
   - https://supabase.com/dashboard
   - Monitor database usage, queries

## 💰 Cost Monitoring

**Free Tier Limits:**
- Vercel: 100GB bandwidth
- Supabase: 500MB database, 1GB file storage
- Untuk <10 users: gratis selamanya!

**Jika exceed:**
- Vercel Pro: $20/month
- Supabase Pro: $25/month

## ✅ Post-Deployment Checklist

- [ ] Website accessible via URL
- [ ] Admin login works
- [ ] Register user works
- [ ] Dashboard loads
- [ ] Database connected
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SSL/HTTPS working

---

**Website Anda sudah LIVE! 🎉**

Next: Mulai develop fitur-fitur lanjutan!
