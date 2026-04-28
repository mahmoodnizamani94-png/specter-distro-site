import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://mahmoodnizamani94-png.github.io',
  base: '/specter-distro-site/',
  integrations: [
    react(),
  ],
});
