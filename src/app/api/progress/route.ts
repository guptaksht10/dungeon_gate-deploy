export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    /* ---------------- GLOBAL LOCK ---------------- */

    const global = await prisma.globalLock.findFirst({
      select: {
        locked: true,
        reason: true,
      },
    });

    if (global?.locked) {
      return NextResponse.json({
        ok: false,
        locked: true,
        reason: global.reason,
      });
    }

    /* ---------------- LATEST PLAYER ---------------- */

    const player = await prisma.player.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        level: true,
        hearts: true,
        locked: true,
        nickname: true,
      },
    });

    if (!player) {
      return NextResponse.json({
        ok: false,
        level: 0,
        hearts: 0,
        locked: false,
      });
    }

    return NextResponse.json({
      ok: true,
      level: player.level,
      hearts: player.hearts,
      locked: player.locked,
      nickname: player.nickname,
    });

  } catch (err) {
    console.error("Progress API Error:", err);

    return NextResponse.json(
      {
        ok: false,
        level: 0,
        hearts: 0,
        locked: false,
      },
      { status: 500 }
    );
  }
}
