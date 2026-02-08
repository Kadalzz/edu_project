import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'SISWA') {
      return NextResponse.json(
        { success: false, error: 'Only students can submit assignments' },
        { status: 403 }
      )
    }

    const { videoUrl, catatan } = await req.json()

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.hasilKuis.findFirst({
      where: {
        kuisId: params.id,
        siswaId: session.user.id
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this assignment' },
        { status: 400 }
      )
    }

    // Check tugas exists and is active
    const tugas = await prisma.kuis.findUnique({
      where: { id: params.id }
    })

    if (!tugas) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (tugas.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This assignment is not active' },
        { status: 400 }
      )
    }

    // Check deadline
    if (tugas.deadline && new Date(tugas.deadline) < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Deadline has passed' },
        { status: 400 }
      )
    }

    // Create submission
    const submission = await prisma.hasilKuis.create({
      data: {
        kuisId: params.id,
        siswaId: session.user.id,
        videoUrl,
        catatan: catatan || null,
        skorMaksimal: 100,
        submittedAt: new Date(),
        waktuSelesai: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: submission,
      message: 'Tugas berhasil dikumpulkan!'
    })
  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
