export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { nick, panicFail } = await req.json();

    if (!nick || !nick.trim()) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { nickname: nick },
    });

    if (!player) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const updated = await prisma.player.update({
      where: { nickname: nick },
      data: {
        attempts: {
          increment: 1,
        },
        ...(panicFail && {
          panicFails: { increment: 1 },
        }),
      },
    });

    return NextResponse.json({
      ok: true,
      attempts: updated.attempts,
    });
  } catch (err) {
    console.error("ATTEMPT ERROR:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
