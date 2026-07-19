import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Web Component build: bundles React, ReactDOM, and @asyncapi/parser directly
// (unlike vite.config.ts, nothing is externalized here) so the output works
// standalone from a plain <script> tag with no consumer-side install step.
// inlineDynamicImports is required for the iife output (Rollup can't emit
// lazy chunks in iife format); applied to both formats for one consistent,
// self-contained bundle rather than branching behavior per format.
export default defineConfig({
  plugins: [react()],
  // React/ReactDOM reference process.env.NODE_ENV internally. The main build
  // externalizes react/react-dom so this never surfaces there; here they're
  // bundled directly, and the browser has no `process` global to resolve it.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: 'src/web-components/index.ts',
      name: 'ApiUIKitWebComponents',
      formats: ['es', 'iife'],
      fileName: (format) => `apiuikit-wc.${format === 'es' ? 'es' : 'iife'}.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) =>
          assetInfo.names?.[0]?.endsWith('.css') ? 'apiuikit-wc.css' : 'assets/[name]-[hash][extname]',
      },
    },
  },
})
