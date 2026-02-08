import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all quizzes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const guruId = searchParams.get("guruId")
    const kelasId = searchParams.get("kelasId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (guruId) {
      where.guruId = guruId
    }

    if (kelasId) {
      where.kelasId = kelasId
    }

    if (status) {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: "insensitive" } },
        { mataPelajaran: { contains: search, mode: "insensitive" } }
      ]
    }

    const kuis = await prisma.kuis.findMany({
      where,
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        kelas: {
          select: {
            nama: true
          }
        },
        pertanyaan: {
          select: {
            id: true,
            soal: true,
            poin: true
          }
        },
        hasilKuis: {
          select: {
            id: true,
            skor: true,
            skorMaksimal: true,
            siswaId: true
          }
        },
        _count: {
          select: {
            pertanyaan: true,
            hasilKuis: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calculate statistics for each quiz
    const kuisWithStats = kuis.map((quiz: any) => {
      const totalParticipants = quiz.hasilKuis.length
      const avgScore = totalParticipants > 0
        ? quiz.hasilKuis.reduce((sum: number, h: any) => sum + (h.skor / h.skorMaksimal * 100), 0) / totalParticipants
        : 0

      return {
        ...quiz,
        totalQuestions: quiz._count.pertanyaan,
        totalParticipants,
        avgScore: Math.round(avgScore)
      }
    })

    return NextResponse.json({ success: true, data: kuisWithStats })
  } catch (error) {
    console.error("Error fetching kuis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch quizzes" },
      { status: 500 }
    )
  }
}

// POST - Create new quiz/tugas
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      kelasId,
      judul,
      deskripsi,
      mode,
      durasi,
      deadline,
      tanggalTampil,
      mataPelajaran,
      pertanyaan,
      status
    } = body

    // Get guruId from session (you'll need to implement proper auth)
    // For now, get first guru as fallback
    const guru = await prisma.guru.findFirst()
    
    if (!guru) {
      return NextResponse.json(
        { success: false, error: "Guru not found. Please create a teacher account first." },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!judul || !mode) {
      return NextResponse.json(
        { success: false, error: "Judul dan mode wajib diisi" },
        { status: 400 }
      )
    }

    const kuis = await prisma.kuis.create({
      data: {
        guruId: guru.id,
        kelasId,
        judul,
        deskripsi,
        mode,
        status: status || "ACTIVE",
        durasi,
        deadline: deadline ? new Date(deadline) : null,
        tanggalTampil: tanggalTampil ? new Date(tanggalTampil) : null,
        mataPelajaran,
        pertanyaan: pertanyaan ? {
          create: pertanyaan.map((p: any, index: number) => ({
            soal: p.soal,
            tipeJawaban: p.tipeJawaban,
            pilihan: p.pilihan,
            jawabanBenar: p.jawabanBenar,
            poin: p.poin || 10,
            urutan: index + 1
          }))
        } : undefined
      },
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

    return NextResponse.json({ success: true, data: kuis }, { status: 201 })
  } catch (error) {
    console.error("Error creating kuis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create tugas" },
      { status: 500 }
    )
  }
}
