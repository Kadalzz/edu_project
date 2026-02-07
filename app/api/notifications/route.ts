import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - Get all notifications for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const isRead = searchParams.get("isRead")
    const limit = searchParams.get("limit")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    const where: any = { userId }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true"
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : 50
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: notifications,
      unreadCount
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

// POST - Create new notification
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, title, message, type } = body

    // Validate required fields
    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (userId, title, message)" },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        content: message,
        type: type || "info",
        isRead: false
      }
    })

    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    )
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { userId, notificationId, markAllAsRead } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      )
    }

    if (markAllAsRead) {
      // Mark all notifications for user as read
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: "All notifications marked as read" 
      })
    }

    if (notificationId) {
      // Mark specific notification as read
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
      })

      return NextResponse.json({ 
        success: true, 
        data: notification 
      })
    }

    return NextResponse.json(
      { success: false, error: "Either notificationId or markAllAsRead must be provided" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get("id")
    const userId = searchParams.get("userId")
    const deleteAll = searchParams.get("deleteAll")

    if (deleteAll === "true" && userId) {
      // Delete all read notifications for user
      await prisma.notification.deleteMany({
        where: {
          userId,
          isRead: true
        }
      })

      return NextResponse.json({ 
        success: true, 
        message: "Read notifications deleted successfully" 
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: "notificationId is required" },
        { status: 400 }
      )
    }

    // Check if notification exists
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!existingNotification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      )
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Notification deleted successfully" 
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
