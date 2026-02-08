import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createNotification, logActivity } from '@/lib/auth'

/**
 * POST - Final submit tugas (calculate score and mark as completed)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tugasId } = await params
    const { siswaId, videoUrl, catatan } = await req.json()

    if (!siswaId) {
      return NextResponse.json(
        { success: false, error: 'Siswa ID required' },
        { status: 400 }
      )
    }

    // Get HasilTugas
    const hasilTugas = await prisma.hasilTugas.findUnique({
      where: {
        tugasId_siswaId: {
          tugasId,
          siswaId
        }
      },
      include: {
        tugas: {
          include: {
            pertanyaan: true,
            guru: true
          }
        },
        jawaban: true,
        siswa: true
      }
    })

    if (!hasilTugas) {
      return NextResponse.json(
        { success: false, error: 'Please start the tugas first by calling /api/tugas/[id]/start' },
        { status: 400 }
      )
    }

    // Check if already submitted
    if (hasilTugas.submittedAt) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this tugas' },
        { status: 400 }
      )
    }

    // Check tugas status
    if (hasilTugas.tugas.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This tugas is not active' },
        { status: 400 }
      )
    }

    // Check deadline for HOMEWORK mode
    if (hasilTugas.tugas.mode === 'HOMEWORK' && hasilTugas.tugas.deadline) {
      if (new Date(hasilTugas.tugas.deadline) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Deadline has passed' },
          { status: 400 }
        )
      }
    }

    // Calculate total score from jawaban (auto-graded questions only)
    const totalSkor = hasilTugas.jawaban.reduce((sum, j) => sum + j.poin, 0)

    // Check if there are essay questions that need manual grading
    const hasEssayQuestions = hasilTugas.tugas.pertanyaan.some(
      p => p.tipeJawaban === 'essay'
    )

    // Update HasilTugas
    const submission = await prisma.hasilTugas.update({
      where: { id: hasilTugas.id },
      data: {
        skor: totalSkor,
        waktuSelesai: new Date(),
        submittedAt: new Date(),
        videoUrl: videoUrl || null,
        catatan: catatan || null,
        // If no essay questions, auto-set nilai
        nilai: hasEssayQuestions ? null : (totalSkor / hasilTugas.skorMaksimal) * 100,
        gradedAt: hasEssayQuestions ? null : new Date()
      }
    })

    // Create notification for guru
    await createNotification(
      hasilTugas.tugas.guru.userId,
      'Tugas Baru Dikumpulkan',
      `${hasilTugas.siswa.nama} telah mengumpulkan tugas "${hasilTugas.tugas.judul}"`,
      'info',
      `/guru/tugas/${tugasId}`
    )

    // Log activity
    await logActivity(
      hasilTugas.siswa.parentId,
      'SUBMIT_TUGAS',
      'HasilTugas',
      submission.id,
      `Submitted tugas: ${hasilTugas.tugas.judul}`
    )

    // Create notification for parent
    await createNotification(
      hasilTugas.siswa.parentId,
      'Tugas Dikumpulkan',
      `${hasilTugas.siswa.nama} telah mengumpulkan tugas "${hasilTugas.tugas.judul}"`,
      'success',
      `/parent/anak-saya`
    )

    return NextResponse.json({
      success: true,
      data: submission,
      message: hasEssayQuestions 
        ? 'Tugas berhasil dikumpulkan! Menunggu penilaian guru untuk soal essay.'
        : 'Tugas berhasil dikumpulkan dan dinilai otomatis!',
      autoGraded: !hasEssayQuestions
    })
  } catch (error) {
    console.error('Error submitting tugas:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
