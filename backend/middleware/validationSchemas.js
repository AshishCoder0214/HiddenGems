import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const createGemSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
    category: z.enum(['Cafe', 'Park', 'Study', 'Viewpoint', 'Food', 'Photography'], {
      errorMap: () => ({ message: 'Category must be one of: Cafe, Park, Study, Viewpoint, Food, Photography' })
    }),
    coordinates: z.array(z.number()).length(2, 'Coordinates must be [Longitude, Latitude]').refine(coords => {
      const [lon, lat] = coords;
      return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
    }, { message: 'Longitude must be between -180 and 180, and Latitude between -90 and 90' }),
    costEstimate: z.number().int().min(1).max(3),
    crowdLevel: z.number().int().min(1).max(5),
    noiseLevel: z.number().int().min(1).max(5),
    safetyRating: z.number().min(1).max(5),
    wiFiAvailable: z.boolean().optional(),
    images: z.array(z.string().url('Invalid image URL format')).optional()
  })
});

// For pagination/search parameters
export const queryGemSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? Math.max(1, parseInt(val, 10)) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 10),
    sort: z.string().optional().default('-createdAt'),
    category: z.string().optional(),
    search: z.string().optional().transform(val => val ? val.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') : undefined), // Escaping regex characters (NoSQL protection)
    noise: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
    crowd: z.string().optional().transform(val => val ? parseInt(val, 10) : undefined),
    safety: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    lon: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    lat: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
    maxDistance: z.string().optional().transform(val => val ? parseFloat(val) : undefined)
  })
});
