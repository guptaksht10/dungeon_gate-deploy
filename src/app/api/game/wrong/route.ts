export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nick } = await req.json();

    if (!nick || !nick.trim()) {
      return NextResponse.json(
        { success: false },
        { status: 400 }
      );
    }

    const cleanNick = nick.toLowerCase().trim();

    const player = await prisma.player.findUnique({
      where: { nickname: cleanNick },
      select: {
        hearts: true,
        locked: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false },
        { status: 404 }
      );
    }

    if (player.locked) {
      return NextResponse.json({
        success: true,
        hearts: player.hearts,
        locked: true,
      });
    }

    /* ---------- ATOMIC UPDATE ---------- */

    const updated = await prisma.player.update({
      where: { nickname: cleanNick },
      data: {
        hearts: {
          decrement: 1,
        },
      },
    });

    const shouldLock = updated.hearts <= 0;

    if (shouldLock && !updated.locked) {
      await prisma.player.update({
        where: { nickname: cleanNick },
        data: { locked: true },
      });
    }

    return NextResponse.json({
      success: true,
      hearts: updated.hearts,
      locked: shouldLock,
    });

  } catch (err) {
    console.error("WRONG ANSWER ERROR:", err);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
