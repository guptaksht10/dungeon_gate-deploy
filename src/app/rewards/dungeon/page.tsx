"use client";

import {
  Box,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSFX } from "@/components/SFXPlayer";

export default function ShadowRewardPage() {
  const sfx = useSFX();
  const router = useRouter();

  const [glow, setGlow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [cheated, setCheated] = useState(false);
  const [nick, setNick] = useState<string | null>(null);

  /* ---------------- LOAD NICK SAFELY ---------------- */

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNick(localStorage.getItem("player_nick"));
  }, []);

  /* ---------------- ACCESS CHECK ---------------- */

  useEffect(() => {
    if (nick === null) return;

    if (!nick) {
      setCheated(true);
      setLoading(false);
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

        if (!d?.ok || d.locked || !d.level2) {
          setCheated(true);
          return;
        }

        setAuthorized(true);
      } catch {
        setCheated(true);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [nick]);

  /* ---------------- GLOW PULSE (SAFE) ---------------- */

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const pulse = setInterval(() => {
      setGlow(true);
      timeout = setTimeout(() => setGlow(false), 800);
    }, 4000);

    return () => {
      clearInterval(pulse);
      if (timeout) clearTimeout(timeout);
    };
  }, []);
  
   /* ---------------- PLAY LOCK SOUND ON FIRST INTERACTION ---------------- */

useEffect(() => {
  const handleFirstInteraction = () => {
    sfx.play("/sounds/global-lock.mp3");

    window.removeEventListener("click", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
  };

  window.addEventListener("click", handleFirstInteraction);
  window.addEventListener("keydown", handleFirstInteraction);

  return () => {
    window.removeEventListener("click", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
  };
}, [sfx]);


  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          background: "#000",
          color: "#00ff9c",
        }}
      >
        <Typography>
          Verifying Dungeon Completion...
        </Typography>
      </Box>
    );
  }

  /* =======================================================
     🚨 CHEAT DETECTED SCREEN
  ======================================================= */

  if (cheated) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          background: "#000",
          color: "#ff3b3b",
        }}
      >
        <Paper
          sx={{
            p: 5,
            maxWidth: 600,
            textAlign: "center",
            background: "#100000",
            border: "1px solid #ff3b3b",
            boxShadow: "0 0 40px #ff000055",
          }}
        >
          <Typography fontSize={24} mb={2}>
            🚨 Unauthorized Access Detected
          </Typography>

          <Typography fontSize={14} lineHeight={1.8}>
            You attempted to access the Shadow Rewards
            without completing the required trials.
            <br />
            <br />
            The Admin is not amused.
            <br />
            The Admin logs impatience.
            <br />
            The Admin remembers shortcuts.
            <br />
            <br />
            Return to your dungeon.
          </Typography>

          <Divider sx={{ my: 3, borderColor: "#ff3b3b44" }} />

          <Typography fontSize={12} color="#888">
            This window will not grant what you have not earned.
          </Typography>
        </Paper>
      </Box>
    );
  }

  /* =======================================================
     🏆 PERMIT PAGE
  ======================================================= */

  return (
    <Box
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "radial-gradient(circle at center,#040404,#000)",
        color: "#00ff9c",
        p: 3,
      }}
    >
      <Paper
        sx={{
          width: "95%",
          maxWidth: 850,
          p: 5,
          background: "rgba(0,0,0,0.94)",
          border: "1px solid #00ff9c",
          boxShadow: glow
            ? "0 0 40px #00ff9c88"
            : "0 0 25px #00ff9c33",
          transition: "0.6s",
        }}
      >
        {/* Title */}
        <Typography
          fontSize={28}
          textAlign="center"
          color="#ff3b3b"
          mb={1}
        >
          SHADOW DUNGEON COMPLETION PERMIT
        </Typography>

        <Typography
          textAlign="center"
          fontSize={13}
          color="#ffaa00"
          mb={3}
        >
          Issued Under Authority of The Admin
        </Typography>

        <Divider sx={{ mb: 3, borderColor: "#00ff9c44" }} />

        {/* Body */}
        <Typography fontSize={14} lineHeight={1.8} mb={3}>
          This document certifies that you have successfully
          endured the psychological trials of the Shadow
          Dungeon.
          <br />
          <br />
          You have faced fear, deception, manipulation,
          memory erasure, and controlled chaos — and yet
          you persisted.
          <br />
          <br />
          As of this moment, you are hereby declared
          <b> Eligible </b>
          for the
          <span style={{ color: "#ff3b3b" }}>
            {" "}
            Double Dungeon Gate to the Shadow Realm
          </span>
          — scheduled to manifest next year.
          <br />
          <br />
          This permit must be kept safe.
          <br />
          Not digitally.
          <br />
          Not casually.
          <br />
          But psychologically.
          <br />
          <br />
          The Admin observes who protects their permit.
          The Admin remembers who forgets.
        </Typography>

        <Divider sx={{ mb: 3, borderColor: "#00ff9c44" }} />

        {/* Rewards Section */}
        <Typography
          fontSize={20}
          color="#ffaa00"
          mb={2}
        >
          🎁 YOUR REWARDS
        </Typography>

        <Typography fontSize={14} lineHeight={1.8} mb={2}>
          1️⃣ If you have completed all levels entirely
          by yourself — without guidance from the Admin —
          you secure a
          <span style={{ color: "#ff3b3b" }}>
            {" "}
            Lifetime Admin Immunity Subscription.
          </span>
          <br />
          <br />
          Meaning:
          <br />
          • The Admin will not make you angry.
          <br />
          • The Admin will agree with you.
          <br />
          • The Admin will take a stronger stand for you
          in all future exchanges.
          <br />
          <br />
          Your authority increases.
        </Typography>

        <Typography fontSize={14} lineHeight={1.8} mb={2}>
          2️⃣ If you completed the dungeon with help from
          the Admin — do not worry.
          <br />
          <br />
          Your fate remains flexible.
          <br />
          Keep the Admin pleased.
          Keep the Admin entertained.
          Keep the Admin respected.
          <br />
          <br />
          And the Double Dungeon may still open next year
          with the same first reward.
        </Typography>

        <Typography fontSize={14} lineHeight={1.8} mb={3}>
          3️⃣ The Third Reward is unspoken.
          <br />
          It activates only if you return stronger.
          <br />
          And the Admin will know.
        </Typography>

        <Divider sx={{ mb: 3, borderColor: "#00ff9c44" }} />

        {/* Footer */}
        <Typography
          fontSize={12}
          textAlign="center"
          color="#888"
        >
          This permit expires if arrogance exceeds humility.
          <br />
          The Admin watches.
        </Typography>

        <Typography
          fontSize={12}
          textAlign="center"
          color="#888"
        >
          You may safely close this window now.
          <br />
          The Admin watches.
        </Typography>
      </Paper>
    </Box>
  );
}

