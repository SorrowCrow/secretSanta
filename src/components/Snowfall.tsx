'use client';

import { useState, useEffect } from 'react';

interface SnowflakeProps {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  character: string;
}

const SNOW_CHARS = ['❄', '❅', '❆', '•', '✧'];

export default function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<SnowflakeProps[]>([]);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    // Generate flakes on client mount to eliminate SSR hydration mismatches
    const flakes: SnowflakeProps[] = Array.from({ length: 38 }, (_, i) => {
      const left = Math.random() * 100;
      const size = Math.floor(Math.random() * 14) + 10; // 10px to 24px
      const duration = Math.random() * 8 + 7; // 7s to 15s
      const delay = Math.random() * 10; // 0s to 10s
      const opacity = Math.random() * 0.55 + 0.25; // 0.25 to 0.8
      const character = SNOW_CHARS[Math.floor(Math.random() * SNOW_CHARS.length)];

      return {
        id: i,
        left: `${left}%`,
        size,
        duration,
        delay,
        opacity,
        character,
      };
    });

    setSnowflakes(flakes);
  }, []);

  if (!enabled || snowflakes.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none z-0"
    >
      {snowflakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            fontSize: `${flake.size}px`,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            opacity: flake.opacity,
          }}
        >
          {flake.character}
        </span>
      ))}
    </div>
  );
}
