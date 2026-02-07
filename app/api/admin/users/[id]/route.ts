import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

// DELETE user by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params

    // Check if user exists and is not an admin
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Tidak dapat menghapus admin" },
        { status: 403 }
      )
    }

    // Delete user (cascade will delete related records)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ 
      success: true, 
      message: "User berhasil dihapus" 
    })
  } catch (error: any) {
    console.error("Delete user error:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: "Tidak dapat menghapus user karena masih memiliki data terkait" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan saat menghapus user" },
      { status: 500 }
    )
  }
}
