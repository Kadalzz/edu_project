const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllUsers() {
  try {
    console.log('🗑️  Menghapus semua user non-admin...\n')

    // Get all non-admin users
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      },
      include: {
        guru: {
          include: {
            kelas: true
          }
        },
        siswaChildren: true
      }
    })

    console.log(`📊 Ditemukan ${users.length} user yang akan dihapus:\n`)

    for (const user of users) {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`)
      
      if (user.role === 'GURU' && user.guru) {
        const guru = user.guru
        
        // Check if guru has students
        const siswaCount = await prisma.siswa.count({
          where: { kelasId: { in: guru.kelas.map(k => k.id) } }
        })

        if (siswaCount > 0) {
          console.log(`  ⚠️  Guru ini memiliki ${siswaCount} siswa di kelasnya`)
          // Delete all related data
          await prisma.$transaction(async (tx) => {
            // Delete badges
            await tx.badge.deleteMany({ where: { guruId: guru.id } })
            
            // Delete materi
            await tx.materi.deleteMany({ where: { guruId: guru.id } })
            
            // Delete jadwal temu
            await tx.jadwalTemu.deleteMany({ where: { guruId: guru.id } })
            
            // Delete progress reports
            await tx.progressReport.deleteMany({ where: { guruId: guru.id } })
            
            // Delete kuis and related data
            const kuisList = await tx.kuis.findMany({ 
              where: { guruId: guru.id },
              select: { id: true }
            })
            for (const kuis of kuisList) {
              await tx.jawaban.deleteMany({ 
                where: { 
                  hasilKuis: { kuisId: kuis.id } 
                } 
              })
              await tx.hasilKuis.deleteMany({ where: { kuisId: kuis.id } })
              await tx.pertanyaan.deleteMany({ where: { kuisId: kuis.id } })
            }
            await tx.kuis.deleteMany({ where: { guruId: guru.id } })
            
            // Delete nilai
            await tx.nilai.deleteMany({ where: { guruId: guru.id } })
            
            // Delete siswa from kelas
            for (const kelas of guru.kelas) {
              const siswaInKelas = await tx.siswa.findMany({
                where: { kelasId: kelas.id },
                select: { id: true }
              })
              
              for (const siswa of siswaInKelas) {
                // Delete siswa related data
                await tx.badge.deleteMany({ where: { siswaId: siswa.id } })
                await tx.absensi.deleteMany({ where: { siswaId: siswa.id } })
                await tx.hasilKuis.deleteMany({ where: { siswaId: siswa.id } })
                await tx.nilai.deleteMany({ where: { siswaId: siswa.id } })
                await tx.progressReport.deleteMany({ where: { siswaId: siswa.id } })
                
                const laporanList = await tx.laporanBelajarRumah.findMany({
                  where: { siswaId: siswa.id },
                  select: { id: true }
                })
                for (const laporan of laporanList) {
                  await tx.dokumentasi.deleteMany({ where: { laporanId: laporan.id } })
                }
                await tx.laporanBelajarRumah.deleteMany({ where: { siswaId: siswa.id } })
                await tx.jadwalTemu.deleteMany({ where: { siswaId: siswa.id } })
              }
              
              // Delete siswa
              await tx.siswa.deleteMany({ where: { kelasId: kelas.id } })
            }
            
            // Delete kelas
            await tx.kelas.deleteMany({ where: { guruId: guru.id } })
            
            // Delete guru record
            await tx.guru.delete({ where: { id: guru.id } })
            
            // Delete user
            await tx.user.delete({ where: { id: user.id } })
          })
          console.log(`  ✅ Guru dan semua data terkait berhasil dihapus`)
        } else {
          // No students, simpler deletion
          await prisma.$transaction(async (tx) => {
            await tx.badge.deleteMany({ where: { guruId: guru.id } })
            await tx.materi.deleteMany({ where: { guruId: guru.id } })
            await tx.jadwalTemu.deleteMany({ where: { guruId: guru.id } })
            await tx.progressReport.deleteMany({ where: { guruId: guru.id } })
            
            const kuisList = await tx.kuis.findMany({ 
              where: { guruId: guru.id },
              select: { id: true }
            })
            for (const kuis of kuisList) {
              await tx.jawaban.deleteMany({ 
                where: { 
                  hasilKuis: { kuisId: kuis.id } 
                } 
              })
              await tx.hasilKuis.deleteMany({ where: { kuisId: kuis.id } })
              await tx.pertanyaan.deleteMany({ where: { kuisId: kuis.id } })
            }
            await tx.kuis.deleteMany({ where: { guruId: guru.id } })
            await tx.nilai.deleteMany({ where: { guruId: guru.id } })
            await tx.kelas.deleteMany({ where: { guruId: guru.id } })
            await tx.guru.delete({ where: { id: guru.id } })
            await tx.user.delete({ where: { id: user.id } })
          })
          console.log(`  ✅ Guru berhasil dihapus`)
        }
      } else if (user.role === 'PARENT') {
        const siswaCount = user.siswaChildren.length
        
        if (siswaCount > 0) {
          console.log(`  ⚠️  Orang tua ini memiliki ${siswaCount} anak`)
          
          // Delete all children first
          await prisma.$transaction(async (tx) => {
            for (const siswa of user.siswaChildren) {
              // Check if siswa still exists
              const siswaExists = await tx.siswa.findUnique({ where: { id: siswa.id } })
              
              if (siswaExists) {
                // Delete siswa related data
                await tx.badge.deleteMany({ where: { siswaId: siswa.id } })
                await tx.absensi.deleteMany({ where: { siswaId: siswa.id } })
                await tx.hasilKuis.deleteMany({ where: { siswaId: siswa.id } })
                await tx.nilai.deleteMany({ where: { siswaId: siswa.id } })
                await tx.progressReport.deleteMany({ where: { siswaId: siswa.id } })
                await tx.jadwalTemu.deleteMany({ where: { siswaId: siswa.id } })
                
                const laporanList = await tx.laporanBelajarRumah.findMany({
                  where: { siswaId: siswa.id },
                  select: { id: true }
                })
                for (const laporan of laporanList) {
                  await tx.dokumentasi.deleteMany({ where: { laporanId: laporan.id } })
                }
                await tx.laporanBelajarRumah.deleteMany({ where: { siswaId: siswa.id } })
                
                // Delete siswa
                await tx.siswa.delete({ where: { id: siswa.id } })
              } else {
                console.log(`    ℹ️  Siswa ${siswa.nama} sudah dihapus sebelumnya`)
              }
            }
            
            // Delete laporan belajar from parent
            const laporanList = await tx.laporanBelajarRumah.findMany({
              where: { parentId: user.id },
              select: { id: true }
            })
            for (const laporan of laporanList) {
              await tx.dokumentasi.deleteMany({ where: { laporanId: laporan.id } })
            }
            await tx.laporanBelajarRumah.deleteMany({ where: { parentId: user.id } })
            
            // Delete user
            await tx.user.delete({ where: { id: user.id } })
          })
          console.log(`  ✅ Orang tua dan semua anak berhasil dihapus`)
        } else {
          // No children
          await prisma.$transaction(async (tx) => {
            const laporanList = await tx.laporanBelajarRumah.findMany({
              where: { parentId: user.id },
              select: { id: true }
            })
            for (const laporan of laporanList) {
              await tx.dokumentasi.deleteMany({ where: { laporanId: laporan.id } })
            }
            await tx.laporanBelajarRumah.deleteMany({ where: { parentId: user.id } })
            await tx.user.delete({ where: { id: user.id } })
          })
          console.log(`  ✅ Orang tua berhasil dihapus`)
        }
      }
    }

    console.log('\n✅ Semua user non-admin berhasil dihapus!')
    console.log('\n📊 Status akhir:')
    
    const remainingUsers = await prisma.user.count()
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } })
    
    console.log(`- Total user tersisa: ${remainingUsers}`)
    console.log(`- Admin tersisa: ${adminUsers}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllUsers()
  .then(() => {
    console.log('\n🎉 Selesai!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script gagal:', error)
    process.exit(1)
  })
