const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...\n')

    const admin = await prisma.user.create({
      data: {
        email: 'admin@eduspecial.com',
        password: '$2b$10$9XiOcecQxdLz1DLICRUE5eHIAX5zOYaVZd3Qjk3rTHARDTAShcKs.',
        role: 'ADMIN',
        name: 'Administrator',
      },
    })

    console.log('✅ Admin user created successfully!\n')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('👤 Role:', admin.role)
    console.log('\n🎉 You can now login at http://localhost:3000/login')
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Admin user already exists!')
      console.log('📧 Email: admin@eduspecial.com')
      console.log('🔑 Password: admin123')
    } else {
      console.error('❌ Error creating admin:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
