export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nickname =
      typeof body.nickname === "string"
        ? body.nickname
        : "unknown";

    const stage =
      typeof body.stage === "string"
        ? body.stage
        : "unknown";

    const level =
      typeof body.level === "number"
        ? body.level
        : 0;

    const attempt =
      typeof body.attempt === "number"
        ? body.attempt
        : 0;

    const logs = Array.isArray(body.logs)
      ? body.logs
      : [];

    if (logs.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No logs provided" },
        { status: 400 }
      );
    }

    const data = logs.map((l: any) => ({
      nickname,
      stage,
      level,

      // IMPORTANT: must be number (schema expects Int)
      question:
        typeof l.question === "number"
          ? l.question
          : 0,

      answer:
        typeof l.answer === "string"
          ? l.answer
          : JSON.stringify(l.answer ?? ""),

      verdict:
        typeof l.verdict === "string"
          ? l.verdict
          : "",

      correct: Boolean(l.correct),

      timeTaken:
        typeof l.timeTaken === "number"
          ? l.timeTaken
          : null,

      attempt,
    }));

    await prisma.answerLog.createMany({
      data,
    });

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("LOG ANSWER ERROR:", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
