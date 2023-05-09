import {useEffect} from 'react';

export default function useArrowKeys(
  onLeftArrow: () => void,
  onRightArrow: () => void,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === 'ArrowRight') {
        onRightArrow();
      }

      if (event.code === 'ArrowLeft') {
        onLeftArrow();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Don't forget to clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRightArrow, onLeftArrow]);
}
