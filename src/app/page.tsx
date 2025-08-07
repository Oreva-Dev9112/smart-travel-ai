'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Users, Banknote, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a loading skeleton before client-side code is hydrated
  if (!mounted) {
    return (
      <div className="min-h-screen bg-luxury flex flex-col items-center justify-center">
        <div className="animate-pulse w-full max-w-5xl px-4">
          <div className="h-16 bg-luxury-card rounded-xl mb-12 w-3/4 mx-auto"></div>
          <div className="h-64 bg-luxury-card rounded-2xl mb-8"></div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="h-32 bg-luxury-card rounded-xl"></div>
            <div className="h-32 bg-luxury-card rounded-xl"></div>
          </div>
          <div className="h-12 bg-luxury-card rounded-full w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-luxury-accent/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-luxury" />
      </div>

      <div className="relative z-10 pt-36 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center max-w-5xl mx-auto mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-luxury-accent/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-luxury-accent" />
            <span className="text-sm text-luxury-accent">AI-Powered Travel Planning</span>
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-gold mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-accent via-luxury-text to-luxury-gold">
              Your Journey Begins Here
            </span>
          </h1>
          <p className="text-lg md:text-xl text-luxury-text/80 max-w-2xl mx-auto mb-8">
            Experience luxury travel planning powered by AI, crafted just for you.
            Let us create a personalized itinerary for your dream destination.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="backdrop-blur-lg rounded-2xl border shadow-lg p-4 flex items-center space-x-3 bg-luxury-card/70 border-luxury-accent/20"
            >
              <Calendar className="w-5 h-5 text-luxury-accent" />
              <span className="text-luxury-text/80 text-sm">Personalized Itineraries</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="backdrop-blur-lg rounded-2xl border shadow-lg p-4 flex items-center space-x-3 bg-luxury-card/70 border-luxury-accent/20"
            >
              <MapPin className="w-5 h-5 text-luxury-accent" />
              <span className="text-luxury-text/80 text-sm">Local Insights</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="backdrop-blur-lg rounded-2xl border shadow-lg p-4 flex items-center space-x-3 bg-luxury-card/70 border-luxury-accent/20"
            >
              <Sparkles className="w-5 h-5 text-luxury-accent" />
              <span className="text-luxury-text/80 text-sm">Luxury Experiences</span>
            </motion.div>
        </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Chat with Travel Assistant Card */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="backdrop-blur-lg rounded-2xl border shadow-lg bg-luxury-card/70 border-luxury-accent/20 p-8 flex flex-col items-center text-center"
            >
              <div className="h-16 w-16 rounded-full bg-luxury-accent/10 flex items-center justify-center mb-6">
                <span className="text-luxury-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </span>
              </div>
              <h3 className="text-xl font-medium text-luxury-text mb-3">Chat with Travel Assistant</h3>
              <p className="text-luxury-text/70 mb-6">Get personalized recommendations and answers to all your travel questions.</p>
              <a href="/assistant" className="mt-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-luxury-accent/20 to-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold/50 flex items-center"
                >
                  <span>Start Chatting</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-4 h-4">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </motion.button>
              </a>
            </motion.div>
            
            {/* Explore Destinations Card */}
            <motion.div
              whileHover={{ y: -10, scale: 1.02 }}
              className="backdrop-blur-lg rounded-2xl border shadow-lg bg-luxury-card/70 border-luxury-accent/20 p-8 flex flex-col items-center text-center"
            >
              <div className="h-16 w-16 rounded-full bg-luxury-accent/10 flex items-center justify-center mb-6">
                <span className="text-luxury-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                    <line x1="8" y1="2" x2="8" y2="18"></line>
                    <line x1="16" y1="6" x2="16" y2="22"></line>
                  </svg>
                </span>
              </div>
              <h3 className="text-xl font-medium text-luxury-text mb-3">Explore Destinations</h3>
              <p className="text-luxury-text/70 mb-6">Discover popular destinations, hidden gems, and travel inspiration for your next journey.</p>
              <a href="/search" className="mt-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-luxury-accent/20 to-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold/50 flex items-center"
                >
                  <span>Explore Now</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 w-4 h-4">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </motion.button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
