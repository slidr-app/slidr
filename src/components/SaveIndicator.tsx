import clsx from 'clsx';
import {useEffect, useRef} from 'react';

export default function SaveIndicator({
  saveState,
}: {
  saveState: 'saved' | 'saving' | 'dirty';
}) {
  // Fixing an element to the bottom doesn't work very well in ios (when the keyboard can cover the bottom)
  // This seems to fix it
  // References:
  // https://stackoverflow.com/a/71547560
  // https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport#simulating_position_device-fixed
  // https://github.com/WICG/visual-viewport
  const buttonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function fixButtonPosition() {
      const viewport = window.visualViewport;
      if (!viewport || !buttonRef.current) {
        return;
      }

      const offsetTop = viewport.height - viewport.offsetTop - 60;
      buttonRef.current.style.top = `${offsetTop}px`;
    }

    window.visualViewport?.addEventListener('scroll', fixButtonPosition);
    window.visualViewport?.addEventListener('resize', fixButtonPosition);

    return () => {
      window.visualViewport?.removeEventListener('scroll', fixButtonPosition);
      window.visualViewport?.removeEventListener('resize', fixButtonPosition);
    };
  }, []);

  return (
    <div
      ref={buttonRef}
      className={clsx(
        'btn fixed right-5 flex flex-row items-center shadow-md text-base transition-opacity ease-in-out bg-black',
        saveState === 'saved' && 'opacity-0 duration-5000',
        saveState === 'dirty' && 'opacity-100 duration-1000',
        saveState === 'saving' && 'opacity-100 duration-1000',
        // Set an initial top offset, this will be recalculated in the visual viewport handlers
        'top-[calc(100vh_-_60px)]',
      )}
    >
      <div>{saveState === 'saved' ? 'Saved' : 'Saving'}</div>
      <div
        className={clsx(
          'ml-2',
          saveState === 'saved' && 'i-tabler-check',
          ['saving', 'dirty'].includes(saveState) &&
            'i-tabler-loader-3 animate-spin',
        )}
      />
    </div>
  );
}
