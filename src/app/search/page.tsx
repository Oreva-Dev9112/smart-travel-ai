'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the ItineraryForm component to avoid hydration issues
const ItineraryForm = dynamic(() => import('@/components/ItineraryForm'), { 
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-12 bg-[#2A2727]/40 rounded mb-4"></div>
      <div className="h-24 bg-[#2A2727]/40 rounded mb-4"></div>
      <div className="h-24 bg-[#2A2727]/40 rounded mb-4"></div>
      <div className="h-12 bg-[#2A2727]/40 rounded"></div>
    </div>
  )
});

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#1F1C1C] relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-[#C9A37A]/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[#1F1C1C]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-[#C9A37A]/10 rounded-full px-4 py-2 mb-6">
            <Search className="w-4 h-4 text-[#C9A37A]" />
            <span className="text-sm text-[#C9A37A]">Find Your Perfect Trip</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#C9A37A] via-[#F5F5F5] to-[#C9A37A] mb-4">
            Plan Your Journey
          </h1>
          <p className="text-xl text-[#F5F5F5]/80">
            Let us create your perfect travel experience
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="bg-[#1F1C1C]/50 backdrop-blur-xl rounded-2xl p-8 border border-[#C9A37A]/20 shadow-[0_8px_40px_-12px_rgba(201,163,122,0.2)]"
        >
          <ItineraryForm />
        </motion.div>
      </div>
    </div>
  );
} 