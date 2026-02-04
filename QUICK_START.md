# 🚀 QUICK START GUIDE

## ✅ Setup Berhasil!

Website EduSpecial sudah ter-install dan running di: **http://localhost:3000**

## 📋 Apa yang Sudah Dibuat?

### ✅ **Frontend Pages**
1. **Landing Page** (`/`)
   - Hero section dengan fitur unggulan
   - Navigation bar
   - Call-to-action buttons
   - Footer

2. **Authentication Pages**
   - Login page (`/login`)
   - Register page (`/register`)
   - Support untuk 2 role: GURU & PARENT

3. **Dashboard Pages**
   - Admin Dashboard (`/admin/dashboard`)
   - Guru Dashboard (`/guru/dashboard`)
   - Parent Dashboard (`/parent/dashboard`)
   - Student Dashboard (`/student/dashboard`)

### ✅ **Backend Setup**
- **Database Schema**: 17 models (User, Guru, Siswa, Kelas, Nilai, Kuis, dll)
- **Authentication**: NextAuth.js dengan JWT
- **API Routes**: Registration endpoint
- **Middleware**: Role-based access control

### ✅ **Tech Stack**
- Next.js 14 (App Router + Turbopack)
- TypeScript
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- PostgreSQL

---

## 🎯 Langkah Selanjutnya

### 1. Setup Database (WAJIB)

Sekarang database belum connected. Pilih salah satu:

#### **Option A: Supabase (Recommended - Gratis)**

```bash
# 1. Buat account di supabase.com
# 2. Buat project baru
# 3. Copy DATABASE_URL dari Settings → Database
# 4. Update file .env:

DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# 5. Push schema ke database
npx prisma db push
```

#### **Option B: PostgreSQL Lokal**

```bash
# 1. Install PostgreSQL
# 2. Buat database
createdb eduproject

# 3. Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eduproject"

# 4. Push schema
npx prisma db push
```

### 2. Generate NEXTAUTH_SECRET

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32

# Update di .env:
NEXTAUTH_SECRET="[hasil-generate-di-atas]"
```

### 3. Create Admin User

Setelah database connected:

```bash
# Generate password hash
node scripts/hash-password.js your-password

# Insert via Prisma Studio atau SQL:
npx prisma studio
```

SQL Insert:
```sql
INSERT INTO users (id, email, password, role, name, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@eduspecial.com',
  '[PASTE_HASH]',
  'ADMIN',
  'Administrator',
  NOW(),
  NOW()
);
```

### 4. Test Website

1. **Buka**: http://localhost:3000
2. **Klik "Daftar"** → Register sebagai Guru/Parent
3. **Login** dengan akun yang baru dibuat
4. **Explore dashboard** sesuai role

---

## 🔧 Development Commands

```bash
# Run dev server
npm run dev

# Build production
npm run build

# Start production
npm start

# Prisma commands
npx prisma studio          # Open database GUI
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create migration

# Format code
npx biome check --write .
```

---

## 📁 File Penting

```
.env                         # Environment variables
prisma/schema.prisma         # Database schema
auth.ts                      # Authentication config
middleware.ts                # Route protection
app/page.tsx                 # Landing page
app/login/page.tsx           # Login page
app/register/page.tsx        # Register page
app/api/auth/register/route.ts  # Register API
```

---

## 🎨 Customize Website

### Update Branding

Edit `app/page.tsx`:
```typescript
// Line 11: Change name
<span className="text-xl font-bold">YourBrand</span>

// Line 30: Change title
<h1>Your Custom Title</h1>
```

### Add Logo

1. Put logo image in `public/logo.png`
2. Update components to use:
```tsx
import Image from "next/image"
<Image src="/logo.png" alt="Logo" width={40} height={40} />
```

### Change Colors

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

---

## 🐛 Troubleshooting

### Server tidak mau start
```bash
# Delete .next folder dan restart
rm -rf .next
npm run dev
```

### Prisma error
```bash
# Regenerate client
npx prisma generate
```

### Environment variables tidak kebaca
```bash
# Restart server setelah edit .env
# Ctrl+C dan npm run dev lagi
```

---

## 📖 Next Development Steps

### Phase 1 Features (Minggu 1-2)
- [ ] CRUD User (Admin)
- [ ] CRUD Kelas
- [ ] Assign Guru ke Kelas
- [ ] Add Siswa

### Phase 2 Features (Minggu 3-4)
- [ ] Input Nilai (Guru)
- [ ] View Nilai (Parent/Siswa)
- [ ] Upload Materi
- [ ] Basic Chat

### Phase 3 Features (Minggu 5-6)
- [ ] Kuis System (Homework)
- [ ] Laporan Belajar Rumah
- [ ] Progress Report
- [ ] File Upload (Supabase Storage)

---

## 📚 Dokumentasi

- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy guide
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://prisma.io/docs)

---

## ✅ Checklist Awal

- [ ] Database connected (Supabase/Local)
- [ ] `npx prisma db push` success
- [ ] NEXTAUTH_SECRET generated
- [ ] Admin user created
- [ ] Register new user works
- [ ] Login works
- [ ] Dashboard accessible

---

## 🎉 Selamat!

Website foundation sudah siap. Sekarang tinggal:
1. Connect database
2. Test authentication
3. Mulai develop fitur-fitur sesuai konsep

**Happy coding!** 🚀

---

## 💬 Need Help?

1. Check error di terminal
2. Check browser console (F12)
3. Read documentation links
4. Google error message

**Website Structure:**
```
Landing (/) → Login → Dashboard (role-based) → Features
```
