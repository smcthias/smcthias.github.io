import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  integrations: [sitemap()],
  output: 'static',
  site: 'https://savelledesign.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
