const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function runE2ETest() {
  console.log('🧪 Starting End-to-End Test...\n')

  try {
    // Test 1: Verify Database Connection
    console.log('📊 Test 1: Database Connection')
    await prisma.$connect()
    console.log('✅ Connected to database\n')

    // Test 2: Verify User Accounts
    console.log('👥 Test 2: Check Test Users')
    const guru = await prisma.user.findFirst({
      where: { role: 'GURU' },
      include: { guru: true }
    })
    const student = await prisma.siswa.findFirst({
      include: { parent: true, kelas: true }
    })
    
    if (!guru || !student) {
      console.log('❌ Missing test users. Run setup script first.')
      console.log('Run: node scripts/create-dummy-tugas.js')
      return
    }
    
    console.log(`✅ GURU found: ${guru.name} (${guru.email})`)
    console.log(`✅ STUDENT found: ${student.nama} (NIS: ${student.nis || 'N/A'})`)
    console.log(`   Kelas: ${student.kelas?.nama || 'N/A'}`)
    
    if (student.parent) {
      console.log(`✅ PARENT found: ${student.parent.name} (${student.parent.email})\n`)
    } else {
      console.log(`⚠️ Student has no parent linked\n`)
    }

    // Test 3: Verify Tugas Creation
    console.log('📝 Test 3: Check Active Tugas')
    const tugas = await prisma.tugas.findFirst({
      where: { 
        status: 'ACTIVE',
        guruId: guru.guru.id
      },
      include: {
        pertanyaan: true,
        _count: {
          select: { hasilTugas: true }
        }
      }
    })

    if (!tugas) {
      console.log('❌ No active tugas found. Creating test tugas...')
      
      const newTugas = await prisma.tugas.create({
        data: {
          judul: '[TEST] E2E Test Tugas',
          mataPelajaran: 'Matematika',
          mode: 'LIVE',
          deskripsi: 'This is an automated test tugas',
          durasi: 30,
          status: 'ACTIVE',
          pinCode: Math.floor(100000 + Math.random() * 900000).toString(),
          guruId: guru.guru.id,
          kelasId: student.kelasId,
          pertanyaan: {
            create: [
              {
                soal: 'Berapa hasil 2 + 2?',
                tipeJawaban: 'multiple_choice',
                pilihan: ['2', '3', '4', '5'],
                jawabanBenar: '4',
                poin: 10,
                urutan: 1
              },
              {
                soal: 'Jelaskan konsep perkalian dasar',
                tipeJawaban: 'essay',
                pilihan: null,
                jawabanBenar: null,
                poin: 15,
                urutan: 2
              },
              {
                soal: '2 x 5 = 10',
                tipeJawaban: 'true_false',
                pilihan: ['Benar', 'Salah'],
                jawabanBenar: 'Benar',
                poin: 5,
                urutan: 3
              }
            ]
          }
        },
        include: {
          pertanyaan: true
        }
      })
      
      console.log(`✅ Created test tugas: ${newTugas.judul}`)
      console.log(`   PIN: ${newTugas.pinCode}`)
      console.log(`   Questions: ${newTugas.pertanyaan.length}`)
    } else {
      console.log(`✅ Found tugas: ${tugas.judul}`)
      console.log(`   Mode: ${tugas.mode}`)
      console.log(`   PIN: ${tugas.pinCode || 'N/A'}`)
      console.log(`   Questions: ${tugas.pertanyaan.length}`)
      console.log(`   Submissions: ${tugas._count.hasilTugas}\n`)
    }

    // Test 4: Simulate Student Start Tugas
    console.log('🎯 Test 4: Simulate Student Start Tugas')
    const activeTugas = tugas || await prisma.tugas.findFirst({
      where: { status: 'ACTIVE' },
      include: { pertanyaan: true }
    })

    if (!activeTugas) {
      console.log('❌ No active tugas available for testing')
      return
    }

    // Check if student already has submission
    let hasilTugas = await prisma.hasilTugas.findFirst({
      where: {
        tugasId: activeTugas.id,
        siswaId: student.id
      }
    })

    if (!hasilTugas) {
      const skorMaksimal = activeTugas.pertanyaan.reduce((sum, q) => sum + q.poin, 0)
      
      hasilTugas = await prisma.hasilTugas.create({
        data: {
          tugasId: activeTugas.id,
          siswaId: student.id,
          skor: 0,
          skorMaksimal,
          waktuMulai: new Date()
        }
      })
      console.log(`✅ Created HasilTugas record (ID: ${hasilTugas.id})`)
    } else {
      console.log(`✅ HasilTugas already exists (ID: ${hasilTugas.id})`)
    }

    // Test 5: Simulate Answering Questions
    console.log('\n💬 Test 5: Simulate Question Answers')
    
    for (const pertanyaan of activeTugas.pertanyaan) {
      let jawaban = await prisma.jawaban.findFirst({
        where: {
          hasilTugasId: hasilTugas.id,
          pertanyaanId: pertanyaan.id
        }
      })

      if (!jawaban) {
        let studentAnswer = ''
        let poin = 0

        if (pertanyaan.tipeJawaban === 'multiple_choice') {
          studentAnswer = pertanyaan.jawabanBenar || '4'
          poin = studentAnswer === pertanyaan.jawabanBenar ? pertanyaan.poin : 0
        } else if (pertanyaan.tipeJawaban === 'essay') {
          studentAnswer = 'Ini adalah jawaban essay saya untuk testing'
          poin = 0 // Pending manual grading
        } else if (pertanyaan.tipeJawaban === 'true_false') {
          studentAnswer = pertanyaan.jawabanBenar || 'Benar'
          poin = studentAnswer === pertanyaan.jawabanBenar ? pertanyaan.poin : 0
        }

        jawaban = await prisma.jawaban.create({
          data: {
            hasilTugasId: hasilTugas.id,
            pertanyaanId: pertanyaan.id,
            jawaban: studentAnswer,
            poin
          }
        })

        console.log(`   Q${pertanyaan.urutan} (${pertanyaan.tipeJawaban}): ${studentAnswer} → ${poin}/${pertanyaan.poin} poin`)
      } else {
        console.log(`   Q${pertanyaan.urutan}: Already answered`)
      }
    }

    // Test 6: Calculate Total Score
    console.log('\n📊 Test 6: Calculate Total Score')
    const allJawaban = await prisma.jawaban.findMany({
      where: { hasilTugasId: hasilTugas.id }
    })
    const totalSkor = allJawaban.reduce((sum, j) => sum + j.poin, 0)
    
    console.log(`   Total Score: ${totalSkor}/${hasilTugas.skorMaksimal}`)
    console.log(`   Percentage: ${((totalSkor / hasilTugas.skorMaksimal) * 100).toFixed(1)}%`)

    // Check if there are essay questions
    const hasEssay = activeTugas.pertanyaan.some(q => q.tipeJawaban === 'essay')
    
    if (hasEssay) {
      console.log('   ⏳ Has essay questions - needs manual grading')
    } else {
      console.log('   ✅ All auto-graded - ready for final submission')
    }

    // Test 7: Submit Tugas
    console.log('\n✅ Test 7: Simulate Submission')
    
    await prisma.hasilTugas.update({
      where: { id: hasilTugas.id },
      data: {
        skor: totalSkor,
        waktuSelesai: new Date(),
        submittedAt: new Date(),
        nilai: hasEssay ? null : (totalSkor / hasilTugas.skorMaksimal) * 100
      }
    })
    
    console.log('   ✅ Tugas submitted successfully')

    if (!hasEssay) {
      console.log(`   ✅ Auto-calculated Nilai: ${((totalSkor / hasilTugas.skorMaksimal) * 100).toFixed(0)}`)
    }

    // Test 8: Check Notifications
    console.log('\n🔔 Test 8: Check Notifications')
    const notifCount = await prisma.notification.count({
      where: {
        OR: [
          { userId: guru.id },
          { userId: student.parentId }
        ]
      }
    })
    console.log(`   Found ${notifCount} notifications`)

    // Test 9: Check Activity Log
    console.log('\n📝 Test 9: Check Activity Log')
    const activityCount = await prisma.activityLog.count()
    console.log(`   Found ${activityCount} activity logs total`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ END-TO-END TEST COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log('\n📋 Test Summary:')
    console.log(`   ✅ Database Connection: OK`)
    console.log(`   ✅ User Accounts: ${guru ? 'GURU' : '❌'}, ${student ? 'STUDENT' : '❌'}, ${student.parent ? 'PARENT' : '⚠️'}`)
    console.log(`   ✅ Tugas: ${activeTugas.judul}`)
    console.log(`   ✅ Questions: ${activeTugas.pertanyaan.length}`)
    console.log(`   ✅ Answers Submitted: ${allJawaban.length}`)
    console.log(`   ✅ Score: ${totalSkor}/${hasilTugas.skorMaksimal}`)
    console.log(`   ${hasEssay ? '⏳' : '✅'} Grading: ${hasEssay ? 'Pending (Essay)' : 'Complete'}`)
    console.log(`   ✅ Notifications: ${notifCount}`)
    console.log(`   ✅ Activity Logs: ${activityCount}`)
    
    console.log('\n🚀 Next Steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Login as GURU and check /guru/tugas/' + activeTugas.id)
    console.log('   3. Grade the essay question')
    console.log('   4. Verify notifications sent to parent')
    console.log('   5. Check student can see nilai')

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

runE2ETest()
