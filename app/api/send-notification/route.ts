import { type NextRequest, NextResponse } from "next/server"
import { EmailNotificationService } from "@/app/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, data } = body

    console.log("Notification request received:", { type, email, data })

    if (!email) {
      console.error("No email address provided for notification")
      return NextResponse.json(
        {
          success: false,
          message: "No email address provided",
        },
        { status: 400 },
      )
    }

    let success = false
    let message = ""

    switch (type) {
      case "resource_submitted":
        console.log("Sending resource submitted notification")
        success = await EmailNotificationService.sendResourceSubmittedNotification(
          email,
          data.category,
          data.resourceName,
        )
        message = "Resource submission notification sent"
        break

      case "resource_added":
        console.log("Sending resource added notification")
        success = await EmailNotificationService.sendResourceAddedNotification(
          email,
          data.category,
          data.resourceName,
          data.addedBy || "Admin",
        )
        message = "Resource added notification sent"
        break

      case "feedback_submitted":
        console.log("Sending feedback submitted notification")
        success = await EmailNotificationService.sendFeedbackSubmittedNotification(
          email,
          data.category,
          data.resourceName,
          data.feedback,
        )
        message = "Feedback notification sent"
        break

      case "test":
        console.log("Sending test email")
        success = await EmailNotificationService.sendTestEmail(email)
        message = "Test email sent"
        break

      default:
        console.error("Unknown notification type:", type)
        return NextResponse.json(
          {
            success: false,
            message: "Unknown notification type",
          },
          { status: 400 },
        )
    }

    console.log("Email notification result:", { success, message })

    return NextResponse.json({
      success,
      message,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send notification",
      },
      { status: 500 },
    )
  }
}
