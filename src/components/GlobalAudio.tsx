"use client";

import { useEffect, useRef } from "react";

export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1;
    audio.loop = true;

    const startAudio = async () => {
      try {
        await audio.play();
      } catch {
        // Autoplay blocked — ignore
      }

      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
    };

    window.addEventListener("click", startAudio);
    window.addEventListener("keydown", startAudio);

    return () => {
      window.removeEventListener("click", startAudio);
      window.removeEventListener("keydown", startAudio);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/sounds/ambience.mp4"
      preload="auto"
      hidden
    />
  );
}
