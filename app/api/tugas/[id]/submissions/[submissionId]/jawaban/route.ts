import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireRole } from '@/lib/auth'

/**
 * GET - Get all jawaban for a specific submission (guru only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    // Authenticate as guru
    await requireRole(['GURU'])
    const { submissionId } = await params

    // Get submission with jawaban
    const hasilTugas = await prisma.hasilTugas.findUnique({
      where: { id: submissionId },
      include: {
        jawaban: {
          include: {
            pertanyaan: {
              select: {
                id: true,
                soal: true,
                tipeJawaban: true,
                pilihan: true,
                jawabanBenar: true,
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
        }
      }
    })

    if (!hasilTugas) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: hasilTugas.jawaban
    })
  } catch (error: any) {
    console.error('Error fetching jawaban:', error)
    
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
