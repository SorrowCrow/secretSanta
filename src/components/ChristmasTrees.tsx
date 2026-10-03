'use client';

import { getBasePath } from '@/lib/api-helper';

interface TreeItem {
  id: string;
  side: 'left' | 'right';
  top: string;
  offset: string;
  width: string;
  opacity: string;
  svg: 'tree-top-right.svg' | 'tree-bottom-right.svg';
  flip?: boolean;
  hideOnMobile?: boolean;
}

const TREES: TreeItem[] = [
  // --- Left Side (0% - 30% width) ---
  {
    id: 'l1',
    side: 'left',
    top: '2%',
    offset: '2%',
    width: 'w-20 sm:w-28 md:w-32',
    opacity: 'opacity-[0.12]',
    svg: 'tree-top-right.svg',
  },
  {
    id: 'l2',
    side: 'left',
    top: '9%',
    offset: '18%',
    width: 'w-16 sm:w-22 md:w-26',
    opacity: 'opacity-[0.09]',
    svg: 'tree-bottom-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'l3',
    side: 'left',
    top: '18%',
    offset: '6%',
    width: 'w-22 sm:w-30 md:w-34',
    opacity: 'opacity-[0.11]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'l4',
    side: 'left',
    top: '27%',
    offset: '24%',
    width: 'w-16 sm:w-22 md:w-24',
    opacity: 'opacity-[0.08]',
    svg: 'tree-top-right.svg',
    hideOnMobile: true,
  },
  {
    id: 'l5',
    side: 'left',
    top: '37%',
    offset: '11%',
    width: 'w-20 sm:w-28 md:w-30',
    opacity: 'opacity-[0.10]',
    svg: 'tree-top-right.svg',
    flip: true,
  },
  {
    id: 'l6',
    side: 'left',
    top: '47%',
    offset: '1%',
    width: 'w-24 sm:w-32 md:w-36',
    opacity: 'opacity-[0.13]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'l7',
    side: 'left',
    top: '57%',
    offset: '21%',
    width: 'w-18 sm:w-24 md:w-26',
    opacity: 'opacity-[0.09]',
    svg: 'tree-bottom-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'l8',
    side: 'left',
    top: '67%',
    offset: '7%',
    width: 'w-22 sm:w-30 md:w-32',
    opacity: 'opacity-[0.11]',
    svg: 'tree-top-right.svg',
  },
  {
    id: 'l9',
    side: 'left',
    top: '77%',
    offset: '23%',
    width: 'w-16 sm:w-22 md:w-26',
    opacity: 'opacity-[0.08]',
    svg: 'tree-top-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'l10',
    side: 'left',
    top: '86%',
    offset: '4%',
    width: 'w-22 sm:w-28 md:w-32',
    opacity: 'opacity-[0.12]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'l11',
    side: 'left',
    top: '94%',
    offset: '16%',
    width: 'w-16 sm:w-22 md:w-24',
    opacity: 'opacity-[0.09]',
    svg: 'tree-top-right.svg',
    hideOnMobile: true,
  },

  // --- Right Side (70% - 100% width, i.e. 0% - 30% from right) ---
  {
    id: 'r1',
    side: 'right',
    top: '3%',
    offset: '16%',
    width: 'w-16 sm:w-22 md:w-26',
    opacity: 'opacity-[0.09]',
    svg: 'tree-bottom-right.svg',
    hideOnMobile: true,
  },
  {
    id: 'r2',
    side: 'right',
    top: '10%',
    offset: '3%',
    width: 'w-22 sm:w-30 md:w-34',
    opacity: 'opacity-[0.12]',
    svg: 'tree-top-right.svg',
    flip: true,
  },
  {
    id: 'r3',
    side: 'right',
    top: '19%',
    offset: '24%',
    width: 'w-16 sm:w-22 md:w-24',
    opacity: 'opacity-[0.08]',
    svg: 'tree-top-right.svg',
    hideOnMobile: true,
  },
  {
    id: 'r4',
    side: 'right',
    top: '28%',
    offset: '6%',
    width: 'w-24 sm:w-32 md:w-36',
    opacity: 'opacity-[0.13]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'r5',
    side: 'right',
    top: '38%',
    offset: '19%',
    width: 'w-18 sm:w-26 md:w-28',
    opacity: 'opacity-[0.09]',
    svg: 'tree-bottom-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'r6',
    side: 'right',
    top: '48%',
    offset: '2%',
    width: 'w-22 sm:w-30 md:w-32',
    opacity: 'opacity-[0.11]',
    svg: 'tree-top-right.svg',
  },
  {
    id: 'r7',
    side: 'right',
    top: '58%',
    offset: '25%',
    width: 'w-14 sm:w-20 md:w-22',
    opacity: 'opacity-[0.07]',
    svg: 'tree-top-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'r8',
    side: 'right',
    top: '68%',
    offset: '9%',
    width: 'w-22 sm:w-30 md:w-32',
    opacity: 'opacity-[0.12]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'r9',
    side: 'right',
    top: '78%',
    offset: '22%',
    width: 'w-16 sm:w-22 md:w-26',
    opacity: 'opacity-[0.08]',
    svg: 'tree-top-right.svg',
    flip: true,
    hideOnMobile: true,
  },
  {
    id: 'r10',
    side: 'right',
    top: '87%',
    offset: '4%',
    width: 'w-24 sm:w-30 md:w-34',
    opacity: 'opacity-[0.12]',
    svg: 'tree-bottom-right.svg',
  },
  {
    id: 'r11',
    side: 'right',
    top: '95%',
    offset: '17%',
    width: 'w-16 sm:w-22 md:w-24',
    opacity: 'opacity-[0.09]',
    svg: 'tree-top-right.svg',
    hideOnMobile: true,
  },
];

export default function ChristmasTrees() {
  const base = getBasePath();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {TREES.map((t) => (
        <div
          key={t.id}
          className={`absolute ${t.width} ${t.opacity} ${t.flip ? 'scale-x-[-1]' : ''} ${t.hideOnMobile ? 'max-sm:hidden' : ''}`}
          style={{
            top: t.top,
            ...(t.side === 'left' ? { left: t.offset } : { right: t.offset }),
          }}
        >
          <img
            src={`${base}/${t.svg}`}
            alt=""
            className="w-full h-auto select-none pointer-events-none"
          />
        </div>
      ))}
    </div>
  );
}
