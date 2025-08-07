import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { itinerarySchema } from './itinerary';

describe('Itinerary Form Validation', () => {
  it('should validate a complete and correct itinerary request', () => {
    const validRequest = {
      destination: "Paris, France",
      startDate: "2024-04-01",
      endDate: "2024-04-07",
      travelers: 2,
      travelStyle: ["cultural", "luxury"],
      activities: ["museums", "restaurants", "sightseeing"],
      budget: 5000,
      accommodationType: ["hotel"],
      transport: ["public transport", "walking"],
      specialRequests: "Interested in art and history"
    };

    const result = itinerarySchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid date range', () => {
    const invalidRequest = {
      destination: "Paris, France",
      startDate: "2024-04-07", // End date is before start date
      endDate: "2024-04-01",
      travelers: 2,
      travelStyle: ["cultural"],
      activities: ["museums"],
      budget: 5000,
      accommodationType: ["hotel"],
      transport: ["public transport"]
    };

    const result = itinerarySchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid number of travelers', () => {
    const invalidRequest = {
      destination: "Paris, France",
      startDate: "2024-04-01",
      endDate: "2024-04-07",
      travelers: 0, // Invalid number of travelers
      travelStyle: ["cultural"],
      activities: ["museums"],
      budget: 5000,
      accommodationType: ["hotel"],
      transport: ["public transport"]
    };

    const result = itinerarySchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});