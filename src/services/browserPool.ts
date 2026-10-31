import puppeteer, { Browser, BrowserContext } from 'puppeteer';

// Un solo Chromium compartido por todos los requests, en vez de lanzar uno por PDF (lanzarlo
// es lo que más memoria y tiempo cuesta). Cada request usa su propio BrowserContext (como una
// ventana privada): cookies, storage y caché aislados entre reportes.
//
// - PDF_CONCURRENCY: renders simultáneos (default 2). El resto espera en cola, así una ráfaga
//   de requests no agota la RAM.
// - PDF_BROWSER_IDLE_MS: tras este tiempo sin renders se cierra el navegador (default 60000),
//   para que el servidor ocioso no retenga la memoria de Chromium. 0 = no cerrarlo nunca.
// - PDF_BROWSER_MAX_RENDERS: se relanza tras N renders (default 200), por si Chromium acumula
//   memoria con el tiempo.
const CONCURRENCY = Math.max(1, Number(process.env.PDF_CONCURRENCY) || 2);
const IDLE_MS = Number(process.env.PDF_BROWSER_IDLE_MS ?? 60_000);
const MAX_RENDERS = Math.max(1, Number(process.env.PDF_BROWSER_MAX_RENDERS) || 200);

const LAUNCH_ARGS = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--allow-file-access-from-files',
    '--enable-local-file-accesses',
    // /dev/shm suele ser de 64 MB en Docker: Chromium usa /tmp en su lugar y no se cae.
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--mute-audio',
    '--no-first-run',
];

let browserPromise: Promise<Browser> | null = null;
let renders = 0;
let active = 0;
let idleTimer: NodeJS.Timeout | null = null;
const queue: Array<() => void> = [];

const launch = (): Promise<Browser> => {
    const launching = puppeteer
        // 'shell' = chrome-headless-shell: el Chromium sin interfaz, más liviano que el completo.
        // Señales desactivadas: el apagado lo maneja server.ts (ver closeBrowserPool). Con los
        // handlers de Puppeteer, un SIGTERM cerraba Chromium pero el proceso de Node seguía vivo.
        .launch({ headless: 'shell', args: LAUNCH_ARGS, handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false })
        .then((browser) => {
            // Si Chromium muere (crash, OOM), el próximo request lanza uno nuevo.
            browser.once('disconnected', () => {
                if (browserPromise === launching) browserPromise = null;
            });
            return browser;
        })
        .catch((error) => {
            browserPromise = null;
            throw error;
        });

    return launching;
};

const closeBrowser = async () => {
    const current = browserPromise;
    browserPromise = null;
    renders = 0;
    if (current) await current.then((b) => b.close()).catch(() => {});
};

const getBrowser = (): Promise<Browser> => (browserPromise ??= launch());

const acquireSlot = (): Promise<void> => {
    if (active < CONCURRENCY) {
        active++;
        return Promise.resolve();
    }
    return new Promise((resolve) => queue.push(() => { active++; resolve(); }));
};

const releaseSlot = () => {
    active--;
    queue.shift()?.();

    if (active === 0 && queue.length === 0) {
        // Relanzar tras MAX_RENDERS solo cuando no hay renders en curso.
        if (renders >= MAX_RENDERS) void closeBrowser();
        else if (IDLE_MS > 0) {
            idleTimer = setTimeout(() => void closeBrowser(), IDLE_MS);
            idleTimer.unref();
        }
    }
};

/** Cierra el navegador compartido (apagado del servidor). */
export const closeBrowserPool = closeBrowser;

/** Corre `fn` con un contexto aislado del navegador compartido, respetando la concurrencia. */
export const withBrowserContext = async <T>(fn: (context: BrowserContext) => Promise<T>): Promise<T> => {
    await acquireSlot();
    if (idleTimer) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }

    let context: BrowserContext | null = null;
    try {
        context = await (await getBrowser()).createBrowserContext();
        renders++;
        return await fn(context);
    } finally {
        await context?.close().catch(() => {});
        releaseSlot();
    }
};
