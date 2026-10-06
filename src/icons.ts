// =============================================================================
// Íconos — paths extraídos literal de `lucide-vue-next` (viewBox 24x24, stroke-only) para
// que el ícono sea el mismo trazo que usa el web, no una recreación a mano.
// =============================================================================

export interface IconDef {
    paths: string[];
    color: string;
}

export const buildDataUri = (def: IconDef | undefined, overrideColor?: string): string | null => {
    if (!def) return null;

    const color = overrideColor ?? def.color;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${def.paths.join('')}</svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// =============================================================================
// Íconos por dimensión (lucide-vue-next: Target/TrendingUp/Rocket/Laptop/Cpu/Heart/Zap/
// AlertTriangle).
//
// Compartido entre el radar (chartOptionBuilders.ts, vía rich-text de ECharts) y las
// celdas de tabla con ícono+texto (RichText.vue, vía <img> normal).
// =============================================================================
export const DIMENSION_ICONS: Record<string, IconDef> = {
    skills: {
        paths: ['<circle cx="12" cy="12" r="10"/>', '<circle cx="12" cy="12" r="6"/>', '<circle cx="12" cy="12" r="2"/>'],
        color: '#3b82f6', // text-blue-500
    },
    performance: {
        paths: ['<path d="M16 7h6v6"/>', '<path d="m22 7-8.5 8.5-5-5L2 17"/>'],
        color: '#10b981', // text-emerald-500
    },
    growth_potential: {
        paths: [
            '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>',
            '<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
            '<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>',
            '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
        ],
        color: '#a855f7', // text-purple-500
    },
    digital_competency: {
        paths: [
            '<path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/>',
            '<path d="M20.054 15.987H3.946"/>',
        ],
        color: '#14b8a6', // text-teal-500
    },
    automation_potential: {
        paths: [
            '<path d="M12 20v2"/>', '<path d="M12 2v2"/>', '<path d="M17 20v2"/>', '<path d="M17 2v2"/>',
            '<path d="M2 12h2"/>', '<path d="M2 17h2"/>', '<path d="M2 7h2"/>',
            '<path d="M20 12h2"/>', '<path d="M20 17h2"/>', '<path d="M20 7h2"/>',
            '<path d="M7 20v2"/>', '<path d="M7 2v2"/>',
            '<rect x="4" y="4" width="16" height="16" rx="2"/>', '<rect x="8" y="8" width="8" height="8" rx="1"/>',
        ],
        color: '#f97316', // text-orange-500
    },
    culture_engagement: {
        paths: [
            '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
        ],
        color: '#ec4899', // text-pink-500
    },
    capacity: {
        paths: [
            '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
        ],
        color: '#f59e0b', // text-amber-500
    },
    risk: {
        paths: [
            '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>',
            '<path d="M12 9v4"/>',
            '<path d="M12 17h.01"/>',
        ],
        color: '#ef4444', // text-red-500
    },
};

export const dimensionIconDataUri = (key: string): string | null => buildDataUri(DIMENSION_ICONS[key]);

// =============================================================================
// Íconos de "Alertas Activas" — por `tipo` de alerta: un set fijo y conocido de 5 tipos, igual
// de estable que las 8 dimensiones — mismo criterio de mapeo 1:1 por clave.
// =============================================================================
export const ALERT_ICONS: Record<string, IconDef> = {
    fuga_clave: {
        // LogOut — puerta abierta con flecha de salida, coincide con la imagen de referencia.
        paths: [
            '<path d="m16 17 5-5-5-5"/>',
            '<path d="M21 12H9"/>',
            '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
        ],
        color: '#f97316', // orange-500
    },
    burnout: {
        paths: [
            '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>',
        ],
        color: '#ef4444', // red-500
    },
    potencial_atrapado: {
        paths: [
            '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/>',
            '<path d="M12 9v4"/>',
            '<path d="M12 17h.01"/>',
        ],
        color: '#f59e0b', // amber-500
    },
    obsolescencia: {
        paths: ['<path d="M16 17h6v-6"/>', '<path d="m22 17-8.5-8.5-5 5L2 7"/>'],
        color: '#ef4444', // red-500
    },
    lobo_solitario: {
        paths: [
            '<path d="M2 21a8 8 0 0 1 11.873-7"/>',
            '<circle cx="10" cy="8" r="5"/>',
            '<path d="m17 17 5 5"/>',
            '<path d="m22 17-5 5"/>',
        ],
        color: '#8b5cf6', // violet-500
    },
};

export const alertIconDataUri = (tipo: string): string | null => buildDataUri(ALERT_ICONS[tipo]);

// Fondo pastel de la insignia de cada dimensión (Table "Detalle por Dimensión") — tono -100
// de la misma familia Tailwind que el color -500 del ícono en DIMENSION_ICONS, para que
// insignia + ícono se vean como el mismo par de color (mismo criterio que HEATMAP_*_BG/TEXT
// en theme.ts: fondo claro + trazo/texto oscuro de la misma familia).
export const DIMENSION_BADGE_BG: Record<string, string> = {
    skills: '#DBEAFE', // blue-100
    performance: '#D1FAE5', // emerald-100
    growth_potential: '#F3E8FF', // purple-100
    digital_competency: '#CCFBF1', // teal-100
    automation_potential: '#FFEDD5', // orange-100
    culture_engagement: '#FCE7F3', // pink-100
    capacity: '#FEF3C7', // amber-100
    risk: '#FEE2E2', // red-100
};

export const dimensionBadgeBg = (key: string): string => DIMENSION_BADGE_BG[key] ?? '#F9FAFB';

// =============================================================================
// Íconos por departamento — best-effort. A diferencia de las 8 dimensiones (un set fijo),
// el nombre de un departamento es libre por cliente (viene de su propio organigrama), así
// que no hay un mapeo 1:1 confiable. Este set solo cubre nombres comunes en español; lo que
// no matchee cae al ícono genérico (`generic`, un edificio). Quien genera el payload hace el
// match por palabra clave y manda la clave ya resuelta en `iconKey`.
// =============================================================================
export const DEPARTMENT_ICONS: Record<string, IconDef> = {
    marketing: {
        paths: [
            '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>',
            '<path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>',
            '<path d="M8 6v8"/>',
        ],
        color: '#a855f7', // purple-500
    },
    ventas: {
        paths: ['<path d="M16 7h6v6"/>', '<path d="m22 7-8.5 8.5-5-5L2 17"/>'],
        color: '#3b82f6', // blue-500
    },
    finanzas: {
        paths: [
            '<circle cx="12" cy="12" r="10"/>',
            '<path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>',
            '<path d="M12 18V6"/>',
        ],
        color: '#10b981', // emerald-500
    },
    administracion: {
        paths: [
            '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
            '<rect width="20" height="14" x="2" y="6" rx="2"/>',
        ],
        color: '#8b5cf6', // violet-500
    },
    operaciones: {
        paths: [
            '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/>',
            '<circle cx="12" cy="12" r="3"/>',
        ],
        color: '#f97316', // orange-500
    },
    rrhh: {
        paths: [
            '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>',
            '<path d="M16 3.128a4 4 0 0 1 0 7.744"/>',
            '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
            '<circle cx="9" cy="7" r="4"/>',
        ],
        color: '#ec4899', // pink-500
    },
    tecnologia: {
        paths: [
            '<path d="M12 20v2"/>', '<path d="M12 2v2"/>', '<path d="M17 20v2"/>', '<path d="M17 2v2"/>',
            '<path d="M2 12h2"/>', '<path d="M2 17h2"/>', '<path d="M2 7h2"/>',
            '<path d="M20 12h2"/>', '<path d="M20 17h2"/>', '<path d="M20 7h2"/>',
            '<path d="M7 20v2"/>', '<path d="M7 2v2"/>',
            '<rect x="4" y="4" width="16" height="16" rx="2"/>', '<rect x="8" y="8" width="8" height="8" rx="1"/>',
        ],
        color: '#14b8a6', // teal-500
    },
    legal: {
        paths: [
            '<path d="M12 3v18"/>',
            '<path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/>',
            '<path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/>',
            '<path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/>',
            '<path d="M7 21h10"/>',
        ],
        color: '#64748b', // slate-500
    },
    atencion: {
        paths: [
            '<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"/>',
            '<path d="M21 16v2a4 4 0 0 1-4 4h-5"/>',
        ],
        color: '#0ea5e9', // sky-500
    },
    logistica: {
        paths: [
            '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>',
            '<path d="M15 18H9"/>',
            '<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>',
            '<circle cx="17" cy="18" r="2"/>',
            '<circle cx="7" cy="18" r="2"/>',
        ],
        color: '#f59e0b', // amber-500
    },
    producto: {
        paths: [
            '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/>',
            '<path d="M12 22V12"/>',
            '<polyline points="3.29 7 12 12 20.71 7"/>',
            '<path d="m7.5 4.27 9 5.15"/>',
        ],
        color: '#6366f1', // indigo-500
    },
    generic: {
        paths: [
            '<path d="M10 12h4"/>', '<path d="M10 8h4"/>', '<path d="M14 21v-3a2 2 0 0 0-4 0v3"/>',
            '<path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/>',
            '<path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
        ],
        color: '#64748b', // slate-500
    },
};

export const departmentIconDataUri = (key: string): string | null => buildDataUri(DEPARTMENT_ICONS[key] ?? DEPARTMENT_ICONS.generic);

// Variante "monocromo" — mismo trazo del ícono de departamento, pero en un color forzado en
// vez del suyo propio (ver DEPARTMENT_ICONS arriba). La tabla "Departamentos" usa una sola
// insignia de color primario para todos los departamentos (no el multicolor por departamento
// que sí usa el gráfico de barras "Score por Departamento"), así que se reutiliza la misma forma sin
// duplicar el set de paths.
export const departmentIconMonoDataUri = (key: string, color: string): string | null =>
    buildDataUri(DEPARTMENT_ICONS[key] ?? DEPARTMENT_ICONS.generic, color);

// Ícono "Personas" (lucide Users, mismos paths que DEPARTMENT_ICONS.rrhh) para el header de
// la columna "Personas" de la tabla de departamentos — no está ligado a ningún departamento,
// así que no vive en DEPARTMENT_ICONS.
const USERS_ICON_PATHS = [
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>',
    '<path d="M16 3.128a4 4 0 0 1 0 7.744"/>',
    '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    '<circle cx="9" cy="7" r="4"/>',
];

export const peopleIconDataUri = (color: string): string | null => buildDataUri({ paths: USERS_ICON_PATHS, color });
