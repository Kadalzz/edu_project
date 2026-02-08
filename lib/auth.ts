import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import prisma from './prisma'

export interface AuthUser {
  userId: string
  email: string
  name: string
  role: 'ADMIN' | 'GURU' | 'PARENT'
}

/**
 * Get authenticated user from JWT token
 */
export async function getAuthUser(req?: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = verify(token, secret) as AuthUser
    return decoded
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

/**
 * Require authentication - throw error if not authenticated
 */
export async function requireAuth(req?: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(req)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Require specific role - throw error if role doesn't match
 */
export async function requireRole(
  roles: ('ADMIN' | 'GURU' | 'PARENT')[],
  req?: NextRequest
): Promise<AuthUser> {
  const user = await requireAuth(req)
  if (!roles.includes(user.role)) {
    throw new Error(`Forbidden: Required role ${roles.join(' or ')}`)
  }
  return user
}

/**
 * Get guru data for authenticated guru user
 */
export async function getAuthGuru(req?: NextRequest) {
  const user = await requireRole(['GURU'], req)
  const guru = await prisma.guru.findUnique({
    where: { userId: user.userId },
    include: {
      user: true
    }
  })
  if (!guru) {
    throw new Error('Guru profile not found')
  }
  return guru
}

/**
 * Get parent's children (siswa)
 */
export async function getParentChildren(req?: NextRequest) {
  const user = await requireRole(['PARENT'], req)
  const children = await prisma.siswa.findMany({
    where: { parentId: user.userId },
    include: {
      kelas: true
    }
  })
  return children
}

/**
 * Check if user owns a resource (for parent accessing child data)
 */
export async function verifyParentAccess(
  siswaId: string,
  req?: NextRequest
): Promise<boolean> {
  const user = await requireRole(['PARENT'], req)
  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId }
  })
  return siswa?.parentId === user.userId
}

/**
 * Check if guru teaches a class
 */
export async function verifyGuruAccess(
  kelasId: string,
  req?: NextRequest
): Promise<boolean> {
  const guru = await getAuthGuru(req)
  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId }
  })
  return kelas?.guruId === guru.id
}

/**
 * Log activity for audit trail
 */
export async function logActivity(
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  description?: string,
  ipAddress?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        description,
        ipAddress
      }
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}

/**
 * Create notification for user
 */
export async function createNotification(
  userId: string,
  title: string,
  content: string,
  type: 'info' | 'warning' | 'success',
  link?: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        content,
        type,
        link
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}
