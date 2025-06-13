import { type NextRequest, NextResponse } from "next/server"
import { getFeedback, addFeedback, updateFeedbackStatus } from "@/app/lib/database"
import { EmailNotificationService } from "@/app/lib/email-service"

export async function GET() {
  try {
    const feedback = await getFeedback()
    return NextResponse.json({
      success: true,
      data: feedback,
    })
  } catch (error) {
    console.error("Failed to fetch feedback:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch feedback",
        data: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "update_status") {
      const { feedbackId, status } = body
      const success = await updateFeedbackStatus(feedbackId, status)

      if (success) {
        return NextResponse.json({
          success: true,
          message: "Feedback status updated",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update feedback status",
          },
          { status: 500 },
        )
      }
    } else {
      // Add new feedback
      const { category, resourceName, resourceData, feedback, submittedAt } = body

      const newFeedback = await addFeedback({
        category,
        resourceName,
        resourceData,
        feedback,
        submittedAt,
        status: "pending",
      })

      if (newFeedback) {
        // Send email notification (non-blocking)
        try {
          const emailService = new EmailNotificationService()
          await emailService.sendFeedbackNotification({
            category,
            resourceName,
            feedback,
            submittedAt,
          })
        } catch (emailError) {
          console.error("Failed to send email notification:", emailError)
          // Don't fail the request if email fails
        }

        return NextResponse.json({
          success: true,
          data: newFeedback,
          message: "Feedback submitted successfully",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to submit feedback",
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Error in feedback API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
