export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nick, stage } = await req.json();

    if (!nick) {
      return NextResponse.json(
        { ok: false, error: "Nickname required" },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: { nickname: nick },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Player not found" },
        { status: 404 }
      );
    }

    const data: Partial<typeof player> = {};

    /* ---------- LOGIN → PRE-GATE ---------- */

    if (!stage || stage === "pregate") {
      data.pregateClear = true;
      data.level = Math.max(player.level, 1);
    }

    /* ---------- LEVEL FLOW (NO SKIPS) ---------- */

    else if (stage === "level1" && player.pregateClear) {
      data.level1Clear = true;
      data.level = 2;
    }

    else if (stage === "level2" && player.level1Clear) {
      data.level2Clear = true;
      data.level = 3;
    }

    else if (stage === "level3" && player.level2Clear) {
      data.level3Clear = true;
      data.level = 4;
    }

    else if (stage === "level4" && player.level3Clear) {
      data.level4Clear = true;
      data.level = 5;
    }

    else if (stage === "level5" && player.level4Clear) {
      data.level5Clear = true;
      data.level = 6;
    }

    else {
      return NextResponse.json(
        { ok: false, error: "Invalid progression" },
        { status: 403 }
      );
    }

    await prisma.player.update({
      where: { nickname: nick },
      data,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("CLEAR ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
