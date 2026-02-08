import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all tugas
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

    const tugas = await prisma.tugas.findMany({
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
        hasilTugas: {
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
            hasilTugas: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Calculate statistics for each tugas
    const tugasWithStats = tugas.map((t: any) => {
      const totalParticipants = t.hasilTugas.length
      const avgScore = totalParticipants > 0
        ? t.hasilTugas.reduce((sum: number, h: any) => sum + (h.skor / h.skorMaksimal * 100), 0) / totalParticipants
        : 0

      return {
        ...t,
        totalQuestions: t._count.pertanyaan,
        totalParticipants,
        avgScore: Math.round(avgScore)
      }
    })

    return NextResponse.json({ success: true, data: tugasWithStats })
  } catch (error) {
    console.error("Error fetching tugas:", error)
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data tugas" },
      { status: 500 }
    )
  }
}

// POST - Create new tugas
export async function POST(request: Request) {
  try {
    // Check authentication and role
    const { getAuthGuru, logActivity } = await import('@/lib/auth')
    const guru = await getAuthGuru()

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

    // Validate required fields
    if (!judul || !mode) {
      return NextResponse.json(
        { success: false, error: "Judul dan mode wajib diisi" },
        { status: 400 }
      )
    }

    // Validate mode-specific requirements
    if (mode === 'LIVE' && !durasi) {
      return NextResponse.json(
        { success: false, error: "LIVE mode memerlukan durasi" },
        { status: 400 }
      )
    }

    if (mode === 'HOMEWORK' && !deadline) {
      return NextResponse.json(
        { success: false, error: "HOMEWORK mode memerlukan deadline" },
        { status: 400 }
      )
    }

    // Generate PIN for LIVE mode
    let pinCode = null
    if (mode === 'LIVE') {
      pinCode = Math.floor(100000 + Math.random() * 900000).toString()
    }

    const tugas = await prisma.tugas.create({
      data: {
        guruId: guru.id,
        kelasId,
        judul,
        deskripsi,
        mode,
        status: status || (mode === 'LIVE' ? 'DRAFT' : 'ACTIVE'),
        durasi,
        deadline: deadline ? new Date(deadline) : null,
        tanggalTampil: tanggalTampil ? new Date(tanggalTampil) : null,
        mataPelajaran,
        pinCode,
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

    // Log activity
    await logActivity(
      guru.userId,
      'CREATE_TUGAS',
      'Tugas',
      tugas.id,
      `Created tugas: ${tugas.judul}`
    )

    return NextResponse.json({ success: true, data: tugas }, { status: 201 })
  } catch (error) {
    console.error("Error creating tugas:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create tugas" },
      { status: 500 }
    )
  }
}
