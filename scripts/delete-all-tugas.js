const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllTugas() {
  try {
    console.log('🗑️  Menghapus semua tugas...')
    
    // Delete related records first
    const deletedHasilKuis = await prisma.hasilKuis.deleteMany({})
    console.log(`✅ Dihapus ${deletedHasilKuis.count} hasil kuis`)
    
    const deletedPertanyaan = await prisma.pertanyaan.deleteMany({})
    console.log(`✅ Dihapus ${deletedPertanyaan.count} pertanyaan`)
    
    // Delete all tugas/kuis
    const deletedKuis = await prisma.kuis.deleteMany({})
    console.log(`✅ Dihapus ${deletedKuis.count} tugas`)
    
    console.log('✨ Semua tugas berhasil dihapus!')
  } catch (error) {
    console.error('❌ Error menghapus tugas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllTugas()
