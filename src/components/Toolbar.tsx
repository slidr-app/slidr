import clsx from 'clsx';
import {useEffect, useState} from 'react';

export default function Toolbar({
  onPrevious,
  onNext,
  onStart,
  onEnd,
}: {
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(document.fullscreenEnabled);
  useEffect(() => {
    function updateFullScreen() {
      setIsFullscreen(document.fullscreenElement !== null);
    }

    document.addEventListener('fullscreenchange', updateFullScreen);
    return () => {
      document.removeEventListener('fullscreenchange', updateFullScreen);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 p-8 pb-3 pl-3 opacity-0 hover:opacity-100 transition-opacity duration-400 ease-out z-1">
      <div className="flex flex-row bg-gray-800 rounded-md px-3 py-2 gap-3 shadow-teal-800 shadow-xl">
        <button
          className="i-tabler-arrow-big-left-filled text-teal font-size-[4rem]"
          type="button"
          onClick={onPrevious}
        />
        <button
          className="i-tabler-arrow-big-right-filled text-teal font-size-[4rem]"
          type="button"
          onClick={onNext}
        />
        <button
          className="i-tabler-arrow-bar-to-left text-teal font-size-[4rem]"
          type="button"
          onClick={onStart}
        />
        <button
          className="i-tabler-arrow-bar-to-right text-teal font-size-[4rem]"
          type="button"
          onClick={onEnd}
        />
        <button
          className="i-tabler-tools-off text-teal font-size-[4rem]"
          type="button"
        />
        <button
          className={clsx(
            'font-size-[4rem]',
            isFullscreen
              ? 'i-tabler-arrows-diagonal-minimize-2'
              : 'i-tabler-arrows-diagonal',
            document.fullscreenEnabled ? 'text-teal' : 'text-gray-400',
          )}
          disabled={!document.fullscreenEnabled}
          type="button"
          onClick={() => {
            console.log('go fullscreen');
            if (!document.fullscreenElement) {
              void document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
              void document.exitFullscreen();
            }
          }}
        />
      </div>
    </div>
  );
}
