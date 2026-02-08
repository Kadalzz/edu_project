const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createSampleData() {
  try {
    console.log('🔧 Creating sample data...\n')

    // Create guru user
    const guruPassword = await bcrypt.hash('guru123', 10)
    const guruUser = await prisma.user.upsert({
      where: { email: 'guru@eduspecial.com' },
      update: {},
      create: {
        email: 'guru@eduspecial.com',
        password: guruPassword,
        role: 'GURU',
        name: 'Ibu Sarah Guru'
      }
    })
    console.log('✅ Guru user created:', guruUser.email)

    // Create guru profile
    const guru = await prisma.guru.upsert({
      where: { userId: guruUser.id },
      update: {},
      create: {
        userId: guruUser.id,
        nip: '198501012010011001',
        phone: '081234567890'
      }
    })
    console.log('✅ Guru profile created')

    // Create parent user
    const parentPassword = await bcrypt.hash('parent123', 10)
    const parentUser = await prisma.user.upsert({
      where: { email: 'parent@eduspecial.com' },
      update: {},
      create: {
        email: 'parent@eduspecial.com',
        password: parentPassword,
        role: 'PARENT',
        name: 'Bapak Ahmad'
      }
    })
    console.log('✅ Parent user created:', parentUser.email)

    // Create kelas
    const kelas = await prisma.kelas.upsert({
      where: { id: 'kelas-sample-1' },
      update: {},
      create: {
        id: 'kelas-sample-1',
        nama: 'Kelas 1A',
        tingkat: '1',
        tahunAjaran: '2025/2026',
        guruId: guru.id,
        deskripsi: 'Kelas 1A untuk anak berkebutuhan khusus'
      }
    })
    console.log('✅ Kelas created:', kelas.nama)

    // Create sample siswa
    const siswaData = [
      { nama: 'AK', nis: '12341' },
      { nama: 'GL', nis: '12342' },
      { nama: 'NU', nis: '12343' },
      { nama: 'IH', nis: '12344' },
      { nama: 'SK', nis: '12345' },
      { nama: 'GE', nis: '12346' },
      { nama: 'AZ', nis: '12347' },
      { nama: 'RE', nis: '12348' },
      { nama: 'AI', nis: '12349' },
      { nama: 'AN', nis: '12350' }
    ]

    for (const data of siswaData) {
      const siswa = await prisma.siswa.upsert({
        where: { nis: data.nis },
        update: {},
        create: {
          nama: data.nama,
          nis: data.nis,
          kelasId: kelas.id,
          parentId: parentUser.id
        }
      })
      console.log('✅ Siswa created:', siswa.nama)
    }

    console.log('\n🎉 Sample data created successfully!')
    console.log('\n📧 Login credentials:')
    console.log('   Admin: admin@eduspecial.com / admin123')
    console.log('   Guru:  guru@eduspecial.com / guru123')
    console.log('   Parent: parent@eduspecial.com / parent123')
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createSampleData()
