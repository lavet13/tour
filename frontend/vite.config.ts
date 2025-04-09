import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import codegen from 'vite-plugin-graphql-codegen';
import dynamicImport from 'vite-plugin-dynamic-import';
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
        '/uploads': {
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
          manualChunks: {
            // Core React
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],

            // Radix UI components
            'radix-vendor': [
              '@radix-ui/react-accordion',
              '@radix-ui/react-avatar',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-hover-card',
              '@radix-ui/react-icons',
              '@radix-ui/react-label',
              '@radix-ui/react-menubar',
              '@radix-ui/react-navigation-menu',
              '@radix-ui/react-popover',
              '@radix-ui/react-progress',
              '@radix-ui/react-scroll-area',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-tooltip',
            ],

            // TanStack packages
            'tanstack-vendor': [
              '@tanstack/react-query',
              '@tanstack/react-query-devtools',
              '@tanstack/react-query-persist-client',
              '@tanstack/query-sync-storage-persister',
              '@tanstack/react-table',
              '@tanstack/react-virtual',
              '@tanstack/match-sorter-utils',
            ],

            // Form handling and validation
            'form-vendor': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod',
              'react-error-boundary',
            ],

            // Utility libraries
            'utility-vendor': [
              'lodash-es',
              'clsx',
              'date-fns',
              'class-variance-authority',
            ],

            // Animations and motion
            'animation-vendor': ['framer-motion', 'tailwindcss-animate'],

            // GraphQL-related libraries
            'graphql-vendor': ['graphql', 'graphql-request', 'graphql-sse'],

            // Miscellaneous
            'misc-vendor': [
              'jotai',
              'lucide-react',
              'input-otp',
              'cmdk',
              'vaul',
              'sonner',
              'react-cookie',
              'react-day-picker',
              'react-dropzone',
              'react-phone-number-input',
              'react-resizable-panels',
              'recharts',
              'next-themes',
            ],

            // Tailwind and styling
            'tailwind-vendor': ['tailwindcss', 'tailwind-merge'],
          },
        },
      },
    },
  };
});
