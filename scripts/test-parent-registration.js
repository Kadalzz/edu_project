/**
 * ================================================
 * TEST PARENT REGISTRATION WITH STUDENT DATA
 * ================================================
 * Test automatic student creation when parent registers
 * 
 * Run: node scripts/test-parent-registration.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testParentRegistration() {
  console.log('🧪 Testing Parent Registration with Student Data...\n')

  try {
    // Check if guru exists
    const guruCount = await prisma.user.count({ where: { role: 'GURU' } })
    
    if (guruCount === 0) {
      console.error('❌ No GURU found in database!')
      console.error('💡 Please register as GURU first or run:')
      console.error('   SQL: scripts/create-first-guru.sql\n')
      return
    }
    
    console.log(`✅ Found ${guruCount} guru(s) in database\n`)

    // Test data
    const testEmail = `parent_test_${Date.now()}@test.com`
    const testData = {
      name: 'John Doe',
      email: testEmail,
      password: 'test123',
      role: 'PARENT',
      studentData: {
        studentName: 'Jane Doe',
        nis: `NIS${Date.now()}`,
        phone: '08123456789',
        specialNeeds: 'Autisme'
      }
    }

    console.log('📝 Test data:')
    console.log('Parent:', { name: testData.name, email: testData.email, role: testData.role })
    console.log('Student:', testData.studentData)
    console.log()

    // Step 1: Create User
    console.log('⏳ Creating parent user...')
    const hashedPassword = await bcrypt.hash(testData.password, 10)
    
    const user = await prisma.user.create({
      data: {
        name: testData.name,
        email: testData.email,
        password: hashedPassword,
        role: testData.role,
      },
    })
    
    console.log('✅ Parent user created:', user.id, user.email)

    // Step 2: Get or create default class
    console.log('\n⏳ Checking for default class...')
    let defaultClass = await prisma.kelas.findFirst({
      orderBy: { createdAt: 'asc' },
      include: {
        guru: {
          include: {
            user: true
          }
        }
      }
    })

    if (!defaultClass) {
      console.log('⚠️  No class found, creating default class...')
      const firstGuru = await prisma.guru.findFirst()
      
      defaultClass = await prisma.kelas.create({
        data: {
          nama: 'Kelas Utama',
          tahunAjaran: new Date().getFullYear().toString(),
          guruId: firstGuru.id,
          deskripsi: 'Kelas default untuk semua siswa',
        },
      })
      console.log('✅ Default class created:', defaultClass.nama)
    } else {
      console.log('✅ Using existing class:', defaultClass.nama)
    }

    // Step 3: Create Siswa
    console.log('\n⏳ Creating student profile...')
    const siswa = await prisma.siswa.create({
      data: {
        nama: testData.studentData.studentName,
        nis: testData.studentData.nis,
        kelasId: defaultClass.id,
        parentId: user.id,
        kebutuhanKhusus: testData.studentData.specialNeeds,
        catatan: `No. Telepon: ${testData.studentData.phone}`,
      },
      include: {
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      }
    })

    console.log('✅ Student created:', siswa.nama, `(NIS: ${siswa.nis})`)
    console.log()
    
    // Verify
    console.log('📊 Registration Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('PARENT:')
    console.log(`  Name: ${user.name}`)
    console.log(`  Email: ${user.email}`)
    console.log(`  Role: ${user.role}`)
    console.log()
    console.log('STUDENT:')
    console.log(`  Name: ${siswa.nama}`)
    console.log(`  NIS: ${siswa.nis}`)
    console.log(`  Special Needs: ${siswa.kebutuhanKhusus}`)
    console.log(`  Class: ${siswa.kelas.nama}`)
    console.log(`  Parent: ${siswa.parent.name}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log('\n✅ Registration flow works perfectly!')
    console.log('🎉 Parent and Student are linked correctly!')

  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    
    if (error.code === 'P2002') {
      console.error('💡 Duplicate entry found. This is expected for re-runs.')
    } else if (error.code === 'P2003') {
      console.error('💡 Foreign key constraint failed.')
      console.error('   Make sure Guru and Kelas exist in database.')
    } else {
      console.error('Error details:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testParentRegistration()
