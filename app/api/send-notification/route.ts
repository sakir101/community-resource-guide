import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";
import { EmailNotificationService } from "@/app/lib/email-service";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, data } = body

    console.log("📩 Notification request received:", { type, email, data })

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      )
    }

    let success = false
    let message = ""

    switch (type) {
      case "resource_submitted": {
        const resource = await prisma.resource.findUnique({
          where: { id: data.resourceId },
          include: {
            category: true,
            ResourceField: true,
          },
        })

        if (!resource) {
          return NextResponse.json({ success: false, message: "Resource not found" }, { status: 404 })
        }

        const resourceName =
          resource.ResourceField.find((f) =>
            ["name", "campName", "title", "program", "resource"].includes(f.name),
          )?.value || "Unnamed Resource"

        success = await EmailNotificationService.sendNewResourceNotification({
          id: resource.id,
          category: resource.category.label,
          data: Object.fromEntries(resource.ResourceField.map((f) => [f.name, f.value])),
          submittedAt: resource.createdAt.toISOString(),
        })

        message = "Resource submission notification sent"
        break
      }

      case "feedback_submitted": {
        const feedback = await prisma.resourceFeedback.findUnique({
          where: { id: data.feedbackId },
          include: {
            resource: {
              include: {
                category: true,
              },
            },
          },
        })

        if (!feedback || !feedback.resource) {
          return NextResponse.json({ success: false, message: "Feedback or resource not found" }, { status: 404 })
        }

        success = await EmailNotificationService.sendFeedbackNotification({
          id: feedback.id,
          category: feedback.resource.category.label,
          resourceName: data.resourceName || "Unknown Resource",
          feedback: feedback.comment,
          submittedAt: feedback.createdAt.toISOString(),
        })

        message = "Feedback notification sent"
        break
      }

      case "test": {
        success = await EmailNotificationService.sendTestEmail(email)
        message = "Test email sent"
        break
      }

      default:
        return NextResponse.json(
          { success: false, message: "Unknown notification type" },
          { status: 400 },
        )
    }

    return NextResponse.json({ success, message })
  } catch (error) {
    console.error("❌ Notification API error:", error)
    return NextResponse.json({ success: false, message: "Failed to send notification" }, { status: 500 })
  }
}
