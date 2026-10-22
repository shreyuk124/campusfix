// lib/format.js - Date, time and SLA formatting utilities
import { format, formatDistanceToNowStrict, differenceInMinutes, differenceInHours, differenceInDays, parseISO } from 'date-fns';

/**
 * Format relative time (e.g., "2h ago", "Just now", "3d ago")
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const distance = formatDistanceToNowStrict(date, { addSuffix: true });
    // Shorten format if desired e.g. "2 hours ago" -> "2h ago"
    return distance
      .replace(' seconds ago', 's ago')
      .replace(' second ago', 's ago')
      .replace(' minutes ago', 'm ago')
      .replace(' minute ago', 'm ago')
      .replace(' hours ago', 'h ago')
      .replace(' hour ago', 'h ago')
      .replace(' days ago', 'd ago')
      .replace(' day ago', 'd ago');
  } catch {
    return dateString;
  }
}

/**
 * Format absolute date string (e.g. "17 Oct 2026, 4:30 PM")
 */
export function formatAbsoluteDate(dateString) {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'd MMM yyyy, h:mm a');
  } catch {
    return dateString;
  }
}

/**
 * Calculate SLA countdown status:
 * Returns: { state: 'on-track' | 'due-soon' | 'overdue', label: string, isOverdue: boolean }
 *
 * Rules from DESIGN.md:
 * - On track: More than 50% of SLA time remaining -> teal
 * - Due soon: Under 50% remaining -> yellow/orange
 * - Overdue: Past deadline -> danger red
 */
export function getSlaStatus(deadlineDateString, createdDateString) {
  if (!deadlineDateString) {
    return { state: 'on-track', label: 'On schedule', isOverdue: false };
  }

  try {
    const now = new Date();
    const deadline = typeof deadlineDateString === 'string' ? parseISO(deadlineDateString) : deadlineDateString;
    const isPast = deadline.getTime() < now.getTime();

    if (isPast) {
      const hoursOver = Math.abs(differenceInHours(now, deadline));
      const daysOver = Math.abs(differenceInDays(now, deadline));
      const label = daysOver >= 1 ? `Overdue by ${daysOver}d` : `Overdue by ${Math.max(1, hoursOver)}h`;
      return {
        state: 'overdue',
        label,
        isOverdue: true,
      };
    }

    const hoursRemaining = differenceInHours(deadline, now);
    const daysRemaining = differenceInDays(deadline, now);
    const minutesRemaining = differenceInMinutes(deadline, now);

    let label = '';
    if (daysRemaining >= 1) {
      label = `Due in ${daysRemaining}d`;
    } else if (hoursRemaining >= 1) {
      label = `Due in ${hoursRemaining}h`;
    } else {
      label = `Due in ${Math.max(1, minutesRemaining)}m`;
    }

    // Check if under 50% SLA remaining if createdDate is known
    let isDueSoon = hoursRemaining <= 12; // default threshold if no created date
    if (createdDateString) {
      const created = typeof createdDateString === 'string' ? parseISO(createdDateString) : createdDateString;
      const totalDuration = deadline.getTime() - created.getTime();
      const remainingDuration = deadline.getTime() - now.getTime();
      if (totalDuration > 0 && remainingDuration / totalDuration < 0.5) {
        isDueSoon = true;
      }
    }

    return {
      state: isDueSoon ? 'due-soon' : 'on-track',
      label,
      isOverdue: false,
    };
  } catch {
    return { state: 'on-track', label: 'On track', isOverdue: false };
  }
}

/**
 * Format plural-aware affected count:
 * "1 student affected" / "12 students affected"
 */
export function formatAffectedCount(count = 0) {
  const num = Math.max(0, count);
  return num === 1 ? '1 student affected' : `${num} students affected`;
}
