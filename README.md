# EduSpecial - Sistem Manajemen Pembelajaran ABK

Platform terpadu untuk manajemen pembelajaran anak berkebutuhan khusus (ABK) dengan fitur monitoring orang tua, pembelajaran interaktif, dan komunikasi guru-orang tua.

## 🚀 Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Frontend), Supabase (Database)

## ✨ Fitur Utama

### 🎓 **Untuk Guru**
- Kelola kelas dan siswa
- Buat kuis (Live & Homework mode)
- Upload materi pembelajaran
- Input nilai dan buat progress report
- Chat dengan orang tua
- Gamifikasi (badges & rewards)

### 👨‍👩‍👧 **Untuk Orang Tua**
- Monitoring perkembangan anak real-time
- Laporan belajar di rumah
- Chat dengan guru
- Pengajuan jadwal temu
- Dashboard analytics
- Switch ke mode siswa

### 🎒 **Untuk Siswa**
- Kerjakan kuis interaktif
- Akses materi pembelajaran
- Lihat nilai dan progress
- Kumpulkan badges & achievements
- Dashboard pribadi

### 🔧 **Untuk Admin**
- Manajemen user (Guru, Orang Tua, Siswa)
- Manajemen kelas
- Dashboard overview
- Export laporan

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (lokal atau Supabase)
- npm atau yarn

## 🛠️ Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

#### Option A: Menggunakan Supabase (Recommended)

1. Buat project di [Supabase](https://supabase.com)
2. Copy connection string dari Settings → Database
3. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Option B: PostgreSQL Lokal

1. Install PostgreSQL
2. Buat database:
```bash
createdb eduproject
```

3. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eduproject"
```

### 3. Configure Environment Variables

Update `.env`:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
edu_project/
├── app/
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── admin/dashboard/    # Admin dashboard
│   ├── guru/dashboard/     # Guru dashboard
│   ├── parent/dashboard/   # Parent dashboard
│   ├── student/dashboard/  # Student dashboard
│   ├── api/auth/           # API routes
│   └── page.tsx            # Landing page
├── prisma/
│   └── schema.prisma       # Database schema
├── lib/
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utilities
├── auth.ts                 # NextAuth config
└── middleware.ts           # Auth middleware
```

## 🗄️ Database Schema

17 model utama: User, Guru, Siswa, Kelas, Nilai, Kuis, ProgressReport, LaporanBelajarRumah, Chat, Badge, dll.

## 🔐 Authentication

- Register dengan role PARENT/GURU
- Login redirect ke dashboard sesuai role
- Parent bisa switch ke mode Student

## 🚀 Deployment

### Deploy ke Vercel

```bash
vercel
```

Set environment variables di Vercel dashboard.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Supabase Documentation](https://supabase.com/docs)

## 📄 License

MIT License - Copyright (c) 2026 EduSpecial

---

**Built with ❤️ for special education**

