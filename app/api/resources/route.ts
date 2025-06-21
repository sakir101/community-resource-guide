import { type NextRequest, NextResponse } from "next/server"
import { getResourceData, addResource, updateResource, deleteResource, initializeDefaultData } from "@/app/lib/database"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");

    if (!categoryId) {
      return NextResponse.json(
        { success: false, message: "categoryId parameter is required" },
        { status: 400 }
      );
    }

    // Optional: Initialize default data
    await initializeDefaultData();

    // Fetch resources directly using Prisma
    const data = await prisma.resource.findMany({
      where: { categoryId },
      include: {
        ResourceField: true,
        category: true, // Optional: if you want to include category info
      },
    });

    console.log(`📊 API: Returning ${data.length} items for category ID "${categoryId}"`);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Failed to fetch resources:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch resources", data: [] },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, data, index } = body

    console.log(`🔧 API: Processing ${action} for category "${category}"`)
    console.log(`📝 API: Data received:`, data)

    if (action === "add") {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Create the Resource
          const newResource = await tx.resource.create({
            data: {
              categoryId: category,
            },
          });

          // 2. Create ResourceField[] associated with the Resource
          const resourceFields = data.map((field: any) => ({
            resourceId: newResource.id,
            fieldId: field.id,
            name: field.name,
            value: field.value,
          }));

          await tx.resourceField.createMany({
            data: resourceFields,
          });

          return newResource;
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: "Resource added successfully",
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to add resource",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    } else if (action === "update") {
      try {
        const result = await prisma.$transaction(async (tx) => {

          // Step 2: Delete existing ResourceField entries
          await tx.resourceField.deleteMany({
            where: {
              resourceId: data.resourceId,
            },
          });

          // Step 3: Re-insert updated ResourceField entries
          const resourceFields = data.fields.map((field: any) => ({
            resourceId: data.resourceId,
            fieldId: field.id,
            name: field.name,
            value: field.value,
          }));

          await tx.resourceField.createMany({
            data: resourceFields,
          });
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: "Resource field updated successfully",
        });
      } catch (error) {
        console.error("❌ Error updating resource:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update resource",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    } else if (action === "delete") {
      try {
        await prisma.$transaction([
          // Delete related ResourceField entries
          prisma.resourceField.deleteMany({
            where: {
              resourceId: category,
            },
          }),

          // Delete the Resource
          prisma.resource.delete({
            where: {
              id: category,
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          message: "Resource deleted successfully",
        });
      } catch (error) {
        console.error("Delete transaction failed:", error);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update resource",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, message: "Failed to process request" }, { status: 500 })
  }
}

// export async function FeedbackPOST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { resourceId, userId, comment } = body;

//     // Validate required fields
//     if (!resourceId || !userId || typeof rating !== "number") {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Missing required fields: resourceId, userId, or rating.",
//         },
//         { status: 400 }
//       );
//     }

//     // Create the feedback
//     const feedback = await prisma.resourceFeedback.create({
//       data: {
//         resourceId,
//         userId,
//         comment,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Feedback submitted successfully",
//       data: feedback,
//     });
//   } catch (error) {
//     console.error("❌ Error submitting feedback:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to submit feedback",
//         error: error instanceof Error ? error.message : String(error),
//       },
//       { status: 500 }
//     );
//   }
// }
