const EMAIL_RATE_LIMIT = 5;
const TIME_WINDOW_MS = 60 * 1000; // 1 minute

const emailTimestamps: number[] = [];

export function checkEmailRateLimit(): {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW_MS;

  // Remove timestamps outside the window
  while (emailTimestamps.length > 0 && emailTimestamps[0] < windowStart) {
    emailTimestamps.shift();
  }

  const remaining = EMAIL_RATE_LIMIT - emailTimestamps.length;

  if (emailTimestamps.length >= EMAIL_RATE_LIMIT) {
    const oldestTimestamp = emailTimestamps[0];
    const retryAfterMs = oldestTimestamp + TIME_WINDOW_MS - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}

export function recordEmailSent(): void {
  emailTimestamps.push(Date.now());
}

export function getRateLimitStatus(): {
  count: number;
  limit: number;
  remaining: number;
} {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW_MS;

  // Remove timestamps outside the window
  while (emailTimestamps.length > 0 && emailTimestamps[0] < windowStart) {
    emailTimestamps.shift();
  }

  return {
    count: emailTimestamps.length,
    limit: EMAIL_RATE_LIMIT,
    remaining: EMAIL_RATE_LIMIT - emailTimestamps.length,
  };
}
