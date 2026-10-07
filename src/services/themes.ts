import * as fs from 'fs';
import * as path from 'path';

// Temas = archivos CSS en /themes (raíz del proyecto, desde src/services o dist-server/services).
// /themes/custom es para temas propios de cada instalación (ignorados por git): se busca ahí
// primero, así que un tema custom con el mismo nombre que uno incluido lo reemplaza.
// Se leen en cada request: agregar un tema es soltar un .css, sin reiniciar.
const THEMES_DIR = path.resolve(__dirname, '../../themes');
const CUSTOM_THEMES_DIR = path.join(THEMES_DIR, 'custom');
const SEARCH_DIRS = [CUSTOM_THEMES_DIR, THEMES_DIR];

export const DEFAULT_THEME = 'default';

// Solo nombres simples: el nombre viene del payload y termina en una ruta de archivo.
const THEME_NAME = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

const themesIn = (dir: string): string[] => {
    try {
        return fs.readdirSync(dir)
            .filter((file) => file.endsWith('.css'))
            .map((file) => file.slice(0, -'.css'.length))
            .filter((name) => THEME_NAME.test(name));
    } catch {
        return [];
    }
};

/** Ruta del archivo del tema: primero en /themes/custom, luego en /themes. */
const themePath = (name: string): string | null => {
    if (!THEME_NAME.test(name)) return null;
    for (const dir of SEARCH_DIRS) {
        const file = path.join(dir, `${name}.css`);
        if (fs.existsSync(file)) return file;
    }

    return null;
};

export const listThemes = (): string[] =>
    [...new Set(SEARCH_DIRS.flatMap(themesIn))]
        .sort((a, b) => (a === DEFAULT_THEME ? -1 : b === DEFAULT_THEME ? 1 : a.localeCompare(b)));

export const isValidTheme = (name: string): boolean => themePath(name) !== null;

/**
 * CSS a inyectar en la página: siempre el tema `default` como base y, encima, el tema pedido.
 * Así un tema solo necesita declarar lo que cambia.
 */
export const loadThemeCss = (name: string = DEFAULT_THEME): string => {
    const read = (theme: string) => fs.readFileSync(themePath(theme) as string, 'utf8');
    const base = read(DEFAULT_THEME);

    if (name === DEFAULT_THEME || !isValidTheme(name)) return base;

    return `${base}\n\n/* ---- theme: ${name} ---- */\n${read(name)}`;
};
