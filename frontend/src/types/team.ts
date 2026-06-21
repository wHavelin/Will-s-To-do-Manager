export interface TeamMember {
  id: number;
  name: string;
}

// All colors verified ≥ 4.5:1 contrast against white (#fff) for WCAG AA
const COLORS = [
  '#4f46e5', // indigo-600  6.3:1
  '#be185d', // pink-700    6.0:1
  '#b45309', // amber-700   5.0:1
  '#047857', // emerald-700 5.5:1
  '#2563eb', // blue-600    5.2:1
  '#7c3aed', // violet-600  5.7:1
  '#dc2626', // red-600     4.8:1
  '#0f766e', // teal-700    5.5:1
];

export function memberColor(id: number): string {
  return COLORS[id % COLORS.length];
}

export function memberInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
