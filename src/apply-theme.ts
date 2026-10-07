// Inyecta el CSS del tema (window.__PDF_THEME_CSS__, ver services/themes.ts) ANTES de que se
// evalúe theme.ts: render-app.ts importa este módulo primero, y theme.ts lee los tokens como
// variables CSS en el momento en que carga. Además de tokens, el tema puede traer reglas CSS
// que pisan estilos de los elementos; como este <style> va al final del <head>, gana sobre el
// CSS de los componentes a igual especificidad.
declare global {
    interface Window {
        __PDF_THEME_CSS__?: string;
    }
}

if (typeof window !== 'undefined' && window.__PDF_THEME_CSS__) {
    const style = document.createElement('style');
    style.id = 'pdf-theme';
    style.textContent = window.__PDF_THEME_CSS__;
    document.head.appendChild(style);
}

export {};
