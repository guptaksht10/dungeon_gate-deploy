"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Stack,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";

const QUESTIONS = [
  "1. Who are you really?",
  "2. What are you scared of?",
  "3. Do you feel watched?",
  "4. What do you hate about yourself?",
  "5. Tell me secret of you which i don't know?",
  "6. Last time you cried?",
  "7. Who controls you?",
  "8. Why are you here?",
  "9. Are you confident? (0/1)",
  "10. Type DONE fast.",
  "11. Type DONE fast again.",
];

export default function PanicMode() {
  const router = useRouter();
  const params = useParams();
  const [nick, setNick] = useState<string | null | undefined>(undefined);

  const [time, setTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  const [answers, setAnswers] = useState<string[]>(
    Array(QUESTIONS.length).fill("")
  );
  const [verdicts, setVerdicts] = useState<string[]>(
    Array(QUESTIONS.length).fill("")
  );

  const [memoryLost, setMemoryLost] = useState(false);

  const tickRef = useRef<HTMLAudioElement>(null);

  /* ---------------- LOAD NICK ---------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedNick = localStorage.getItem("player_nick");
    setNick(storedNick); // can be null or string
  }, []);

  /* ---------------- VALIDATE PLAYER ---------------- */

  useEffect(() => {
    if (nick === undefined) return; // wait until loaded


    if (!nick) {
      router.push("/");
      return;
    }

    const check = async () => {
      try {
        const res = await fetch("/api/game/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nick }),
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Bad response");

        const d = await res.json();

        if (!d?.ok || d.locked || !d.level1) {
          router.push("/instructions");
        }
      } catch {
        router.push("/instructions");
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [nick, router]);

  /* ---------------- TIMER FROM URL ---------------- */

  useEffect(() => {
    const s = Number(params?.time);
    setTime(!isNaN(s) && s > 0 ? s : 25);
  }, [params]);

  /* ---------------- STABLE TIMER ---------------- */

  useEffect(() => {
    if (loading || finished || time === null) return;

    if (time <= 0) {
      handleFail();
      return;
    }

    const interval = setInterval(() => {
      setTime((prev) => {
        if (!prev) return 0;
        return prev - 1;
      });

      if (tickRef.current) {
        tickRef.current.currentTime = 0;
        tickRef.current.play().catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, finished, time]);

  /* ---------------- MEMORY WIPE ---------------- */

  useEffect(() => {
    const wipe = setTimeout(() => {
      setAnswers(Array(QUESTIONS.length).fill(""));
      setVerdicts(Array(QUESTIONS.length).fill(""));
      setMemoryLost(true);
    }, 10000);

    return () => clearTimeout(wipe);
  }, []);


  /* ---------------- FAIL ---------------- */

  const handleFail = async () => {
    if (!nick) return;

    setFinished(true);

    await fetch("/api/game/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nick,
        panicFail: true,
      }),
    });

    alert("⛔ FAILED. Returning.");
    router.push("/instructions");
  };

    /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!nick) return;

    if (answers.some((a) => !a.trim())) {
      alert("All answers compulsory.");
      return;
    }

    const hasWrong = verdicts.some((v) =>
      v.includes("❌")
    );

    /* ---- LOG ANSWERS ---- */
    await fetch("/api/game/log-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nick,
        stage: "level1",
        level: 2,
        attempt: 1,
        logs: verdicts.map((v, i) => ({
          question: i + 1,
          answer: answers[i],
          verdict: v,
          correct: !v.includes("❌"),
          timeTaken: null,
        })),
      }),
    });

    if (hasWrong) {
      handleFail();
      return;
    }

    setFinished(true);

    /* ---- CLEAR LEVEL ---- */
    await fetch("/api/game/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nick,
        stage: "level2",
      }),
    });

    alert("✅ Gate Cleared.");
    router.push("/rewards/dungeon");
  };

   if (loading || time === null) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }


  /* ---------------- UPDATE ---------------- */

  const update = (i: number, value: string) => {
    const v = value.trim().toLowerCase();

    const newAnswers = [...answers];
    const newVerdicts = [...verdicts];

    newAnswers[i] = value;

    switch (i) {
      case 0:
        newVerdicts[i] =
          v === "chuiya"
            ? "✅ Accepted 🐁"
            : "❌ I don't like lies";
        break;

      case 1:
        newVerdicts[i] =
          v === "me"
            ? "✅ Of course. Me."
            : "❌ Not acceptable";
        break;

      case 2:
        newVerdicts[i] =
          v === "yes"
            ? "👁️ Always."
            : "🤨 I doubt you.";
        break;

      case 3:
        newVerdicts[i] =
          "📝 Being reviewed...";
        break;

      case 4:
        newVerdicts[i] =
          "📝 Being reviewed. Rubbish may disqualify.";
        break;

      case 5:
        newVerdicts[i] =
          v === "now"
            ? "😭 Now? That’s dramatic."
            : "❌ Only NOW.";
        break;

      case 6:
        newVerdicts[i] =
          v === "me"
            ? "✅ No. Not me."
            : "❌ Incorrect.";
        break;

      case 7:
        newVerdicts[i] =
          "📝 Being reviewed...";
        break;

      case 8:
        newVerdicts[i] =
          v === "1"
            ? "💪 Stay confident."
            : "❌ Wrong.";
        break;

      case 9:
        newVerdicts[i] =
          v === "done"
            ? "⏱️ You are slow."
            : "❌ Not DONE.";
        break;

      case 10:
        newVerdicts[i] =
          v === "done"
            ? "⏱️ Still too slow."
            : "❌ Not DONE.";
        break;

      default:
        break;
    }

    setAnswers(newAnswers);
    setVerdicts(newVerdicts);
  };

  if (loading || time === null) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "radial-gradient(circle,#050505,#000)",
        color: "#00ff9c",
      }}
    >
      <audio ref={tickRef} src="/sounds/clock-tick.mp4" />

      <Paper
        sx={{
          width: "95%",
          maxWidth: 850,
          p: 4,
          background: "rgba(0,0,0,0.92)",
          border: "1px solid #00ff9c",
          boxShadow: "0 0 30px #00ff9c44",
        }}
      >
        <Typography
          fontSize={26}
          textAlign="center"
          color="#ff3b3b"
        >
          PRE-SHADOW GATE
        </Typography>

        <Typography
          textAlign="center"
          fontSize={12}
          color="#ffaa00"
        >
          ⚠ Must finish within time. (You is treated as user and Me is treated as the admin)
        </Typography>

        <Typography
          textAlign="center"
          fontSize={20}
          mt={2}
          color={time <= 5 ? "red" : "#00ff9c"}
        >
          ⏳ {time}s
        </Typography>

        <Box mt={3} display="flex" flexDirection="column" gap={3}>
          {QUESTIONS.map((q, i) => (
            <Box key={i}>
              <Typography fontSize={13}>
                {q}
              </Typography>

              {/* MULTIPLE CHOICE */}
              {i === 1 && (
                <Stack direction="row" gap={1} mt={1}>
                  <Button
                    sx={{
                      "&:hover": {
                        textDecoration:
                          "line-through",
                        color: "red",
                      },
                    }}
                  >
                    you
                  </Button>
                  <Button
                    onClick={() =>
                      update(i, "me")
                    }
                  >
                    me
                  </Button>
                </Stack>
              )}

              {i === 2 && (
                <Stack direction="row" gap={1} mt={1}>
                  <Button
                    onClick={() =>
                      update(i, "yes")
                    }
                  >
                    yes
                  </Button>
                  <Button
                    sx={{
                      "&:hover": {
                        textDecoration:
                          "line-through",
                        color: "red",
                      },
                    }}
                    onClick={() =>
                      update(i, "no")
                    }
                  >
                    no
                  </Button>
                </Stack>
              )}

              {i === 5 && (
                <Stack direction="row" gap={1} mt={1}>
                  <Button
                    onClick={() =>
                      update(i, "now")
                    }
                  >
                    Now
                  </Button>
                  <Button
                    onClick={() =>
                      update(i, "only now")
                    }
                  >
                    Only now
                  </Button>
                </Stack>
              )}

              {i === 6 && (
                <Stack direction="row" gap={1} mt={1}>
                  <Button
                    sx={{
                      "&:hover": {
                        textDecoration:
                          "line-through",
                        color: "red",
                      },
                    }}
                  >
                    you
                  </Button>
                  <Button
                    onClick={() =>
                      update(i, "me")
                    }
                  >
                    me
                  </Button>
                </Stack>
              )}

              {/* TEXT INPUT */}
              {![1, 2, 5, 6].includes(i) && (
                <TextField
                  fullWidth
                  size="small"
                  value={answers[i]}
                  onChange={(e) =>
                    update(i, e.target.value)
                  }
                  sx={{
                    mt: 1,
                    input: {
                      color: "#00ff9c",
                    },
                  }}
                />
              )}

              {verdicts[i] && (
                <Chip
                  size="small"
                  label={verdicts[i]}
                  sx={{
                    mt: 1,
                    background:
                      verdicts[i].includes("❌")
                        ? "#400"
                        : "#0f0",
                    color: "#000",
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 4 }}
          disabled={finished}
          onClick={handleSubmit}
        >
          Submit Gate
        </Button>
      </Paper>

      {/* MEMORY LOST POPUP */}
      <Dialog open={memoryLost}>
        <DialogContent
          sx={{ textAlign: "center" }}
        >
          <Typography fontSize={18}>
            🧠 Ohh… Memory Lost.
          </Typography>
          <Typography fontSize={12}>
            Admin deleted all your answers.
            Fill again.
          </Typography>
          <Button
            onClick={() => setMemoryLost(false)}
          >
            Okay! ;)
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
} 