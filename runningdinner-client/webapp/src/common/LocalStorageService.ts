export function getLocalStorageItem<T>(key: string): T | undefined {
  let item = localStorage.getItem(key);
  return item ? JSON.parse(item) : item;
}

export function setLocalStorageItem(key: string, value: unknown) {
  if (value === null || value === undefined) {
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalStorageInAdminId<T>(key: string, adminId: string): T | undefined {
  return getLocalStorageItem(calculateKeyForAdminId(key, adminId));
}

export function setLocalStorageInAdminId(key: string, value: unknown, adminId: string) {
  setLocalStorageItem(calculateKeyForAdminId(key, adminId), value);
}

function calculateKeyForAdminId(key: string, adminId: string) {
  return `${key}_${adminId}`;
}