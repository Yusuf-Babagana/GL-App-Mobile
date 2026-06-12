import { TFunction } from 'i18next';

const knownErrors: Record<string, string> = {
  'user with this email already exists.': 'email_registered',
  'this email is already registered.': 'email_registered',
  'a user is already registered with this e-mail address.': 'email_registered',
  'unable to log in with provided credentials.': 'invalid_credentials',
  'this field is required.': 'fill_required',
  'this field may not be blank.': 'fill_required',
  'the two password fields didn\'t match.': 'passwords_no_match',
  'this password is too short. it must contain at least 8 characters.': 'password_too_short',
  'this password is too common.': 'password_common',
  'this password is entirely numeric.': 'password_numeric',
  'enter a valid email address.': 'email_invalid',
  'ensure this field has at least 8 characters.': 'password_too_short',
};

function normalizeMessage(msg: string): string {
  return msg.toLowerCase().replace(/^["']|["']$/g, '').trim();
}

export function extractErrorString(error: any): string | null {
  if (!error) return null;

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      if (data.detail && typeof data.detail === 'string') return data.detail;
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.error && typeof data.error === 'string') return data.error;
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const first = data[keys[0]];
        if (Array.isArray(first) && first.length > 0) return String(first[0]);
        if (typeof first === 'string') return first;
      }
    }
  }

  if (error.message) {
    if (error.message === 'Network Error' || error.message.includes('Network request failed')) {
      return '__network_error__';
    }
    return error.message;
  }

  return null;
}

export function toUserFriendlyError(error: any, t: TFunction): string {
  const raw = extractErrorString(error);
  if (!raw) return t('verify_info');

  if (raw === '__network_error__') {
    return t('server_error');
  }

  const normalized = normalizeMessage(raw);
  const key = knownErrors[normalized];
  if (key) return t(key);

  return t('verify_info');
}
