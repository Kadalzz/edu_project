import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * POST - Start tugas (create HasilTugas record)
 * This endpoint is called when student first opens a tugas
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tugasId } = await params
    const { siswaId, pinCode } = await req.json()

    if (!siswaId) {
      return NextResponse.json(
        { success: false, error: 'Siswa ID required' },
        { status: 400 }
      )
    }

    // Get tugas details
    const tugas = await prisma.tugas.findUnique({
      where: { id: tugasId },
      include: {
        pertanyaan: true
      }
    })

    if (!tugas) {
      return NextResponse.json(
        { success: false, error: 'Tugas not found' },
        { status: 404 }
      )
    }

    // Check if tugas is active
    if (tugas.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Tugas is not active' },
        { status: 400 }
      )
    }

    // For LIVE mode, validate PIN
    if (tugas.mode === 'LIVE') {
      if (!pinCode) {
        return NextResponse.json(
          { success: false, error: 'PIN code required for LIVE mode' },
          { status: 400 }
        )
      }
      if (tugas.pinCode !== pinCode) {
        return NextResponse.json(
          { success: false, error: 'Invalid PIN code' },
          { status: 401 }
        )
      }
    }

    // For HOMEWORK mode, check deadline
    if (tugas.mode === 'HOMEWORK' && tugas.deadline) {
      if (new Date(tugas.deadline) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Deadline has passed' },
          { status: 400 }
        )
      }
    }

    // Check if already started
    const existingRecord = await prisma.hasilTugas.findUnique({
      where: {
        tugasId_siswaId: {
          tugasId,
          siswaId
        }
      }
    })

    if (existingRecord) {
      // Already started, return existing record
      return NextResponse.json({
        success: true,
        data: existingRecord,
        message: 'Melanjutkan tugas yang sudah dimulai'
      })
    }

    // Calculate max score
    const skorMaksimal = tugas.pertanyaan.reduce((sum, p) => sum + p.poin, 0)

    // Create new HasilTugas record
    const hasilTugas = await prisma.hasilTugas.create({
      data: {
        tugasId,
        siswaId,
        skorMaksimal,
        waktuMulai: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: hasilTugas,
      tugas: {
        id: tugas.id,
        judul: tugas.judul,
        mode: tugas.mode,
        durasi: tugas.durasi,
        deadline: tugas.deadline
      },
      message: 'Tugas berhasil dimulai!'
    })
  } catch (error) {
    console.error('Error starting tugas:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
