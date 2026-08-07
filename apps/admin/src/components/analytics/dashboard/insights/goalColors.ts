export function goalColor(index: number): string {
  const hue = (index * 137.508 + 25) % 360;
  return `oklch(0.7 0.15 ${hue.toFixed(1)})`;
}
