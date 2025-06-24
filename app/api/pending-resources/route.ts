import { type NextRequest, NextResponse } from "next/server"
import {
  addPendingResource,
  approvePendingResource,
  rejectPendingResource,
  removePendingResource,
} from "@/app/lib/database"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getPendingResources() {
  const resources = await prisma.resource.findMany({
    where: {
      status: "pending", // or ResourceStatus.pending if enum used
    },
    include: {
      category: true,
      ResourceField: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return resources.map((resource) => ({
    id: resource.id,
    category: resource.categoryId,
    categoryLabel: resource.category.label,
    submittedAt: resource.createdAt,
    status: resource.status,
    name: resource.name,
    data: resource.ResourceField.map((field) => ({
      id: field.id,
      name: field.name,
      value: field.value,
    })),
  }));
}

export async function GET() {
  try {
    const pendingResources = await getPendingResources();

    return NextResponse.json({
      success: true,
      data: pendingResources,
    });
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch pending resources",
        data: [],
      },
      { status: 500 },
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body


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
        const success = await prisma.resource.update({
          where: { id: resourceId },
          data: { adminNote: adminNotes, status: "approve" },
        })

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
        const success = await prisma.resource.update({
          where: { id: resourceId },
          data: { adminNote: adminNotes, status: "reject" },
        })

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

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
