import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createNotification, logActivity } from '@/lib/auth'

/**
 * POST - Submit individual answer (for multiple choice and essay questions)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tugasId } = await params
    const { siswaId, pertanyaanId, jawaban, hasilTugasId } = await req.json()

    if (!siswaId || !pertanyaanId || !jawaban) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get pertanyaan details
    const pertanyaan = await prisma.pertanyaan.findUnique({
      where: { id: pertanyaanId }
    })

    if (!pertanyaan) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    // Get or find HasilTugas
    let hasilTugas
    if (hasilTugasId) {
      hasilTugas = await prisma.hasilTugas.findUnique({
        where: { id: hasilTugasId }
      })
    } else {
      hasilTugas = await prisma.hasilTugas.findUnique({
        where: {
          tugasId_siswaId: {
            tugasId,
            siswaId
          }
        }
      })
    }

    if (!hasilTugas) {
      return NextResponse.json(
        { success: false, error: 'Please start the tugas first' },
        { status: 400 }
      )
    }

    // Check if already answered
    const existingJawaban = await prisma.jawaban.findFirst({
      where: {
        hasilTugasId: hasilTugas.id,
        pertanyaanId
      }
    })

    // Auto-grade for multiple choice
    let benar = null
    let poin = 0

    if (pertanyaan.tipeJawaban === 'multiple_choice' && pertanyaan.jawabanBenar) {
      benar = jawaban.trim().toLowerCase() === pertanyaan.jawabanBenar.trim().toLowerCase()
      poin = benar ? pertanyaan.poin : 0
    }

    if (existingJawaban) {
      // Update existing answer
      const updatedJawaban = await prisma.jawaban.update({
        where: { id: existingJawaban.id },
        data: {
          jawaban,
          benar,
          poin
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedJawaban,
        message: 'Jawaban berhasil diupdate'
      })
    }

    // Create new answer
    const newJawaban = await prisma.jawaban.create({
      data: {
        hasilTugasId: hasilTugas.id,
        pertanyaanId,
        jawaban,
        benar,
        poin
      }
    })

    return NextResponse.json({
      success: true,
      data: newJawaban,
      message: 'Jawaban berhasil disimpan'
    })
  } catch (error) {
    console.error('Error saving answer:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET - Get all answers for a student's tugas
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tugasId } = await params
    const { searchParams } = new URL(req.url)
    const siswaId = searchParams.get('siswaId')
    const hasilTugasId = searchParams.get('hasilTugasId')

    if (!siswaId && !hasilTugasId) {
      return NextResponse.json(
        { success: false, error: 'siswaId or hasilTugasId required' },
        { status: 400 }
      )
    }

    // Get HasilTugas
    let hasilTugas
    if (hasilTugasId) {
      hasilTugas = await prisma.hasilTugas.findUnique({
        where: { id: hasilTugasId }
      })
    } else if (siswaId) {
      hasilTugas = await prisma.hasilTugas.findUnique({
        where: {
          tugasId_siswaId: {
            tugasId,
            siswaId
          }
        }
      })
    }

    if (!hasilTugas) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get all answers
    const jawaban = await prisma.jawaban.findMany({
      where: {
        hasilTugasId: hasilTugas.id
      },
      include: {
        pertanyaan: {
          select: {
            id: true,
            soal: true,
            tipeJawaban: true,
            poin: true,
            urutan: true
          }
        }
      },
      orderBy: {
        pertanyaan: {
          urutan: 'asc'
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: jawaban
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
