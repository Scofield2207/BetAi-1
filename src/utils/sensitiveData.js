export const maskCode = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed.length <= 4) return '*'.repeat(trimmed.length);
  const prefix = trimmed.slice(0, 2);
  const suffix = trimmed.slice(-2);
  return `${prefix}${'*'.repeat(4)}${suffix}`;
};

export const maskDeviceId = (value) => {
  if (!value || typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed.length <= 6) return '*'.repeat(trimmed.length);
  return `${trimmed.slice(0, 3)}${'*'.repeat(4)}${trimmed.slice(-2)}`;
};

export const sanitizeSession = (session) => {
  if (!session || typeof session !== 'object') return session;
  const sanitized = { ...session };
  if ('code' in sanitized) delete sanitized.code;
  if ('deviceId' in sanitized) sanitized.deviceId = maskDeviceId(sanitized.deviceId);
  return sanitized;
};

export const redactCodesForAdmin = (records = []) =>
  records.map((record) => ({
    ...record,
    code: maskCode(record?.code),
    device_id: maskDeviceId(record?.device_id)
  }));
