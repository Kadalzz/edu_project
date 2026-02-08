import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { siswaId, videoUrl, catatan } = await req.json()

    if (!siswaId) {
      return NextResponse.json(
        { success: false, error: 'Siswa ID required' },
        { status: 400 }
      )
    }

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.hasilTugas.findFirst({
      where: {
        tugasId: id,
        siswaId: siswaId
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this assignment' },
        { status: 400 }
      )
    }

    // Check tugas exists and is active
    const tugas = await prisma.tugas.findUnique({
      where: { id: id }
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
    const submission = await prisma.hasilTugas.create({
      data: {
        tugasId: id,
        siswaId: siswaId,
        skorMaksimal: 100,
        videoUrl,
        catatan: catatan || null,
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
