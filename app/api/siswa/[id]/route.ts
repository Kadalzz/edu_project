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
    
    // Check if siswa exists first
    const siswa = await prisma.siswa.findUnique({
      where: { id: params.id }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Siswa tidak ditemukan" },
        { status: 404 }
      )
    }

    // Delete all related records first to avoid foreign key constraints
    // Using sequential transaction for better error handling
    await prisma.$transaction(async (tx) => {
      // Delete jawaban from hasilTugas first
      await tx.jawaban.deleteMany({
        where: { 
          hasilTugas: { siswaId: params.id } 
        }
      })
      
      // Delete hasil tugas
      await tx.hasilTugas.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete nilai
      await tx.nilai.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete absensi
      await tx.absensi.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete progress reports
      await tx.progressReport.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete badges
      await tx.badge.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete nilai kategori (custom grading)
      await tx.nilaiKategori.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete jadwal temu (appointment schedules)
      await tx.jadwalTemu.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Delete dokumentasi from laporan belajar rumah
      const laporanIds = await tx.laporanBelajarRumah.findMany({
        where: { siswaId: params.id },
        select: { id: true }
      })
      
      if (laporanIds.length > 0) {
        await tx.dokumentasi.deleteMany({
          where: { laporanId: { in: laporanIds.map(l => l.id) } }
        })
      }
      
      // Delete laporan belajar rumah
      await tx.laporanBelajarRumah.deleteMany({
        where: { siswaId: params.id }
      })
      
      // Finally delete the student
      await tx.siswa.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ success: true, message: "Siswa berhasil dihapus" })
  } catch (error: any) {
    console.error("Error deleting siswa:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus siswa" },
      { status: 500 }
    )
  }
}
