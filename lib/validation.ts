import { z } from 'zod';
export const listingSchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(20).max(5000),
  categoryId: z.string().min(1),
  subcategory: z.string().default(''),
  condition: z.enum(['New', 'Like new', 'Very good', 'Good']),
  brand: z.string().min(1),
  model: z.string().default(''),
  price: z.number().int().min(100).max(100000000),
  quantity: z.number().int().min(1).max(100),
  location: z.string().min(2),
  delivery: z.boolean(),
  pickup: z.boolean(),
  listingType: z.enum(['Fixed price', 'Auction']),
  allowOffers: z.boolean(),
  image: z
    .string()
    .url()
    .refine((v) => v.startsWith('https://images.unsplash.com/'), 'Use an Unsplash image URL'),
  duration: z.number().int().min(1).max(30).default(7),
  minimumBid: z.number().int().min(100).default(500),
  specifications: z
    .string()
    .max(5000)
    .refine((value) => {
      try {
        const data = JSON.parse(value);
        return (
          data !== null &&
          !Array.isArray(data) &&
          typeof data === 'object' &&
          Object.values(data).every((v) => typeof v === 'string')
        );
      } catch {
        return false;
      }
    }, 'Specifications must be a JSON object of text values')
    .default('{}'),
});
export const addressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  company: z.string().optional(),
  street: z.string().min(3),
  apartment: z.string().optional(),
  postalCode: z.string().min(3),
  city: z.string().min(2),
  state: z.string().optional(),
  country: z.string().min(2),
  phone: z.string().min(7),
  delivery: z.enum(['shipping', 'pickup']),
  payment: z.enum(['Card', 'TWINT', 'PayPal']),
  promo: z.string().optional(),
});
export const registrationSchema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.email(),
    password: z.string().min(10),
    confirmPassword: z.string(),
    terms: z.boolean().refine(Boolean, 'Please accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });
