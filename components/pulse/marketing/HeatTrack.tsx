import { useId } from 'react';

/** Original vector artwork: a banked running track rendered as thermal contours. */
export function HeatTrack({ compact = false }: { compact?: boolean }) {
  const id = useId().replaceAll(':', '');
  return (
    <svg className={`heat-track${compact ? ' heat-track--compact' : ''}`} viewBox="0 0 900 900" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-heat`} x1="180" y1="800" x2="730" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--pulse-magenta)" /><stop offset=".32" stopColor="var(--pulse-red)" />
          <stop offset=".64" stopColor="var(--pulse-orange)" /><stop offset=".87" stopColor="var(--pulse-yellow)" />
          <stop offset="1" stopColor="var(--pulse-ink)" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--pulse-void)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--pulse-void)" stopOpacity=".85" />
        </linearGradient>
      </defs>
      <g transform="rotate(-32 450 450)">
        {Array.from({ length: 42 }, (_, index) => (
          <rect key={index} x={99 + index * 4.1} y={45 + index * 4.1}
            width={702 - index * 8.2} height={810 - index * 8.2}
            rx={351 - index * 4.1} stroke={`url(#${id}-heat)`}
            strokeWidth={index % 7 === 0 ? 2.5 : 1.1} opacity={.35 + index / 65} />
        ))}
        <path d="M124 616 282 560M115 586 272 540M108 555 266 520M103 523 263 501"
          stroke="var(--pulse-ink)" strokeWidth="2" opacity=".65" />
        <circle cx="660" cy="194" r="6" fill="var(--pulse-ink)" />
        <circle cx="660" cy="194" r="16" stroke="var(--pulse-ink)" opacity=".45" />
      </g>
      <path d="M40 760 860 140" stroke="var(--pulse-ink)" strokeOpacity=".14" strokeDasharray="3 9" />
    </svg>
  );
}
