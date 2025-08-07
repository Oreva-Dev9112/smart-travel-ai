'use client';

import React, { createContext, useContext, useReducer } from 'react';

// Form state type
export interface TripFormState {
  destination: string;
  checkIn: string;
  checkOut: string;
  travelers: string;
  budget: number;
  travelStyle: string;
  accommodationType: string;
  transportation: string;
  activities: string[];
  preferences: string;
  step: number;
  isSubmitting: boolean;
  isComplete: boolean;
}

// Initial state
const initialState: TripFormState = {
  destination: '',
  checkIn: '',
  checkOut: '',
  travelers: '',
  budget: 10000,
  travelStyle: '',
  accommodationType: '',
  transportation: '',
  activities: [],
  preferences: '',
  step: 1,
  isSubmitting: false,
  isComplete: false,
};

// Action types
type ActionType =
  | { type: 'SET_FIELD'; field: keyof TripFormState; value: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET_FORM' }
  | { type: 'TOGGLE_ACTIVITY'; activity: string }
  | { type: 'SUBMIT_FORM' }
  | { type: 'COMPLETE_SUBMISSION' }
  | { type: 'SET_STEP'; step: number };

// Reducer function
function formReducer(state: TripFormState, action: ActionType): TripFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      };
    case 'NEXT_STEP':
      return {
        ...state,
        step: Math.min(state.step + 1, 3),
      };
    case 'PREV_STEP':
      return {
        ...state,
        step: Math.max(state.step - 1, 1),
      };
    case 'RESET_FORM':
      return initialState;
    case 'TOGGLE_ACTIVITY': {
      const activities = [...state.activities];
      const index = activities.indexOf(action.activity);
      
      if (index > -1) {
        activities.splice(index, 1);
      } else {
        activities.push(action.activity);
      }
      
      return {
        ...state,
        activities,
      };
    }
    case 'SUBMIT_FORM':
      return {
        ...state,
        isSubmitting: true,
      };
    case 'COMPLETE_SUBMISSION':
      return {
        ...state,
        isSubmitting: false,
        isComplete: true,
      };
    case 'SET_STEP':
      return {
        ...state,
        step: action.step,
      };
    default:
      return state;
  }
}

// Context
interface FormContextType {
  state: TripFormState;
  dispatch: React.Dispatch<ActionType>;
  setField: <K extends keyof TripFormState>(field: K, value: TripFormState[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  toggleActivity: (activity: string) => void;
  submitForm: () => void;
  isBudgetCategoryActive: (index: number) => boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Helper functions
  const setField = <K extends keyof TripFormState>(field: K, value: TripFormState[K]) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const prevStep = () => {
    dispatch({ type: 'PREV_STEP' });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
  };

  const toggleActivity = (activity: string) => {
    dispatch({ type: 'TOGGLE_ACTIVITY', activity });
  };

  const submitForm = () => {
    dispatch({ type: 'SUBMIT_FORM' });
    
    // Simulate API call
    setTimeout(() => {
      dispatch({ type: 'COMPLETE_SUBMISSION' });
      process.env.NODE_ENV !== "production" && console.log('Form submitted:', state);
    }, 1500);
  };

  const isBudgetCategoryActive = (index: number) => {
    const min = 500 + ((50000 - 500) * (index / 4));
    const max = 500 + ((50000 - 500) * ((index + 1) / 4));
    return state.budget >= min && state.budget <= max;
  };

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch,
        setField,
        nextStep,
        prevStep,
        resetForm,
        toggleActivity,
        submitForm,
        isBudgetCategoryActive,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
} 