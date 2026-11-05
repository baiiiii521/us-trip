import { defineConfig } from 'vite';

// 相对路径部署：Vercel、GitHub Pages 子路径、本地直接打开 dist 都能用
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
});
