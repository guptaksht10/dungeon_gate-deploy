"use client";
import { Box, Paper, Typography, Divider } from "@mui/material";

export default function NotFound() {
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
          maxWidth: 700,
          p: 5,
          background: "rgba(0,0,0,0.94)",
          border: "1px solid #ff3b3b",
          boxShadow: "0 0 30px #ff000055",
          textAlign: "center",
        }}
      >
        {/* Title */}
        <Typography
          fontSize={28}
          color="#ff3b3b"
          mb={1}
        >
          404 — REALITY NOT FOUND
        </Typography>

        <Typography
          fontSize={13}
          color="#ffaa00"
          mb={3}
        >
          The Admin attempted retrieval.
        </Typography>

        <Divider sx={{ mb: 3, borderColor: "#00ff9c44" }} />

        {/* Body */}
        <Typography fontSize={14} lineHeight={1.8} mb={3}>
          You have stepped into a corridor that does not exist.
          <br />
          <br />
          Either the path was mistyped,
          <br />
          or the dungeon has shifted its structure.
          <br />
          <br />
          The Shadow Realm does not acknowledge this location.
          <br />
          And therefore,
          <br />
          it does not acknowledge you here.
          <br />
          <br />
          Return to known territory.
          <br />
          Before the walls start remembering.
        </Typography>

        <Divider sx={{ mb: 3, borderColor: "#00ff9c44" }} />

        {/* Footer */}
        <Typography
          fontSize={12}
          color="#888"
        >
          Error Code: SHADOW_404
        </Typography>

        <Typography
          fontSize={12}
          color="#888"
        >
          The Admin watches.
        </Typography>
      </Paper>
    </Box>
  );
}
