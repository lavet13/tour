// vite.config.ts
import { defineConfig } from "file:///E:/web-dev/donbass-tour/backend/node_modules/vite/dist/node/index.js";
import { VitePluginNode } from "file:///E:/web-dev/donbass-tour/backend/node_modules/vite-plugin-node/dist/index.js";
import codegen from "file:///E:/web-dev/donbass-tour/backend/node_modules/vite-plugin-graphql-codegen/dist/index.mjs";
import topLevelAwait from "file:///E:/web-dev/donbass-tour/backend/node_modules/vite-plugin-top-level-await/exports/import.mjs";
import dynamicImport from "file:///E:/web-dev/donbass-tour/backend/node_modules/vite-plugin-dynamic-import/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "E:\\web-dev\\donbass-tour\\backend";
var vite_config_default = defineConfig({
  server: {
    port: 4e3,
    strictPort: true,
    host: true
    // needed for the Docker Container port mapping to work
    // open: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    minify: true,
    ssrManifest: true,
    manifest: true,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `chunks/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  plugins: [
    ...VitePluginNode({
      adapter: "express",
      appPath: "./src/main.ts",
      tsCompiler: "swc"
    }),
    codegen({
      matchOnSchemas: true,
      debug: true
    }),
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`
    }),
    dynamicImport()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx3ZWItZGV2XFxcXGRvbmJhc3MtdG91clxcXFxiYWNrZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx3ZWItZGV2XFxcXGRvbmJhc3MtdG91clxcXFxiYWNrZW5kXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi93ZWItZGV2L2RvbmJhc3MtdG91ci9iYWNrZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB7IFZpdGVQbHVnaW5Ob2RlIH0gZnJvbSAndml0ZS1wbHVnaW4tbm9kZSc7XHJcbmltcG9ydCBjb2RlZ2VuIGZyb20gJ3ZpdGUtcGx1Z2luLWdyYXBocWwtY29kZWdlbic7XHJcbmltcG9ydCB0b3BMZXZlbEF3YWl0IGZyb20gJ3ZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdCc7XHJcbmltcG9ydCBkeW5hbWljSW1wb3J0IGZyb20gJ3ZpdGUtcGx1Z2luLWR5bmFtaWMtaW1wb3J0JztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogNDAwMCxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBob3N0OiB0cnVlLCAvLyBuZWVkZWQgZm9yIHRoZSBEb2NrZXIgQ29udGFpbmVyIHBvcnQgbWFwcGluZyB0byB3b3JrXHJcbiAgICAvLyBvcGVuOiB0cnVlLFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgc3NyTWFuaWZlc3Q6IHRydWUsXHJcbiAgICBtYW5pZmVzdDogdHJ1ZSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IGBbbmFtZV0uanNgLFxyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiBgY2h1bmtzL1tuYW1lXS5qc2AsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IGBhc3NldHMvW25hbWVdLltleHRdYCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICAuLi5WaXRlUGx1Z2luTm9kZSh7XHJcbiAgICAgIGFkYXB0ZXI6ICdleHByZXNzJyxcclxuICAgICAgYXBwUGF0aDogJy4vc3JjL21haW4udHMnLFxyXG4gICAgICB0c0NvbXBpbGVyOiAnc3djJyxcclxuICAgIH0pLFxyXG4gICAgY29kZWdlbih7XHJcbiAgICAgIG1hdGNoT25TY2hlbWFzOiB0cnVlLFxyXG4gICAgICBkZWJ1ZzogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgdG9wTGV2ZWxBd2FpdCh7XHJcbiAgICAgIHByb21pc2VFeHBvcnROYW1lOiAnX190bGEnLFxyXG4gICAgICBwcm9taXNlSW1wb3J0TmFtZTogaSA9PiBgX190bGFfJHtpfWAsXHJcbiAgICB9KSxcclxuICAgIGR5bmFtaWNJbXBvcnQoKSxcclxuICBdLFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UixTQUFTLG9CQUFvQjtBQUNwVCxTQUFTLHNCQUFzQjtBQUMvQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxVQUFVO0FBTGpCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE1BQU07QUFBQTtBQUFBO0FBQUEsRUFFUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsVUFBVTtBQUFBLElBQ1YsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsR0FBRyxlQUFlO0FBQUEsTUFDaEIsU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLE1BQ1QsWUFBWTtBQUFBLElBQ2QsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLE1BQ04sZ0JBQWdCO0FBQUEsTUFDaEIsT0FBTztBQUFBLElBQ1QsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLE1BQ1osbUJBQW1CO0FBQUEsTUFDbkIsbUJBQW1CLE9BQUssU0FBUyxDQUFDO0FBQUEsSUFDcEMsQ0FBQztBQUFBLElBQ0QsY0FBYztBQUFBLEVBQ2hCO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
