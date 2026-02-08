import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    let siswaId = searchParams.get('siswaId')

    // Try to get siswaId from JWT token if not provided
    if (!siswaId) {
      const cookieStore = await cookies()
      const token = cookieStore.get('auth-token')?.value
      
      if (token) {
        try {
          const decoded = verify(token, process.env.JWT_SECRET || 'secret-key') as { userId: string }
          // Find siswa by parentId (User is the parent)
          const siswa = await prisma.siswa.findFirst({
            where: { parentId: decoded.userId }
          })
          if (siswa) {
            siswaId = siswa.id
          }
        } catch {
          // Token invalid
        }
      }
    }

    if (!siswaId) {
      return NextResponse.json(
        { success: false, error: 'Siswa ID required' },
        { status: 400 }
      )
    }

    const submission = await prisma.hasilTugas.findFirst({
      where: {
        tugasId: id,
        siswaId: siswaId
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Error fetching my submission:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
