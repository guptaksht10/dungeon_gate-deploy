export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const global = await prisma.globalLock.findFirst({
      select: {
        locked: true,
        reason: true,
      },
    });

    if (!global) {
      return NextResponse.json({
        locked: false,
        reason: null,
      });
    }

    return NextResponse.json({
      locked: global.locked,
      reason: global.reason,
    });

  } catch (err) {
    console.error("LOCK STATUS ERROR:", err);

    return NextResponse.json(
      { locked: false, reason: null },
      { status: 500 }
    );
  }
}
