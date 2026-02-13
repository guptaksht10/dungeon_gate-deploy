export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      nickname,
      stage,
      level,
      logs,
      attempt,
    } = await req.json();

    /* ---------- BASIC VALIDATION ---------- */

    if (
      !nickname ||
      !stage ||
      !Array.isArray(logs) ||
      logs.length === 0
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    /* ---------- PLAYER CHECK ---------- */

    const player = await prisma.player.findUnique({
      where: { nickname },
    });

    if (!player) {
      return NextResponse.json(
        { ok: false, error: "Player not found" },
        { status: 404 }
      );
    }

    /* ---------- STAGE PERMISSION ---------- */

    const allowedStage =
      stage === "pregate" ||
      (stage === "level1" && player.pregateClear) ||
      (stage === "level2" && player.level1Clear) ||
      (stage === "level3" && player.level2Clear) ||
      (stage === "level4" && player.level3Clear) ||
      (stage === "level5" && player.level4Clear);

    if (!allowedStage) {
      return NextResponse.json(
        { ok: false, error: "Stage not unlocked" },
        { status: 403 }
      );
    }

    /* ---------- ATTEMPT SYNC ---------- */

    const safeAttempt =
      typeof attempt === "number"
        ? attempt
        : player.attempts;

    /* ---------- SANITIZE LOGS ---------- */

    const data = logs.map((l: any) => ({
      nickname,
      stage,
      level: Number(level) || 0,
      question: Number(l.question) || 0,
      answer: String(l.answer || ""),
      verdict: String(l.verdict || ""),
      correct: Boolean(l.correct),
      timeTaken:
        typeof l.timeTaken === "number"
          ? l.timeTaken
          : null,
      attempt: safeAttempt,
    }));

    /* ---------- SAVE ---------- */

    await prisma.answerLog.createMany({
      data,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("LOG ANSWER ERROR:", err);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
