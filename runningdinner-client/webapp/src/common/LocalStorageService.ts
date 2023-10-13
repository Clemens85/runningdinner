export function getLocalStorageItem<T>(key: string): T | undefined {
  let item = localStorage.getItem(key);
  return item ? JSON.parse(item) : item;
}

export function setLocalStorageItem(key: string, value: unknown) {
  if (!value) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}