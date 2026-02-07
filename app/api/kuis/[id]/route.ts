import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get single quiz by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const kuis: any = await prisma.kuis.findUnique({
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
        hasilKuis: {
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

    if (!kuis) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalQuestions = kuis.pertanyaan.length
    const totalParticipants = kuis.hasilKuis.length
    const avgScore = totalParticipants > 0
      ? kuis.hasilKuis.reduce((sum: number, h: any) => sum + (h.skor / h.skorMaksimal * 100), 0) / totalParticipants
      : 0

    const kuisWithStats = {
      ...kuis,
      statistics: {
        totalQuestions,
        totalParticipants,
        avgScore: Math.round(avgScore),
        maxScore: kuis.pertanyaan.reduce((sum: number, p: any) => sum + p.poin, 0)
      }
    }

    return NextResponse.json({ success: true, data: kuisWithStats })
  } catch (error) {
    console.error("Error fetching kuis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz" },
      { status: 500 }
    )
  }
}

// PATCH - Update quiz
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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

    // Check if quiz exists
    const existingKuis = await prisma.kuis.findUnique({
      where: { id }
    })

    if (!existingKuis) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
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
        where: { kuisId: id }
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

    const kuis = await prisma.kuis.update({
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

    return NextResponse.json({ success: true, data: kuis })
  } catch (error) {
    console.error("Error updating kuis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update quiz" },
      { status: 500 }
    )
  }
}

// DELETE - Delete quiz
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if quiz exists
    const existingKuis = await prisma.kuis.findUnique({
      where: { id },
      include: {
        hasilKuis: true
      }
    })

    if (!existingKuis) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Check if quiz has results
    if (existingKuis.hasilKuis.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete quiz with submitted results. Archive it instead." 
        },
        { status: 400 }
      )
    }

    // Delete pertanyaan first (cascade)
    await prisma.pertanyaan.deleteMany({
      where: { kuisId: id }
    })

    // Delete quiz
    await prisma.kuis.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Quiz deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting kuis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete quiz" },
      { status: 500 }
    )
  }
}
