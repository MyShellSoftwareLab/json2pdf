// pm2 config — `npm run build` first, then `pm2 start ecosystem.config.js`.
module.exports = {
    apps: [
        {
            name: 'json2pdf',
            script: 'dist-server/server.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            // Cada PDF abre su propio Chromium; reinicia si la memoria se dispara.
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 8003,
            },
        },
    ],
};
