import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import JadwalClient from "./JadwalClient"

export default async function JadwalPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')

  if (!token) {
    redirect('/login')
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { 
      userId: string
      email: string
      role: string
      name: string
    }

    if (decoded.role !== 'PARENT') {
      redirect('/login')
    }

    return <JadwalClient userName={decoded.name} userId={decoded.userId} />
  } catch (error) {
    redirect('/login')
  }
}
