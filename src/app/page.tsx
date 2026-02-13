"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogContent,
  Stack,
} from "@mui/material";
import { useRouter } from "next/navigation";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useSFX } from "@/components/SFXPlayer";

export default function Login() {
  const [nick, setNick] = useState("");
  const [error, setError] = useState("");

  const sfx = useSFX();
  const router = useRouter();

  // Fake button movement
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Game states
  const [tries, setTries] = useState(0);
  const [brokenHearts, setBrokenHearts] = useState(0);
  const [lastWrong, setLastWrong] = useState("");
  const [realLogin, setRealLogin] = useState(false);

  // Hints
  const [showHints, setShowHints] = useState(false);
  const [activeHint, setActiveHint] = useState<number | null>(null);

  // Fake success
  const [fakeSuccess, setFakeSuccess] = useState(false);
  const [fakeUsed, setFakeUsed] = useState(false);

  // Fake loading
  const [fakeLoading, setFakeLoading] = useState(false);

  /* ---------------- MOVE FAKE BUTTON ---------------- */

  const moveButton = () => {
    const x = Math.random() * 260 - 130;
    const y = Math.random() * 140 - 70;
    setPos({ x, y });
  };

  /* ---------------- FAKE BUTTON CLICK ---------------- */

  const fakeSubmit = async () => {
    setFakeLoading(true);

    try {
      const nickLocal =
        typeof window !== "undefined"
          ? localStorage.getItem("player_nick") || "unknown"
          : "unknown";

      await fetch("/api/game/log-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickLocal,
          stage: "login-fake",
          level: 0,
          attempt: tries + 1,
          logs: [
            {
              question: "Fake Button",
              answer: nick || "empty",
              verdict: "Bait Triggered",
              correct: false,
              timeTaken: null,
            },
          ],
        }),
      });
    } catch (err) {
      console.error("Fake log failed:", err);
    }

    setTries((prev) => {
      const next = prev + 1;

      if (next === 2 && !fakeUsed) {
        setFakeSuccess(true);
        setFakeUsed(true);
        return next;
      }

      if (next > 2) {
        setBrokenHearts((p) => Math.min(p + 1, 10));
      }

      return next;
    });

    setTimeout(() => {
      setFakeLoading(false);
    }, 400);
  };

  /* ---------------- REAL LOGIN ---------------- */

  const realSubmit = async () => {
    setRealLogin(true);

    if (!nick.trim()) {
      setError("Enter something first 😐");
      setRealLogin(false);
      return;
    }

    const cleanNick = nick.toLowerCase().trim();

    try {
      // Log final attempt
      await fetch("/api/game/log-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: cleanNick,
          stage: "login",
          level: 0,
          attempt: tries + 1,
          logs: [
            {
              question: "login",
              answer: nick,
              verdict: "Final Input",
              correct: true,
              timeTaken: null,
            },
          ],
        }),
      });

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: cleanNick }),
      });

      if (!res.ok) {
        throw new Error("Bad response");
      }

      const data = await res.json();

      if (!data.success) {
        setError("Wrong Key 💔");
        setLastWrong(nick);
        setBrokenHearts((p) => Math.min(p + 1, 10));
        setRealLogin(false);
        return;
      }

      // Save player
      localStorage.setItem("player_nick", cleanNick);

      // Clear pre-gate
      await fetch("/api/game/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nick: cleanNick,
          stage: "pregate",
        }),
      });

      sfx.play("/sounds/win.mp4");

      router.push("/instructions");
    } catch (err) {
      console.error(err);
      setError("Server error ⚠️");
      setRealLogin(false);
    }
  };

  /* ---------------- HINT TEXT ---------------- */

  const getHintText = () => {
    if (activeHint === 1)
      return "Not everything that moves is meant to be clicked.";
    if (activeHint === 2)
      return "Some doors exist… but hide in plain sight.";
    if (activeHint === 3)
      return "Inspect what you cannot touch. (find id -> real-login-btn)";
    if (activeHint === 4)
      return "nickname -> very very ____ (adiyal)";
    return "";
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="relative"
    >
      {/* Hint Toggle */}
      <IconButton
        sx={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => setShowHints(!showHints)}
      >
        <HelpOutlineIcon />
      </IconButton>

      {/* Hint Panel */}
      {showHints && (
        <Paper
          sx={{
            position: "absolute",
            top: 60,
            right: 20,
            p: 2,
            width: 300,
            fontSize: 11,
          }}
        >
          <Typography fontSize={12} mb={1}>
            💡 HINTS
          </Typography>

          <Stack direction="row" spacing={1}>
            {[1, 2, 3, 4].map((n) => (
              <Button
                key={n}
                size="small"
                variant="outlined"
                onClick={() => setActiveHint(n)}
              >
                Hint {n}
              </Button>
            ))}
          </Stack>

          {activeHint && (
            <Typography fontSize={11} mt={2} sx={{ opacity: 0.8 }}>
              💭 {getHintText()}
            </Typography>
          )}
        </Paper>
      )}

      {/* Login Box */}
      <Paper sx={{ p: 4, width: 420, textAlign: "center" }}>
        <Typography fontSize={18}>🖤 SECRET GAME 🖤</Typography>

        <TextField
          fullWidth
          sx={{ mt: 3 }}
          label="Secret Name"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
        />

        {error && <Typography color="error">{error}</Typography>}

        {lastWrong && (
          <Typography fontSize={10} mt={1} color="warning.main">
            Last try: "{lastWrong}"
          </Typography>
        )}

        {/* Button Arena */}
       <Box sx={{ position: "relative", height: 90, mt: 3 }}>
          {/* Fake Button */}
          <Button
            variant="contained"
            onMouseEnter={moveButton}
            onClick={fakeSubmit}
            disabled={fakeLoading}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
              transition: "all 0.15s ease",
            }}
          >
            {fakeLoading ? "Logging..." : "Catch Me 😈"}
          </Button>

          <Button id="real-login-btn" variant="contained" onClick={realSubmit} className="CHANGE OPACITY TO (1) && POINTER EVENTS TO (auto) opacity-0 pointer-events-none" sx={{ position: "absolute", bottom: 4, right: 4, filter: "blur(4px)", "&:hover": { opacity: 1, filter: "blur(0)", }, }} > {realLogin ? "Checking..." : "Enter 🚪"}</Button>
        </Box>

        <Typography fontSize={10} mt={1} sx={{ opacity: 0.7 }}>
          Attempts: {tries}
        </Typography>

        {brokenHearts > 0 && (
          <Typography fontSize={10} color="error">
            Wrong answer: {"💔".repeat(brokenHearts)}
          </Typography>
        )}
      </Paper>

      {/* Fake Success Dialog */}
      <Dialog open={fakeSuccess} onClose={() => setFakeSuccess(false)}>
        <DialogContent sx={{ textAlign: "center", p: 4 }}>
          <Typography fontSize={18}>✅ Access Granted 🐁</Typography>

          <Typography fontSize={12} mt={1}>
            LOL easy 😌✨
          </Typography>

          <Typography fontSize={12} mt={1}>
            You are actually smart 😍
          </Typography>

          <Typography fontSize={12} mt={1}>
            WHY IS THIS FAKE 😭💀
          </Typography>

          <Typography fontSize={10} mt={2} sx={{ opacity: 0.6 }}>
            Just kidding 😈, Retry the level !!
          </Typography>

          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={() => setFakeSuccess(false)}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </Box>

  );
}
