import {useEffect} from 'react';

export default function useKeys(keyHandlers: Map<string, () => void>) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      console.log(event.code);
      const handler = keyHandlers.get(event.code);
      if (handler) {
        handler();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [keyHandlers]);
}
