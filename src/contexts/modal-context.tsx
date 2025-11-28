"use client";

import React, { createContext, useContext, useState } from "react";

interface ModalContextType {
  isSeasonCreateOpen: boolean;
  isPlayerCreateOpen: boolean;
  isMatchCreateOpen: boolean;
  openSeasonCreate: () => void;
  closeSeasonCreate: () => void;
  openPlayerCreate: () => void;
  closePlayerCreate: () => void;
  openMatchCreate: () => void;
  closeMatchCreate: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isSeasonCreateOpen, setIsSeasonCreateOpen] = useState(false);
  const [isPlayerCreateOpen, setIsPlayerCreateOpen] = useState(false);
  const [isMatchCreateOpen, setIsMatchCreateOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        isSeasonCreateOpen,
        isPlayerCreateOpen,
        isMatchCreateOpen,
        openSeasonCreate: () => setIsSeasonCreateOpen(true),
        closeSeasonCreate: () => setIsSeasonCreateOpen(false),
        openPlayerCreate: () => setIsPlayerCreateOpen(true),
        closePlayerCreate: () => setIsPlayerCreateOpen(false),
        openMatchCreate: () => setIsMatchCreateOpen(true),
        closeMatchCreate: () => setIsMatchCreateOpen(false),
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
