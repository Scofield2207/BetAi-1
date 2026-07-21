import test from 'node:test';
import assert from 'node:assert/strict';
import { maskCode, maskDeviceId, sanitizeSession, redactCodesForAdmin } from './sensitiveData.js';

test('maskCode hides the middle of a code while keeping the ends visible', () => {
  assert.equal(maskCode('TEST001STARTER'), 'TE****ER');
  assert.equal(maskCode('ABC12345'), 'AB****45');
});

test('maskDeviceId keeps a short prefix and suffix', () => {
  assert.equal(maskDeviceId('device_123456789012'), 'dev****12');
  assert.equal(maskDeviceId(null), null);
});

test('sanitizeSession removes sensitive fields', () => {
  const session = {
    code: 'SECRET123',
    deviceId: 'device_123456789012',
    expiresAt: 1710000000000,
    loginTime: 1700000000000,
    role: 'admin'
  };

  const sanitized = sanitizeSession(session);
  assert.equal(sanitized.code, undefined);
  assert.equal(sanitized.deviceId, 'dev****12');
  assert.equal(sanitized.role, 'admin');
});

test('redactCodesForAdmin masks codes and device ids', () => {
  const records = [
    { id: 1, code: 'TEST001STARTER', device_id: 'device_123456789012' },
    { id: 2, code: 'ABC12345', device_id: null }
  ];

  const redacted = redactCodesForAdmin(records);
  assert.equal(redacted[0].code, 'TE****ER');
  assert.equal(redacted[0].device_id, 'dev****12');
  assert.equal(redacted[1].device_id, null);
});
