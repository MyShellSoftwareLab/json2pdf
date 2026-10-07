import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/index.ts', 'src/components/**/*', 'src/types.ts', 'src/theme.ts', 'src/services/**/*', 'src/vue-shims.d.ts'],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: {
        'pdf-creator': path.resolve(__dirname, 'src/index.ts'),
        elements: path.resolve(__dirname, 'src/components/Elements.vue')
      },
      name: 'PdfCreator',
      fileName: (format, entryName) => `${entryName}.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'echarts'],
      output: {
        globals: {
          vue: 'Vue',
          echarts: 'echarts'
        }
      }
    }
  }
});
