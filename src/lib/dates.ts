export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isTimeZone(value: string) {
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; }
  catch { return false; }
}

export function birthdayLabel(date: string, timeZone: string, now = new Date()) {
  if (!isCalendarDate(date) || !isTimeZone(timeZone)) return null;
  const parts = new Intl.DateTimeFormat('en', { timeZone, month: '2-digit', day: '2-digit' }).formatToParts(now);
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  const label = new Intl.DateTimeFormat('en', { timeZone: 'UTC', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
  return date.slice(5) === `${month}-${day}` ? `Birthday today · ${label}` : label;
}
