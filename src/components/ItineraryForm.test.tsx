import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ItineraryForm from './ItineraryForm';

// Mock the router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock validation schema
vi.mock('@/lib/validations/itinerary', () => ({
  itinerarySchema: {
    parse: vi.fn().mockImplementation((data) => data),
  },
}));

describe('ItineraryForm', () => {
  it('renders form fields', () => {
    render(<ItineraryForm />);
    
    // Check if basic form elements are present
    expect(screen.getByPlaceholderText(/where would you like to go/i)).toBeInTheDocument();
  });
  
  // Add simplified tests that don't depend on specific implementation details
  it('has a submit button', () => {
    render(<ItineraryForm />);
    
    const submitButton = screen.getByText(/Create My Trip/i);
    
    expect(submitButton).toBeInTheDocument();
  });
});