import twilio from 'twilio';

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    return `+${trimmed.slice(1).replace(/\D/g, '')}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  const countryCode = process.env.TWILIO_DEFAULT_COUNTRY_CODE ?? '1';

  if (digits.length === 10) {
    return `+${countryCode}${digits}`;
  }

  return `+${digits}`;
}

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN environment variable');
  }

  return twilio(accountSid, authToken);
}

export async function sendSms(to: string, body: string) {
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!from) {
    throw new Error('Missing TWILIO_PHONE_NUMBER environment variable');
  }

  const client = getTwilioClient();

  return client.messages.create({
    to: normalizePhone(to),
    from,
    body,
  });
}

export function buildWaitlistAddedMessage({
  name,
  position,
  partySize,
  estimatedWait,
}: {
  name: string;
  position: number;
  partySize: number;
  estimatedWait: number;
}) {
  return `Hi ${name}! You've been added to the waitlist at The Green Table. You're #${position} in line for a party of ${partySize}. Estimated wait: ${estimatedWait} mins. We'll text you when your table is ready!`;
}

export function buildTableReadyMessage(name: string) {
  return `Great news, ${name}! 🎉 Your table is ready!`;
}
