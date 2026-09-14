interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpRecord>();

export function generateOtp(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  const code = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    attempts: 0,
  });

  return code;
}

export function verifyOtp(
  email: string,
  code: string
): boolean {
  const normalizedEmail = email.trim().toLowerCase();

  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return false;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  record.attempts += 1;

  if (record.attempts > 5) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  if (record.code !== code.trim()) {
    return false;
  }

  otpStore.delete(normalizedEmail);

  return true;
}

export function clearOtp(email: string): void {
  otpStore.delete(email.trim().toLowerCase());
}