'use client';

import React, { useState, ReactNode } from 'react';
import { cn } from '../../lib/utils/util2';


type TabsProps = {
  defaultValue: string;
  className?: string;
  children: ReactNode;
  onValueChange?: (value: string) => void;
};

type TabsContextType = {
  activeValue: string;
  setActiveValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({ defaultValue, className, children, onValueChange }: TabsProps) {
  const [activeValue, setActiveValue] = useState(defaultValue);

  const handleChange = (value: string) => {
    setActiveValue(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex space-x-2 bg-muted p-1 rounded-md", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: { value: string; children: ReactNode }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeValue === value;

  return (
    <button
      onClick={() => context.setActiveValue(value)}
      className={cn(
        "px-4 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
          : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700"
      )}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeValue !== value) return null;

  return (
    <div className={cn("mt-2", className)}>
      {children}
    </div>
  );
}
