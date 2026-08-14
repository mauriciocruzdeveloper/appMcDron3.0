export const buildListFilterStorageKey = (scope: string): string => `mcdron:list-filters:${scope}`;

export function getStoredListFilter<T>(scope: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(buildListFilterStorageKey(scope));
    if (!rawValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<T>;
    return {
      ...fallback,
      ...parsedValue,
    } as T;
  } catch {
    return fallback;
  }
}

export function saveStoredListFilter<T>(scope: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(buildListFilterStorageKey(scope), JSON.stringify(value));
  } catch {
    // Los filtros siguen funcionando en memoria si el almacenamiento está bloqueado o lleno.
  }
}

export function clearStoredListFilter(scope: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(buildListFilterStorageKey(scope));
  } catch {
    // El reset visual no debe fallar si el almacenamiento no está disponible.
  }
}
