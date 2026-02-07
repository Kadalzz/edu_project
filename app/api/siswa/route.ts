import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all students atau filter by kelas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const kelasId = searchParams.get("kelasId")
    const search = searchParams.get("search")

    const where: any = {}
    
    if (kelasId) {
      where.kelasId = kelasId
    }

    if (search) {
      where.OR = [
        { nama: { contains: search, mode: "insensitive" } },
        { nis: { contains: search, mode: "insensitive" } }
      ]
    }

    const siswa = await prisma.siswa.findMany({
      where,
      include: {
        kelas: true,
        parent: {
          select: {
            name: true,
            email: true
          }
        },
        nilai: {
          take: 5,
          orderBy: { createdAt: "desc" }
        },
        absensi: {
          take: 10,
          orderBy: { tanggal: "desc" }
        }
      },
      orderBy: { nama: "asc" }
    })

    return NextResponse.json({ success: true, data: siswa })
  } catch (error) {
    console.error("Error fetching siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}

// POST - Create new student
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      nama,
      nis,
      kelasId,
      parentId,
      tanggalLahir,
      jenisKelamin,
      kebutuhanKhusus,
      catatan
    } = body

    // Validate required fields
    if (!nama || !kelasId || !parentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const siswa = await prisma.siswa.create({
      data: {
        nama,
        nis,
        kelasId,
        parentId,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        jenisKelamin,
        kebutuhanKhusus,
        catatan
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

    return NextResponse.json({ success: true, data: siswa }, { status: 201 })
  } catch (error) {
    console.error("Error creating siswa:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create student" },
      { status: 500 }
    )
  }
}
