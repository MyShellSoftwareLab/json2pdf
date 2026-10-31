import app from './app';
import { closeBrowserPool } from './services/browserPool';
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Apagado ordenado (pm2 reload/stop, Ctrl+C): deja de aceptar requests, cierra el Chromium
// compartido y sale. Sin esto el proceso no terminaba mientras el navegador seguía abierto.
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  server.close();
  // Si algo se cuelga, salir igual antes de que el gestor de procesos lo mate a la fuerza.
  setTimeout(() => process.exit(1), 10_000).unref();
  closeBrowserPool().finally(() => process.exit(0));
};

['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((signal) => process.once(signal, () => shutdown(signal)));
