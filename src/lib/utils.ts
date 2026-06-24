import { format } from 'date-fns';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatTime(isoString: string): string {
  return format(new Date(isoString), 'h:mm a');
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'EEE');
}

export function formatDateLabel(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM d');
}

export function formatDateFull(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'EEEE, MMMM d');
}

export function formatDateCompact(dateStr: string): string {
  return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy');
}
