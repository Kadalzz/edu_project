# 🚀 QUICK START - API USAGE EXAMPLES

## 📦 NEW API ENDPOINTS

### 1. Start Tugas (Create HasilTugas)
**Endpoint:** `POST /api/tugas/[id]/start`

**Use Case:** Student first opens a tugas to begin working on it

**Request:**
```typescript
const response = await fetch(`/api/tugas/${tugasId}/start`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siswaId: 'siswa-id-here',
    pinCode: '123456' // Required for LIVE mode only
  })
})

const data = await response.json()
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "hasil-tugas-id",
    "tugasId": "tugas-id",
    "siswaId": "siswa-id",
    "skorMaksimal": 100,
    "waktuMulai": "2026-02-08T10:00:00Z",
    "skor": 0
  },
  "tugas": {
    "id": "tugas-id",
    "judul": "Matematika Quiz 1",
    "mode": "LIVE",
    "durasi": 30,
    "deadline": null
  },
  "message": "Tugas berhasil dimulai!"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid PIN code"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "PIN code required for LIVE mode"
}
```

---

### 2. Submit Individual Answer
**Endpoint:** `POST /api/tugas/[id]/answer`

**Use Case:** Student answers each question (called once per question)

**Request:**
```typescript
const response = await fetch(`/api/tugas/${tugasId}/answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siswaId: 'siswa-id',
    pertanyaanId: 'pertanyaan-id',
    jawaban: 'B', // For multiple choice
    // OR
    jawaban: 'Full essay answer here...', // For essay
    hasilTugasId: 'hasil-tugas-id' // Optional, will find automatically
  })
})

const data = await response.json()
```

**Success Response (200) - Multiple Choice (Auto-Graded):**
```json
{
  "success": true,
  "data": {
    "id": "jawaban-id",
    "hasilTugasId": "hasil-tugas-id",
    "pertanyaanId": "pertanyaan-id",
    "jawaban": "B",
    "benar": true,
    "poin": 10
  },
  "message": "Jawaban berhasil disimpan"
}
```

**Success Response (200) - Essay (Manual Grading):**
```json
{
  "success": true,
  "data": {
    "id": "jawaban-id",
    "hasilTugasId": "hasil-tugas-id",
    "pertanyaanId": "pertanyaan-id",
    "jawaban": "Full essay answer...",
    "benar": null,
    "poin": 0
  },
  "message": "Jawaban berhasil disimpan"
}
```

---

### 3. Get Student's Answers
**Endpoint:** `GET /api/tugas/[id]/answer?siswaId=xxx`

**Use Case:** Fetch all answers student has submitted for this tugas

**Request:**
```typescript
const response = await fetch(
  `/api/tugas/${tugasId}/answer?siswaId=${siswaId}`
)
const data = await response.json()
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "jawaban-1-id",
      "hasilTugasId": "hasil-tugas-id",
      "pertanyaanId": "pertanyaan-1-id",
      "jawaban": "B",
      "benar": true,
      "poin": 10,
      "pertanyaan": {
        "id": "pertanyaan-1-id",
        "soal": "What is 2+2?",
        "tipeJawaban": "multiple_choice",
        "poin": 10,
        "urutan": 1
      }
    },
    {
      "id": "jawaban-2-id",
      "hasilTugasId": "hasil-tugas-id",
      "pertanyaanId": "pertanyaan-2-id",
      "jawaban": "Essay answer here...",
      "benar": null,
      "poin": 0,
      "pertanyaan": {
        "id": "pertanyaan-2-id",
        "soal": "Explain gravity",
        "tipeJawaban": "essay",
        "poin": 20,
        "urutan": 2
      }
    }
  ]
}
```

---

### 4. Final Submit Tugas
**Endpoint:** `POST /api/tugas/[id]/submit`

**Use Case:** Student finishes and submits the entire tugas

**Request:**
```typescript
const response = await fetch(`/api/tugas/${tugasId}/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    siswaId: 'siswa-id',
    videoUrl: 'https://...', // Optional for HOMEWORK mode
    catatan: 'Optional notes' // Optional
  })
})

const data = await response.json()
```

**Success Response (200) - Auto-Graded:**
```json
{
  "success": true,
  "data": {
    "id": "hasil-tugas-id",
    "tugasId": "tugas-id",
    "siswaId": "siswa-id",
    "skor": 85,
    "skorMaksimal": 100,
    "nilai": 85,
    "waktuMulai": "2026-02-08T10:00:00Z",
    "waktuSelesai": "2026-02-08T10:25:00Z",
    "submittedAt": "2026-02-08T10:25:00Z",
    "gradedAt": "2026-02-08T10:25:00Z",
    "videoUrl": null,
    "catatan": null
  },
  "message": "Tugas berhasil dikumpulkan dan dinilai otomatis!",
  "autoGraded": true
}
```

**Success Response (200) - Needs Manual Grading:**
```json
{
  "success": true,
  "data": {
    "id": "hasil-tugas-id",
    "tugasId": "tugas-id",
    "siswaId": "siswa-id",
    "skor": 60,
    "skorMaksimal": 100,
    "nilai": null,
    "waktuMulai": "2026-02-08T10:00:00Z",
    "waktuSelesai": "2026-02-08T10:25:00Z",
    "submittedAt": "2026-02-08T10:25:00Z",
    "gradedAt": null,
    "videoUrl": "https://...",
    "catatan": null
  },
  "message": "Tugas berhasil dikumpulkan! Menunggu penilaian guru untuk soal essay.",
  "autoGraded": false
}
```

---

### 5. Grade Submission (Guru Only)
**Endpoint:** `PATCH /api/tugas/[id]/submissions/[submissionId]`

**Use Case:** Guru grades essay questions and sets final nilai

**Request Method 1 - Grade Essay Questions:**
```typescript
const response = await fetch(
  `/api/tugas/${tugasId}/submissions/${submissionId}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      essayGrades: [
        { jawabanId: 'jawaban-1-id', poin: 18 }, // out of 20
        { jawabanId: 'jawaban-2-id', poin: 15 }  // out of 20
      ],
      catatan: 'Good work! Need more details on question 2.'
    })
  }
)

const data = await response.json()
```

**Request Method 2 - Simple Nilai Input:**
```typescript
const response = await fetch(
  `/api/tugas/${tugasId}/submissions/${submissionId}`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nilai: 85,
      catatan: 'Excellent work!'
    })
  }
)

const data = await response.json()
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "hasil-tugas-id",
    "tugasId": "tugas-id",
    "siswaId": "siswa-id",
    "skor": 93,
    "skorMaksimal": 100,
    "nilai": 93,
    "waktuMulai": "2026-02-08T10:00:00Z",
    "waktuSelesai": "2026-02-08T10:25:00Z",
    "submittedAt": "2026-02-08T10:25:00Z",
    "gradedAt": "2026-02-08T11:00:00Z",
    "catatan": "Good work! Need more details on question 2."
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "You do not have permission to grade this submission"
}
```

---

## 🔐 AUTHENTICATION USAGE

### Check if User is Authenticated
```typescript
// In API route
import { getAuthUser } from '@/lib/auth'

export async function GET(req: Request) {
  const user = await getAuthUser()
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    )
  }
  
  // User is authenticated
  console.log(user.userId, user.role, user.name)
}
```

### Require Authentication (Throws Error)
```typescript
import { requireAuth } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    // User is authenticated, continue...
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
```

### Require Specific Role
```typescript
import { requireRole } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await requireRole(['GURU', 'ADMIN'])
    // User is GURU or ADMIN, continue...
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 403 }
    )
  }
}
```

### Get Guru Profile
```typescript
import { getAuthGuru } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const guru = await getAuthGuru()
    // guru.id, guru.userId, guru.nip, guru.user.name
    
    const tugas = await prisma.tugas.create({
      data: {
        guruId: guru.id, // Use authenticated guru's ID
        // ...
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Must be a guru' },
      { status: 403 }
    )
  }
}
```

---

## 📢 NOTIFICATION USAGE

### Create Notification
```typescript
import { createNotification } from '@/lib/auth'

// Notify a user
await createNotification(
  userId,
  'Notification Title',
  'Notification content here',
  'success', // 'info' | 'warning' | 'success'
  '/optional/link'
)
```

### Get User's Notifications
**Endpoint:** `GET /api/notifications?limit=20&isRead=false`

```typescript
const response = await fetch('/api/notifications?limit=50')
const data = await response.json()

// Response:
{
  "success": true,
  "data": [
    {
      "id": "notif-id",
      "userId": "user-id",
      "title": "Tugas Baru Dikumpulkan",
      "content": "Ahmad telah mengumpulkan tugas Matematika Quiz 1",
      "type": "info",
      "link": "/guru/tugas/xxx",
      "isRead": false,
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### Mark Notifications as Read
**Endpoint:** `PATCH /api/notifications`

```typescript
const response = await fetch('/api/notifications', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    notificationIds: ['notif-1', 'notif-2']
  })
})
```

### Mark All as Read
**Endpoint:** `DELETE /api/notifications`

```typescript
const response = await fetch('/api/notifications', {
  method: 'DELETE'
})
```

---

## 📝 ACTIVITY LOG USAGE

### Log an Activity
```typescript
import { logActivity } from '@/lib/auth'

await logActivity(
  userId,
  'ACTION_NAME',
  'EntityType', // 'Tugas', 'Materi', 'Nilai', etc.
  entityId,
  'Human-readable description',
  request.headers.get('x-forwarded-for') // IP address
)
```

### Query Activity Logs
```typescript
const logs = await prisma.activityLog.findMany({
  where: { 
    userId: 'user-id',
    action: 'SUBMIT_TUGAS'
  },
  include: {
    user: {
      select: {
        name: true,
        role: true
      }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 100
})
```

---

## 🎯 COMPLETE TUGAS FLOW EXAMPLE

### Client-Side Implementation

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function TugasPage() {
  const params = useParams()
  const tugasId = params.id as string
  const siswaId = 'siswa-id-from-context' // Get from auth context
  
  const [tugas, setTugas] = useState(null)
  const [hasilTugas, setHasilTugas] = useState(null)
  const [pertanyaan, setPertanyaan] = useState([])
  const [answers, setAnswers] = useState({})
  const [pinCode, setPinCode] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // Step 1: Load tugas detail
  useEffect(() => {
    fetchTugasDetail()
  }, [])

  const fetchTugasDetail = async () => {
    const res = await fetch(`/api/tugas/${tugasId}`)
    const data = await res.json()
    if (data.success) {
      setTugas(data.data)
      setPertanyaan(data.data.pertanyaan)
    }
  }

  // Step 2: Start tugas
  const handleStart = async () => {
    try {
      const res = await fetch(`/api/tugas/${tugasId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          pinCode: tugas.mode === 'LIVE' ? pinCode : undefined
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setHasilTugas(data.data)
        
        // Start timer for LIVE mode
        if (data.tugas.mode === 'LIVE' && data.tugas.durasi) {
          startTimer(data.tugas.durasi)
        }
        
        alert('Tugas dimulai! Selamat mengerjakan.')
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error starting tugas:', error)
      alert('Gagal memulai tugas')
    }
  }

  // Step 3: Timer for LIVE mode
  const startTimer = (durationMinutes: number) => {
    const endTime = Date.now() + (durationMinutes * 60 * 1000)
    
    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      
      if (remaining <= 0) {
        clearInterval(interval)
        // Auto-submit
        handleSubmit()
        alert('Waktu habis! Tugas otomatis dikumpulkan.')
      } else {
        const minutes = Math.floor(remaining / 60000)
        const seconds = Math.floor((remaining % 60000) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
    }, 1000)
  }

  // Step 4: Save each answer
  const handleAnswerChange = async (pertanyaanId: string, jawaban: string) => {
    setAnswers(prev => ({ ...prev, [pertanyaanId]: jawaban }))
    
    // Auto-save answer
    await fetch(`/api/tugas/${tugasId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siswaId,
        pertanyaanId,
        jawaban,
        hasilTugasId: hasilTugas.id
      })
    })
  }

  // Step 5: Final submit
  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/tugas/${tugasId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswaId })
      })

      const data = await res.json()
      
      if (data.success) {
        setSubmitted(true)
        alert(data.message)
        
        if (data.autoGraded) {
          alert(`Nilai Anda: ${data.data.nilai}`)
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error submitting tugas:', error)
      alert('Gagal mengumpulkan tugas')
    }
  }

  if (!tugas) {
    return <div>Loading...</div>
  }

  if (submitted) {
    return (
      <div>
        <h1>Tugas Berhasil Dikumpulkan!</h1>
        <p>Terima kasih telah mengerjakan tugas.</p>
      </div>
    )
  }

  if (!hasilTugas) {
    return (
      <div>
        <h1>{tugas.judul}</h1>
        <p>{tugas.deskripsi}</p>
        
        {tugas.mode === 'LIVE' && (
          <div>
            <input
              type="text"
              placeholder="Enter PIN"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              maxLength={6}
            />
          </div>
        )}
        
        <button onClick={handleStart}>
          {tugas.mode === 'LIVE' ? 'Join LIVE Session' : 'Mulai Mengerjakan'}
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>{tugas.judul}</h1>
      
      {timeRemaining && (
        <div className="timer">
          Waktu Tersisa: {timeRemaining}
        </div>
      )}
      
      {pertanyaan.map((q, index) => (
        <div key={q.id} className="question">
          <h3>Soal {index + 1}</h3>
          <p>{q.soal}</p>
          
          {q.tipeJawaban === 'multiple_choice' && (
            <div>
              {q.pilihan.map((pilihan: string) => (
                <label key={pilihan}>
                  <input
                    type="radio"
                    name={q.id}
                    value={pilihan}
                    checked={answers[q.id] === pilihan}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                  {pilihan}
                </label>
              ))}
            </div>
          )}
          
          {q.tipeJawaban === 'essay' && (
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder="Tulis jawaban Anda di sini..."
            />
          )}
        </div>
      ))}
      
      <button onClick={handleSubmit}>
        Kumpulkan Tugas
      </button>
    </div>
  )
}
```

---

## 🎨 GURU GRADING EXAMPLE

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function GradeSubmissionPage() {
  const params = useParams()
  const { tugasId, submissionId } = params
  
  const [submission, setSubmission] = useState(null)
  const [essayGrades, setEssayGrades] = useState({})
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    fetchSubmission()
  }, [])

  const fetchSubmission = async () => {
    const res = await fetch(`/api/tugas/${tugasId}/submissions`)
    const data = await res.json()
    // Find specific submission
    const sub = data.data.find(s => s.id === submissionId)
    setSubmission(sub)
  }

  const handleGrade = async () => {
    const essayGradesArray = Object.entries(essayGrades).map(([jawabanId, poin]) => ({
      jawabanId,
      poin: parseFloat(poin as string)
    }))

    const res = await fetch(
      `/api/tugas/${tugasId}/submissions/${submissionId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essayGrades: essayGradesArray,
          catatan
        })
      }
    )

    const data = await res.json()
    if (data.success) {
      alert('Penilaian berhasil disimpan!')
    } else {
      alert(data.error)
    }
  }

  if (!submission) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Grade Submission</h1>
      <h2>Student: {submission.siswa.nama}</h2>
      
      {submission.jawaban.map((jawaban) => (
        <div key={jawaban.id}>
          <h3>{jawaban.pertanyaan.soal}</h3>
          <p><strong>Answer:</strong> {jawaban.jawaban}</p>
          
          {jawaban.pertanyaan.tipeJawaban === 'essay' && (
            <div>
              <label>
                Points (max {jawaban.pertanyaan.poin}):
                <input
                  type="number"
                  min="0"
                  max={jawaban.pertanyaan.poin}
                  value={essayGrades[jawaban.id] || ''}
                  onChange={(e) => 
                    setEssayGrades(prev => ({
                      ...prev,
                      [jawaban.id]: e.target.value
                    }))
                  }
                />
              </label>
            </div>
          )}
          
          {jawaban.pertanyaan.tipeJawaban === 'multiple_choice' && (
            <p>
              {jawaban.benar ? '✅ Correct' : '❌ Wrong'} 
              ({jawaban.poin} points)
            </p>
          )}
        </div>
      ))}
      
      <div>
        <label>
          Catatan untuk siswa:
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
        </label>
      </div>
      
      <button onClick={handleGrade}>
        Save Grades
      </button>
    </div>
  )
}
```

---

**Need More Examples?** Check [AUDIT_REPORT.md](./AUDIT_REPORT.md) and [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
