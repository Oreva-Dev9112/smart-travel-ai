'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Coffee, 
  Sun, 
  Moon, 
  Cloud, 
  CloudRain, 
  Music, 
  Wind,
  MapPin,
  Share2,
  Download,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Our itinerary data types - basically what we show for each day
// Morning/afternoon/evening activities plus some extra stuff like weather
interface ItineraryDay {
  day: string;
  date: string;
  morning: string;
  afternoon: string;
  evening: string;
  notes?: string;
  weather?: string;
  events?: {
    title: string;
    isRealEvent?: boolean;
    location?: string;
    time?: string;
  }[];
}

interface Itinerary {
  summary: string;
  days: ItineraryDay[];
}

// Keys for caching - helps avoid hitting the API every page load
const ITINERARY_CACHE_KEY = 'cachedItinerary';
const CACHE_TIMESTAMP_KEY = 'itineraryCacheTimestamp';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// The main itinerary page component
// Shows the travel plan with timeline, lets users export to PDF, and handles
// all the data loading/caching so we don't hammer the API unnecessarily
export default function ItineraryPage() {
  // All our state variables - pretty standard React stuff
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState("Loading destination...");
  const [travelStyle, setTravelStyle] = useState("Loading preferences...");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Ref for the PDF export - needed to capture the DOM element
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  
  // Checks if our cache is still fresh or if we need new data
// Just compares timestamps - nothing fancy
  const isCacheValid = () => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cachedTime = parseInt(timestamp);
    const now = new Date().getTime();
    
    return (now - cachedTime) < CACHE_EXPIRY_TIME;
  };

  // Grab cached data from localStorage
// Added try/catch because JSON.parse likes to blow up sometimes
  const loadFromCache = () => {
    const cachedData = localStorage.getItem(ITINERARY_CACHE_KEY);
    if (!cachedData) return null;
    
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached itinerary:', e);
      return null;
    }
  };

  // Save data to localStorage with a timestamp so we know when it expires
  const saveToCache = (data: any) => {
    localStorage.setItem(ITINERARY_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().getTime().toString());
  };

  // The main API call to get itinerary data
// Does some validation to make sure we got something usable back
  const fetchItineraryData = async (formData: any) => {
    const response = await fetch('/api/generate-itinerary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate itinerary');
    }

    const data = await response.json();
    process.env.NODE_ENV !== "production" && console.log('API Response:', data);
    
    // Validate response structure to prevent runtime errors
    if (!data.itinerary || !data.itinerary.days || !Array.isArray(data.itinerary.days)) {
      throw new Error('Invalid itinerary data structure received from API');
    }
    
    return data;
  };

  // Formats the raw API data into something more usable for our UI
// Splits activities by time of day and extracts the important bits
  const formatItineraryData = (data: any): Itinerary => {
    return {
      summary: data.itinerary.summary || 'No summary available',
      days: data.itinerary.days.map((day: any) => {
        // Ensure activities exist and are properly formatted
        const activities = Array.isArray(day.activities) ? day.activities : [];
        
        process.env.NODE_ENV !== "production" && console.log(`Day ${day.date} has ${activities.length} activities, including ${activities.filter((a: any) => a.isRealEvent).length} real events`);
        
        // Group activities by time period for better organization
        const morning = activities.find((a: any) => {
          if (!a || !a.time) return false;
          const hour = parseInt(a.time.split(':')[0]);
          return hour >= 6 && hour < 12;
        });
        
        const afternoon = activities.find((a: any) => {
          if (!a || !a.time) return false;
          const hour = parseInt(a.time.split(':')[0]);
          return hour >= 12 && hour < 18;
        });
        
        const evening = activities.find((a: any) => {
          if (!a || !a.time) return false;
          const hour = parseInt(a.time.split(':')[0]);
          return hour >= 18;
        });

        return {
          day: day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'Unknown day',
          date: day.date || 'No date provided',
          morning: morning ? `${morning.time} - ${morning.title}: ${morning.description}` : 'Free time to explore',
          afternoon: afternoon ? `${afternoon.time} - ${afternoon.title}: ${afternoon.description}` : 'Free time to explore',
          evening: evening ? `${evening.time} - ${evening.title}: ${evening.description}` : 'Free time to explore',
          notes: day.weather?.backupPlan,
          weather: day.weather?.forecast,
          events: activities.map((a: any) => ({
            title: a.title || 'Unnamed activity',
            isRealEvent: a.isRealEvent || false,
            location: a.location || '',
            time: a.time || ''
          }))
        };
      })
    };
  };

  // When the user clicks the refresh button
// Gets fresh data from the API using the same preferences
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const storedFormData = localStorage.getItem('itineraryFormData');
      
      if (!storedFormData) {
        throw new Error('No form data found. Please fill out the form first.');
      }
      
      const formData = JSON.parse(storedFormData);
      const data = await fetchItineraryData(formData);
      const formattedItinerary = formatItineraryData(data);
      
      setItinerary(formattedItinerary);
      saveToCache({ itinerary: formattedItinerary, destination, travelStyle });
    } catch (err) {
      console.error('Error refreshing itinerary:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsRefreshing(false);
    }
  };

  // The PDF export function - this was tricky to get right!
// Uses html2canvas to grab the DOM and jsPDF to create the document
  const handleExportToPdf = async () => {
    if (!pdfRef.current) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Dynamically import libraries to reduce initial bundle size
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2, // Higher quality rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#1F1C1C', // Match app background
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for A4 paper
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Handle multi-page documents for longer itineraries
      let position = 0;
      let heightLeft = imgHeight;
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Generate filename based on destination
      const filename = `${destination.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-itinerary.pdf`;
      pdf.save(filename);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // The main useEffect that loads our data when the page first renders
// Tries the cache first, then falls back to the API if needed
  useEffect(() => {
    const loadItinerary = async () => {
      try {
        setLoading(true);
        
        // Get user preferences from localStorage
        const storedFormData = localStorage.getItem('itineraryFormData');
        
        if (!storedFormData) {
          throw new Error('No form data found. Please fill out the form first.');
        }
        
        const formData = JSON.parse(storedFormData);
        
        // Extract key information for display
        const destinationValue = formData.destination || "Unknown destination";
        const travelStyleValue = Array.isArray(formData.travelStyle) && formData.travelStyle.length > 0 
          ? formData.travelStyle.map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
          : "Custom";
        
        setDestination(destinationValue);
        setTravelStyle(travelStyleValue);

        // Try to use cached data first to improve performance
        if (isCacheValid()) {
          const cachedData = loadFromCache();
          if (cachedData && cachedData.itinerary) {
            console.log('Using cached itinerary data');
            setItinerary(cachedData.itinerary);
            setLoading(false);
            return;
          }
        }

        // If no valid cache exists, fetch fresh data
        const data = await fetchItineraryData(formData);
        const formattedItinerary = formatItineraryData(data);
        
        setItinerary(formattedItinerary);
        
        // Cache the results for future visits
        saveToCache({ 
          itinerary: formattedItinerary, 
          destination: destinationValue, 
          travelStyle: travelStyleValue 
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching itinerary:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoading(false);
      }
    };

    loadItinerary();
  }, []);

  // Quick helper to pick the right weather icon
// Nothing fancy - just checks for keywords in the forecast
  const getWeatherIcon = (weather: string) => {
    if (!weather) return <Sun className="text-[#C9A37A]" />;
    
    const weatherLower = weather.toLowerCase();
    if (weatherLower.includes('sun')) return <Sun className="text-[#C9A37A]" />;
    if (weatherLower.includes('cloud')) return <Cloud className="text-[#C9A37A]" />;
    if (weatherLower.includes('rain')) return <CloudRain className="text-[#C9A37A]" />;
    if (weatherLower.includes('wind')) return <Wind className="text-[#C9A37A]" />;
    
    return <Sun className="text-[#C9A37A]" />;
  };

  // Loading screen with animated elements for better UX
  const LoadingScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1F1C1C]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        {/* Animated calendar icon with particles */}
        <div className="relative">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#C9A37A] to-[#94754E] flex items-center justify-center">
              <Calendar className="w-10 h-10 text-[#1F1C1C]" />
            </div>
          </motion.div>
          
          {/* Decorative animated particles */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#C9A37A] rounded-full"
                initial={{ 
                  x: 0, 
                  y: 0,
                  opacity: 0,
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 100, 
                  y: (Math.random() - 0.5) * 100,
                  opacity: [0, 1, 0],
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#C9A37A] via-[#F5F5F5] to-[#C9A37A] mb-4">
          Planning your dream trip…
        </h2>
        <p className="text-[#F5F5F5]/70 max-w-md mb-8">
          Our AI is crafting a personalized luxury itinerary just for you. This should only take a moment.
        </p>

        {/* Loading indicator dots */}
        <div className="flex justify-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                repeatType: "loop",
                delay: i * 0.4,
              }}
              className="w-3 h-3 rounded-full bg-[#C9A37A]"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );

  // Error screen with friendly message and recovery options
  const ErrorScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1F1C1C] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-900/30 flex items-center justify-center">
          <div className="text-3xl">😕</div>
        </div>

        <h2 className="text-2xl font-bold text-[#F5F5F5] mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-[#F5F5F5]/70 mb-6">
          {error || "We couldn't generate your itinerary. Please try again."}
        </p>

        <button
          onClick={() => router.push('/')}
          className="group relative px-8 py-3 bg-[#C9A37A] text-[#1F1C1C] rounded-full overflow-hidden"
        >
          <span className="relative z-10 flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Go Back</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-[#C9A37A] via-[#C9A37A]/80 to-[#C9A37A] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </motion.div>
    </div>
  );

  // Conditional rendering based on state
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen />;
  }

  if (!itinerary) {
    return null;
  }

  // Main itinerary display with timeline and day details
  return (
    <div className="min-h-screen bg-[#1F1C1C] pb-20">
      
      {/* Header with gradient background and navigation */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A37A]/10 to-transparent" />
        <div className="relative z-10 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => router.push('/')}
                className="group flex items-center text-[#F5F5F5]/70 hover:text-[#C9A37A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span>Back to home</span>
              </button>
              
              <div className="flex space-x-3">
                {/* Refresh button with loading indicator */}
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-2 rounded-full border border-[#C9A37A]/30 hover:bg-[#C9A37A]/10 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Refresh itinerary"
                >
                  <RefreshCw className={`w-4 h-4 text-[#C9A37A] ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              
                {/* Export to PDF button with loading state */}
                <button 
                  onClick={handleExportToPdf}
                  disabled={isPdfGenerating}
                  className={`flex items-center space-x-2 px-4 py-2 bg-[#C9A37A]/10 hover:bg-[#C9A37A]/20 border border-[#C9A37A]/30 rounded-lg transition-colors ${isPdfGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isPdfGenerating ? (
                    <div className="w-4 h-4 border-2 border-[#C9A37A] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-[#C9A37A]" />
                  )}
                  <span className="text-[#C9A37A] text-sm font-medium">
                    {isPdfGenerating ? 'Generating...' : 'Export to PDF'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Content - wrapped in ref for export functionality */}
      <div ref={pdfRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trip summary section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#C9A37A] via-[#F5F5F5] to-[#C9A37A] mb-6">
            Your Itinerary
          </h1>
          
          {/* Summary card with key trip details */}
          <div className="bg-[#1F1C1C]/80 backdrop-blur-xl rounded-2xl p-8 border border-[#C9A37A]/20 shadow-[0_8px_40px_-12px_rgba(201,163,122,0.2)]">
            <h2 className="text-xl font-medium text-[#C9A37A] mb-3">Trip Summary</h2>
            <p className="text-[#F5F5F5]/80 leading-relaxed">{itinerary.summary}</p>
            
            {/* Trip metadata grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-[#C9A37A]" />
                <div>
                  <div className="text-sm text-[#F5F5F5]/50">Duration</div>
                  <div className="text-[#F5F5F5]">{itinerary.days.length} days</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-[#C9A37A]" />
                <div>
                  <div className="text-sm text-[#F5F5F5]/50">Destination</div>
                  <div className="text-[#F5F5F5]">{destination}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 text-[#C9A37A] flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <div className="text-sm text-[#F5F5F5]/50">Travel Style</div>
                  <div className="text-[#F5F5F5]">{travelStyle}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Day-by-day itinerary timeline */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {itinerary.days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.1,
                ease: [0.23, 1, 0.32, 1]
              }}
              className="relative"
            >
              {/* Day header with date and weather info */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 bg-gradient-to-r from-[#C9A37A] to-[#9F815E] text-[#1F1C1C] p-3 rounded-l-xl">
                  <span className="text-xl font-bold">Day {index + 1}</span>
                </div>
                <div className="flex-grow bg-[#2A2727] rounded-r-xl p-3 pl-6 flex justify-between items-center">
                  <div>
                    <div className="text-[#C9A37A] font-medium">{day.day}</div>
                    <div className="text-xs text-[#F5F5F5]/60">{day.date}</div>
                  </div>
                  <div className="flex items-center bg-[#1F1C1C]/50 px-3 py-1.5 rounded-full">
                    {getWeatherIcon(day.weather || '')}
                    <span className="ml-2 text-sm text-[#F5F5F5]/80">{day.weather || 'Sunny'}</span>
                  </div>
                </div>
              </div>

              {/* Day content card with activities */}
              <div className="bg-gradient-to-br from-[#2A2727] to-[#1F1C1C] rounded-xl overflow-hidden shadow-[0_8px_30px_-12px_rgba(201,163,122,0.25)]">
                {/* Events tags at the top */}
                {day.events && day.events.length > 0 && (
                  <div className="bg-[#1F1C1C]/50 p-4 flex flex-wrap gap-2 border-b border-[#C9A37A]/10">
                    {day.events.map((event, eventIndex) => (
                      <span 
                        key={eventIndex}
                        className={`px-3 py-1 text-xs rounded-full flex items-center ${
                          event.isRealEvent 
                            ? 'bg-[#C9A37A] text-[#1F1C1C] font-medium shadow-md' 
                            : 'bg-[#333] text-[#F5F5F5]/80'
                        }`}
                      >
                        {event.isRealEvent && <span className="mr-1.5 text-base">🎭</span>}
                        <span>{event.title}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Time blocks for morning, afternoon, evening */}
                <div className="p-6">
                  {/* Morning activities */}
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A37A]/10 flex items-center justify-center mr-3">
                        <Coffee className="w-4 h-4 text-[#C9A37A]" />
                      </div>
                      <h4 className="text-[#C9A37A] font-medium">MORNING</h4>
                      {day.events?.some(e => e.isRealEvent && day.morning.includes(e.title)) && (
                        <span className="ml-3 inline-block bg-[#C9A37A] text-[#1F1C1C] text-xs font-medium px-2 py-0.5 rounded-full">
                          Real Event
                        </span>
                      )}
                    </div>
                    <div className="ml-11 bg-[#1F1C1C]/30 p-4 rounded-lg border-l-2 border-[#C9A37A]/30">
                      <p className="text-[#F5F5F5]/90 leading-relaxed">{day.morning}</p>
                    </div>
                  </div>

                  {/* Afternoon activities */}
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A37A]/10 flex items-center justify-center mr-3">
                        <Sun className="w-4 h-4 text-[#C9A37A]" />
                      </div>
                      <h4 className="text-[#C9A37A] font-medium">AFTERNOON</h4>
                      {day.events?.some(e => e.isRealEvent && day.afternoon.includes(e.title)) && (
                        <span className="ml-3 inline-block bg-[#C9A37A] text-[#1F1C1C] text-xs font-medium px-2 py-0.5 rounded-full">
                          Real Event
                        </span>
                      )}
                    </div>
                    <div className="ml-11 bg-[#1F1C1C]/30 p-4 rounded-lg border-l-2 border-[#C9A37A]/30">
                      <p className="text-[#F5F5F5]/90 leading-relaxed">{day.afternoon}</p>
                    </div>
                  </div>

                  {/* Evening activities */}
                  <div className="mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A37A]/10 flex items-center justify-center mr-3">
                        <Moon className="w-4 h-4 text-[#C9A37A]" />
                      </div>
                      <h4 className="text-[#C9A37A] font-medium">EVENING</h4>
                      {day.events?.some(e => e.isRealEvent && day.evening.includes(e.title)) && (
                        <span className="ml-3 inline-block bg-[#C9A37A] text-[#1F1C1C] text-xs font-medium px-2 py-0.5 rounded-full">
                          Real Event
                        </span>
                      )}
                    </div>
                    <div className="ml-11 bg-[#1F1C1C]/30 p-4 rounded-lg border-l-2 border-[#C9A37A]/30">
                      <p className="text-[#F5F5F5]/90 leading-relaxed">{day.evening}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {day.notes && (
                    <div className="mt-8 bg-gradient-to-r from-[#C9A37A]/10 to-[#C9A37A]/5 rounded-lg p-4 border border-[#C9A37A]/20">
                      <h4 className="text-xs text-[#C9A37A] uppercase tracking-wider mb-2 flex items-center">
                        <span className="mr-2">✏️</span>
                        <span>Notes</span>
                      </h4>
                      <p className="text-sm text-[#F5F5F5]/80 leading-relaxed">{day.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}