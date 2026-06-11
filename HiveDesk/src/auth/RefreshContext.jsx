import React, { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext(0);
const TriggerContext = createContext(() => {});

export function RefreshProvider({ children }) {
  const [signal, setSignal] = useState(0);
  const trigger = useCallback(() => setSignal(s => s + 1), []);
  return (
    <TriggerContext.Provider value={trigger}>
      <RefreshContext.Provider value={signal}>
        {children}
      </RefreshContext.Provider>
    </TriggerContext.Provider>
  );
}

export function useRefreshSignal() {
  return useContext(RefreshContext);
}

export function useRefreshTrigger() {
  return useContext(TriggerContext);
}
