import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://embelleze-bella.online/',
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [
    icon(),
    sitemap({
      customPages: [
        'https://embelleze-bella.online/',
        'https://embelleze-bella.online/cursos',
        'https://embelleze-bella.online/mapa',
        'https://embelleze-bella.online/obrigado',
        'https://embelleze-bella.online/oferta',
        'https://embelleze-bella.online/privacidade',
        'https://embelleze-bella.online/termos'
      ]
    })
  ],
});
