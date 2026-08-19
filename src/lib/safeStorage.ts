/**
 * iOS Safari (Özel Dolaşım / Çerez Kısıtlamaları) ve SSR uyumlu güvenli depolama yardımcısı.
 * 
 * iOS Safari'de çerezler engellendiğinde veya gizli moddayken
 * localStorage / sessionStorage çağrıları SecurityError fırlatarak sayfanın çökmesine yol açar.
 * Bu yardımcı, hatayı yakalayarak bellek içi (in-memory) yedekleme ile sessizce çalışmaya devam eder.
 */

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryLocalStorage.getItem(key);
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      memoryLocalStorage.setItem(key, value);
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryLocalStorage.removeItem(key);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.clear();
    } catch {
      memoryLocalStorage.clear();
    }
  },
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return memorySessionStorage.getItem(key);
    }
  },

  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      memorySessionStorage.setItem(key, value);
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      memorySessionStorage.removeItem(key);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.clear();
    } catch {
      memorySessionStorage.clear();
    }
  },
};
