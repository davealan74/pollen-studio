interface Settings {
  sessionOnlyKey: boolean;
  defaultImageModel: string;
  theme: 'dark' | 'light';
}
const KEY = 'pollen_studio.settings';

const defaults: Settings = { sessionOnlyKey: false, defaultImageModel: 'flux', theme: 'dark' };

function load(): Settings {
  if (typeof localStorage === 'undefined') return { ...defaults };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return { ...defaults };
  }
}

export const settings = $state<Settings>(load());

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(settings, patch);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }
}
