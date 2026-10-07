import * as fs from 'fs';
import * as path from 'path';

// Temas = archivos CSS en /themes (raíz del proyecto, desde src/services o dist-server/services).
// Se leen en cada request: agregar un tema es soltar un .css ahí, sin reiniciar.
const THEMES_DIR = path.resolve(__dirname, '../../themes');

export const DEFAULT_THEME = 'default';

// Solo nombres simples: el nombre viene del payload y termina en una ruta de archivo.
const THEME_NAME = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

export const listThemes = (): string[] => {
    try {
        return fs.readdirSync(THEMES_DIR)
            .filter((file) => file.endsWith('.css'))
            .map((file) => file.slice(0, -'.css'.length))
            .filter((name) => THEME_NAME.test(name))
            .sort((a, b) => (a === DEFAULT_THEME ? -1 : b === DEFAULT_THEME ? 1 : a.localeCompare(b)));
    } catch {
        return [];
    }
};

export const isValidTheme = (name: string): boolean => THEME_NAME.test(name) && listThemes().includes(name);

/**
 * CSS a inyectar en la página: siempre `default.css` como base y, encima, el tema pedido. Así
 * un tema solo necesita declarar lo que cambia.
 */
export const loadThemeCss = (name: string = DEFAULT_THEME): string => {
    const read = (theme: string) => fs.readFileSync(path.join(THEMES_DIR, `${theme}.css`), 'utf8');
    const base = read(DEFAULT_THEME);

    if (name === DEFAULT_THEME || !isValidTheme(name)) return base;

    return `${base}\n\n/* ---- theme: ${name} ---- */\n${read(name)}`;
};
