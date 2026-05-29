// Mirror of api ISO-week helpers (Monday-based) for the plan/table grid.
export function isoWeekOf(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function weekMonday(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  return monday;
}

export const DOW_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

// day 1..6 → Date within the given iso week
export function dayDate(year: number, week: number, dow: number): Date {
  const m = weekMonday(year, week);
  const d = new Date(m);
  d.setUTCDate(m.getUTCDate() + (dow - 1));
  return d;
}

export function fmtDay(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

// 1..6 (Пн..Сб) for a date string; 0 if Sunday/out
export function dowOf(dateStr: string, monday: Date): number {
  const t = new Date(dateStr);
  const diff = Math.floor((Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) - monday.getTime()) / 86400000) + 1;
  return diff >= 1 && diff <= 6 ? diff : 0;
}
