'use client';

export default function ChristmasTrees() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Left Side Christmas Trees */}
      <div className="absolute left-0 bottom-0 top-0 flex flex-col justify-between py-12 -ml-6 sm:ml-0 opacity-10 text-emerald-800">
        {/* Top-Left Tree */}
        <svg
          className="w-24 sm:w-36 md:w-48 h-auto"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          {/* Star */}
          <polygon points="50,2 53,10 61,10 55,15 57,23 50,18 43,23 45,15 39,10 47,10" fill="#f59e0b" />
          {/* Top Tier */}
          <polygon points="50,16 68,42 58,42 76,66 64,66 84,94 16,94 36,66 24,66 42,42 32,42" />
          {/* Bottom Tier */}
          <polygon points="50,75 88,118 12,118" />
          {/* Trunk */}
          <rect x="44" y="118" width="12" height="18" fill="#78350f" />
        </svg>

        {/* Middle-Left Tree (offset) */}
        <svg
          className="w-20 sm:w-28 md:w-36 h-auto -ml-3"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <polygon points="50,20 66,45 56,45 74,70 62,70 82,100 18,100 38,70 26,70 44,45 34,45" />
          <polygon points="50,80 86,120 14,120" />
          <rect x="44" y="120" width="12" height="16" fill="#78350f" />
        </svg>

        {/* Bottom-Left Big Tree */}
        <svg
          className="w-28 sm:w-44 md:w-56 h-auto"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <polygon points="50,2 53,10 61,10 55,15 57,23 50,18 43,23 45,15 39,10 47,10" fill="#f59e0b" />
          <polygon points="50,16 68,42 58,42 76,66 64,66 84,94 16,94 36,66 24,66 42,42 32,42" />
          <polygon points="50,75 92,122 8,122" />
          <rect x="43" y="122" width="14" height="18" fill="#78350f" />
        </svg>
      </div>

      {/* Right Side Christmas Trees */}
      <div className="absolute right-0 bottom-0 top-0 flex flex-col justify-between items-end py-12 -mr-6 sm:mr-0 opacity-10 text-emerald-800">
        {/* Top-Right Tree */}
        <svg
          className="w-24 sm:w-36 md:w-48 h-auto"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <polygon points="50,2 53,10 61,10 55,15 57,23 50,18 43,23 45,15 39,10 47,10" fill="#f59e0b" />
          <polygon points="50,16 68,42 58,42 76,66 64,66 84,94 16,94 36,66 24,66 42,42 32,42" />
          <polygon points="50,75 88,118 12,118" />
          <rect x="44" y="118" width="12" height="18" fill="#78350f" />
        </svg>

        {/* Middle-Right Tree (offset) */}
        <svg
          className="w-20 sm:w-28 md:w-36 h-auto -mr-3"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <polygon points="50,20 66,45 56,45 74,70 62,70 82,100 18,100 38,70 26,70 44,45 34,45" />
          <polygon points="50,80 86,120 14,120" />
          <rect x="44" y="120" width="12" height="16" fill="#78350f" />
        </svg>

        {/* Bottom-Right Big Tree */}
        <svg
          className="w-28 sm:w-44 md:w-56 h-auto"
          viewBox="0 0 100 140"
          fill="currentColor"
        >
          <polygon points="50,2 53,10 61,10 55,15 57,23 50,18 43,23 45,15 39,10 47,10" fill="#f59e0b" />
          <polygon points="50,16 68,42 58,42 76,66 64,66 84,94 16,94 36,66 24,66 42,42 32,42" />
          <polygon points="50,75 92,122 8,122" />
          <rect x="43" y="122" width="14" height="18" fill="#78350f" />
        </svg>
      </div>
    </div>
  );
}
