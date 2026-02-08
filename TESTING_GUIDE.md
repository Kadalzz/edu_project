# 🧪 End-to-End Testing Guide

## Test Environment Setup

**Date:** February 8, 2026  
**System:** LMS with Auto-Grading Features  
**Database:** PostgreSQL (Supabase)  
**Frontend:** Next.js 14 (App Router)

---

## ✅ Completed Features

### Backend (API)
- ✅ JWT Authentication with httpOnly cookies
- ✅ RBAC Middleware protecting all routes
- ✅ Auto-grading for multiple choice & true/false
- ✅ Manual grading for essay questions
- ✅ PIN generation & validation for LIVE mode
- ✅ Timer-based auto-submission
- ✅ Notification system (GURU → PARENT)
- ✅ Activity logging for audit trail
- ✅ New endpoint: `/api/tugas/[id]/submissions/[submissionId]/jawaban`

### Frontend (Client)
- ✅ Student tugas page with:
  - PIN input for LIVE sessions
  - Timer with auto-submit
  - Question answering (MC, Essay, True/False)
  - Auto-save on input change
  - Video upload for HOMEWORK mode
- ✅ Guru grading page with:
  - Per-question viewing
  - Auto-graded scores (read-only)
  - Essay grading inputs
  - Auto-calculated total score
  - Notification sending on submit

---

## 📋 Test Scenarios

### 1. LIVE Mode Flow (Priority: HIGH)

#### Test 1.1: Create LIVE Tugas as GURU
**Steps:**
1. Login as GURU
2. Navigate to `/guru/tugas`
3. Click "Buat Tugas Baru"
4. Fill form:
   - Judul: "Ujian Matematika Bab 1"
   - Mata Pelajaran: "Matematika"
   - Mode: **LIVE**
   - Durasi: 30 menit
   - Status: ACTIVE
   - Add questions:
     - Q1: Multiple Choice (10 poin)
     - Q2: Essay (15 poin)
     - Q3: True/False (5 poin)
5. Submit and note the generated **PIN** (6 digits)

**Expected Result:**
- ✅ Tugas created successfully
- ✅ PIN displayed (e.g., 123456)
- ✅ Status: ACTIVE
- ✅ Questions saved with jawabanBenar

**Verification:**
```sql
SELECT id, judul, mode, pinCode, durasi, status 
FROM "Tugas" 
WHERE judul = 'Ujian Matematika Bab 1';

SELECT id, soal, tipeJawaban, jawabanBenar, poin 
FROM "Pertanyaan" 
WHERE tugasId = '<tugas_id>';
```

---

#### Test 1.2: Student Join LIVE Session with PIN
**Steps:**
1. Login as STUDENT
2. Navigate to `/student/tugas`
3. Click on "Ujian Matematika Bab 1"
4. See PIN input form
5. Enter wrong PIN first: "000000"
6. Enter correct PIN: "<actual_pin>"
7. Click "Join LIVE Session"

**Expected Result - Wrong PIN:**
- ❌ Error: "PIN tidak valid atau tugas sudah tidak aktif"

**Expected Result - Correct PIN:**
- ✅ HasilTugas record created
- ✅ Timer starts (30:00 countdown)
- ✅ Questions displayed
- ✅ Can answer questions

**Verification:**
```sql
SELECT id, tugasId, siswaId, waktuMulai, skorMaksimal 
FROM "HasilTugas" 
WHERE tugasId = '<tugas_id>' AND siswaId = '<student_id>';
```

---

#### Test 1.3: Answer Questions with Auto-Save
**Steps:**
1. Answer Q1 (Multiple Choice): Select option A
   - Wait 1 second
2. Answer Q2 (Essay): Type "Jawaban essay saya..."
   - Wait 1 second
3. Answer Q3 (True/False): Select "Benar"
   - Wait 1 second
4. Check Network tab for `/api/tugas/[id]/answer` calls

**Expected Result:**
- ✅ Each answer triggers POST to `/api/tugas/[id]/answer`
- ✅ Multiple choice: Auto-graded immediately (poin = 10 if correct, 0 if wrong)
- ✅ Essay: Saved with poin = 0 (pending manual grading)
- ✅ True/False: Auto-graded immediately

**Verification:**
```sql
SELECT j.id, j.jawaban, j.poin, p.tipeJawaban, p.jawabanBenar
FROM "Jawaban" j
JOIN "Pertanyaan" p ON j.pertanyaanId = p.id
WHERE j.hasilTugasId = '<hasil_tugas_id>'
ORDER BY p.urutan;
```

**Expected Data:**
| jawaban | poin | tipeJawaban | jawabanBenar | status |
|---------|------|-------------|--------------|--------|
| A | 10 or 0 | multiple_choice | A | ✅ Auto-graded |
| "Jawaban essay..." | 0 | essay | null | ⏳ Pending |
| Benar | 5 or 0 | true_false | Benar | ✅ Auto-graded |

---

#### Test 1.4: Timer Auto-Submit
**Options:**

**Option A: Wait for Timer (30 minutes)**
- Wait until timer reaches 00:00
- Verify auto-submit triggers

**Option B: Manual Submit Before Timer Ends**
- Click "Kumpulkan Tugas" button
- Verify submission completes

**Expected Result:**
- ✅ `POST /api/tugas/[id]/submit` called
- ✅ `waktuSelesai` and `submittedAt` set
- ✅ `skor` calculated (auto-graded questions only)
- ✅ `nilai` = null (because essay pending)
- ✅ Notification created for GURU
- ✅ Activity log created

**Verification:**
```sql
-- Check HasilTugas
SELECT skor, skorMaksimal, nilai, submittedAt, waktuSelesai
FROM "HasilTugas"
WHERE id = '<hasil_tugas_id>';

-- Check Notifications
SELECT * FROM "Notifikasi"
WHERE userId = '<guru_user_id>'
ORDER BY createdAt DESC LIMIT 1;

-- Check Activity Log
SELECT * FROM "AktivitasSiswa"
WHERE siswaId = '<student_id>'
AND aktivitas = 'mengumpulkan tugas'
ORDER BY timestamp DESC LIMIT 1;
```

---

### 2. HOMEWORK Mode Flow (Priority: HIGH)

#### Test 2.1: Create HOMEWORK Tugas
**Steps:**
1. Login as GURU
2. Create tugas:
   - Judul: "PR Matematika Minggu 1"
   - Mode: **HOMEWORK**
   - Deadline: 3 days from now
   - Questions: Same as LIVE test

**Expected Result:**
- ✅ No PIN generated
- ✅ Deadline field active
- ✅ Status: ACTIVE

---

#### Test 2.2: Student Complete HOMEWORK
**Steps:**
1. Login as STUDENT
2. Navigate to tugas
3. Click "Mulai Mengerjakan" (No PIN required)
4. Answer all questions
5. Optionally upload video
6. Click "Kumpulkan Tugas"

**Expected Result:**
- ✅ No timer displayed
- ✅ Can start anytime before deadline
- ✅ Video upload field available
- ✅ Submission successful

---

### 3. Guru Grading Flow (Priority: HIGH)

#### Test 3.1: View Submissions
**Steps:**
1. Login as GURU
2. Navigate to `/guru/tugas/<tugas_id>`
3. Click "Pengumpulan" tab

**Expected Result:**
- ✅ List of all submissions visible
- ✅ Each shows:
  - Student name & NIS
  - Submit timestamp
  - Current score (auto-graded only)
  - Final nilai (if already graded)

---

#### Test 3.2: Grade Essay Questions
**Steps:**
1. Expand submission card
2. Review essay answer: "Jawaban essay saya..."
3. Enter poin: 12 (out of 15)
4. View auto-graded scores (read-only):
   - Q1 (MC): 10/10 ✓
   - Q3 (TF): 5/5 ✓
5. Add catatan: "Bagus! Tapi kurang lengkap di bagian X"
6. Check calculated score:
   - Total: 10 + 12 + 5 = 27/30
   - Nilai: (27/30) × 100 = 90
7. Click "Simpan Nilai & Kirim ke Siswa"

**Expected Result:**
- ✅ Essay jawaban updated with poin = 12
- ✅ HasilTugas.skor = 27
- ✅ HasilTugas.nilai = 90
- ✅ HasilTugas.gradedAt = now()
- ✅ HasilTugas.catatan saved
- ✅ Notification sent to PARENT
- ✅ Nilai record created
- ✅ Activity log: "Tugas dinilai"

**Verification:**
```sql
-- Check updated Jawaban (essay)
SELECT poin FROM "Jawaban"
WHERE pertanyaanId = '<essay_question_id>' 
AND hasilTugasId = '<hasil_tugas_id>';
-- Expected: 12

-- Check HasilTugas
SELECT skor, nilai, catatan, gradedAt
FROM "HasilTugas"
WHERE id = '<hasil_tugas_id>';
-- Expected: skor=27, nilai=90, catatan filled, gradedAt NOT NULL

-- Check Nilai table
SELECT * FROM "Nilai"
WHERE siswaId = '<student_id>'
AND jenisNilai = 'tugas'
ORDER BY tanggal DESC LIMIT 1;
-- Expected: nilai=90, mataPelajaran="Matematika"

-- Check Parent notification
SELECT * FROM "Notifikasi"
WHERE userId = '<parent_user_id>'
AND title = 'Tugas Telah Dinilai'
ORDER BY createdAt DESC LIMIT 1;
-- Expected: message contains "Nilai: 90"

-- Check Activity log
SELECT * FROM "AktivitasSiswa"
WHERE siswaId = '<student_id>'
AND aktivitas = 'Tugas dinilai'
ORDER BY timestamp DESC LIMIT 1;
```

---

### 4. Notification Flow (Priority: MEDIUM)

#### Test 4.1: Student Receives Grading Notification
**Steps:**
1. Login as STUDENT
2. Check notification bell
3. Click on notification

**Expected Result:**
- ✅ Notification shows: "Tugas Telah Dinilai"
- ✅ Message: "Nilai: 90"
- ✅ Can view nilai on tugas page

---

#### Test 4.2: Parent Receives Notification
**Steps:**
1. Login as PARENT
2. Navigate to notifications
3. Check for "Tugas Telah Dinilai"

**Expected Result:**
- ✅ Notification visible
- ✅ Shows student name
- ✅ Shows nilai
- ✅ Link to `/parent/anak-saya`

---

### 5. Edge Cases (Priority: MEDIUM)

#### Test 5.1: Deadline Passed
**Steps:**
1. Manually set tugas deadline to past date
2. Login as STUDENT
3. Try to access tugas

**Expected Result:**
- ✅ "Deadline Terlewat" message shown
- ✅ Cannot submit

---

#### Test 5.2: All Multiple Choice (No Essay)
**Steps:**
1. Create tugas with only MC and TF questions
2. Student submits
3. Check nilai

**Expected Result:**
- ✅ Nilai calculated immediately
- ✅ No manual grading needed
- ✅ Notification sent to parent immediately

---

#### Test 5.3: Network Interruption During Auto-Save
**Steps:**
1. Start answering questions
2. Open DevTools → Network → Go offline
3. Try to change answer
4. Go back online

**Expected Result:**
- ⚠️ Answer not saved while offline
- ⚠️ User should see error/warning
- 💡 **Enhancement**: Add retry logic or queue

---

## 🔧 Testing Tools

### Manual Testing
```bash
# Start dev server
npm run dev

# Open browser
http://localhost:3000
```

### Database Queries (Supabase)
```bash
# Connect to DB
DATABASE_URL="postgresql://..." npx prisma studio
```

### API Testing (Postman/Thunder Client)
```bash
# Login
POST http://localhost:3000/api/auth/signin
Body: { "email": "guru@test.com", "password": "password123" }

# Create Tugas
POST http://localhost:3000/api/tugas
Headers: Cookie: <auth_cookie>
Body: { ... }

# Start Tugas (Student)
POST http://localhost:3000/api/tugas/<id>/start
Body: { "siswaId": "...", "pinCode": "123456" }
```

---

## 📊 Test Results Template

| Test ID | Scenario | Status | Notes |
|---------|----------|--------|-------|
| 1.1 | Create LIVE Tugas | ⏳ | - |
| 1.2 | JOIN with PIN | ⏳ | - |
| 1.3 | Auto-save Answers | ⏳ | - |
| 1.4 | Timer Auto-submit | ⏳ | - |
| 2.1 | Create HOMEWORK | ⏳ | - |
| 2.2 | Complete HOMEWORK | ⏳ | - |
| 3.1 | View Submissions | ⏳ | - |
| 3.2 | Grade Essays | ⏳ | - |
| 4.1 | Student Notification | ⏳ | - |
| 4.2 | Parent Notification | ⏳ | - |
| 5.1 | Deadline Passed | ⏳ | - |
| 5.2 | All MC/TF | ⏳ | - |
| 5.3 | Network Offline | ⏳ | - |

---

## 🚀 Quick Test Script

Run this to verify basic flow works:

```bash
# In project root
node scripts/test-end-to-end.js
```

(Create this script next if needed)

---

**Test Coverage Target:** 90%  
**Critical Paths:** LIVE mode with PIN, Essay grading, Notifications  
**Next Steps:** Run tests → Fix bugs → Deploy
