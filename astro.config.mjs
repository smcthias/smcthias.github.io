import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // /go/* are short-link redirect pages (src/data/go-links.ts), not content.
  integrations: [sitemap({ filter: (page) => !page.includes('/go/') })],
  output: 'static',
  site: 'https://savelledesign.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
