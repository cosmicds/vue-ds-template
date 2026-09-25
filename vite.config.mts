// Utilities
import { fileURLToPath, URL } from 'node:url'
import Vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// Plugins
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
    }),
  ],
  optimizeDeps: {
    exclude: [
      'vuetify',
    ],
    // a yarn-linked package is not pre-bundled by default, so its UMD entry would be served raw
    include: [
      '@cosmicds/vue-toolkit',
    ],
  },
  define: { 'process.env': {} },
  
  json: {
    stringify: true,
  },
  resolve: {
    // https://vueschool.io/articles/vuejs-tutorials/import-aliases-in-vite/
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {},
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
      },
    },
  },
});
