import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Get student with all related data
    const student = await prisma.siswa.findUnique({
      where: {
        id: id
      },
      include: {
        kelas: {
          include: {
            guru: {
              include: {
                user: true
              }
            }
          }
        },
        nilai: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        absensi: {
          orderBy: {
            tanggal: 'desc'
          },
          take: 30
        },
        hasilTugas: {
          include: {
            tugas: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        badges: {
          orderBy: {
            earnedAt: 'desc'
          }
        },
        parent: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalAbsensi = student.absensi.length
    const hadirCount = student.absensi.filter(a => a.status === 'HADIR').length
    const attendancePercentage = totalAbsensi > 0 
      ? Math.round((hadirCount / totalAbsensi) * 100)
      : 0

    const grades = student.nilai.map(n => n.nilai)
    const avgGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + g, 0) / grades.length)
      : 0

    const completedAssignments = student.nilai.filter(n => n.nilai >= 60).length
    const totalAssignments = student.nilai.length

    // Get pending tugas (tugas not yet taken)
    const allTugas = await prisma.tugas.findMany({
      where: {
        status: 'ACTIVE'
      }
    })
    const takenTugasIds = student.hasilTugas.map(h => h.tugasId)
    const pendingTugas = allTugas.filter(t => !takenTugasIds.includes(t.id))

    return NextResponse.json({
      success: true,
      data: {
        id: student.id,
        nama: student.nama,
        nis: student.nis,
        kebutuhanKhusus: student.kebutuhanKhusus,
        kelas: student.kelas?.nama || 'Belum ada kelas',
        guruNama: student.kelas?.guru?.user.name || '-',
        parentName: student.parent?.name || '-',
        attendance: attendancePercentage,
        avgGrade: avgGrade,
        assignmentsCompleted: completedAssignments,
        totalAssignments: totalAssignments,
        badges: student.badges.length,
        pendingTugas: pendingTugas.length,
        recentGrades: student.nilai.slice(0, 10).map(n => ({
          id: n.id,
          subject: n.mataPelajaran,
          grade: n.nilai,
          date: n.createdAt.toISOString()
        })),
        recentTugas: student.hasilTugas.slice(0, 10).map(h => ({
          id: h.id,
          title: h.tugas.judul,
          score: h.skor,
          passed: h.skor >= 60,
          date: h.createdAt.toISOString()
        })),
        weeklyAttendance: student.absensi.slice(0, 7).map(a => ({
          date: a.tanggal.toISOString(),
          status: a.status
        })),
        allBadges: student.badges.map(b => ({
          id: b.id,
          name: b.nama,
          description: b.deskripsi,
          earnedAt: b.earnedAt.toISOString()
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching student data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student data' },
      { status: 500 }
    )
  }
}
