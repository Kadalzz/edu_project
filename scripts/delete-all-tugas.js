const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteAllTugas() {
  try {
    console.log('🗑️  Menghapus semua tugas...')
    
    // Delete related records first
    const deletedHasilTugas = await prisma.hasilTugas.deleteMany({})
    console.log(`✅ Dihapus ${deletedHasilTugas.count} hasil tugas`)
    
    const deletedPertanyaan = await prisma.pertanyaan.deleteMany({})
    console.log(`✅ Dihapus ${deletedPertanyaan.count} pertanyaan`)
    
    // Delete all tugas
    const deletedTugas = await prisma.tugas.deleteMany({})
    console.log(`✅ Dihapus ${deletedTugas.count} tugas`)
    
    console.log('✨ Semua tugas berhasil dihapus!')
  } catch (error) {
    console.error('❌ Error menghapus tugas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllTugas()
