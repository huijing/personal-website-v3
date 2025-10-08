import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: () =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      og_image: z.string().optional(),
      description: z.string().optional(),
      hastweet: z.boolean().default(false),
      hascaniuse: z.boolean().default(false),
      hascodepen: z.boolean().default(false),
      project: z.string().optional(),
      project_image: z.string().optional(),
      external_url: z.string().url().optional(),
      external_site: z.string().optional(),
      nofeed: z.boolean().default(false),
      noindex: z.boolean().default(false),
      draft: z.boolean().optional(),
    }),
});

export const collections = { blog };
