import prisma from "@/db";
import { NextResponse } from "next/server";
import { saltAndHashPassword } from '@/utils/salt-and-hash-password'

export async function POST(req: Request) {
    const body = await req.json();
    const hashedPassword = saltAndHashPassword(body.password)

    const user = await prisma.user.create({
        data: {
            email: body.email,
            password: hashedPassword
        }
    });

    if (!user) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return NextResponse.json({ message: 'success' }, { status: 200 });
}