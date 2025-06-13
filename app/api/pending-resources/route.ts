import { type NextRequest, NextResponse } from "next/server"
import {
  getPendingResources,
  addPendingResource,
  approvePendingResource,
  rejectPendingResource,
  removePendingResource,
} from "@/app/lib/database"

export async function GET() {
  try {
    console.log("🔄 API: Fetching pending resources from database...")
    const pendingResources = await getPendingResources()
    console.log("📋 Database response:", pendingResources.length, "pending resources")

    return NextResponse.json({
      success: true,
      data: pendingResources,
    })
  } catch (error) {
    console.error("❌ Failed to fetch pending resources:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending resources",
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

    console.log("📥 Pending resources API received:", { action, body })

    switch (action) {
      case "add": {
        const { category, data, submitterEmail } = body
        const newResource = await addPendingResource({
          category,
          data,
          submittedAt: new Date().toISOString(),
          status: "pending",
          submitterEmail,
        })

        if (newResource) {
          return NextResponse.json({
            success: true,
            data: newResource,
            message: "Resource submitted for approval",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to submit resource",
            },
            { status: 500 },
          )
        }
      }

      case "approve": {
        const { resourceId, adminNotes } = body
        const success = await approvePendingResource(resourceId, adminNotes)

        if (success) {
          return NextResponse.json({
            success: true,
            message: "Resource approved successfully",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to approve resource",
            },
            { status: 500 },
          )
        }
      }

      case "reject": {
        const { resourceId, adminNotes } = body
        const success = await rejectPendingResource(resourceId, adminNotes)

        if (success) {
          return NextResponse.json({
            success: true,
            message: "Resource rejected",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to reject resource",
            },
            { status: 500 },
          )
        }
      }

      case "remove": {
        const { resourceId } = body
        const success = await removePendingResource(resourceId)

        if (success) {
          return NextResponse.json({
            success: true,
            message: "Resource removed",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to remove resource",
            },
            { status: 500 },
          )
        }
      }

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action",
          },
          { status: 400 },
        )
    }
  } catch (error) {
    console.error("❌ Error in pending resources API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
