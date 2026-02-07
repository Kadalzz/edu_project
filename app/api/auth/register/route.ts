import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
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
      if (!studentData || !studentData.studentName || !studentData.nis || !studentData.phone || !studentData.specialNeeds) {
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
            { error: "Belum ada guru terdaftar. Mohon hubungi administrator." },
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
          kebutuhanKhusus: studentData.specialNeeds,
          catatan: `No. Telepon: ${studentData.phone}`,
        },
      })
    }

    return NextResponse.json(
      { 
        message: "Registrasi berhasil",
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
    console.error("Registration error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat registrasi",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
