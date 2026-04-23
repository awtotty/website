// @ts-check
import { defineConfig } from 'astro/config';

function rehypeExternalLinks() {
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (
        typeof href === 'string' &&
        /^https?:\/\//.test(href) &&
        !href.startsWith('https://austin-totty.com')
      ) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    }
    node.children?.forEach(walk);
  };
  return walk;
}

// https://astro.build/config
export default defineConfig({
  site: 'https://austin-totty.com',
  markdown: {
    rehypePlugins: [rehypeExternalLinks],
  },
});
