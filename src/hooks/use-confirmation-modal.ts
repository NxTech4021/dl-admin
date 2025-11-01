"use client";

import { useState, useCallback } from "react";

interface ConfirmationState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  isLoading: boolean;
  variant?: "default" | "destructive";
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmationModal() {
  const [state, setState] = useState<ConfirmationState>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    isLoading: false,
    variant: "default",
  });

  const showConfirmation = useCallback((config: Omit<ConfirmationState, "open" | "isLoading">) => {
    setState({
      ...config,
      open: true,
      isLoading: false,
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  return {
    ...state,
    showConfirmation,
    hideConfirmation,
    setLoading,
  };
}