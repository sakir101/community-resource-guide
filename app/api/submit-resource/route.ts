import { type NextRequest, NextResponse } from "next/server"
import { addPendingResource } from "@/app/lib/storage"
import { EmailNotificationService } from "@/app/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Starting resource submission process...")

    let body
    try {
      body = await request.json()
      console.log("📝 Received submission:", body)
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError)
      return NextResponse.json({ success: false, message: "Invalid JSON in request body" }, { status: 400 })
    }

    const { category, data, submittedAt } = body

    // Validate required fields
    if (!category) {
      console.log("❌ Validation failed: Category is required")
      return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 })
    }

    if (!data || Object.keys(data).length === 0) {
      console.log("❌ Validation failed: Resource data is required")
      return NextResponse.json({ success: false, message: "Resource data is required" }, { status: 400 })
    }

    // Add to pending resources
    let newResource
    try {
      newResource = addPendingResource({
        category,
        data,
        submittedAt: submittedAt || new Date().toISOString(),
        status: "pending",
      })
      console.log("✅ Resource added to pending queue:", newResource.id)
      console.log("✅ Resource details:", newResource)
    } catch (storageError) {
      console.error("❌ Storage error:", storageError)
      return NextResponse.json(
        { success: false, message: "Failed to save resource. Please try again." },
        { status: 500 },
      )
    }

    // Try to send email notification
    try {
      console.log("📧 Attempting to send email notification...")

      const emailSent = await EmailNotificationService.sendNewResourceNotification({
        id: newResource.id,
        category,
        data,
        submittedAt: newResource.submittedAt,
      })

      if (emailSent) {
        console.log("✅ Email notification sent successfully")
      } else {
        console.log("⚠️ Email notification failed, but submission was successful")
      }
    } catch (emailError) {
      console.error("❌ Email notification error:", emailError)
      // Don't fail the submission if email fails - this is important!
    }

    // Always return success if the resource was saved, regardless of email status
    return NextResponse.json({
      success: true,
      message: "Resource submitted successfully for admin review.",
      submissionId: newResource.id,
      debug: {
        resourceId: newResource.id,
        category: newResource.category,
        status: newResource.status,
        submittedAt: newResource.submittedAt,
      },
    })
  } catch (error) {
    console.error("❌ Unexpected error in submit-resource API:", error)

    // Ensure we always return valid JSON
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again.",
        error: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ success: false, message: "Method not allowed" }, { status: 405 })
}
