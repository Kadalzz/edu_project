import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all grades
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const siswaId = searchParams.get("siswaId")
    const guruId = searchParams.get("guruId")
    const mataPelajaran = searchParams.get("mataPelajaran")
    const semester = searchParams.get("semester")

    const where: any = {}
    
    if (siswaId) {
      where.siswaId = siswaId
    }

    if (guruId) {
      where.guruId = guruId
    }

    if (mataPelajaran) {
      where.mataPelajaran = mataPelajaran
    }

    if (semester) {
      where.jenisNilai = { contains: semester, mode: "insensitive" }
    }

    const nilai = await prisma.nilai.findMany({
      where,
      include: {
        siswa: {
          select: {
            nama: true,
            kelas: {
              select: {
                nama: true,
                tingkat: true
              }
            }
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, data: nilai })
  } catch (error) {
    console.error("Error fetching nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch grades" },
      { status: 500 }
    )
  }
}

// POST - Create new grade
export async function POST(request: Request) {
  try {
    // Require GURU role
    const { getAuthGuru, logActivity, createNotification } = await import('@/lib/auth')
    const guru = await getAuthGuru()

    const body = await request.json()
    const {
      siswaId,
      mataPelajaran,
      jenisNilai,
      nilai,
      nilaiMaksimal,
      catatan,
      tanggal
    } = body

    // Validate required fields
    if (!siswaId || !mataPelajaran || !jenisNilai || nilai === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (siswaId, mataPelajaran, jenisNilai, nilai)" },
        { status: 400 }
      )
    }

    // Get siswa info including parent
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: { parent: true }
    })

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: "Siswa not found" },
        { status: 404 }
      )
    }

    const nilaiRecord = await prisma.nilai.create({
      data: {
        siswaId,
        guruId: guru.id,
        mataPelajaran,
        jenisNilai,
        nilai: parseFloat(nilai),
        nilaiMaksimal: nilaiMaksimal ? parseFloat(nilaiMaksimal) : 100,
        catatan,
        tanggal: tanggal ? new Date(tanggal) : new Date()
      },
      include: {
        siswa: {
          select: {
            nama: true
          }
        },
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Create notification for parent
    await createNotification(
      siswa.parentId,
      'Nilai Baru',
      `${siswa.nama} mendapat nilai ${nilai} untuk ${mataPelajaran} (${jenisNilai})`,
      'info',
      `/parent/anak-saya`
    )

    // Log activity
    await logActivity(
      guru.userId,
      'CREATE_NILAI',
      'Nilai',
      nilaiRecord.id,
      `Created nilai for ${siswa.nama}: ${nilai}/${nilaiMaksimal || 100}`
    )

    return NextResponse.json({ success: true, data: nilaiRecord }, { status: 201 })
  } catch (error) {
    console.error("Error creating nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create grade" },
      { status: 500 }
    )
  }
}
