const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createDummyTugas() {
  try {
    console.log('🎯 Membuat tugas dummy untuk testing...\n')

    // Get first guru
    const guru = await prisma.guru.findFirst({
      include: {
        user: true
      }
    })

    if (!guru) {
      console.log('❌ Guru belum ada. Membuat guru system...')
      
      // Create system guru if not exists
      const bcrypt = require('bcryptjs')
      const systemPassword = await bcrypt.hash('system123', 10)
      const systemUser = await prisma.user.create({
        data: {
          name: "Guru System",
          email: `system.guru.${Date.now()}@eduspecial.system`,
          password: systemPassword,
          role: "GURU",
        },
      })

      const newGuru = await prisma.guru.create({
        data: {
          userId: systemUser.id,
          nip: `SYS${Date.now()}`,
        },
      })

      console.log(`✅ Guru system dibuat: ${systemUser.name}`)
      
      // Create default class
      const kelas = await prisma.kelas.create({
        data: {
          nama: "Kelas Utama",
          tahunAjaran: "2026",
          guruId: newGuru.id,
          deskripsi: "Kelas default untuk semua siswa"
        }
      })

      console.log(`✅ Kelas default dibuat: ${kelas.nama}\n`)
    }

    const finalGuru = await prisma.guru.findFirst()
    
    // Create tugas that should be visible now
    const tugas1 = await prisma.kuis.create({
      data: {
        guruId: finalGuru.id,
        judul: "Tugas Matematika - Perkalian",
        mataPelajaran: "Matematika",
        mode: "LIVE",
        status: "ACTIVE",
        deskripsi: "Latihan perkalian 1-10",
        tanggalTampil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Kemarin
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 hari dari sekarang
      }
    })

    console.log('✅ Tugas 1 (LIVE - sudah terlihat):')
    console.log(`   ${tugas1.judul}`)
    console.log(`   Tanggal Tampil: ${tugas1.tanggalTampil}`)
    console.log(`   Status: ${tugas1.status}\n`)

    // Create tugas without tanggalTampil (should be visible)
    const tugas2 = await prisma.kuis.create({
      data: {
        guruId: finalGuru.id,
        judul: "PR Bahasa Indonesia - Menulis Cerita",
        mataPelajaran: "Bahasa Indonesia",
        mode: "HOMEWORK",
        status: "ACTIVE",
        deskripsi: "Tulis cerita pendek tentang liburan",
        tanggalTampil: null, // Langsung terlihat
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 hari dari sekarang
      }
    })

    console.log('✅ Tugas 2 (HOMEWORK - langsung terlihat):')
    console.log(`   ${tugas2.judul}`)
    console.log(`   Tanggal Tampil: Langsung`)
    console.log(`   Status: ${tugas2.status}\n`)

    // Create tugas scheduled for tomorrow (should NOT be visible yet)
    const tugas3 = await prisma.kuis.create({
      data: {
        guruId: finalGuru.id,
        judul: "Tugas IPA - Eksperimen Sederhana",
        mataPelajaran: "IPA",
        mode: "LIVE",
        status: "ACTIVE",
        deskripsi: "Lakukan eksperimen tentang magnet",
        tanggalTampil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Besok
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 hari dari sekarang
      }
    })

    console.log('✅ Tugas 3 (LIVE - dijadwalkan besok):')
    console.log(`   ${tugas3.judul}`)
    console.log(`   Tanggal Tampil: ${tugas3.tanggalTampil}`)
    console.log(`   Status: ${tugas3.status}\n`)

    console.log('📊 Ringkasan:')
    const totalTugas = await prisma.kuis.count()
    console.log(`   Total tugas di database: ${totalTugas}`)
    console.log(`   Yang seharusnya terlihat siswa: 2 (Tugas 1 & 2)`)
    console.log(`   Yang dijadwalkan: 1 (Tugas 3 - besok)\n`)

    console.log('🎉 Selesai! Silakan cek:')
    console.log('   - /guru/tugas untuk melihat semua tugas')
    console.log('   - /student/tugas untuk melihat tugas yang tersedia (2 tugas)')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createDummyTugas()
  .then(() => {
    console.log('\n✅ Script selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script gagal:', error)
    process.exit(1)
  })
