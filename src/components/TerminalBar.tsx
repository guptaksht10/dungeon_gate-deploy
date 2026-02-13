"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function TerminalBar() {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([
    "SYSTEM: Connected.",
    "Type 'help' to begin.",
  ]);

  const [corrupt, setCorrupt] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------------- RANDOM GLITCH ---------------- */

  useEffect(() => {
    const glitch = setInterval(() => {
      if (Math.random() < 0.5) {
        setCorrupt(true);

        timeoutRef.current = setTimeout(() => {
          setCorrupt(false);
        }, 3000);
      }
    }, 8000);

    return () => {
      clearInterval(glitch);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* ---------------- COMMAND HANDLER ---------------- */

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;

    const cmd = command.toLowerCase().trim();
    let response = "";

    switch (cmd) {
      case "help":
        response =
          "help | hint | status | clear | whoami | unlock";
        break;

      case "hint":
        response = "Aalsi upr click kr na!!";
        break;

      case "status":
        response = "Status: I am monitoring you playing...";
        break;

      case "whoami":
        response =
          "I don't even know who am I. Tell me who you are.";
        break;

      case "unlock":
        response = "No escape for you!";
        break;

      case "hack":
        response = "Warning: Intrusion detected.";
        setCorrupt(true);

        timeoutRef.current = setTimeout(() => {
          setCorrupt(false);
        }, 4000);
        break;

      case "clear":
        setHistory([]);
        setCommand("");
        return;

      default:
        response = "Unknown command.";
    }

    setHistory((prev) => {
      const updated = [
        ...prev,
        `> ${cmd}`,
        `SYSTEM: ${response}`,
      ];

      // 🔥 Cap history to last 50 lines
      return updated.slice(-50);
    });

    setCommand("");
  };

  return (
    <>
      <style>
        {`
          @keyframes flicker {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}
      </style>

      {!open && (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 70,
            height: 40,
            background: "#000",
            border: "1px solid #00ff9c",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00ff9c",
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 0 12px #00ff9c66",
            zIndex: 9999,
            "&:hover": {
              boxShadow: "0 0 20px #00ff9c",
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
        >
          &gt;_
        </Box>
      )}

      {open && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 360,
            height: 260,
            background: "#000",
            border: "1px solid #00ff9c",
            boxShadow: "0 0 25px #00ff9c55",
            display: "flex",
            flexDirection: "column",
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderBottom: "1px solid #00ff9c33",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#00ff9c",
              fontSize: 12,
            }}
          >
            TERMINAL

            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{ color: "#00ff9c" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 1.5,
              py: 1,
              fontSize: 11,
            }}
          >
            {history.map((line, i) => (
              <Typography
                key={i}
                sx={{ color: "#00ff9c", fontSize: 11 }}
              >
                {line}
              </Typography>
            ))}

            {corrupt && (
              <Typography
                sx={{
                  color: "#ff3b3b",
                  fontSize: 11,
                  mt: 0.5,
                  textShadow: "0 0 6px #ff3b3b",
                  animation: "flicker 0.15s infinite",
                }}
              >
                ⚠ Admin is corrupting the terminal...
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.8,
              borderTop: "1px solid #00ff9c33",
            }}
          >
            <Typography
              sx={{
                color: "#00ff9c",
                mr: 1,
                fontSize: 12,
              }}
            >
              &gt;
            </Typography>

            <TextField
              variant="standard"
              fullWidth
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleCommand}
              InputProps={{
                disableUnderline: true,
                sx: {
                  color: "#00ff9c",
                  fontSize: 12,
                },
              }}
              placeholder="command..."
            />
          </Box>
        </Paper>
      )}
    </>
  );
}
