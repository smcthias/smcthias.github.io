import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    thumbnail: z.string(),
    role: z.string(),
    timeline: z.string(),
    services: z.string(),
    brief: z.array(z.string()),
    results: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })),
    ctaHeading: z.string(),
    ctaDescription: z.string(),
    images: z.object({
      hero: z.string(),
      detail1: z.string(),
      detail2: z.string(),
      detail3: z.string(),
    }),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('Savelle Design'),
    category: z.string(),
    tags: z.array(z.string()),
    image: z.string(),
    imageAlt: z.string(),
  }),
});

export const collections = {
  projects: projectsCollection,
  blog: blogCollection,
};
