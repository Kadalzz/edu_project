// Test Supabase Database Connection
const { Client } = require('pg')

console.log('🔍 Testing Supabase Connection...\n')

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.rgvnnzbqnoicuoozahii:RichardChristianSulistyo@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

console.log('Database URL:', DATABASE_URL.replace(/:[^:]*@/, ':****@'))

// Parse connection string
const url = new URL(DATABASE_URL)
console.log('\n📊 Connection Details:')
console.log('  Host:', url.hostname)
console.log('  Port:', url.port)
console.log('  Database:', url.pathname.slice(1))
console.log('  User:', url.username)
console.log('  Password:', url.password ? '****' + url.password.slice(-3) : 'NOT SET')

console.log('\n⏳ Attempting connection...')

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

client.connect()
  .then(() => {
    console.log('✅ Connection successful!')
    return client.query('SELECT version()')
  })
  .then((result) => {
    console.log('📦 PostgreSQL Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1])
    return client.end()
  })
  .then(() => {
    console.log('\n🎉 Database is ready for Prisma!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('\n❌ Connection failed!')
    console.error('Error:', err.message)
    console.error('\n💡 Troubleshooting:')
    console.error('  1. Check if Supabase project is fully active (not "Setting up")')
    console.error('  2. Verify password is correct')
    console.error('  3. Check if database paused (free tier auto-pauses after 1 week inactivity)')
    console.error('  4. Try using Connection Pooling string instead')
    console.error('\n📍 Go to: https://supabase.com/dashboard/project/rgvnnzbqnoicuoozahii')
    process.exit(1)
  })
