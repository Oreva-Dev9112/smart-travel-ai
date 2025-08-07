import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

process.env.NODE_ENV !== "production" && console.log('Test route - OpenAI API Key configured:', process.env.OPENAI_API_KEY ? '[Key exists]' : '[Key missing]');

export async function GET() {
  try {
    process.env.NODE_ENV !== "production" && console.log('Testing OpenAI API connection...');
    
    // Simple test with GPT-4
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello world!" }
      ]
    });
    
    process.env.NODE_ENV !== "production" && console.log('OpenAI response received');
    return NextResponse.json({
      success: true,
      response: chatCompletion.choices[0].message.content,
      model: chatCompletion.model
    });
  } catch (error: any) {
    console.error('Error testing OpenAI API:', error);
    
    // Define a more flexible error details type
    interface ErrorDetails {
      message: string;
      status?: number;
      statusText?: string;
      data?: any;
    }
    
    let errorDetails: ErrorDetails = {
      message: error instanceof Error ? error.message : String(error)
    };
    
    if (error.response) {
      errorDetails = {
        ...errorDetails,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };
    }
    
    return NextResponse.json({
      success: false,
      error: errorDetails
    }, { status: 500 });
  }
} 