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
    const body = await request.json()
    const {
      siswaId,
      guruId,
      mataPelajaran,
      jenisNilai,
      nilai,
      nilaiMaksimal,
      catatan,
      tanggal
    } = body

    // Validate required fields
    if (!siswaId || !guruId || !mataPelajaran || !jenisNilai || nilai === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (siswaId, guruId, mataPelajaran, jenisNilai, nilai)" },
        { status: 400 }
      )
    }

    const nilaiRecord = await prisma.nilai.create({
      data: {
        siswaId,
        guruId,
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

    return NextResponse.json({ success: true, data: nilaiRecord }, { status: 201 })
  } catch (error) {
    console.error("Error creating nilai:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create grade" },
      { status: 500 }
    )
  }
}
