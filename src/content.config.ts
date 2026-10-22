import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(), summary: z.string(), category: z.string(), stack: z.array(z.string()),
    repo: z.string().url(), demo: z.string().url().optional(), featured: z.boolean().default(true), order: z.number(), status: z.string().optional(),
    problem: z.string(), approach: z.string(), outcome: z.string()
  })
});
export const collections = { projects };
