import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthGuru, createNotification, logActivity } from '@/lib/auth'

/**
 * PATCH - Grade submission (guru only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  try {
    // Authenticate as guru
    const guru = await getAuthGuru()
    const { submissionId } = await params

    const body = await req.json()
    const { nilai, catatan, essayGrades } = body

    // Get submission with details
    const hasilTugas = await prisma.hasilTugas.findUnique({
      where: { id: submissionId },
      include: {
        tugas: {
          include: {
            pertanyaan: true
          }
        },
        siswa: {
          include: {
            parent: true
          }
        },
        jawaban: true
      }
    })

    if (!hasilTugas) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Verify guru owns this tugas
    if (hasilTugas.tugas.guruId !== guru.id) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to grade this submission' },
        { status: 403 }
      )
    }

    // If essayGrades provided, update jawaban poin for essay questions
    if (essayGrades && Array.isArray(essayGrades)) {
      for (const grade of essayGrades) {
        const { jawabanId, poin } = grade
        await prisma.jawaban.update({
          where: { id: jawabanId },
          data: { poin }
        })
      }

      // Recalculate total score
      const updatedJawaban = await prisma.jawaban.findMany({
        where: { hasilTugasId: submissionId }
      })
      const totalSkor = updatedJawaban.reduce((sum, j) => sum + j.poin, 0)

      // Update hasilTugas with new score
      const submission = await prisma.hasilTugas.update({
        where: { id: submissionId },
        data: {
          skor: totalSkor,
          nilai: (totalSkor / hasilTugas.skorMaksimal) * 100,
          catatan: catatan || hasilTugas.catatan,
          gradedAt: new Date()
        }
      })

      // Create notification for parent
      await createNotification(
        hasilTugas.siswa.parentId,
        'Tugas Telah Dinilai',
        `Tugas "${hasilTugas.tugas.judul}" untuk ${hasilTugas.siswa.nama} telah dinilai. Nilai: ${submission.nilai?.toFixed(0)}`,
        'success',
        `/parent/anak-saya`
      )

      // Log activity
      await logActivity(
        guru.userId,
        'GRADE_TUGAS',
        'HasilTugas',
        submission.id,
        `Graded submission for ${hasilTugas.siswa.nama}: ${submission.nilai?.toFixed(0)}`
      )

      // Save to Nilai table for permanent record
      await prisma.nilai.create({
        data: {
          siswaId: hasilTugas.siswaId,
          guruId: guru.id,
          mataPelajaran: hasilTugas.tugas.mataPelajaran || 'Umum',
          jenisNilai: 'tugas',
          nilai: submission.nilai || 0,
          nilaiMaksimal: 100,
          catatan: catatan || null,
          tanggal: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: submission
      })
    }

    // Manual grading (simple nilai input)
    if (typeof nilai !== 'number' || nilai < 0 || nilai > 100) {
      return NextResponse.json(
        { success: false, error: 'Nilai must be between 0 and 100' },
        { status: 400 }
      )
    }

    const submission = await prisma.hasilTugas.update({
      where: { id: submissionId },
      data: {
        nilai,
        catatan: catatan || null,
        gradedAt: new Date()
      }
    })

    // Create notification for parent
    await createNotification(
      hasilTugas.siswa.parentId,
      'Tugas Telah Dinilai',
      `Tugas "${hasilTugas.tugas.judul}" untuk ${hasilTugas.siswa.nama} telah dinilai. Nilai: ${nilai}`,
      'success',
      `/parent/anak-saya`
    )

    // Log activity
    await logActivity(
      guru.userId,
      'GRADE_TUGAS',
      'HasilTugas',
      submission.id,
      `Graded submission for ${hasilTugas.siswa.nama}: ${nilai}`
    )

    // Save to Nilai table
    await prisma.nilai.create({
      data: {
        siswaId: hasilTugas.siswaId,
        guruId: guru.id,
        mataPelajaran: hasilTugas.tugas.mataPelajaran || 'Umum',
        jenisNilai: 'tugas',
        nilai: nilai,
        nilaiMaksimal: 100,
        catatan: catatan || null,
        tanggal: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error: any) {
    console.error('Error grading submission:', error)
    
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
