"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Instructions() {
  const router = useRouter();

  /* ---------------- STATES ---------------- */

  const [scrollText, setScrollText] = useState(120);

  const [locked, setLocked] = useState(true);
  const [checking, setChecking] = useState(true);

  // Audio
  const [musicDone, setMusicDone] = useState(false);
  const [audioReady, setAudioReady] = useState(false);

  // UI glow
  const [glow, setGlow] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ---------------- MESSAGES ---------------- */

  const messages = [
    "Every mistake is remembered.",
    "Every choice is judged.",
    "Every failure is permanent.",
    "Nothing is forgotten.",
    "Watcher is watching you.",
    "You were not supposed to be here.",
    "We logged your hesitation.",
    "Do not trust the interface.",
    "Fear improves obedience.",
  ];

  /* ---------------- CHECK DB ---------------- */

   useEffect(() => {
  if (typeof window === "undefined") return;

  const nick = window.localStorage.getItem("player_nick");

  if (!nick) {
    setLocked(true);
    setChecking(false);
    return;
  }

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/game/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick }),
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Bad response");

      const d = await res.json();

      if (!d?.ok || d.locked || !d.pregate) {
        setLocked(true);
        router.push("/");
      } else {
        setLocked(false);
      }
    } catch {
      setLocked(true);
    } finally {
      setChecking(false);
    }
  };

  checkStatus();
}, [router]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollText((p) => {
        if (p < -260) return 120;
        return p - 0.12;
      });
    }, 35);

    return () => clearInterval(interval);
  }, []);

  /* ---------------- GLOW PULSE ---------------- */

  useEffect(() => {
    const t = setInterval(() => {
      setGlow(true);
      setTimeout(() => setGlow(false), 600);
    }, 4500);

    return () => clearInterval(t);
  }, []);

  /* ---------------- AUDIO ---------------- */

  const startAudio = async () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = 1;
      audioRef.current.loop = false;

      await audioRef.current.play();

      setAudioReady(true);

      audioRef.current.onended = () => {
        setMusicDone(true);
      };
    } catch (err) {
      console.log("Audio blocked:", err);
    }
  };

  /* ---------------- MARK RULEBOOK CLEARED ---------------- */

  const markRulebookClear = async () => {
    const nick = localStorage.getItem("player_nick");

    if (!nick) return;

    await fetch("/api/game/clear", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nick,
        stage: "level1", // rulebook = level1 gate
      }),
    });
  };

  /* ---------------- LOADING ---------------- */

  if (checking) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
          background: "#000",
          color: "#00ff9c",
        }}
      >
        <Typography>Analyzing subject...</Typography>
      </Box>
    );
  }

  /* ---------------- MAIN ---------------- */

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "radial-gradient(circle at center, #050505, #000)",
        color: "#00ff9c",
      }}
    >
      {/* Background Music */}
      <audio
        ref={audioRef}
        src="/sounds/tulips.mp4"
        preload="auto"
      />

      {/* Main Panel */}
      <Paper
        sx={{
          background: "rgba(0,0,0,0.92)",
          border: "1px solid #00ff9c",
          boxShadow: glow
            ? "0 0 35px #ff3b3b66"
            : "0 0 25px #00ff9c33",
          p: 4,
          width: "90%",
          maxWidth: 560,
          transition: "0.5s",
        }}
      >
        {/* Title */}
        <Typography
          fontSize={18}
          mb={2}
          sx={{
            color: "#ff4f4f",
            textAlign: "center",
            letterSpacing: 1,
          }}
        >
          📜 RULES OF THE WORLD
        </Typography>

        {/* Scroll Terminal */}
        <Box
          sx={{
            position: "relative",
            height: 130,
            overflow: "hidden",
            border: "1px solid #222",
            mb: 3,
            p: 1,
            background: "linear-gradient(#010101, #030303)",
            boxShadow: "inset 0 0 15px #000",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: scrollText,
              width: "100%",
              textAlign: "center",
              opacity: 0.7,
            }}
          >
            {messages.map((t, i) => (
              <Typography
                key={i}
                fontSize={15}
                sx={{
                  color: "#ff3b3b",
                  textShadow: "0 0 8px #ff3b3b",
                  mb: 1,
                }}
              >
                {t}
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Rules */}
        <Typography fontSize={13} lineHeight={1.7} mb={2}>
          🕳️ Five shadows await you.
          <br />
          None reveal themselves willingly.
          <br />
          Sounds hide signals. Listen carefully.
          <br />
          <br />
          ❤️ Three fragile hearts.
          <br />
          Lose them… and you disappear.
          <br />
          Every wrong answer steals a heartbeat. <br />
          <br />
          ☠️ No hearts left… the world seals forever.
          <br />
          <br />
          👁️ Hints are whispers from the dark.
          <br />
          <br />
          🔐 When a world is sealed, it stays sealed. <br /> Only I decide when it opens again.
          <br /> Convince me. Beg. Prove. <br /> <br />
          ⏳ Play slowly. DON'T TRUST. I am watching. <br /> ⭐ A pre-ticket awaits beyond this gate.
          (You refers to the player, me refers to the admin throughout the game.)
        </Typography>

        {/* Audio Button */}
        {!audioReady && (
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 2,
              borderColor: "#ffaa00",
              color: "#ffaa00",

              "&:hover": {
                borderColor: "#ff3b3b",
                color: "#ff3b3b",
              },
            }}
            onClick={startAudio}
          >
            ▶ Initialize Audio Protocol
          </Button>
        )}

        {/* Audio Status */}
        {audioReady && !musicDone && (
          <Typography
            mb={2}
            fontSize={12}
            sx={{
              color: "#ffaa00",
              textAlign: "center",
              letterSpacing: 0.5,
            }}
          >
            🎧 Signal detected...
            <br />
            Do not interrupt.
          </Typography>
        )}

        {/* Lock Warning */}
        {locked && (
          <Typography mb={2} fontSize={12} color="#ff4f4f">
            ⚠ ACCESS DENIED
            <br />
            Previous trial incomplete.
          </Typography>
        )}

        {/* Enter Button */}
        <Button
          fullWidth
          variant="outlined"
          disabled={locked || !musicDone}
          sx={{
            mt: 2,
            borderColor:
              locked || !musicDone ? "#333" : "#00ff9c",
            color:
              locked || !musicDone ? "#333" : "#00ff9c",

            "&:hover": {
              borderColor: "#ff3b3b",
              color: "#ff3b3b",
            },
          }}
          onClick={async () => {
            await markRulebookClear(); // <-- NEW
            router.push("/level_gate/panic_mode/20");
          }}
        >
          {!audioReady
            ? "Initialize System"
            : !musicDone
            ? "Listen complete to move ahead."
            : locked
            ? "World Locked 🔒"
            : "Enter"}
        </Button>
      </Paper>
    </Box>
  );
}
