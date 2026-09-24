'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { animate } from 'animejs';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NumberFormat = 'integer' | 'decimal' | 'percentage' | 'compact';
type Direction = 'up' | 'down' | 'neutral';

export interface AnimatedNumberProps {
  /** Target numeric value */
  value: number;
  /** Animation duration in ms (default: 800) */
  duration?: number;
  /** Display format applied during and after animation (default: 'integer') */
  format?: NumberFormat;
  /** Decimal places — used by 'decimal' and 'percentage' formats (default: 0) */
  decimals?: number;
  /** String prepended before the formatted number */
  prefix?: string;
  /** String appended after the formatted number */
  suffix?: string;
  /** BCP 47 locale for Intl.NumberFormat (default: 'en-US') */
  locale?: string;
  /**
   * Show a small signed-delta badge that fades out after the animation settles.
   * E.g. value goes from 8 → 11 → shows "+3" badge in green.
   */
  showDelta?: boolean;
  /**
   * Tint the number green on increase, red on decrease.
   * Fades back to neutral once the delta badge disappears.
   */
  colorized?: boolean;
  /** Extra classes applied to the root <span> */
  className?: string;
  /** Passed to aria-label on the live region root */
  'aria-label'?: string;
}

// ─── Format Helper ────────────────────────────────────────────────────────────

function fmt(
  raw: number,
  format: NumberFormat,
  decimals: number,
  locale: string,
  prefix: string,
  suffix: string,
): string {
  let core: string;

  switch (format) {
    case 'compact':
      core = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(raw);
      break;

    case 'percentage':
      core =
        new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(raw) + '%';
      break;

    case 'decimal':
      core = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(raw);
      break;

    case 'integer':
    default:
      // Intl handles comma-separators for large numbers (e.g. 1,024)
      core = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }).format(Math.round(raw));
      break;
  }

  return `${prefix}${core}${suffix}`;
}

// ─── Static Style Maps ────────────────────────────────────────────────────────

const numColour: Record<Direction, string> = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  neutral: '',
};

const badgeStyle: Record<'up' | 'down', string> = {
  up: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/25',
  down: 'bg-red-500/10    text-red-400    ring-1 ring-inset ring-red-500/25',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnimatedNumber({
  value,
  duration = 800,
  format = 'integer',
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'en-US',
  showDelta = false,
  colorized = false,
  className = '',
  'aria-label': ariaLabel,
}: AnimatedNumberProps) {
  const numberRef = useRef<HTMLSpanElement>(null);

  /**
   * Track the actual rendered value at any moment in time.
   * This differs from a "previous value" ref: if an animation is cancelled
   * mid-flight, the new animation picks up from wherever the number visually
   * is — not from the last target — so there is never a jump.
   */
  const visualValue = useRef<number>(value);
  const animInstance = useRef<{ pause(): void } | null>(null);
  const isFirstRender = useRef(true);

  const [direction, setDirection] = useState<Direction>('neutral');
  const [deltaValue, setDeltaValue] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const deltaClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flashClearRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /** Momentary brightness spike so the eye catches every value change */
  const flash = useCallback(() => {
    setIsFlashing(true);
    clearTimeout(flashClearRef.current);
    flashClearRef.current = setTimeout(() => setIsFlashing(false), 280);
  }, []);

  useEffect(() => {
    const from = visualValue.current;
    const to = value;
    const delta = to - from;

    // Side-effects only on genuine value changes after first mount
    if (!isFirstRender.current && delta !== 0) {
      const dir: Direction = delta > 0 ? 'up' : 'down';

      flash();

      if (colorized) {
        setDirection(dir);
      }

      if (showDelta) {
        setDeltaValue(delta);
        setShowBadge(true);
        clearTimeout(deltaClearRef.current);
        deltaClearRef.current = setTimeout(() => {
          setShowBadge(false);
          // Delay direction reset so colour fades out after badge is gone
          if (colorized) {
            setTimeout(() => setDirection('neutral'), 500);
          }
        }, duration + 1_400);
      }
    }

    isFirstRender.current = false;

    // Cancel any in-flight animation before starting the new one
    animInstance.current?.pause();

    const obj = { val: from };

    animInstance.current = animate(obj, {
      val: to,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        // Keep visualValue in sync so interruption picks up correctly
        visualValue.current = obj.val;
        if (numberRef.current) {
          numberRef.current.textContent = fmt(
            obj.val, format, decimals, locale, prefix, suffix,
          );
        }
      },
      onComplete: () => {
        visualValue.current = to;
      },
    }) as unknown as { pause(): void };

    return () => {
      // On unmount or before the next effect run, cancel everything
      animInstance.current?.pause();
      clearTimeout(deltaClearRef.current);
      clearTimeout(flashClearRef.current);
    };
  }, [value, duration, format, decimals, prefix, suffix, locale, colorized, showDelta, flash]);

  const badgeDir: 'up' | 'down' = deltaValue >= 0 ? 'up' : 'down';
  const absDelta = Math.abs(deltaValue);

  return (
    <span
      className={`relative inline-flex items-baseline gap-1.5 tabular-nums ${className}`}
      aria-live="polite"
      aria-atomic="true"
      aria-label={ariaLabel}
    >
      {/*
        Hidden live region: announces the settled value to screen readers
        without exposing intermediate animation frames.
      */}
      <span className="sr-only">
        {fmt(value, format, decimals, locale, prefix, suffix)}
      </span>

      {/* Visible animated number */}
      <span
        ref={numberRef}
        aria-hidden="true"
        className={[
          'transition-colors duration-500',
          colorized ? numColour[direction] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          /*
            Drive the brightness flash with inline style so Tailwind's JIT
            doesn't need to know about the transient state at build time.
          */
          filter: isFlashing ? 'brightness(1.55)' : 'brightness(1)',
          transition: isFlashing
            ? 'filter 0ms, color 500ms'
            : 'filter 280ms ease-out, color 500ms',
        }}
      >
        {fmt(value, format, decimals, locale, prefix, suffix)}
      </span>

      {/* Delta badge */}
      {showDelta && showBadge && absDelta > 0 && (
        <span
          aria-hidden="true"
          className={[
            'inline-flex items-center gap-px rounded px-1.5 py-0.5',
            'text-[0.5em] font-semibold leading-none',
            badgeStyle[badgeDir],
          ].join(' ')}
        >
          <span className="text-[1.1em] leading-none">
            {badgeDir === 'up' ? '▲' : '▼'}
          </span>
          {deltaValue > 0 ? '+' : '−'}
          {fmt(absDelta, format, decimals, locale, '', suffix)}
        </span>
      )}
    </span>
  );
}