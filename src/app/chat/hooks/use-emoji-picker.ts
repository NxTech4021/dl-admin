import { useState, useCallback } from 'react';

export const useEmojiPicker = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openPicker = useCallback(() => setIsOpen(true), []);
  const closePicker = useCallback(() => setIsOpen(false), []);
  const togglePicker = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openPicker,
    closePicker,
    togglePicker,
    setIsOpen,
  };
};