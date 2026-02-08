import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get student by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id },
      include: {
        kelas: true,
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        nilai: {
          orderBy: { createdAt: "desc" }
        },
        hasilTugas: {
          include: {
            tugas: {
              select: {
                judul: true,
                mataPelajaran: true
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        absensi: {
          orderBy: { tanggal: "desc" },
          take: 30
        },
        progressReports: {
          orderBy: { createdAt: "desc" }
        },
        badges: {
          orderBy: { earnedAt: "desc" }
        }
      }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: siswa })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

// PATCH - Update student
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const body = await request.json()
    
    const siswa = await prisma.siswa.update({
      where: { id: params.id },
      data: {
        ...body,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined
      },
      include: {
        kelas: true,
        parent: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: siswa })
  } catch (error) {
    console.error("Error updating siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update student" },
      { status: 500 }
    )
  }
}

// DELETE - Delete student with cascade
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    // Delete all related records first to avoid foreign key constraints
    await prisma.$transaction([
      // Delete hasil tugas (and its jawaban via cascade)
      prisma.hasilTugas.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete nilai
      prisma.nilai.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete absensi
      prisma.absensi.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete progress reports
      prisma.progressReport.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete badges
      prisma.badge.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete nilai kategori (custom grading)
      prisma.nilaiKategori.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete jadwal temu (appointment schedules)
      prisma.jadwalTemu.deleteMany({
        where: { siswaId: params.id }
      }),
      // Delete laporan belajar rumah (and its dokumentasi via cascade)
      prisma.laporanBelajarRumah.deleteMany({
        where: { siswaId: params.id }
      }),
      // Finally delete the student
      prisma.siswa.delete({
        where: { id: params.id }
      })
    ])

    return NextResponse.json({ success: true, message: "Student deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting siswa:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete student" },
      { status: 500 }
    )
  }
}
