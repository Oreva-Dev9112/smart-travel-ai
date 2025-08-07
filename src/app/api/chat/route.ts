import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Sample responses for demo mode when OpenAI API is not available
const sampleResponses = [
  "I'd be happy to help you plan your trip! Based on your interests, I recommend visiting during the shoulder season (April-May or September-October) when there are fewer tourists but the weather is still pleasant.",
  "That's a great destination choice! For accommodations, I suggest staying in the central district where you'll have easy access to major attractions. The public transportation there is excellent and will save you money on taxis.",
  "When visiting that region, don't miss the local cuisine! The street food markets offer authentic dishes at reasonable prices. I particularly recommend trying the regional specialties like the local seafood dishes and traditional desserts.",
  "For a family-friendly vacation, consider destinations with a mix of educational and fun activities. Many museums offer interactive exhibits for children, and beach destinations often have kid-friendly resorts with dedicated activity programs.",
  "If you're traveling on a budget, I recommend booking accommodations with kitchen facilities so you can prepare some of your meals. Also, look into city passes that bundle attractions for a discounted price, and consider free activities like hiking, visiting public parks, or self-guided walking tours."
];

// Check if OpenAI API key is configured
const hasApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10;

// Initialize OpenAI only if API key is available
const openai = hasApiKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // If OpenAI is not configured, use demo mode with sample responses
    if (!openai) {
      console.log('Using demo mode: OpenAI API key not configured');
      const randomIndex = Math.floor(Math.random() * sampleResponses.length);
      const demoResponse = sampleResponses[randomIndex];
      
      return NextResponse.json({
        response: `[DEMO MODE] ${demoResponse}`,
        success: true
      });
    }

    // If OpenAI is configured, use the API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a more widely available model
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable travel assistant. Provide helpful, accurate, and engaging travel advice. Focus on practical recommendations, local insights, and personalized suggestions."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return NextResponse.json({
      response: chatCompletion.choices[0].message.content,
      success: true
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Fallback to demo mode in case of any error
    const randomIndex = Math.floor(Math.random() * sampleResponses.length);
    const demoResponse = sampleResponses[randomIndex];
    
    return NextResponse.json({
      response: `[FALLBACK MODE] ${demoResponse}`,
      success: true
    });
  }
} 