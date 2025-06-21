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
        resourceName: resourceNameField?.value || "Unnamed Resource",
        feedback: fb.comment,
        submittedAt: fb.createdAt,
        status: fb.status,
        user: {
          id: fb.userId,
          name: "Anonymous",
          email: fb.user.email,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("❌ Failed to fetch feedback:", error);
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
    const { resourceId, userId, comment, action } = body;

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
      if (!resourceId || !userId || !comment) {
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
          userId,
          comment,
        },
      });

      if (feedback) {
        // // Send email notification (non-blocking)
        // try {
        //   const emailService = new EmailNotificationService()
        //   await emailService.sendFeedbackNotification({
        //     category,
        //     resourceName,
        //     feedback,
        //     submittedAt,
        //   })
        // } catch (emailError) {
        //   console.error("Failed to send email notification:", emailError)
        //   // Don't fail the request if email fails
        // }

        return NextResponse.json({
          success: true,
          data: feedback,
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
