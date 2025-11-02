'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  isCompressed: boolean;
  setIsCompressed: (value: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType>({
  isCompressed: false,
  setIsCompressed: () => {},
});

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [isCompressed, setIsCompressed] = useState(false);

  return (
    <HeaderContext.Provider value={{ isCompressed, setIsCompressed }}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  return useContext(HeaderContext);
}
