import React, { useState, useEffect } from 'react';
import { ParsedRequest, AnalysisResult, GeneratedPoc, Project } from '../types';
import { AppContext } from './context';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRequest, setCurrentRequest] = useState<ParsedRequest | null>(() => {
    try {
      const saved = sessionStorage.getItem('csrf_forge_current_req');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(() => {
    try {
      const saved = sessionStorage.getItem('csrf_forge_current_analysis');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [generatedPocs, setGeneratedPocs] = useState<GeneratedPoc[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (currentRequest) {
      sessionStorage.setItem('csrf_forge_current_req', JSON.stringify(currentRequest));
    } else {
      sessionStorage.removeItem('csrf_forge_current_req');
    }
  }, [currentRequest]);

  useEffect(() => {
    if (currentAnalysis) {
      sessionStorage.setItem('csrf_forge_current_analysis', JSON.stringify(currentAnalysis));
    } else {
      sessionStorage.removeItem('csrf_forge_current_analysis');
    }
  }, [currentAnalysis]);

  const addGeneratedPoc = (poc: GeneratedPoc) => {
    setGeneratedPocs((prev) => [poc, ...prev]);
  };

  const clearCurrentSession = () => {
    setCurrentRequest(null);
    setCurrentAnalysis(null);
    setGeneratedPocs([]);
    sessionStorage.removeItem('csrf_forge_current_req');
    sessionStorage.removeItem('csrf_forge_current_analysis');
  };

  return (
    <AppContext.Provider
      value={{
        currentRequest,
        setCurrentRequest,
        currentAnalysis,
        setCurrentAnalysis,
        generatedPocs,
        addGeneratedPoc,
        projects,
        setProjects,
        clearCurrentSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
