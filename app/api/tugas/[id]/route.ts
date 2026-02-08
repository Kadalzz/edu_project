import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get single tugas by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const tugas: any = await prisma.tugas.findUnique({
      where: { id },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        kelas: {
          include: {
            siswa: {
              select: {
                nama: true
              }
            }
          }
        },
        pertanyaan: {
          orderBy: { urutan: "asc" }
        },
        hasilTugas: {
          include: {
            siswa: {
              select: {
                nama: true
              }
            },
            jawaban: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    if (!tugas) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalQuestions = tugas.pertanyaan.length
    const totalParticipants = tugas.hasilTugas.length
    const avgScore = totalParticipants > 0
      ? tugas.hasilTugas.reduce((sum: number, h: any) => sum + (h.skor / h.skorMaksimal * 100), 0) / totalParticipants
      : 0

    const tugasWithStats = {
      ...tugas,
      _count: {
        pertanyaan: totalQuestions,
        hasilTugas: totalParticipants
      },
      statistics: {
        totalQuestions,
        totalParticipants,
        avgScore: Math.round(avgScore),
        maxScore: tugas.pertanyaan.reduce((sum: number, p: any) => sum + p.poin, 0)
      }
    }

    return NextResponse.json({ success: true, data: tugasWithStats })
  } catch (error) {
    console.error("Error fetching tugas:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data tugas" },
      { status: 500 }
    )
  }
}

// PATCH - Update tugas
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const {
      judul,
      deskripsi,
      mode,
      status,
      durasi,
      deadline,
      mataPelajaran,
      kelasId,
      pertanyaan
    } = body

    // Check if tugas exists
    const existingTugas = await prisma.tugas.findUnique({
      where: { id }
    })

    if (!existingTugas) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      )
    }

    const updateData: any = {}
    
    if (judul !== undefined) updateData.judul = judul
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi
    if (mode !== undefined) updateData.mode = mode
    if (status !== undefined) updateData.status = status.toUpperCase()
    if (durasi !== undefined) updateData.durasi = durasi
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (mataPelajaran !== undefined) updateData.mataPelajaran = mataPelajaran
    if (kelasId !== undefined) updateData.kelasId = kelasId

    // Handle pertanyaan update if provided
    if (pertanyaan) {
      // Delete existing questions
      await prisma.pertanyaan.deleteMany({
        where: { tugasId: id }
      })

      // Create new questions
      updateData.pertanyaan = {
        create: pertanyaan.map((p: any, index: number) => ({
          soal: p.soal,
          tipeJawaban: p.tipeJawaban,
          pilihan: p.pilihan,
          jawabanBenar: p.jawabanBenar,
          poin: p.poin || 10,
          urutan: index + 1
        }))
      }
    }

    const tugas = await prisma.tugas.update({
      where: { id },
      data: updateData,
      include: {
        pertanyaan: true,
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        kelas: true
      }
    })

    return NextResponse.json({ success: true, data: tugas })
  } catch (error) {
    console.error("Error updating tugas:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate tugas" },
      { status: 500 }
    )
  }
}

// DELETE - Delete tugas
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if tugas exists
    const existingTugas = await prisma.tugas.findUnique({
      where: { id }
    })

    if (!existingTugas) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 }
      )
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      // Delete jawaban from hasilTugas
      prisma.jawaban.deleteMany({
        where: {
          hasilTugas: { tugasId: id }
        }
      }),
      // Delete hasilTugas
      prisma.hasilTugas.deleteMany({
        where: { tugasId: id }
      }),
      // Delete jawaban from pertanyaan
      prisma.jawaban.deleteMany({
        where: {
          pertanyaan: { tugasId: id }
        }
      }),
      // Delete pertanyaan
      prisma.pertanyaan.deleteMany({
        where: { tugasId: id }
      }),
      // Delete tugas
      prisma.tugas.delete({
        where: { id }
      })
    ])

    return NextResponse.json({ 
      success: true, 
      message: "Tugas berhasil dihapus" 
    })
  } catch (error) {
    console.error("Error deleting tugas:", error)
    return NextResponse.json(
      { success: false, error: "Gagal menghapus tugas" },
      { status: 500 }
    )
  }
}
