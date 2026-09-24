export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatFullDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getSlaStatus(createdAt: string, status: string): { text: string; isBreached: boolean } {
  if (status === 'Closed') {
    return { text: 'Resolved', isBreached: false };
  }
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const hoursElapsed = (now - created) / (1000 * 60 * 60);

  // Standard SLA target is 24 hours
  if (hoursElapsed > 24) {
    return { text: `SLA Breached (${Math.floor(hoursElapsed)}h)`, isBreached: true };
  }
  const remaining = Math.max(1, Math.round(24 - hoursElapsed));
  return { text: `${remaining}h SLA left`, isBreached: false };
}
