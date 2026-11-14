// Pure helpers for the Hope box and My circle, kept apart so they can be tested without a phone.

// The address that opens Messages with several people and the words filled in. iPhone and
// Android spell it differently. Nothing is sent until the person taps Send.
export function smsLink(phones, body, platform) {
  const list = phones.map((p) => String(p).replace(/[^\d+]/g, '')).filter(Boolean);
  const text = encodeURIComponent(body);
  if (platform === 'ios') return 'sms://open?addresses=' + list.join(',') + '&body=' + text;
  return 'sms:' + list.join(';') + '?body=' + text;
}
export function preview(text, length = 80) {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > length ? flat.slice(0, length - 1) + '…' : flat;
}
// The largest size that fits inside the edge limit, keeping the photo's shape.
export function fitInside(width, height, edge) {
  const scale = Math.min(1, edge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
