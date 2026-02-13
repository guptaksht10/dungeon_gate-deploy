export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nick } = await req.json();

    if (!nick) {
      return NextResponse.json(
        { ok: false, error: "Nickname required" },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { nickname: nick },
      select: {
        pregateClear: true,
        level1Clear: true,
        level2Clear: true,
        level3Clear: true,
        level4Clear: true,
        level5Clear: true,
        attempts: true,
        panicFails: true,
        memoryWiped: true,
        flagged: true,
      },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      pregate: player.pregateClear,
      level1: player.level1Clear,
      level2: player.level2Clear,
      level3: player.level3Clear,
      level4: player.level4Clear,
      level5: player.level5Clear,
      attempts: player.attempts,
      panicFails: player.panicFails,
      memoryWiped: player.memoryWiped,
      flagged: player.flagged,
    });

  } catch (err) {
    console.error("STATUS ERROR:", err);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
