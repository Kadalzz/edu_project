import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all messages for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const otherUserId = searchParams.get("otherUserId")
    const limit = searchParams.get("limit")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    const where: any = {}

    // If otherUserId is provided, get conversation between two users
    if (otherUserId) {
      where.OR = [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId }
      ]
    } else {
      // Otherwise, get all messages to/from this user
      where.OR = [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    }

    const messages = await prisma.chat.findMany({
      where,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : 100
    })

    // If no specific conversation, group by conversation partner
    if (!otherUserId) {
      // Get unique conversations with last message
      const conversationMap = new Map()

      for (const msg of messages) {
        const partnerId = msg.fromUserId === userId ? msg.toUserId : msg.fromUserId
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            partner: msg.fromUserId === userId ? msg.toUser : msg.fromUser,
            lastMessage: msg,
            unreadCount: 0
          })
        }

        // Count unread messages
        if (msg.toUserId === userId && !msg.isRead) {
          const conv = conversationMap.get(partnerId)
          conv.unreadCount++
        }
      }

      return NextResponse.json({ 
        success: true, 
        data: {
          conversations: Array.from(conversationMap.values())
        }
      })
    }

    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST - Send new message
export async function POST(request: Request) {
  try {
    // Require authentication
    const { requireAuth, logActivity, createNotification } = await import('@/lib/auth')
    const authUser = await requireAuth()

    const body = await request.json()
    const { toUserId, message, siswaId } = body

    // Validate required fields
    if (!toUserId || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (toUserId, message)" },
        { status: 400 }
      )
    }

    // Check if recipient exists
    const toUser = await prisma.user.findUnique({ 
      where: { id: toUserId },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!toUser) {
      return NextResponse.json(
        { success: false, error: "Recipient not found" },
        { status: 404 }
      )
    }

    const chat = await prisma.chat.create({
      data: {
        fromUserId: authUser.userId,
        toUserId,
        message,
        siswaId,
        isRead: false
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Create notification for recipient
    await createNotification(
      toUserId,
      'Pesan Baru',
      `Pesan baru dari ${authUser.name}`,
      'info',
      `/chat?userId=${authUser.userId}`
    )

    // Log activity
    await logActivity(
      authUser.userId,
      'SEND_MESSAGE',
      'Chat',
      chat.id,
      `Sent message to ${toUser.name}`
    )

    return NextResponse.json({ success: true, data: chat }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    )
  }
}

// PATCH - Mark messages as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, otherUserId } = body

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { success: false, error: "userId and otherUserId are required" },
        { status: 400 }
      )
    }

    // Mark all messages from otherUserId to userId as read
    await prisma.chat.updateMany({
      where: {
        fromUserId: otherUserId,
        toUserId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Messages marked as read" 
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return NextResponse.json(
      { success: false, error: "Failed to mark messages as read" },
      { status: 500 }
    )
  }
}
