import { z } from 'zod';

// Blog Post Validation Schema
export const blogPostSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  
  content: z.string()
    .min(1, 'Content is required'),
  
  excerpt: z.string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  category_id: z.number()
    .optional()
    .nullable(),
  
  status: z.enum(['draft', 'published'], {
    errorMap: () => ({ message: 'Status must be either draft or published' }),
  }),
  
  is_featured: z.boolean().optional().default(false),
  
  sticky_post: z.boolean().optional().default(false),
  
  meta_description: z.string()
    .max(160, 'Meta description must be less than 160 characters')
    .optional()
    .or(z.literal('')),
  
  keywords: z.string()
    .max(200, 'Keywords must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  
  tags: z.string()
    .optional()
    .or(z.literal('')),
  
  publish_date: z.string()
    .optional()
    .nullable(),
});

// Category Validation Schema
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(255, 'Category name must be less than 255 characters'),
  
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255, 'Slug must be less than 255 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
    .optional(),
});

// Type inference
// export type BlogPost = z.infer<typeof blogPostSchema>;
// export type Category = z.infer<typeof categorySchema>;
