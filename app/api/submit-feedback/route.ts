import { type NextRequest, NextResponse } from "next/server"
import { addFeedback, updateFeedbackStatus } from "@/app/lib/database"
import { EmailNotificationService } from "@/app/lib/email-service"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getFeedback() {
  return await prisma.resourceFeedback.findMany({
    include: {
      user: true,
      resource: {
        include: {
          category: true,
          ResourceField: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}


export async function GET() {
  try {
    const feedbackRaw = await getFeedback();



    const feedback = feedbackRaw.map((fb) => {
      const resourceNameField = fb.resource.ResourceField.find(
        (field) => field.name === "name" || field.name === "title"
      );

      return {
        id: fb.id,
        resourceId: fb.resourceId,
        category: fb.resource.categoryId,
        categoryLabel: fb.resource.category.label,
        resourceName: fb.resource.name,
        feedback: fb.comment,
        submittedAt: fb.createdAt,
        status: fb.status,
        userEmail: fb.user ? fb.user.email : "Anonymous",
      };
    });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch feedback",
        data: [],
      },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resourceId, comment, action, userId } = body;

    if (action === "update_status") {
      const { feedbackId, status } = body
      const success = await prisma.resourceFeedback.update({
        where: { id: feedbackId },
        data: { status },
      })

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

      // Validate required fields
      if (!resourceId || !comment || !userId) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing required fields: resourceId, userId, or comment.",
          },
          { status: 400 }
        );
      }

      // Create the feedback
      const feedback = await prisma.resourceFeedback.create({
        data: {
          resourceId,
          comment,
          userId,
        },
      });

      // 2. Fetch the related resource and category for email info
      const fullFeedback = await prisma.resourceFeedback.findUnique({
        where: { id: feedback.id },
        include: {
          resource: {
            include: {
              category: true,
            },
          },
        },
      })

      if (!fullFeedback || !fullFeedback.resource || !fullFeedback.resource.category) {
      } else {
        const categoryLabel = fullFeedback.resource.category.label
        const resourceName = fullFeedback.resource.name || "Unnamed Resource"

        // 3. Send feedback email (non-blocking)
        try {
          await EmailNotificationService.sendFeedbackNotification({
            id: feedback.id,
            category: categoryLabel,
            resourceName,
            feedback: comment,
            submittedAt: feedback.createdAt.toISOString(),
          })
        } catch (emailError) {

          // Do not fail the main operation
        }
      }

      return NextResponse.json(
        { success: true, message: "Feedback submitted successfully" },
        { status: 201 }
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
