/**
 * Simple cookie parser utility
 */

/**
 * Parse a cookie header string into an object
 * @param {string} cookieHeader - The Cookie header value
 * @returns {Object} Parsed cookies as key-value pairs
 */
export function parse(cookieHeader) {
  const cookies = {};

  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) {
      cookies[name] = rest.join('='); // Handle values with = in them
    }
  });

  return cookies;
}
