import clsx from 'clsx/lite';
import {useEffect, useState} from 'react';

export default function Disconnected({
  isPaused,
  unPause,
}: {
  readonly isPaused: boolean;
  readonly unPause: () => void;
}) {
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    if (isPaused) {
      setSpin(false);
      return;
    }

    setSpin(true);
    const handle = setTimeout(() => {
      setSpin(false);
    }, 1000);

    return () => {
      if (handle) {
        clearTimeout(handle);
      }
    };
  }, [isPaused]);

  return (
    <div
      className={clsx(
        'fixed top-0 w-full h-full flex flex-row justify-center items-start p-6 bg-black bg-opacity-70 overflow-hidden transition-all ease-out duration-1000',
        isPaused ? 'opacity-100 z-1' : 'opacity-0 z--2',
      )}
    >
      <button
        className="btn flex flex-row items-center gap-2"
        type="button"
        onClick={() => {
          unPause();
        }}
      >
        <div
          className={clsx(
            'i-tabler-refresh',
            spin && 'animate-spin animate-duration-500',
          )}
        />
        <div>reconnect</div>
      </button>
    </div>
  );
}
