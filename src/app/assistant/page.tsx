'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowDownCircleIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Chat bubble animation variants
const bubbleVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.9,
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
    }
  }
};

// Suggested prompts for users to try
const suggestedPrompts = [
  "Plan a weekend trip to Paris",
  "What are the best beaches in Thailand?",
  "Give me some budget travel tips",
  "What should I pack for a winter vacation?",
  "Recommend a family-friendly destination",
];

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageGroup {
  date: string;
  messages: Message[];
}

// Sample responses for demo
const sampleResponses = [
  "I'd be happy to help you with that! Could you tell me more about your travel preferences?",
  "Great question! Here are some recommendations based on your interests...",
  "For your trip to that destination, I'd recommend visiting during the shoulder season (April-May or September-October) when there are fewer tourists but the weather is still pleasant.",
  "Based on your interests in cultural experiences and food, I think you'd love exploring the local markets and trying regional specialties. Would you like some specific recommendations?",
  "I've put together some ideas for your itinerary. Would you like me to suggest activities for specific days or give general recommendations?"
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI travel assistant. How can I help you plan your next journey?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Group messages by date
  const groupedMessages = messages.reduce((groups: MessageGroup[], message) => {
    const date = format(message.timestamp, 'MMMM d, yyyy');
    const existingGroup = groups.find(group => group.date === date);
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
    
    return groups;
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if we should show the scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getRandomResponse = () => {
    const index = Math.floor(Math.random() * sampleResponses.length);
    return sampleResponses[index];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <main className="min-h-screen pt-24 pb-20 px-4 relative overflow-hidden bg-gradient-to-b from-[#1A1817] to-[#242020]">
      {/* Decorative particles/elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-luxury-gold/10 animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-3 h-3 rounded-full bg-luxury-gold/10 animate-float"></div>
        <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-luxury-accent/10 animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-luxury-accent/10 animate-float"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col h-[calc(100vh-12rem)]"
        >
          {/* Messages container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-luxury-gold/20 scrollbar-track-transparent mb-4 space-y-6"
          >
            {groupedMessages.map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="text-center">
                  <span className="inline-block px-3 py-1 text-xs text-luxury-gold/60 bg-luxury-gold/10 rounded-full">
                    {group.date}
                  </span>
                </div>
                {group.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    variants={bubbleVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center mr-3 self-end mb-2">
                        <SparklesIcon className="w-4 h-4 text-luxury-gold" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.isUser
                          ? 'bg-luxury-gold text-white rounded-br-none'
                          : 'bg-white/10 text-white rounded-bl-none'
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-4 leading-relaxed text-white/90">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-white/90">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-white/90">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-luxury-gold">{children}</strong>,
                          em: ({ children }) => <em className="italic text-white/80">{children}</em>,
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-luxury-gold">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-luxury-gold">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-luxury-gold">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-luxury-gold pl-4 italic text-white/80 my-4 py-2">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-white/10 px-2 py-0.5 rounded text-sm font-mono text-luxury-gold">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono text-white/90">
                              {children}
                            </pre>
                          ),
                          a: ({ href, children }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-luxury-gold hover:text-white transition-colors underline"
                            >
                              {children}
                            </a>
                          ),
                          hr: () => <hr className="my-6 border-t border-luxury-gold/20" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="min-w-full border-collapse">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-white/5">
                              {children}
                            </thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-white/10">
                              {children}
                            </tbody>
                          ),
                          tr: ({ children }) => <tr className="hover:bg-white/5">{children}</tr>,
                          th: ({ children }) => (
                            <th className="px-4 py-2 text-left text-sm font-semibold text-luxury-gold">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-4 py-2 text-sm text-white/90">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                      <div className="text-xs text-luxury-gold/60 mt-2">
                        {format(message.timestamp, 'h:mm a')}
                      </div>
                    </div>
                    {message.isUser && (
                      <div className="w-8 h-8 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center ml-3 self-end mb-2">
                        <span className="text-xs text-luxury-gold">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested prompts */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <p className="text-xs text-luxury-gold/60 mb-3 uppercase tracking-wider font-medium">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePromptClick(prompt)}
                    className="text-xs bg-white/5 text-luxury-gold px-3 py-1.5 rounded-full border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all"
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center mr-3">
                <SparklesIcon className="w-4 h-4 text-luxury-gold" />
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-luxury-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}

          {/* Input form */}
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about travel..."
              className="w-full bg-white/5 border border-luxury-gold/20 rounded-full py-4 px-6 pr-12 text-white placeholder-luxury-gold/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-luxury-gold hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToBottom}
              className="absolute right-4 bottom-24 p-2 bg-luxury-gold/20 rounded-full text-luxury-gold hover:bg-luxury-gold/30 transition-colors"
            >
              <ArrowDownCircleIcon className="w-6 h-6" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </main>
  );
} 
