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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: string): string {
  if (!iso) return '';
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return '';
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}
