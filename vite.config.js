import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  server: {
    port: 5000
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './server.js',
      exportName: 'app',
      tsCompiler: 'esbuild'
    })
  ],
  optimizeDeps: {
    exclude: ['fsevents']
  }
});