import { type NextRequest, NextResponse } from "next/server"
import { getCustomCategories, addCustomCategory, updateCustomCategory, deleteCustomCategory } from "../../lib/database"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        categoryFields: true,
        Resource: {
          include: {
            ResourceField: true,
          },
        },
        _count: {
          select: {
            Resource: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {

    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function GETSingle(req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        categoryFields: true,
      },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: category })
  } catch (error) {

    return NextResponse.json(
      { success: false, message: "Failed to fetch category" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body


    switch (action) {
      case "create": {
        const { name, label, description, icon, color, categoryFields } = body;

        const categoryToSave = {
          name,
          label,
          description,
          icon,
          color,
        };

        try {
          const result = await prisma.$transaction(async (tx) => {
            // 1. Create Category
            const newCategory = await tx.category.create({
              data: categoryToSave,
            });

            // 2. Prepare & Create CategoryFields
            if (categoryFields && Array.isArray(categoryFields) && categoryFields.length > 0) {
              const fieldsToCreate = categoryFields.map((field: any) => {
                const baseField = {
                  name: field.name,
                  label: field.label,
                  type: field.type,
                  required: field.required ?? false,
                  categoryId: newCategory.id,
                };

                // Include options only if it's a valid array
                if (Array.isArray(field.options) && field.options.length > 0) {
                  return {
                    ...baseField,
                    options: field.options,
                  };
                }

                return baseField;
              });

              await tx.categoryField.createMany({
                data: fieldsToCreate,
              });
            }

            // 3. Fetch category with fields
            const categoryWithFields = await tx.category.findUnique({
              where: { id: newCategory.id },
              include: { categoryFields: true },
            });

            return categoryWithFields;
          });

          return NextResponse.json({
            success: true,
            data: result,
            message: "Category created successfully",
          });

        } catch (error) {
          return NextResponse.json(
            {
              success: false,
              message: "Failed to create category",
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          );
        }
      }

      case "update": {
        const { categoryId, categoryData } = body;

        if (!categoryId || !categoryData) {
          return NextResponse.json(
            { success: false, message: "Missing categoryId or categoryData" },
            { status: 400 }
          );
        }

        const { name, label, description, icon, color, fields } = categoryData;

        try {
          const updatedCategory = await prisma.$transaction(async (tx) => {
            // 1. Update Category Info
            const category = await tx.category.update({
              where: { id: categoryId },
              data: {
                name,
                label,
                description,
                icon,
                color,
              },
            });

            // 2. Delete existing fields
            await tx.categoryField.deleteMany({
              where: { categoryId },
            });

            // 3. Insert updated fields
            if (fields && Array.isArray(fields) && fields.length > 0) {
              const fieldsToCreate = fields.map((field: any) => {
                const baseField = {
                  name: field.name,
                  label: field.label,
                  type: field.type,
                  required: field.required ?? false,
                  categoryId,
                };

                if (Array.isArray(field.options) && field.options.length > 0) {
                  return {
                    ...baseField,
                    options: field.options,
                  };
                }

                return baseField;
              });

              await tx.categoryField.createMany({
                data: fieldsToCreate,
              });
            }

            // 4. Return updated category with fields
            return tx.category.findUnique({
              where: { id: categoryId },
              include: { categoryFields: true },
            });
          });

          return NextResponse.json({
            success: true,
            data: updatedCategory,
            message: "Category updated successfully",
          });
        } catch (error) {

          return NextResponse.json(
            {
              success: false,
              message: "Failed to update category",
              error: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
          );
        }
      }

      case "delete": {
        const { categoryId } = body;

        if (!categoryId) {
          return NextResponse.json(
            {
              success: false,
              message: "Missing categoryId",
            },
            { status: 400 }
          );
        }

        try {
          await prisma.$transaction(async (tx) => {
            // Check if category exists
            const existingCategory = await tx.category.findUnique({
              where: { id: categoryId },
            });

            if (!existingCategory) {
              throw new Error("Category not found");
            }

            // Find all resource IDs in this category
            const resources = await tx.resource.findMany({
              where: { categoryId },
              select: { id: true },
            });
            const resourceIds = resources.map((r) => r.id);

            // Delete related resource feedbacks
            await tx.resourceFeedback.deleteMany({
              where: { resourceId: { in: resourceIds } },
            });

            // Delete related resource fields
            await tx.resourceField.deleteMany({
              where: { resourceId: { in: resourceIds } },
            });

            // Delete resources
            await tx.resource.deleteMany({
              where: { id: { in: resourceIds } },
            });

            // Delete category fields
            await tx.categoryField.deleteMany({
              where: { categoryId },
            });

            // Delete the category
            await tx.category.delete({
              where: { id: categoryId },
            });
          });

          return NextResponse.json({
            success: true,
            message: "Category and all related data deleted successfully",
          });
        } catch (error) {

          return NextResponse.json(
            { success: false, message: "Failed to delete category" },
            { status: 500 }
          );
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
