import { type NextRequest, NextResponse } from "next/server"
import { getResourceData, addResource, updateResource, deleteResource, initializeDefaultData } from "@/app/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (!category) {
      return NextResponse.json({ success: false, message: "Category parameter is required" }, { status: 400 })
    }

    // Initialize default data if this is the first request
    await initializeDefaultData()

    const data = await getResourceData(category)
    console.log(`📊 API: Returning ${data.length} items for category "${category}"`)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Failed to fetch resources:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch resources", data: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, data, index } = body

    console.log(`🔧 API: Processing ${action} for category "${category}"`)
    console.log(`📝 API: Data received:`, data)

    if (action === "add") {
      const success = await addResource(category, data)
      if (success) {
        console.log("✅ API: Resource added successfully")
        return NextResponse.json({ success: true, message: "Resource added successfully!" })
      } else {
        return NextResponse.json({ success: false, message: "Failed to add resource" }, { status: 500 })
      }
    } else if (action === "update") {
      console.log(`📝 API: Updating resource at index ${index}`)
      const success = await updateResource(category, index, data)
      if (success) {
        console.log("✅ API: Resource updated successfully")
        return NextResponse.json({ success: true, message: "Resource updated successfully!" })
      } else {
        console.log("❌ API: Resource not found for update")
        return NextResponse.json({ success: false, message: "Resource not found" }, { status: 404 })
      }
    } else if (action === "delete") {
      const success = await deleteResource(category, index)
      if (success) {
        console.log("✅ API: Resource deleted successfully")
        return NextResponse.json({ success: true, message: "Resource deleted successfully!" })
      } else {
        return NextResponse.json({ success: false, message: "Resource not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "Failed to process request" }, { status: 500 })
  }
}
