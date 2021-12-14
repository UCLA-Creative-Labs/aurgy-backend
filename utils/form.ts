/**
 * Convert an object to urlencoded form. Needed for Spotify API.
 *
 * Read more about data formats here:
 * https://medium.com/@rajajawahar77/content-type-x-www-form-urlencoded-form-data-and-json-e17c15926c69
 *
 * @param payload a single level object
 * @returns a url encoded version of the payload
 */
export function objectToForm(payload: Record<string, string>): string {
  const form = [];
  for (const key in payload) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(payload[key]);
    form.push(encodedKey + '=' + encodedValue);
  }
  return form.join('&');
}
