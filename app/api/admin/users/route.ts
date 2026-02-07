import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// GET all users (teachers and parents only)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { role: string }
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['GURU', 'PARENT']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        guru: {
          select: {
            nip: true,
            kelas: {
              select: {
                nama: true
              }
            }
          }
        },
        siswaChildren: {
          select: {
            nama: true,
            nis: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 }
    )
  }
}

// POST create new user
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as { role: string }
    
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, email, password, role, studentData } = body

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Semua field harus diisi" },
        { status: 400 }
      )
    }

    if (!["PARENT", "GURU"].includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid" },
        { status: 400 }
      )
    }

    // Validate student data if role is PARENT
    if (role === "PARENT") {
      if (!studentData || !studentData.studentName || !studentData.nis) {
        return NextResponse.json(
          { error: "Data murid harus dilengkapi untuk pendaftaran orang tua" },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      )
    }

    // Check if NIS already exists (for PARENT role)
    if (role === "PARENT" && studentData?.nis) {
      const existingNIS = await prisma.siswa.findUnique({
        where: { nis: studentData.nis },
      })

      if (existingNIS) {
        return NextResponse.json(
          { error: "NIS sudah terdaftar" },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // If role is GURU, create Guru profile
    if (role === "GURU") {
      await prisma.guru.create({
        data: {
          userId: user.id,
        },
      })
    }

    // If role is PARENT, create Siswa profile
    if (role === "PARENT" && studentData) {
      // Get or create default class
      let defaultClass = await prisma.kelas.findFirst({
        orderBy: { createdAt: 'asc' },
      })

      // If no class exists, we need to find a guru to create default class
      if (!defaultClass) {
        const firstGuru = await prisma.guru.findFirst()
        
        if (firstGuru) {
          // Create a default class with first guru
          defaultClass = await prisma.kelas.create({
            data: {
              nama: "Kelas Utama",
              tahunAjaran: new Date().getFullYear().toString(),
              guruId: firstGuru.id,
              deskripsi: "Kelas default untuk semua siswa",
            },
          })
        } else {
          return NextResponse.json(
            { error: "Belum ada guru terdaftar. Mohon buat akun guru terlebih dahulu." },
            { status: 400 }
          )
        }
      }

      // Create student profile
      await prisma.siswa.create({
        data: {
          nama: studentData.studentName,
          nis: studentData.nis,
          kelasId: defaultClass.id,
          parentId: user.id,
          kebutuhanKhusus: studentData.specialNeeds || null,
          catatan: studentData.phone ? `No. Telepon: ${studentData.phone}` : null,
        },
      })
    }

    return NextResponse.json(
      { 
        message: "User berhasil dibuat",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create user error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat membuat user",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
