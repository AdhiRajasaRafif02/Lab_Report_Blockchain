export const logger = {
  info: (message: string, payload?: unknown) => {
    if (payload) {
      console.log(`[INFO] ${message}`, payload);
      return;
    }
    console.log(`[INFO] ${message}`);
  },
  error: (message: string, payload?: unknown) => {
    if (payload) {
      console.error(`[ERROR] ${message}`, payload);
      return;
    }
    console.error(`[ERROR] ${message}`);
  }
};
