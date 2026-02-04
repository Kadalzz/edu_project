const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testRegister() {
  try {
    console.log('🧪 Testing registration...')
    
    // Data test
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'GURU'
    }
    
    console.log('📝 Test data:', testData)
    
    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.email }
    })
    
    if (existingUser) {
      console.log('⚠️  User already exists, deleting...')
      // Delete Guru first if exists
      const guru = await prisma.guru.findUnique({
        where: { userId: existingUser.id }
      })
      if (guru) {
        await prisma.guru.delete({
          where: { id: guru.id }
        })
      }
      await prisma.user.delete({
        where: { email: testData.email }
      })
    }
    
    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(testData.password, 10)
    
    // Create user
    console.log('👤 Creating user...')
    const user = await prisma.user.create({
      data: {
        name: testData.name,
        email: testData.email,
        password: hashedPassword,
        role: testData.role,
      },
    })
    console.log('✅ User created:', user.id)
    
    // Create Guru profile
    if (testData.role === 'GURU') {
      console.log('👨‍🏫 Creating Guru profile...')
      const guru = await prisma.guru.create({
        data: {
          userId: user.id,
        },
      })
      console.log('✅ Guru profile created:', guru.id)
    }
    
    console.log('🎉 Registration test successful!')
    console.log('User:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    })
    
  } catch (error) {
    console.error('❌ Registration test failed:', error)
    console.error('Error details:', error.message)
    if (error.meta) {
      console.error('Meta:', error.meta)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testRegister()
