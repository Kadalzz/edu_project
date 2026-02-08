const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@eduspecial.com' }
    })
    
    if (user) {
      console.log('✅ User exists:')
      console.log('   ID:', user.id)
      console.log('   Email:', user.email)
      console.log('   Role:', user.role)
      console.log('   Name:', user.name)
    } else {
      console.log('❌ User NOT found')
      console.log('Creating admin user...')
      
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const newUser = await prisma.user.create({
        data: {
          email: 'admin@eduspecial.com',
          password: hashedPassword,
          role: 'ADMIN',
          name: 'Administrator'
        }
      })
      console.log('✅ Admin created:', newUser.email)
    }
  } catch (e) {
    console.log('Error:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdmin()
