interface Settings {
  sessionOnlyKey: boolean;
  defaultImageModel: string;
  theme: 'dark' | 'light';
}
const KEY = 'pollen_studio.settings';

function load(): Settings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}
const defaults: Settings = { sessionOnlyKey: false, defaultImageModel: 'flux', theme: 'dark' };

export const settings = $state<Settings>(load());

export function updateSettings(patch: Partial<Settings>): void {
  Object.assign(settings, patch);
  localStorage.setItem(KEY, JSON.stringify(settings));
}
