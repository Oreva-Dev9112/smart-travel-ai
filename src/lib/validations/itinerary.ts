import { z } from 'zod';

export const itinerarySchema = z.object({
  destination: z.string().min(1, 'Destination is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  travelers: z.number().int().min(1, 'At least 1 traveler is required'),
  travelStyle: z.array(z.string()).min(1, 'At least one travel style is required'),
  accommodationType: z.array(z.string()).min(1, 'At least one accommodation type is required'),
  activities: z.array(z.string()).min(1, 'At least one activity is required'),
  transport: z.array(z.string()).min(1, 'At least one transport option is required'),
  budget: z.number().positive('Budget must be positive'),
  specialRequests: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type ItineraryRequest = z.infer<typeof itinerarySchema>; 