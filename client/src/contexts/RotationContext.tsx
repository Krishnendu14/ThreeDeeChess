import React, { createContext, useState, useCallback } from 'react';

interface RotationContextType {
  rotationKey: number;
  triggerRotation: () => void;
}

export const RotationContext = createContext<RotationContextType | undefined>(undefined);

export function RotationProvider({ children }: { children: React.ReactNode }) {
  const [rotationKey, setRotationKey] = useState(0);

  const triggerRotation = useCallback(() => {
    setRotationKey(prev => prev + 1);
  }, []);

  return (
    <RotationContext.Provider value={{ rotationKey, triggerRotation }}>
      {children}
    </RotationContext.Provider>
  );
}

export function useRotation() {
  const context = React.useContext(RotationContext);
  if (!context) {
    throw new Error('useRotation must be used within RotationProvider');
  }
  return context;
}
