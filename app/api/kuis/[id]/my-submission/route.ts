import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const siswaId = searchParams.get('siswaId')

    if (!siswaId) {
      return NextResponse.json(
        { success: false, error: 'Siswa ID required' },
        { status: 400 }
      )
    }

    const submission = await prisma.hasilKuis.findFirst({
      where: {
        kuisId: id,
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
