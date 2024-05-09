export function deepClone(value: any) {
  if (Array.isArray(value)) {
    return value.map(deepClone);
  } else if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, deepClone(value)]));
  } else {
    return value;
  }
}
