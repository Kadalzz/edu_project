import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'
import UserManagementClient from "./UserManagementClient"

export default async function UserManagementPage() {
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

    if (decoded.role !== 'ADMIN') {
      redirect('/login')
    }

    return <UserManagementClient userName={decoded.name} />
  } catch (error) {
    redirect('/login')
  }
}
