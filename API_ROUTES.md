# API Routes Documentation

## Base URL
All API routes are prefixed with `/api`

---

## 🎓 Siswa (Students)

### GET /api/siswa
Get all students with optional filters

**Query Parameters:**
- `kelasId` - Filter by class ID
- `search` - Search by name (fuzzy match)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "kelasId": "string",
      "nisn": "string",
      "user": { "name": "string" },
      "kelas": { "nama": "string" },
      "nilai": [],
      "absensi": []
    }
  ]
}
```

### POST /api/siswa
Create new student

**Body:**
```json
{
  "userId": "string",
  "kelasId": "string",
  "nisn": "string",
  "tanggalLahir": "2010-01-01",
  "alamat": "string",
  "nomorHP": "string",
  "parentId": "string"
}
```

### GET /api/siswa/[id]
Get single student by ID (includes all relations)

### PATCH /api/siswa/[id]
Update student

**Body:** Same as POST (all fields optional)

### DELETE /api/siswa/[id]
Delete student (cascade deletes)

---

## 📝 Kuis (Quizzes)

### GET /api/kuis
Get all quizzes with filters

**Query Parameters:**
- `guruId` - Filter by teacher ID
- `kelasId` - Filter by class ID
- `status` - Filter by status (DRAFT/ACTIVE/ARCHIVED)
- `search` - Search by title or subject

**Response includes:**
- Total questions count
- Total participants
- Average score

### POST /api/kuis
Create new quiz with questions

**Body:**
```json
{
  "guruId": "string",
  "kelasId": "string",
  "judul": "string",
  "deskripsi": "string",
  "mode": "REALTIME|FLEXIBLE",
  "durasi": 60,
  "deadline": "2024-12-31T00:00:00Z",
  "mataPelajaran": "string",
  "pertanyaan": [
    {
      "soal": "string",
      "tipeJawaban": "PILIHAN_GANDA|ESSAY",
      "pilihan": ["A", "B", "C", "D"],
      "jawabanBenar": "A",
      "poin": 10
    }
  ]
}
```

### GET /api/kuis/[id]
Get single quiz with full details and statistics

### PATCH /api/kuis/[id]
Update quiz (can update pertanyaan array)

### DELETE /api/kuis/[id]
Delete quiz (prevents deletion if has submitted results)

---

## 📚 Materi (Materials)

### GET /api/materi
Get all materials

**Query Parameters:**
- `guruId` - Filter by teacher ID
- `kelasId` - Filter by class ID
- `mataPelajaran` - Filter by subject
- `search` - Search by title or description

### POST /api/materi
Create new material

**Body:**
```json
{
  "guruId": "string",
  "kelasId": "string",
  "judul": "string",
  "deskripsi": "string",
  "konten": "string",
  "mataPelajaran": "string",
  "fileUrl": "string"
}
```

### GET /api/materi/[id]
Get single material with details

### PATCH /api/materi/[id]
Update material

### DELETE /api/materi/[id]
Delete material

---

## 💬 Chat (Messages)

### GET /api/chat
Get messages for a user

**Query Parameters:**
- `userId` (required) - Current user ID
- `otherUserId` - Get conversation with specific user
- `limit` - Max messages to return (default: 100)

**Response:**
- If `otherUserId` provided: Array of messages
- Otherwise: Array of conversations with unread count

### POST /api/chat
Send new message

**Body:**
```json
{
  "fromUserId": "string",
  "toUserId": "string",
  "message": "string"
}
```

### PATCH /api/chat
Mark messages as read

**Body:**
```json
{
  "userId": "string",
  "otherUserId": "string"
}
```

---

## 🏫 Kelas (Classes)

### GET /api/kelas
Get all classes

**Query Parameters:**
- `guruId` - Filter by teacher ID
- `tingkat` - Filter by grade level
- `search` - Search by name

**Response includes:**
- Student count
- Quiz count
- Material count

### POST /api/kelas
Create new class

**Body:**
```json
{
  "guruId": "string",
  "nama": "string",
  "tingkat": "string",
  "tahunAjaran": "2024/2025"
}
```

### GET /api/kelas/[id]
Get single class with all relations (students, quizzes, materials)

### PATCH /api/kelas/[id]
Update class

### DELETE /api/kelas/[id]
Delete class (prevents deletion if has students)

---

## 📊 Nilai (Grades)

### GET /api/nilai
Get all grades

**Query Parameters:**
- `siswaId` - Filter by student ID
- `guruId` - Filter by teacher ID
- `mataPelajaran` - Filter by subject
- `semester` - Filter by semester

### POST /api/nilai
Create new grade

**Body:**
```json
{
  "siswaId": "string",
  "guruId": "string",
  "mataPelajaran": "string",
  "semester": "string",
  "tahunAjaran": "2024/2025",
  "nilaiTugas": 85,
  "nilaiUTS": 90,
  "nilaiUAS": 88,
  "catatan": "string"
}
```

**Auto-calculations:**
- `nilaiAkhir` = (nilaiTugas × 30%) + (nilaiUTS × 30%) + (nilaiUAS × 40%)
- `predikat` = A (≥90), B (≥80), C (≥70), D (≥60), E (<60)

### GET /api/nilai/[id]
Get single grade with details

### PATCH /api/nilai/[id]
Update grade (auto-recalculates nilaiAkhir and predikat)

### DELETE /api/nilai/[id]
Delete grade

---

## 🔔 Notifications

### GET /api/notifications
Get notifications for a user

**Query Parameters:**
- `userId` (required) - User ID
- `isRead` - Filter by read status (true/false)
- `limit` - Max notifications to return (default: 50)

**Response includes:**
- Array of notifications
- `unreadCount` - Total unread notifications

### POST /api/notifications
Create new notification

**Body:**
```json
{
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "INFO|SUCCESS|WARNING|ERROR"
}
```

### PATCH /api/notifications
Mark notifications as read

**Body:**
```json
{
  "userId": "string",
  "notificationId": "string",  // For specific notification
  "markAllAsRead": true        // Or mark all as read
}
```

### DELETE /api/notifications
Delete notification

**Query Parameters:**
- `id` - Notification ID to delete
- `userId` + `deleteAll=true` - Delete all read notifications

---

## 🔐 Authentication

### POST /api/auth/register
Register new user

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "GURU|SISWA|PARENT|ADMIN"
}
```

### POST /api/auth/signin
Sign in

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### POST /api/auth/signout
Sign out (clears session)

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid fields)
- `404` - Not Found
- `500` - Internal Server Error

---

## Usage Examples

### Fetch all quizzes for a teacher
```typescript
const response = await fetch('/api/kuis?guruId=xxx&status=ACTIVE')
const { data } = await response.json()
```

### Create a new student
```typescript
const response = await fetch('/api/siswa', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'xxx',
    kelasId: 'yyy',
    nisn: '123456'
  })
})
```

### Get chat conversations
```typescript
const response = await fetch('/api/chat?userId=xxx')
const { data } = await response.json()
// data.conversations contains list of conversations
```

### Mark all notifications as read
```typescript
await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'xxx',
    markAllAsRead: true
  })
})
```

---

## Notes

1. **Relations**: GET endpoints automatically include related data (guru, kelas, siswa, etc.)
2. **Search**: Search parameters use case-insensitive partial matching
3. **Validation**: All POST/PATCH endpoints validate required fields
4. **Cascade Deletes**: Some delete operations prevent deletion if related data exists
5. **Auto-calculations**: Nilai endpoint auto-calculates final grades and predicates
6. **Timestamps**: All records include `createdAt` and `updatedAt` timestamps

---

## Frontend Integration

Replace localStorage with API calls:

```typescript
// Before (localStorage)
const data = JSON.parse(localStorage.getItem('kuis') || '[]')

// After (API)
const response = await fetch('/api/kuis?guruId=xxx')
const { data } = await response.json()
```
