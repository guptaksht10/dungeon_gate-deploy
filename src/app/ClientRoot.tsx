"use client";

import Providers from "./providers";
import GlobalAudio from "../components/GlobalAudio";
import TerminalBar from "../components/TerminalBar";
import SFXPlayer from "../components/SFXPlayer";
import LockWrapper from "../components/LockWrapper";
import ThemeRegistry from "./ThemeRegistry";

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeRegistry>
    <SFXPlayer>
      <LockWrapper>
        <Providers>
          <GlobalAudio />
          {children}
          <TerminalBar />
        </Providers>
      </LockWrapper>
    </SFXPlayer>
    </ThemeRegistry>
  );
}
