import { createApp } from 'vue';
import Elements from './components/Elements.vue';
import './base.css';

// Define the window interface to include our data
declare global {
    interface Window {
        __PDF_ELEMENTS__: any[];
        __PDF_TAILWIND_CSS__?: string;
        __PDF_TITLE__?: string | null;
        RENDER_COMPLETE?: boolean;
    }
}

const elements = window.__PDF_ELEMENTS__ || [];

// Título del documento: metadato "Title" del PDF y `<span class="title">` en header/footer.
if (window.__PDF_TITLE__) document.title = window.__PDF_TITLE__;

// CSS de Tailwind para los elementos `html` (compilado en el servidor, ver services/tailwind.ts).
if (window.__PDF_TAILWIND_CSS__) {
    const style = document.createElement('style');
    style.textContent = window.__PDF_TAILWIND_CSS__;
    document.head.appendChild(style);
}

const app = createApp(Elements, { elements });

app.mount('#app');

// Signal completion effectively immediately after mount, 
// though charts might take a tick. 
// Elements.vue mounts ChartItem components. ChartItem calls renderChart() in onMounted.
// ECharts is synchronous in rendering unless animation is involved. We disabled animation.
// However, to be safe, we can set the flag after nextTick.

import { nextTick } from 'vue';
nextTick(() => {
    // In a real scenario, if charts loaded async data or images, we'd need to wait.
    // Here we assume synchronous data.
    setTimeout(() => {
        window.RENDER_COMPLETE = true;
    }, 100); 
});
