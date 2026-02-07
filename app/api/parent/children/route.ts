import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: 'Parent ID is required' },
        { status: 400 }
      )
    }

    // Get all children for this parent with their related data
    const children = await prisma.siswa.findMany({
      where: {
        parentId: parentId
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
          },
          take: 10
        },
        absensi: {
          orderBy: {
            tanggal: 'desc'
          },
          take: 30
        },
        hasilKuis: {
          include: {
            kuis: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        badges: {
          orderBy: {
            earnedAt: 'desc'
          }
        }
      }
    })

    // Transform data for frontend
    const transformedChildren = children.map((child: any) => {
      // Calculate attendance percentage
      const totalAbsensi = child.absensi.length
      const hadirCount = child.absensi.filter((a: any) => a.status === 'hadir').length
      const attendancePercentage = totalAbsensi > 0 
        ? Math.round((hadirCount / totalAbsensi) * 100)
        : 0

      // Calculate average grade
      const grades = child.nilai.map((n: any) => n.nilai)
      const avgGrade = grades.length > 0
        ? Math.round(grades.reduce((sum: number, g: number) => sum + g, 0) / grades.length)
        : 0

      // Count completed assignments (nilai >= 60)
      const completedAssignments = child.nilai.filter((n: any) => n.nilai >= 60).length
      const totalAssignments = child.nilai.length

      return {
        id: child.id,
        nama: child.nama,
        nis: child.nis,
        kebutuhanKhusus: child.kebutuhanKhusus,
        kelas: child.kelas?.nama || 'Belum ada kelas',
        guruNama: child.kelas?.guru?.user.name || '-',
        attendance: attendancePercentage,
        avgGrade: avgGrade,
        assignmentsCompleted: completedAssignments,
        totalAssignments: totalAssignments,
        badges: child.badges.length,
        recentGrades: child.nilai.slice(0, 5).map((n: any) => ({
          subject: n.mataPelajaran,
          grade: n.nilai,
          date: n.createdAt.toISOString()
        })),
        recentQuizzes: child.hasilKuis.slice(0, 5).map((h: any) => ({
          title: h.kuis.judul,
          score: h.nilai,
          date: h.createdAt.toISOString()
        })),
        weeklyAttendance: child.absensi.slice(0, 7).map((a: any) => ({
          date: a.tanggal.toISOString(),
          status: a.status
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedChildren
    })
  } catch (error) {
    console.error('Error fetching children data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch children data' },
      { status: 500 }
    )
  }
}
