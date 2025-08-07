import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ItineraryRequest } from '@/lib/validations/itinerary';
import type { ItineraryResponse, ApiError, Location, WeatherData, Event, PointOfInterest } from '@/lib/types/itinerary';
import OpenAI from 'openai';
import { createHash } from 'crypto';

// Simple in-memory cache with expiration
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();

// Generate a cache key from request parameters
function generateCacheKey(params: any): string {
  const serialized = JSON.stringify(params);
  return createHash('md5').update(serialized).digest('hex');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Log OpenAI key for debugging (redacted for security)
process.env.NODE_ENV !== "production" && console.log('OpenAI API Key configured:', process.env.OPENAI_API_KEY ? '[Key exists]' : '[Key missing]');

async function getCoordinates(destination: string): Promise<Location> {
  try {
    process.env.NODE_ENV !== "production" && console.log(`Geocoding destination: ${destination}`);
    
    // Try multiple geocoding strategies if needed
    const strategies = [
      // Strategy 1: Basic search
      async () => {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${process.env.OPENCAGE_KEY}&limit=1&no_annotations=1`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0] : null;
      },
      
      // Strategy 2: Add "city" to the search to emphasize we want a city
      async () => {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination + " city")}&key=${process.env.OPENCAGE_KEY}&limit=1&no_annotations=1`;
        const response = await fetch(url);
        if (!response.ok) return null;
        const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0] : null;
      },
      
      // Strategy 3: Try with locality bias for major cities
      async () => {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${process.env.OPENCAGE_KEY}&limit=1&no_annotations=1&countrycode=ng,gh,eg,ke,za&type=city`;
        const response = await fetch(url);
        if (!response.ok) return null;
    const data = await response.json();
        return data.results && data.results.length > 0 ? data.results[0] : null;
      }
    ];
    
    // Try each strategy until one succeeds
    for (const strategy of strategies) {
      const result = await strategy();
      if (result) {
        process.env.NODE_ENV !== "production" && console.log(`Successfully geocoded ${destination} to: ${result.formatted} (confidence: ${result.confidence})`);
      return {
          lat: result.geometry.lat,
          lng: result.geometry.lng
      };
      }
    }
    
    throw new Error(`Location not found: ${destination}`);
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
}

async function getWeather(location: Location, startDate: string, endDate: string): Promise<WeatherData[]> {
  try {
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHERAPI_KEY}&q=${location.lat},${location.lng}&days=14`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.forecast.forecastday;
  } catch (error) {
    console.error('Error getting weather:', error);
    return []; // Return empty array instead of failing
  }
}

async function getEvents(location: Location, startDate: string, endDate: string, userPreferences: any = {}): Promise<Event[]> {
  try {
    // Validate API key
    if (!process.env.PREDICTHQ_API_KEY) {
      console.error('PredictHQ API key is missing');
      return [];
    }

    // Validate location coordinates
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      console.error('Invalid location coordinates:', location);
      return [];
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date format:', { startDate, endDate });
      return [];
    }

    // Format dates for PredictHQ API (YYYY-MM-DD)
    const formattedStartDate = start.toISOString().split('T')[0];
    const formattedEndDate = end.toISOString().split('T')[0];
    
    // Log the input parameters
    process.env.NODE_ENV !== "production" && console.log('PredictHQ API Request Parameters:', {
      location,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      userPreferences
    });
    
    // Filter categories based on user preferences if available
    let categories = [
      'concerts', 'conferences', 'expos', 'festivals', 'performing-arts', 
      'sports', 'community', 'public-holidays'
    ];
    
    // If user selected specific activity types, prioritize related categories
    if (userPreferences.activities && userPreferences.activities.length > 0) {
      const activityMapping: Record<string, string[]> = {
        'museums': ['expos', 'community'],
        'restaurants': ['food-and-drink'],
        'shopping': ['expos', 'community'],
        'nature': ['community'],
        'nightlife': ['concerts', 'performing-arts'],
        'sightseeing': ['community', 'expos'],
        'beach': ['community'],
        'hiking': ['community'],
        'adventure': ['sports'],
        'cultural': ['performing-arts', 'community', 'festivals']
      };
      
      // Build preferred categories list
      const preferredCategories = new Set<string>();
      userPreferences.activities.forEach((activity: string) => {
        const mappedCategories = activityMapping[activity] || [];
        mappedCategories.forEach(cat => preferredCategories.add(cat));
      });
      
      // If we have preferences, use them, otherwise fall back to all categories
      if (preferredCategories.size > 0) {
        categories = [...preferredCategories];
      }
    }
    
    // Log the categories being used
    process.env.NODE_ENV !== "production" && console.log('Using PredictHQ categories:', categories);
    
    // First, try a simple test request to verify API connectivity
    const testUrl = `https://api.predicthq.com/v1/events/?location_around.origin=${location.lat},${location.lng}&location_around.radius=10km`;
    
    process.env.NODE_ENV !== "production" && console.log('Testing PredictHQ API connection with URL:', testUrl);
    
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.PREDICTHQ_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (!testResponse.ok) {
      const errorData = await testResponse.json();
      console.error('PredictHQ API test request failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: errorData,
        url: testUrl
      });
      return [];
    }
    
    // If test request succeeds, proceed with full request
    const url = `https://api.predicthq.com/v1/events/?location_around.origin=${location.lat},${location.lng}&location_around.radius=10km&active.gte=${formattedStartDate}&active.lte=${formattedEndDate}&category=${categories.join(',')}&limit=50&sort=rank`;
    
    process.env.NODE_ENV !== "production" && console.log('Fetching events from PredictHQ API with URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.PREDICTHQ_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('PredictHQ API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: url
      });
      return [];
    }
    
    const data = await response.json();
    process.env.NODE_ENV !== "production" && console.log(`Found ${data.results?.length || 0} events from PredictHQ`);
    
    // Helper function to calculate distance between two points
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371; // Radius of the earth in km
      const dLat = deg2rad(lat2 - lat1);
      const dLon = deg2rad(lon2 - lon1);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const d = R * c; // Distance in km
      return d;
    }
    
    function deg2rad(deg: number): number {
      return deg * (Math.PI/180);
    }
    
    // Additional filtering to ensure location relevance
    const filteredResults = (data.results || []).filter((event: Record<string, any>) => {
      if (!event.location || !Array.isArray(event.location)) return false;
      
      const distanceKm = calculateDistance(
        location.lat, 
        location.lng, 
        event.location[1], 
        event.location[0]
      );
      
      return distanceKm <= 20;
    });
    
    process.env.NODE_ENV !== "production" && console.log(`After distance filtering: ${filteredResults.length} events remain`);
    
    return filteredResults.map((event: Record<string, any>) => ({
      id: event.id,
      title: event.title,
      description: event.description || `${event.title} - ${event.category}`,
      start: event.start,
      end: event.end,
      category: event.category,
      location: {
        lat: event.location ? event.location[1] : location.lat,
        lon: event.location ? event.location[0] : location.lng
      },
      venue: {
        name: event.entities?.find((e: Record<string, any>) => e.type === 'venue')?.name || '',
        address: event.place_hierarchies?.[0]?.join(', ') || ''
      }
    }));
  } catch (error) {
    console.error('Error getting events:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return [];
  }
}

async function getPOIs(location: Location): Promise<PointOfInterest[]> {
  try {
    const url = `https://api.foursquare.com/v3/places/search?ll=${location.lat},${location.lng}&radius=5000&limit=50`;
    const response = await fetch(url, {
      headers: {
        'Authorization': process.env.FOURSQUARE_API_KEY ?? ''
      }
    });
    
    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error getting POIs:', error);
    return []; // Return empty array instead of failing
  }
}

async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Extract the needed form data
    const { 
      destination, 
      startDate, 
      endDate, 
      travelers, 
      travelStyle, 
      accommodationType, 
      activities, 
      transport, 
      budget, 
      specialRequests,
      forceRefresh = false // Optional parameter to bypass cache
    } = body;
    
    // Generate cache key from request parameters
    const cacheKey = generateCacheKey({
      destination,
      startDate,
      endDate,
      travelers,
      travelStyle,
      accommodationType,
      activities,
      transport,
      budget,
      specialRequests
    });
    
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedResult = cache.get(cacheKey);
      const now = Date.now();
      
      if (cachedResult && (now - cachedResult.timestamp) < CACHE_TTL) {
        process.env.NODE_ENV !== "production" && console.log('Using cached itinerary result');
        return Response.json({
          ...cachedResult.data,
          fromCache: true
        });
      }
    }

    // Validate required fields
    if (!destination || !startDate || !endDate) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get coordinates for destination
    const location = await getCoordinates(destination);
    if (!location) {
      return Response.json({ error: 'Could not geocode destination' }, { status: 400 });
    }

    process.env.NODE_ENV !== "production" && console.log(`Geocoded ${destination} to coordinates: ${location.lat}, ${location.lng}`);

    // Create user preferences object
    const userPreferences = {
      activities,
      travelStyle,
      budget
    };

    // Fetch additional data in parallel
    const [weatherData, eventsData, pointsOfInterestData] = await Promise.all([
      getWeather(location, startDate, endDate),
      getEvents(location, startDate, endDate, userPreferences),
      getPOIs(location)
    ]);
    
    // Calculate trip duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    
    // Format data for GPT-4
    // Format events for more readability
    const formattedEvents = eventsData.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description || `${event.title}`,
      start: event.start,
      end: event.end,
      category: event.category,
      venue: event.venue?.name || 'Local venue',
      address: event.venue?.address || ''
    }));
    
    // Format POIs for more readability
    const formattedPOIs = pointsOfInterestData.slice(0, 15).map(poi => {
      // Safely handle address which might not be an array
      let addressText = '';
      if (poi.location?.address) {
        addressText = Array.isArray(poi.location.address) 
          ? poi.location.address.join(', ') 
          : String(poi.location.address);
      }
      
      return {
        name: poi.name,
        category: poi.categories?.[0]?.name || 'Point of Interest',
        address: addressText,
        distance: poi.distance
      };
    });
    
    // Format weather more readably
    const formattedWeather = weatherData.map(day => ({
      date: day.date,
      max_temp: day.day.maxtemp_c,
      min_temp: day.day.mintemp_c,
      condition: day.day.condition.text
    }));

    process.env.NODE_ENV !== "production" && console.log('Generating itinerary with GPT-4...');
    
    // Build a comprehensive system message
    const systemMessage = `You are an expert travel planner with deep knowledge of destinations worldwide. 
You'll create a personalized, realistic, and engaging travel itinerary using real data.
Follow these key principles:
1. Always include real events from the provided events list when available for specific dates
2. Create an authentic experience that respects the traveler's preferences
3. Ensure all activities are geographically sensible with travel time between locations
4. Provide specific venue names and locations, not generic suggestions`;
    
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: `Create a detailed travel itinerary for ${travelers} travelers to ${destination}.
Trip dates: ${startDate} to ${endDate} (${daysDiff} days)
Budget: $${budget}
Travel style preferences: ${travelStyle.join(', ')}
Preferred accommodations: ${accommodationType.join(', ')}
Desired activities: ${activities.join(', ')}
Transportation options: ${transport.join(', ')}
Special requests: ${specialRequests || 'None'}

I've gathered this information about the destination:

WEATHER:
${JSON.stringify(formattedWeather, null, 2)}

LOCAL EVENTS (must include these in the itinerary on their specific dates):
${JSON.stringify(formattedEvents, null, 2)}

POINTS OF INTEREST:
${JSON.stringify(formattedPOIs, null, 2)}

Generate a comprehensive JSON itinerary with this structure:
{
  "summary": "Overall description of the trip",
  "totalCost": estimated total cost based on budget,
  "tips": [array of 5-7 specific tips for this destination],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "theme": "Theme for this day",
      "description": "Brief engaging description",
      "activities": [
        {
          "time": "HH:MM",
          "title": "Activity name",
          "description": "Detailed description",
          "location": "Location name",
          "cost": estimated cost in USD,
          "isRealEvent": boolean indicating if this is from the events list
        }
      ],
      "weather": {
        "forecast": "Weather forecast based on the data provided",
        "backupPlan": "Plan for bad weather if needed"
      }
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Include at least one real event from the provided list for each day when available
2. Make the itinerary realistic and tailored to the preferences
3. Keep timing sensible (no back-to-back activities without travel time)
4. For real events, use their exact title, description, and timing
5. Make sure your response is valid JSON that can be parsed
6. Generate specific, location-relevant tips, not generic travel advice` }
      ]
    });
    
    // Parse the response
    const itineraryContent = chatCompletion.choices[0].message.content;
    const generatedItinerary = JSON.parse(itineraryContent || '{}');
    
    process.env.NODE_ENV !== "production" && console.log('Successfully generated itinerary with GPT-4');
    
    // Prepare response data
    const responseData = {
      destination,
      coordinates: location,
      dates: { start: startDate, end: endDate },
      itinerary: generatedItinerary,
      weather: formattedWeather,
      events: formattedEvents,
      pointsOfInterest: formattedPOIs
    };
    
    // Store in cache
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Return the data with our standard format
    return Response.json(responseData);
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    
    // Enhanced error logging for OpenAI errors
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log specific OpenAI API response details if available
    if (error.response) {
      console.error('OpenAI API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    return Response.json({ 
      error: 'Failed to generate itinerary', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export { POST };