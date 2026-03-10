'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface QAItem {
  question: string;
  answer: string;
}

export interface SessionState {
  founderName: string;
  email: string;
  companyName: string;
  category: string;
  pitchTranscript: string;
  deckSummary: string;
  deckFileName: string;
  questions: string[];
  qaSession: QAItem[];
  report: string;
  scores: {
    problemSolution: number;
    marketOpportunity: number;
    businessModel: number;
    team: number;
    traction: number;
    overall: number;
  };
}

type SessionAction =
  | { type: 'SET_USER_INFO'; payload: Pick<SessionState, 'founderName' | 'email' | 'companyName' | 'category'> }
  | { type: 'SET_PITCH_TRANSCRIPT'; payload: string }
  | { type: 'SET_DECK'; payload: { deckSummary: string; deckFileName: string } }
  | { type: 'SET_QUESTIONS'; payload: string[] }
  | { type: 'ADD_QA'; payload: QAItem }
  | { type: 'SET_REPORT'; payload: { report: string; scores: SessionState['scores'] } }
  | { type: 'RESET' };

const initialState: SessionState = {
  founderName: '',
  email: '',
  companyName: '',
  category: 'Life Science',
  pitchTranscript: '',
  deckSummary: '',
  deckFileName: '',
  questions: [],
  qaSession: [],
  report: '',
  scores: { problemSolution: 0, marketOpportunity: 0, businessModel: 0, team: 0, traction: 0, overall: 0 },
};

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_USER_INFO': return { ...state, ...action.payload };
    case 'SET_PITCH_TRANSCRIPT': return { ...state, pitchTranscript: action.payload };
    case 'SET_DECK': return { ...state, deckSummary: action.payload.deckSummary, deckFileName: action.payload.deckFileName };
    case 'SET_QUESTIONS': return { ...state, questions: action.payload };
    case 'ADD_QA': return { ...state, qaSession: [...state.qaSession, action.payload] };
    case 'SET_REPORT': return { ...state, ...action.payload };
    case 'RESET': return initialState;
    default: return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
