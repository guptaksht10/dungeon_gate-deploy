"use client";

import { ReactNode } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00ff9c" },
    secondary: { main: "#ff4fd8" },
    background: { default: "#050505" },
  },
  typography: {
    fontFamily: "var(--font-press), monospace",
    fontSize: 12, // important for 2P readability
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
