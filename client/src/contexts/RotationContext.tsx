import React, { createContext, useState, useCallback } from 'react';

interface RotationContextType {
  rotationKey: number;
  focusPlayer: 'white' | 'black';
  triggerRotation: (focusPlayer: 'white' | 'black') => void;
}

export const RotationContext = createContext<RotationContextType | undefined>(undefined);

export function RotationProvider({ children }: { children: React.ReactNode }) {
  const [rotationKey, setRotationKey] = useState(0);
  const [focusPlayer, setFocusPlayer] = useState<'white' | 'black'>('white');

  const triggerRotation = useCallback((focusPlayer: 'white' | 'black') => {
    setFocusPlayer(focusPlayer);
    setRotationKey(prev => prev + 1);
  }, []);

  return (
    <RotationContext.Provider value={{ rotationKey, focusPlayer, triggerRotation }}>
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
