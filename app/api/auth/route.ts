import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // ✅ Update lastLogin timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        return NextResponse.json(
            {
                message: "Login successful",
                userId: user.id,
                email: user.email,
            },
            { status: 200 }
        );
    } catch (error) {

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
