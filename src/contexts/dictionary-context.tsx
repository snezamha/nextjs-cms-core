"use client";

import { createContext, useContext } from "react";

import type { DictionaryType } from "@/lib/get-dictionary";
import type { ReactNode } from "react";

const DictionaryContext = createContext<DictionaryType | undefined>(undefined);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: DictionaryType;
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
