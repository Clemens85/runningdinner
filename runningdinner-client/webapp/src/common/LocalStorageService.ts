export function getLocalStorageItem<T>(key: string): T | undefined {
  let item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  }
  return undefined;
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

export function deleteLocalStorageInAdminId(key: string, adminId: string) {
  const itemKey = calculateKeyForAdminId(key, adminId);
  if (localStorage.getItem(itemKey)) {
    localStorage.removeItem(itemKey);
  }
}

function calculateKeyForAdminId(key: string, adminId: string) {
  return `${key}_${adminId}`;
}