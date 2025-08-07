'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itinerarySchema, type ItineraryRequest } from '@/lib/validations/itinerary';
import type { ItineraryResponse } from '@/lib/types/itinerary';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Banknote, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ItineraryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Wait until the component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ItineraryRequest>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: {
      destination: '',
      startDate: '',
      endDate: '',
      travelers: 2,
      travelStyle: [],
      accommodationType: [],
      activities: [],
      transport: [],
      budget: 2000,
      specialRequests: '',
    }
  });

  const onSubmit = async (data: ItineraryRequest) => {
    process.env.NODE_ENV !== "production" && console.log('Form data:', data);
    try {
      setIsLoading(true);
      setError(null);

      // Store form data in localStorage for the itinerary page to use
      localStorage.setItem('itineraryFormData', JSON.stringify(data));
      
      // Redirect to the itinerary page
      router.push('/itinerary');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  // Don't render the form until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-[#2A2727]/40 rounded mb-4"></div>
        <div className="h-24 bg-[#2A2727]/40 rounded mb-4"></div>
        <div className="h-24 bg-[#2A2727]/40 rounded mb-4"></div>
        <div className="h-12 bg-[#2A2727]/40 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-medium text-[#F5F5F5]">Create Your Itinerary</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A37A]">
              <MapPin size={18} />
            </div>
            <input
              type="text"
              id="destination"
              placeholder="Where would you like to go?"
              {...register('destination')}
              className="w-full pl-12 pr-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-red-500">{errors.destination.message}</p>
            )}
          </div>

          <div className="group relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A37A]">
              <Users size={18} />
            </div>
            <input
              type="number"
              id="travelers"
              min="1"
              placeholder="Number of travelers"
              {...register('travelers', { valueAsNumber: true })}
              className="w-full pl-12 pr-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
            />
            {errors.travelers && (
              <p className="mt-1 text-sm text-red-500">{errors.travelers.message}</p>
            )}
          </div>

          <div className="group relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A37A]">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              id="startDate"
              {...register('startDate')}
              className="w-full pl-12 pr-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>
            )}
          </div>

          <div className="group relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#C9A37A]">
              <Calendar size={18} />
            </div>
            <input
              type="date"
              id="endDate"
              {...register('endDate')}
              className="w-full pl-12 pr-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="group relative">
          <div className="absolute left-4 top-10 transform -translate-y-1/2 text-[#C9A37A]">
            <Banknote size={18} />
          </div>
          <label className="block text-[#F5F5F5]/80 mb-2 text-sm">Budget (USD)</label>
          <input
            type="number"
            id="budget"
            min="0"
            placeholder="Your trip budget"
            {...register('budget', { valueAsNumber: true })}
            className="w-full pl-12 pr-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
          />
          {errors.budget && (
            <p className="mt-1 text-sm text-red-500">{errors.budget.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[#F5F5F5]/80 mb-3 text-sm">
            Travel Style (Select at least one)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['luxury', 'budget', 'adventure', 'cultural', 'relaxation'].map((style) => (
              <label key={style} className="relative">
                <input
                  type="checkbox"
                  value={style}
                  {...register('travelStyle')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                  watch('travelStyle').includes(style)
                    ? 'bg-[#C9A37A]/20 border-[#C9A37A] text-[#F5F5F5]' 
                    : 'border-[#C9A37A]/20 text-[#F5F5F5]/70 hover:border-[#C9A37A]/50'
                }`}>
                  <span className="capitalize">{style}</span>
                  {watch('travelStyle').includes(style) && (
                    <Check size={16} className="text-[#C9A37A]" />
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.travelStyle && (
            <p className="mt-1 text-sm text-red-500">{errors.travelStyle.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[#F5F5F5]/80 mb-3 text-sm">
            Accommodation Type (Select at least one)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['hotel', 'hostel', 'apartment', 'resort', 'villa', 'camping'].map((type) => (
              <label key={type} className="relative">
                <input
                  type="checkbox"
                  value={type}
                  {...register('accommodationType')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                  watch('accommodationType').includes(type)
                    ? 'bg-[#C9A37A]/20 border-[#C9A37A] text-[#F5F5F5]' 
                    : 'border-[#C9A37A]/20 text-[#F5F5F5]/70 hover:border-[#C9A37A]/50'
                }`}>
                  <span className="capitalize">{type}</span>
                  {watch('accommodationType').includes(type) && (
                    <Check size={16} className="text-[#C9A37A]" />
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.accommodationType && (
            <p className="mt-1 text-sm text-red-500">{errors.accommodationType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[#F5F5F5]/80 mb-3 text-sm">
            Activities (Select at least one)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['museums', 'restaurants', 'shopping', 'nature', 'nightlife', 'sightseeing', 'beach', 'hiking'].map((activity) => (
              <label key={activity} className="relative">
                <input
                  type="checkbox"
                  value={activity}
                  {...register('activities')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                  watch('activities').includes(activity)
                    ? 'bg-[#C9A37A]/20 border-[#C9A37A] text-[#F5F5F5]' 
                    : 'border-[#C9A37A]/20 text-[#F5F5F5]/70 hover:border-[#C9A37A]/50'
                }`}>
                  <span className="capitalize">{activity}</span>
                  {watch('activities').includes(activity) && (
                    <Check size={16} className="text-[#C9A37A]" />
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.activities && (
            <p className="mt-1 text-sm text-red-500">{errors.activities.message}</p>
          )}
        </div>

        <div>
          <label className="block text-[#F5F5F5]/80 mb-3 text-sm">
            Transportation (Select at least one)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {['walking', 'public transport', 'taxi', 'rental car', 'bicycle', 'tour bus'].map((transport) => (
              <label key={transport} className="relative">
                <input
                  type="checkbox"
                  value={transport}
                  {...register('transport')}
                  className="sr-only"
                />
                <div className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all duration-300 ${
                  watch('transport').includes(transport)
                    ? 'bg-[#C9A37A]/20 border-[#C9A37A] text-[#F5F5F5]' 
                    : 'border-[#C9A37A]/20 text-[#F5F5F5]/70 hover:border-[#C9A37A]/50'
                }`}>
                  <span className="capitalize">{transport}</span>
                  {watch('transport').includes(transport) && (
                    <Check size={16} className="text-[#C9A37A]" />
                  )}
                </div>
              </label>
            ))}
          </div>
          {errors.transport && (
            <p className="mt-1 text-sm text-red-500">{errors.transport.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-[#F5F5F5]/80 mb-2 text-sm">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            placeholder="Any dietary requirements, accessibility needs, or specific interests"
            {...register('specialRequests')}
            rows={3}
            className="w-full px-4 py-3 bg-[#1F1C1C]/50 border border-[#C9A37A]/20 rounded-xl text-[#F5F5F5] placeholder-[#F5F5F5]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A37A]/50 focus:border-[#C9A37A]/50"
          />
          {errors.specialRequests && (
            <p className="mt-1 text-sm text-red-500">{errors.specialRequests.message}</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-[#1F1C1C] bg-[#C9A37A] hover:bg-[#C9A37A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A37A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Preparing Your Journey...' : 'Create My Trip'}
        </motion.button>

        {error && (
          <div className="rounded-xl bg-red-900/20 border border-red-500/20 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-400">Error</h3>
                <div className="mt-2 text-sm text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
} 