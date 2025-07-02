import { type NextRequest, NextResponse } from "next/server"
import { getResourceData, addResource, updateResource, deleteResource, initializeDefaultData } from "@/app/lib/database"
import { PrismaClient } from "@prisma/client";
import { EmailNotificationService } from "@/app/lib/email-service";

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

    return NextResponse.json({ success: true, data });
  } catch (error) {

    return NextResponse.json(
      { success: false, message: "Failed to fetch resources", data: [] },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, category, data, index, resourceName, settings } = body


    if (action === "add") {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Create the Resource
          const newResource = await tx.resource.create({
            data: {
              categoryId: category,
              name: resourceName, // You must ensure this comes from the request
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

          return {
            resource: newResource,
            fields: resourceFields,
          };
        });

        const categoryData = await prisma.category.findUnique({
          where: { id: category },
          select: { label: true },
        });

        // 🔔 Send email notification after resource and fields are saved
        try {

          await EmailNotificationService.sendNewResourceNotification({
            id: result.resource.id,
            category: categoryData?.label || "Unknown Category",
            data: result.resource.name,
            submittedAt: new Date().toISOString(),
            email: settings.adminEmail,
            settings
          });
        } catch (emailError) {

          // Do not throw; this should not block the request
        }

        return NextResponse.json({
          success: true,
          data: result.resource,
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
          // 1. Delete existing ResourceField entries
          await tx.resourceField.deleteMany({
            where: {
              resourceId: data.resourceId,
            },
          });

          // 2. Re-insert updated ResourceField entries
          const resourceFields = data.fields.map((field: any) => ({
            resourceId: data.resourceId,
            fieldId: field.id,
            name: field.name,
            value: field.value,
          }));

          await tx.resourceField.createMany({
            data: resourceFields,
          });

          // 3. Fetch category and updatedAt
          const resource = await tx.resource.findUnique({
            where: { id: data.resourceId },
            include: {
              category: true,
            },
          });

          if (!resource) {
            throw new Error("Resource not found");
          }

          return {
            resource,
            fields: resourceFields,
          };
        });

        // 📧 Send update notification
        try {
          const fieldMap = Object.fromEntries(
            result.fields.map((f: any) => [f.name, f.value])
          );

          await EmailNotificationService.updateResourceNotification({
            id: result.resource.id,
            category: result.resource.category.label,
            data: result.resource.name,
            updatedAt: result.resource.updatedAt.toISOString(),
            email: settings.adminEmail,
            settings,
          });
        } catch (emailErr) {

        }

        return NextResponse.json({
          success: true,
          data: result.resource,
          message: "Resource field updated successfully",
        });
      } catch (error) {

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
        // 1. Fetch the resource with its category and fields
        const resource = await prisma.resource.findUnique({
          where: { id: category },
          include: {
            category: true,
            ResourceField: true,
          },
        });

        if (!resource) {
          return NextResponse.json(
            { success: false, message: "Resource not found" },
            { status: 404 }
          );
        }

        // 2. Extract fields into key-value map
        const fieldMap: Record<string, string> = Object.fromEntries(
          resource.ResourceField.map((f) => [f.name, f.value])
        );

        // 3. Extract name/title to use in notification
        const resourceName = resource.name;

        // 4. Perform the deletion
        await prisma.$transaction([
          prisma.resourceField.deleteMany({ where: { resourceId: category } }),
          prisma.resourceFeedback.deleteMany({ where: { resourceId: category } }),
          prisma.resource.delete({ where: { id: category } }),
        ]);

        // 5. Send delete notification
        try {
          await EmailNotificationService.deleteResourceNotification({
            id: resource.id,
            category: resource.category.label,
            data: resourceName,
            email: settings.adminEmail,
            settings,
          });
        } catch (emailError) {

        }

        return NextResponse.json({
          success: true,
          message: "Resource deleted successfully",
        });

      } catch (error) {

        return NextResponse.json(
          {
            success: false,
            message: "Failed to update resource",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    } else if (action === "updateResourceName") {
      try {

        const { data, settings } = body
        // 1. Fetch the resource with its category and fields
        const resource = await prisma.resource.update({
          where: { id: data.resourceId },
          data: { name: data.resourceName },
          include: {
            category: true,
            ResourceField: true,
          },
        });

        if (!resource) {
          return NextResponse.json(
            { success: false, message: "Resource update failed" },
            { status: 404 }
          );
        }

        // 5. Send delete notification
        try {
          await EmailNotificationService.resourceNameUpdateNotification({
            id: resource.id,
            category: resource.category.label,
            data: resource.name,
            email: settings.adminEmail,
            settings,
          });
        } catch (emailError) {

        }

        return NextResponse.json({
          success: true,
          message: "Resource name updated successfully",
        });

      } catch (error) {

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
