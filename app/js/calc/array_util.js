export function extractField(fieldName, arr) {
  return arr.map(el => el[fieldName]);
}
