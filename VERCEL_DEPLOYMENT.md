# 🚀 Vercel Deployment Guide

## ✅ Prerequisites

Semua API routes sudah dibuat dan siap untuk production! Sebelum deploy, pastikan:

- [x] Database Supabase sudah setup
- [x] Prisma schema sudah di-migrate
- [x] API routes sudah dibuat (Siswa, Kuis, Materi, Chat, Kelas, Nilai, Notifications)
- [x] No TypeScript errors

---

## 📋 Step-by-Step Deployment

### 1. **Setup Environment Variables di Vercel**

Masuk ke Vercel Dashboard → Your Project → Settings → Environment Variables

Tambahkan variabel berikut:

#### **DATABASE_URL** (Required)
Supabase connection string dengan **Session Pooler** (bukan Direct Connection):
```
postgresql://postgres.rgvnnzbqnoicuoozahii:RichardChristianSulistyo@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**⚠️ IMPORTANT:** Gunakan **Session Pooler**, bukan Transaction Pooler atau Direct Connection!

#### **JWT_SECRET** (Required)
Generate random string untuk JWT:
```bash
# Run in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy hasilnya dan paste di Vercel environment variable.

#### **NEXTAUTH_SECRET** (Optional - jika pakai NextAuth)
Generate dengan:
```bash
openssl rand -base64 32
```

#### **NEXTAUTH_URL** (Optional - jika pakai NextAuth)
Set ke domain Vercel production:
```
https://your-app-name.vercel.app
```

#### **NEXT_PUBLIC_APP_URL** (Optional)
Set ke domain Vercel production:
```
https://your-app-name.vercel.app
```

---

### 2. **Vercel Configuration**

File `next.config.ts` sudah siap. Tidak perlu membuat `vercel.json` untuk Next.js project.

#### **Build Settings** (Vercel akan auto-detect):
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (includes `prisma generate`)
- **Output Directory:** `.next` (auto)
- **Install Command:** `npm install`

---

### 3. **Database Connection Pooling**

Untuk Vercel Serverless Functions, **HARUS** menggunakan **Supabase Session Pooler**:

✅ **CORRECT:**
```
postgresql://postgres.[ID]:[PASS]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

❌ **WRONG (akan error di production):**
```
postgresql://postgres.[ID]:[PASS]@aws-1-ap-southeast-1.aws.supabase.co:5432/postgres
```

**Why?** Vercel serverless functions terbatas jumlah koneksi database. Session pooler mengatasi masalah ini.

---

### 4. **Local .env Setup**

Update file `.env` lokal:

```bash
# Copy dari .env.example
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres.rgvnnzbqnoicuoozahii:RichardChristianSulistyo@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
JWT_SECRET="generate-random-string-here"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-string-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 5. **Deploy to Vercel**

#### **Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### **Via Git Push:**
1. Push code ke GitHub
2. Import project di Vercel Dashboard
3. Add environment variables
4. Deploy!

---

### 6. **Post-Deployment Testing**

#### **Test API Endpoints:**

**1. Test Health Check:**
```bash
curl https://your-app.vercel.app/api/siswa
```

**2. Test Authentication:**
```bash
curl -X POST https://your-app.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'
```

**3. Test CRUD Operations:**
```bash
# Get all quizzes
curl https://your-app.vercel.app/api/kuis

# Create material
curl -X POST https://your-app.vercel.app/api/materi \
  -H "Content-Type: application/json" \
  -d '{"guruId":"xxx","judul":"Test","tipeMateri":"pdf"}'
```

---

## 🔧 Troubleshooting

### **Error: "Can't reach database server"**

**Problem:** Using Direct Connection instead of Session Pooler

**Solution:** Change `DATABASE_URL` to use `.pooler.supabase.com`:
```
postgresql://postgres.[ID]:[PASS]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### **Error: "Prepared statement already exists"**

**Problem:** Prisma connection pooling issue

**Solution:** Add to `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this for migrations
}
```

Then set environment variables:
```env
DATABASE_URL="postgresql://...pooler.supabase.com..."  # Pooler for app
DIRECT_URL="postgresql://...aws.supabase.co..."        # Direct for migrations
```

### **Error: "JWT_SECRET is not defined"**

**Problem:** Missing environment variable

**Solution:** Add `JWT_SECRET` to Vercel environment variables

### **Error: "Module not found: @prisma/client"**

**Problem:** Prisma Client not generated

**Solution:** `postinstall` script in package.json will auto-run `prisma generate`. Redeploy.

### **Error: CORS issues from frontend**

**Problem:** Cross-origin requests blocked

**Solution:** Add CORS headers in `next.config.ts` or middleware

---

## 📊 Performance Tips

### **1. Database Query Optimization**

API routes sudah include relation selects yang optimal:
```typescript
// ✅ Good - select only needed fields
include: {
  siswa: {
    select: {
      nama: true
    }
  }
}

// ❌ Bad - fetches all fields
include: {
  siswa: true
}
```

### **2. Enable Edge Runtime (Optional)**

For faster cold starts, consider Edge Runtime for some routes:
```typescript
export const runtime = 'edge' // Add to route.ts
```

**Note:** Not all features work on Edge (e.g., some Prisma features)

### **3. Database Connection Pooling**

Already using Supabase Session Pooler ✓

### **4. Caching**

Add caching headers for static data:
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
  }
})
```

---

## 🔐 Security Checklist

- [x] Use environment variables (not hardcoded secrets)
- [x] Use HTTPS only in production
- [x] JWT tokens stored in httpOnly cookies
- [x] Passwords hashed with bcryptjs
- [x] Input validation on all API routes
- [x] Error messages don't leak sensitive info
- [ ] Add rate limiting (recommended)
- [ ] Add CORS whitelist (if needed)
- [ ] Setup CSP headers (recommended)

---

## 🎯 Environment Variables Checklist

Copy this checklist to ensure all variables are set in Vercel:

```
Production Environment Variables:
✅ DATABASE_URL (Session Pooler URL)
✅ JWT_SECRET (random 32+ char string)
✅ NEXTAUTH_SECRET (if using NextAuth)
✅ NEXTAUTH_URL (https://your-app.vercel.app)
✅ NEXT_PUBLIC_APP_URL (https://your-app.vercel.app)
```

---

## 📝 Quick Deploy Commands

```bash
# 1. Generate Prisma Client locally to test
npx prisma generate

# 2. Build locally to test
npm run build

# 3. Test production build
npm run start

# 4. Deploy to Vercel
vercel --prod
```

---

## 🌐 API Base URLs

**Local Development:**
```
http://localhost:3000/api
```

**Production (Vercel):**
```
https://your-app-name.vercel.app/api
```

**Update frontend API calls:**
```typescript
const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
fetch(`${API_BASE}/api/kuis`)
```

---

## 📱 Testing After Deployment

### **1. Check Build Logs**
Vercel Dashboard → Deployments → Latest → View Build Logs

Look for:
- ✅ `npx prisma generate` ran successfully
- ✅ Build completed without errors
- ✅ All routes compiled

### **2. Check Function Logs**
Vercel Dashboard → Deployments → Latest → View Function Logs

Test API endpoints and check for errors.

### **3. Test All Features**
- [ ] Login/Register
- [ ] Create/Read/Update/Delete operations
- [ ] File uploads (if any)
- [ ] Chat functionality
- [ ] Notifications

---

## 🚨 Common Vercel Limits

**Free Tier:**
- Serverless Function Timeout: 10 seconds
- Serverless Function Memory: 1024 MB
- Bandwidth: 100 GB/month
- Builds: Unlimited

**Pro Tier:**
- Function Timeout: 60 seconds
- Function Memory: 3008 MB
- Bandwidth: 1 TB/month

**⚠️ If you hit timeout errors:** Optimize database queries or upgrade plan.

---

## ✅ Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database using Session Pooler connection
- [ ] JWT_SECRET generated and set
- [ ] Test all API endpoints work
- [ ] Test authentication flow
- [ ] Check error handling
- [ ] Monitor function logs for errors
- [ ] Test on mobile devices
- [ ] Setup custom domain (optional)

---

## 🎉 Success!

Jika semua checklist di atas sudah ✅, aplikasi Anda **SIAP PRODUCTION** di Vercel!

**Test Base URL:**
```bash
https://your-app-name.vercel.app
```

**All API Routes Ready:**
- ✅ `/api/siswa` - Student management
- ✅ `/api/kuis` - Quiz management
- ✅ `/api/materi` - Learning materials
- ✅ `/api/chat` - Messaging
- ✅ `/api/kelas` - Class management  
- ✅ `/api/nilai` - Grades
- ✅ `/api/notifications` - Notifications
- ✅ `/api/auth/signin` - Authentication
- ✅ `/api/auth/signout` - Sign out
- ✅ `/api/auth/register` - Registration

---

## 📞 Need Help?

**Common Resources:**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma on Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Supabase Pooler: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
