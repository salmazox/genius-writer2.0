
import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean; // Command on Mac
  shiftKey?: boolean;
  altKey?: boolean;
};

export const useKeyboardShortcuts = (
  shortcuts: { combo: KeyCombo; handler: (e: KeyboardEvent) => void }[]
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ combo, handler }) => {
        const isKeyMatch = event.key.toLowerCase() === combo.key.toLowerCase();
        const isCtrlMatch = !!combo.ctrlKey === event.ctrlKey;
        const isMetaMatch = !!combo.metaKey === event.metaKey;
        const isShiftMatch = !!combo.shiftKey === event.shiftKey;
        const isAltMatch = !!combo.altKey === event.altKey;

        // Allow Ctrl OR Meta for "Cmd/Ctrl" shortcuts unless specified otherwise
        const isCommandMatch = (combo.ctrlKey || combo.metaKey) 
          ? (event.ctrlKey || event.metaKey) 
          : true;

        if (isKeyMatch && isCommandMatch && isShiftMatch && isAltMatch) {
          event.preventDefault();
          handler(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
