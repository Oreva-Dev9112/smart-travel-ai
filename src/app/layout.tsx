import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/lib/ThemeContext';
import { FormProvider } from '@/lib/FormContext';
import dynamic from 'next/dynamic';

// Import PerformanceMonitor with no SSR to avoid hydration issues
const PerformanceMonitor = dynamic(() => import('@/components/PerformanceMonitor'), { 
  ssr: false 
});

export const metadata: Metadata = {
  title: "Smart Travel AI - Luxury Planning",
  description: "Plan luxury trips in seconds with AI. Personalized itineraries, real-time data, beautiful UX.",
  openGraph: {
    title: "Smart Travel AI - Luxury Planning",
    description: "Plan luxury trips in seconds with AI. Personalized itineraries, real-time data, beautiful UX.",
    url: "https://smart-travel-ai.vercel.app",
    siteName: "Smart Travel AI",
    images: [
      {
        url: "https://smart-travel-ai.vercel.app/launch.png",
        width: 1200,
        height: 630,
        alt: "Smart Travel AI - Hero Screenshot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Travel AI - Luxury Planning",
    description: "AI-powered luxury travel planning platform. Instant itineraries. Beautiful UX.",
    images: ["https://smart-travel-ai.vercel.app/launch.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#FAFAFA] dark:bg-[#1F1C1C] text-[#0F0E0E] dark:text-[#F5F5F5] min-h-screen antialiased transition-colors duration-300">
        <ThemeProvider>
          <FormProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main id="main-content" className="flex-grow">{children}</main>
              
              {/* Performance monitoring */}
              <PerformanceMonitor />
              
              {/* Skip to content link for accessibility */}
              <a 
                href="#main-content" 
                className="absolute left-4 top-4 bg-[#C9A37A] text-[#1F1C1C] p-3 rounded-md transform -translate-y-16 focus:translate-y-0 transition-transform z-50"
              >
                Skip to content
              </a>
            </div>
          </FormProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
