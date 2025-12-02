export function getLocalStorageItem<T>(key: string): T | undefined {
  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item, dateReviver);
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

export function getPublicEventRegistrationsFromLocalStorage() {
  const result = new Array<string>();
  Object.keys(localStorage).forEach((key: string) => {
    if (key.startsWith('registration_')) {
      const publicEventId = key.split('_')[1];
      result.push(publicEventId);
    }
  });
  return result;
}

export function setPublicEventRegistrationInLocalStorage(publicEventId: string, registrationData: unknown) {
  setLocalStorageItem(`registration_${publicEventId}`, registrationData);
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

export function deleteLocalStorageByPrefix(prefix: string) {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function calculateKeyForAdminId(key: string, adminId: string) {
  return `${key}_${adminId}`;
}

function dateReviver(_key: string, value: any) {
  // Check if value is a string and matches ISO date format
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return value;
}
