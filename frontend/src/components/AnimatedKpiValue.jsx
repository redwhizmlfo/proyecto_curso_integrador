import { useEffect, useRef, useState } from 'react';

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return Number.NaN;

  // Values such as "12:00 - 14:00" are KPI labels, not numbers to animate.
  if (value.includes(':')) return Number.NaN;

  const numericLike = /^[\s$S/.,0-9-]+$/.test(value);
  if (!numericLike) return Number.NaN;

  const normalized = value.replace(/[^0-9.-]/g, '');
  return normalized ? Number(normalized) : Number.NaN;
};

export default function AnimatedKpiValue({ value, format = (v) => v, duration = 700 }) {
  const numericValue = toNumber(value);
  const isNumeric = Number.isFinite(numericValue);
  const [displayValue, setDisplayValue] = useState(isNumeric ? 0 : value);
  const previousValue = useRef(isNumeric ? 0 : value);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      previousValue.current = value;
      return undefined;
    }

    const from = Number.isFinite(previousValue.current) ? previousValue.current : 0;
    const startedAt = performance.now();
    let frameId;

    const animate = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = from + (numericValue - from) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        previousValue.current = numericValue;
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [duration, isNumeric, numericValue, value]);

  if (!isNumeric) return <>{format(value)}</>;

  const formattedValue = Number.isInteger(numericValue)
    ? Math.round(displayValue)
    : displayValue;

  return <>{format(formattedValue)}</>;
}
