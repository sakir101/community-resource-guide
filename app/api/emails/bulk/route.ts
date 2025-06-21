import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { emails } = body

        if (!emails || !Array.isArray(emails)) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 })
        }

        const result = {
            added: [] as string[],
            invalid: [] as string[],
            duplicates: [] as string[],
        }

        const normalized = emails.map((e: string) => e.trim().toLowerCase())
        const valid: string[] = []
        const seen = new Set<string>()

        for (const email of normalized) {
            if (!/\S+@\S+\.\S+/.test(email)) {
                result.invalid.push(email)
                continue
            }

            if (seen.has(email)) {
                result.duplicates.push(email)
                continue
            }

            seen.add(email)
            valid.push(email)
        }

        const existing = await prisma.approvedEmail.findMany({
            where: { email: { in: valid } },
            select: { email: true },
        })

        const existingSet = new Set(existing.map((e) => e.email))
        const newEmails = valid.filter((e) => !existingSet.has(e))

        if (newEmails.length > 0) {
            await prisma.approvedEmail.createMany({
                data: newEmails.map((e) => ({ email: e })),
                skipDuplicates: true,
            })
            result.added = newEmails
        }

        result.duplicates.push(...existing.map(e => e.email))

        return NextResponse.json({ success: true, ...result }, { status: 200 })
    } catch (error) {
        console.error("Bulk email upload error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
