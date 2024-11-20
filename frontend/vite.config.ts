import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import codegen from 'vite-plugin-graphql-codegen';
import dynamicImport from 'vite-plugin-dynamic-import';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import commonjs from 'vite-plugin-commonjs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  process.env = { ...process.env, ...env };

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react(),
      codegen({ matchOnSchemas: true, debug: true, throwOnBuild: false }),
      dynamicImport(),
      chunkSplitPlugin({
        strategy: 'single-vendor',
        customChunk(context) {
          const { file } = context;
          console.log({ file });

          return undefined;
        },
        customSplitting: {
          tanstack: [/@tanstack/],
          'date-fns': [/date-fns/],
          'framer-motion': [/framer-motion/],
          'lucide-react': [/lucide-react/],
          'react-number-format': [/react-number-format/],
          'react-phone-number-input': [
            /react-phone-number-input/,
            /libphonenumber-js/,
          ],
          'react-waypoint': [/react-waypoint/],
          'react-error-boundary': [/react-error-boundary/],
          recharts: [/recharts/],
          graphql: [/graphql/],
          'graphql-request': [/graphql-request/],
          sonner: [/sonner/],
          'next-themes': [/next-themes/],
          zod: [/zod/],
          vendor: [/node_modules/],
        },
      }),
      commonjs(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'tailwind-config': path.resolve(__dirname, './tailwind.config.js'),
      },
    },
    server: {
      host: true,
      port: 5174,
      strictPort: true,
      hmr: {
        clientPort: 5174,
        port: 5174,
      },
      proxy: {
        '/graphql': {
          target: 'http://localhost:80',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://localhost:80',
          changeOrigin: true,
        },
        '/assets': {
          target: 'http://localhost:80',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['tailwind-config'],
    },
    build: {
      minify: true,
      cssCodeSplit: true,
      rollupOptions: {
        input: './index.html',
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
