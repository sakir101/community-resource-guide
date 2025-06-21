import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch all approved emails
        const emails = await prisma.approvedEmail.findMany({
            select: {
                email: true,
            },
        });

        return NextResponse.json({ emails: emails.map(e => e.email) }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching approved emails:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Check if the email already exists
        const existingEmail = await prisma.approvedEmail.findUnique({ where: { email } });

        if (existingEmail) {
            return NextResponse.json({ error: "Email already exists" }, { status: 409 });
        }

        // Create the approved email
        const newEmail = await prisma.approvedEmail.create({
            data: { email },
        });

        return NextResponse.json({ ok: true, message: "Email added successfully", email: newEmail.email }, { status: 201 });
    } catch (error) {
        console.error("Error adding email:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        const existing = await prisma.approvedEmail.findUnique({
            where: { email: normalizedEmail },
        })

        if (!existing) {
            return NextResponse.json({ error: "Email not found" }, { status: 404 })
        }

        await prisma.approvedEmail.delete({
            where: { email: normalizedEmail },
        })

        return NextResponse.json({ success: true, message: "Email removed" }, { status: 200 })
    } catch (error) {
        console.error("Error removing email:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}


