import { type NextRequest, NextResponse } from "next/server"
import { getCustomCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } from "../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeDefault = searchParams.get("includeDefault") === "true"

    const customCategories = await getCustomCategories()

    if (includeDefault) {
      // Return both default and custom categories
      const defaultCategories = [
        {
          id: "camps",
          name: "camps",
          label: "Camps",
          description: "Summer camps and recreational programs",
          icon: "Users",
          color: "bg-green-50 text-green-600 border-green-200",
          isDefault: true,
          fields: [
            { name: "campName", label: "Camp Name", type: "text", required: true },
            { name: "contactPerson", label: "Contact Person", type: "text", required: true },
            { name: "phone", label: "Phone", type: "text", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "underAuspicesOf", label: "Under Auspices Of", type: "text" },
            { name: "gender", label: "Gender", type: "select", options: ["boys", "girls", "both", "mixed"] },
            { name: "ages", label: "Ages", type: "text" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "location", label: "Location", type: "text" },
            { name: "integrated", label: "Integration Type", type: "text" },
            { name: "medicalNeeds", label: "Medical Needs", type: "text" },
            { name: "tuition", label: "Tuition", type: "text" },
            { name: "comments", label: "Comments", type: "textarea" },
          ],
        },
        {
          id: "schools",
          name: "schools",
          label: "Schools",
          description: "Educational institutions and schools",
          icon: "GraduationCap",
          color: "bg-blue-50 text-blue-600 border-blue-200",
          isDefault: true,
          fields: [
            { name: "name", label: "School Name", type: "text", required: true },
            { name: "location", label: "Location", type: "text", required: true },
            { name: "contactPerson", label: "Contact Person", type: "text", required: true },
            { name: "phone", label: "Phone", type: "text", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "studentsServed", label: "Students Served", type: "textarea" },
          ],
        },
        {
          id: "medical-supplies",
          name: "medical-supplies",
          label: "Medical Supplies",
          description: "Medical supplies and equipment resources",
          icon: "Stethoscope",
          color: "bg-red-50 text-red-600 border-red-200",
          isDefault: true,
          fields: [
            { name: "resource", label: "Resource Name", type: "text", required: true },
            { name: "contact", label: "Contact Info", type: "text", required: true },
            { name: "email", label: "Email", type: "email" },
            { name: "notes", label: "Notes", type: "textarea" },
            { name: "moreItems", label: "Additional Items", type: "textarea" },
          ],
        },
        {
          id: "hamaspik-programs",
          name: "hamaspik-programs",
          label: "Hamaspik Programs",
          description: "Hamaspik organization programs and services",
          icon: "Heart",
          color: "bg-purple-50 text-purple-600 border-purple-200",
          isDefault: true,
          fields: [
            { name: "program", label: "Program Name", type: "text", required: true },
            { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Both"] },
            { name: "functioningLevel", label: "Functioning Level", type: "text" },
            { name: "location", label: "Location", type: "text" },
            { name: "daysOpen", label: "Days Open", type: "text" },
            { name: "contact", label: "Contact", type: "text" },
            { name: "runBy", label: "Run By", type: "text" },
          ],
        },
        {
          id: "contracted-programs",
          name: "contracted-programs",
          label: "Contracted Programs",
          description: "Active contracted programs and services",
          icon: "Building",
          color: "bg-orange-50 text-orange-600 border-orange-200",
          isDefault: true,
          fields: [
            { name: "name", label: "Program Name", type: "text", required: true },
            { name: "programType", label: "Program Type", type: "text" },
            { name: "location", label: "Location", type: "text" },
            { name: "phone", label: "Phone", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "gender", label: "Gender", type: "select", options: ["boys", "girls", "both"] },
            { name: "ages", label: "Ages", type: "text" },
            { name: "whoItsFor", label: "Who It's For", type: "textarea" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "toSignUp", label: "How to Sign Up", type: "text" },
          ],
        },
        {
          id: "perks",
          name: "perks",
          label: "Perks",
          description: "Special perks and benefits available",
          icon: "Gift",
          color: "bg-pink-50 text-pink-600 border-pink-200",
          isDefault: true,
          fields: [
            { name: "title", label: "Perk Title", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea", required: true },
            { name: "details", label: "Details", type: "textarea" },
          ],
        },
      ]

      return NextResponse.json({
        success: true,
        data: [...defaultCategories, ...customCategories.map((cat) => ({ ...cat, isDefault: false }))],
      })
    } else {
      // Return only custom categories
      return NextResponse.json({
        success: true,
        data: customCategories,
      })
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    console.log("📥 Categories API received:", { action, body })

    switch (action) {
      case "create": {
        const { category } = body
        console.log("🚀 Creating category:", category)

        const categoryToSave = {
          ...category,
          icon: category.icon || "Folder",
          color: category.color || "bg-gray-50 text-gray-600 border-gray-200",
        }

        console.log("💾 Category data to save:", categoryToSave)

        const newCategory = await addCustomCategory(categoryToSave)

        if (newCategory) {
          console.log("✅ Category created:", newCategory)
          return NextResponse.json({
            success: true,
            data: newCategory,
            message: "Category created successfully",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to create category",
            },
            { status: 500 },
          )
        }
      }

      case "update": {
        const { categoryId, categoryData } = body
        console.log("✏️ Updating category:", categoryId, categoryData)

        const updatedCategory = await updateCustomCategory(categoryId, categoryData)
        if (updatedCategory) {
          return NextResponse.json({
            success: true,
            data: updatedCategory,
            message: "Category updated successfully",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Category not found",
            },
            { status: 404 },
          )
        }
      }

      case "delete": {
        const { categoryId } = body
        console.log("🗑️ Deleting category:", categoryId)

        const success = await deleteCustomCategory(categoryId)
        if (success) {
          return NextResponse.json({
            success: true,
            message: "Category deleted successfully",
          })
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Category not found",
            },
            { status: 404 },
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
    console.error("❌ Error in categories API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
