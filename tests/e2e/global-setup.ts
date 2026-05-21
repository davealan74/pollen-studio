import { startMockPollinations } from '../mock-pollinations/server';

export default async function globalSetup() {
  const svr = await startMockPollinations(4180);
  (globalThis as Record<string, unknown>).__POLLEN_MOCK__ = svr;
  return async () => {
    await svr.close();
  };
}
