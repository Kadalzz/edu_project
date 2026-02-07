import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { sign } from "jsonwebtoken"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        guru: true,
        siswaChildren: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      )
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET || "secret-key",
      { expiresIn: "7d" }
    )

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    )

    // Set cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { 
        error: "Terjadi kesalahan saat login",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
