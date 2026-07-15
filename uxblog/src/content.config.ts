import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/case-studies' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    project: z.string(),
    year: z.number(),
    objectives: z.string(),
    description: z.string(),
    result: z.string(),
    thumbnail: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    publishDate: z.coerce.date(),
    projectUrl: z.string().optional(),
    role: z.string().optional(),
    scope: z.string().optional(),
    yearEnd: z.number().optional(),
    media: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    homepageFeatured: z.boolean().default(false),
    homepageOrder: z.number().optional(),
    outcomes: z.array(z.object({ stat: z.string(), label: z.string() })).optional(),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    /** Topic cluster this article belongs to (e.g. "clarity-sells"). */
    cluster: z.string().optional(),
    /** Pillar articles are featured at the top of the listing. */
    pillar: z.boolean().default(false),
    /** Drafts are excluded from the listing, routes, and sitemap. */
    draft: z.boolean().default(false),
    /** Hero image — rendered under the header and used as the OG/social image. */
    hero: z.object({ src: z.string(), alt: z.string() }).optional(),
    /** Article-specific closing CTA. Falls back to a generic contact CTA when omitted. */
    cta: z
      .object({
        heading: z.string(),
        text: z.string(),
        button: z.string(),
        href: z.string(),
      })
      .optional(),
  }),
});

export const collections = {
  'case-studies': caseStudies,
  insights,
};
