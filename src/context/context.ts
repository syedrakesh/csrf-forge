import { createContext } from 'react';
import { ParsedRequest, AnalysisResult, GeneratedPoc, Project } from '../types';

export interface AppContextType {
  currentRequest: ParsedRequest | null;
  setCurrentRequest: (req: ParsedRequest | null) => void;
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  generatedPocs: GeneratedPoc[];
  addGeneratedPoc: (poc: GeneratedPoc) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  clearCurrentSession: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
