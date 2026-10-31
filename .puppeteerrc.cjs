// Puppeteer download config (read by `npm ci` / `npm install`).
// The app only launches chrome-headless-shell (headless: 'shell', see src/services/browserPool.ts),
// so the full Chrome (~370 MB) is not downloaded. On small servers this also avoids unpacking two
// browsers in parallel during install, which can run a 1 GB machine out of memory.
module.exports = {
    chrome: { skipDownload: true },
};
