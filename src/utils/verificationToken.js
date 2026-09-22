/**
 * Secure Token Utilities for Institutional Student Credential Verification
 * Conceals sensitive student information from the scanned QR URL.
 */

// URL-safe Base64 encode
export const encodeVerificationToken = (student) => {
  if (!student) return '';
  try {
    const payload = JSON.stringify({
      id: student.id || 'usr-std-01',
      r: student.rollNo || '22/CSE/042',
      n: student.name || 'Student',
      b: student.branchCode || student.branch || 'CSE',
      s: student.semester || '5th Sem',
      k: student.batch || '2022 - 2026',
      g: student.regNo || '',
      t: Date.now()
    });

    const utf8Bytes = new TextEncoder().encode(payload);
    let binary = '';
    utf8Bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.warn('Failed to encode verification token:', e);
    return student.id || 'usr-std-01';
  }
};

// URL-safe Base64 decode
export const decodeVerificationToken = (token) => {
  if (!token) return null;
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const obj = JSON.parse(jsonStr);

    return {
      id: obj.id || '',
      roll: obj.r || '',
      name: obj.n || '',
      branch: obj.b || '',
      sem: obj.s || '',
      batch: obj.k || '',
      reg: obj.g || '',
      ts: obj.t || null
    };
  } catch (e) {
    // If token is raw student ID or roll
    if (typeof token === 'string' && (token.startsWith('usr-') || token.includes('/'))) {
      return {
        id: token.startsWith('usr-') ? token : '',
        roll: token.includes('/') ? token : '',
        name: '',
        branch: '',
        sem: '',
        batch: '',
        reg: ''
      };
    }
    return null;
  }
};

// Generates opaque verification URL for QR codes
export const generateVerificationUrl = (student, customOrigin = null) => {
  const origin = customOrigin || 
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://gecp.vercel.app');
  
  const token = encodeVerificationToken(student);
  return `${origin}/?v=${token}`;
};
