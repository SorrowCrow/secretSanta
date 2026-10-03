'use client';

import { getBasePath } from '@/lib/api-helper';

export default function ChristmasTrees() {
  const base = getBasePath();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Left side: Top-Right Christmas Tree from vecteezy */}
      <div className="absolute -left-8 sm:left-2 lg:left-6 top-1/2 -translate-y-1/2 w-48 sm:w-64 md:w-80 lg:w-[380px] opacity-[0.12] pointer-events-none transition-opacity">
        <img
          src={`${base}/tree-top-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      {/* Right side: Bottom-Right Christmas Tree from vecteezy */}
      <div className="absolute -right-8 sm:right-2 lg:right-6 top-1/2 -translate-y-1/2 w-48 sm:w-64 md:w-80 lg:w-[380px] opacity-[0.12] pointer-events-none transition-opacity">
        <img
          src={`${base}/tree-bottom-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
