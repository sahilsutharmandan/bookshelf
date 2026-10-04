const COMPACT_UNITS = [
  { value: 1_000, suffix: 'K' },
  { value: 1_000_000, suffix: 'M' },
  { value: 1_000_000_000, suffix: 'B' },
];

export function formatCompact(n: number): string {
  const unit = COMPACT_UNITS.find(u => n >= u.value);
  if (!unit) {
    return n.toString();
  }
  const scaled = (n / unit.value).toFixed(1).replace(/\.0$/, '');
  return `${scaled}${unit.suffix}`;
}
