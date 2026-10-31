// pm2 config — `npm run build` first, then `pm2 start ecosystem.config.js`.
module.exports = {
    apps: [
        {
            name: 'json2pdf',
            script: 'dist-server/server.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            // Esperar el apagado ordenado (cierra el Chromium compartido, ver server.ts).
            kill_timeout: 12000,
            env: {
                NODE_ENV: 'production',
                PORT: 8003,
                // PDF_CONCURRENCY: 2,        // renders simultáneos (ver README, "Tuning")
                // PDF_BROWSER_IDLE_MS: 60000,
            },
        },
    ],
};
