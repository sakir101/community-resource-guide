import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all users (for demonstration purposes, usually not recommended for production)
        const users = await prisma.user.findMany();

        return NextResponse.json({ users }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create the user with the hashed password
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "User created", userId: newUser.id, email: newUser.email }, { status: 201 });

    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;
        console.log(id, status);

        // Update the user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                isActive: status === "active" ? true : false,
            },
        });

        return NextResponse.json({ success: true, message: "User updated", userId: updatedUser.id, email: updatedUser.email }, { status: 200 });

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }

}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete all feedbacks related to the user
            await tx.resourceFeedback.deleteMany({
                where: { userId: id },
            });

            // Delete the user
            await tx.user.delete({
                where: { id },
            });
        });

        return NextResponse.json({ success: true, message: "User deleted" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

