const LIMIT_KEY = 'zodiac_ai_message_count';
const DATE_KEY = 'zodiac_ai_message_date';
const DAILY_LIMIT = 3;

export function getAiMessageUsage(): { used: number; remaining: number; canUse: boolean } {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem(DATE_KEY);

  // Reset count if it's a new day
  if (savedDate !== today) {
    localStorage.setItem(DATE_KEY, today);
    localStorage.setItem(LIMIT_KEY, '0');
  }

  const used = parseInt(localStorage.getItem(LIMIT_KEY) || '0');
  const remaining = Math.max(0, DAILY_LIMIT - used);

  return { used, remaining, canUse: remaining > 0 };
}

export function incrementAiMessageCount(): void {
  const today = new Date().toDateString();
  localStorage.setItem(DATE_KEY, today);
  const used = parseInt(localStorage.getItem(LIMIT_KEY) || '0');
  localStorage.setItem(LIMIT_KEY, String(used + 1));
}

export function resetAiMessageCount(): void {
  localStorage.removeItem(LIMIT_KEY);
  localStorage.removeItem(DATE_KEY);
}