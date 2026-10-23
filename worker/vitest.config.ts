import { defineConfig } from 'vitest/config';

// Mirrors wrangler's Text rule: .md files import as strings.
export default defineConfig({
  plugins: [{
    name: 'markdown-as-text',
    transform(code, id) {
      if (id.endsWith('.md')) return { code: `export default ${JSON.stringify(code)};`, map: null };
    },
  }],
});
