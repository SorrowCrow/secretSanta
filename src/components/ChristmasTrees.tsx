'use client';

import { getBasePath } from '@/lib/api-helper';

export default function ChristmasTrees() {
  const base = getBasePath();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Left side trees cluster (smaller, staggered along the left border) */}
      <div className="absolute top-10 -left-6 sm:left-2 w-20 sm:w-28 md:w-32 opacity-[0.11]">
        <img
          src={`${base}/tree-top-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute top-[32%] -left-8 sm:left-8 w-16 sm:w-24 md:w-28 opacity-[0.09]">
        <img
          src={`${base}/tree-bottom-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute top-[58%] -left-4 sm:left-1 w-24 sm:w-32 md:w-36 opacity-[0.12]">
        <img
          src={`${base}/tree-top-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute bottom-8 -left-6 sm:left-4 w-18 sm:w-26 md:w-30 opacity-[0.10]">
        <img
          src={`${base}/tree-bottom-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      {/* Right side trees cluster (smaller, staggered along the right border) */}
      <div className="absolute top-14 -right-4 sm:right-3 w-18 sm:w-26 md:w-30 opacity-[0.10]">
        <img
          src={`${base}/tree-bottom-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute top-[34%] -right-8 sm:right-6 w-24 sm:w-32 md:w-36 opacity-[0.12]">
        <img
          src={`${base}/tree-top-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute top-[60%] -right-4 sm:right-2 w-16 sm:w-24 md:w-28 opacity-[0.09]">
        <img
          src={`${base}/tree-bottom-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>

      <div className="absolute bottom-10 -right-6 sm:right-5 w-22 sm:w-30 md:w-34 opacity-[0.11]">
        <img
          src={`${base}/tree-top-right.svg`}
          alt=""
          className="w-full h-auto select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
