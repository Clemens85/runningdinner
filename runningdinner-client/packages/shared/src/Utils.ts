export function isStringEmpty(s: string | undefined) {
  return !s || s.length === 0;
}

export function isArrayNotEmpty(arr: any) {
  return arr && arr.length > 0;
}

export function isArrayEmpty(arr: any) {
  return !isArrayNotEmpty(arr);
}
