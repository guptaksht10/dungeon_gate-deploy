"use client";

import { createContext, useContext, useRef, useEffect } from "react";

type SFXContextType = {
  play: (src: string) => void;
};

const SFXContext = createContext<SFXContextType | null>(null);

export function useSFX() {
  const ctx = useContext(SFXContext);

  if (!ctx) {
    throw new Error("useSFX must be used inside <SFXPlayer>");
  }

  return ctx;
}

export default function SFXPlayer({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioPool = useRef<HTMLAudioElement[]>([]);

  const play = (src: string) => {
    const audio = new Audio(src);
    audio.volume = 1;

    audio.play().catch(() => {});

    audioPool.current.push(audio);

    audio.onended = () => {
      audioPool.current = audioPool.current.filter(
        (a) => a !== audio
      );
    };
  };

  // 🔥 Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPool.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioPool.current = [];
    };
  }, []);

  return (
    <SFXContext.Provider value={{ play }}>
      {children}
    </SFXContext.Provider>
  );
}
