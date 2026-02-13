export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nick } = await req.json();

    const cleanNick = nick?.toLowerCase().trim();
    const secret = process.env.SECRET_NICKNAME
      ?.toLowerCase()
      .trim();

    if (!cleanNick || !secret) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    if (cleanNick !== secret) {
      return NextResponse.json(
        { success: false },
        { status: 403 }
      );
    }

    /* ---------- UPSERT PLAYER ---------- */

    const player = await prisma.player.upsert({
      where: { nickname: cleanNick },
      update: {},
      create: { nickname: cleanNick },
      select: {
        level: true,
        hearts: true,
        locked: true,
      },
    });

    if (player.locked) {
      return NextResponse.json({
        success: false,
        locked: true,
      });
    }

    return NextResponse.json({
      success: true,
      level: player.level,
      hearts: player.hearts,
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
