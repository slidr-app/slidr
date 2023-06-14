import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {type PresentationDoc} from '../presentation';

export default function Toolbar({
  onPrevious,
  onNext,
  onStart,
  onEnd,
  presentation,
}: {
  onPrevious: () => void;
  onNext: () => void;
  onStart: () => void;
  onEnd: () => void;
  presentation?: PresentationDoc;
}) {
  const [isFullscreen, setIsFullscreen] = useState(
    document.fullscreenElement !== null,
  );
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
      <div
        className="flex flex-row bg-gray-800 rounded-md px-3 py-2 gap-3 shadow-teal-800 shadow-xl"
        onClick={(event) => {
          // Prevents navigating forward when toolbar is over the click to advance area
          event.stopPropagation();
        }}
      >
        <button
          className="i-tabler-arrow-big-left-filled text-teal font-size-[4rem]"
          type="button"
          title="Previous"
          onClick={onPrevious}
        />
        <button
          className="i-tabler-arrow-big-right-filled text-teal font-size-[4rem]"
          type="button"
          title="Next"
          onClick={onNext}
        />
        <button
          className="i-tabler-arrow-bar-to-left text-teal font-size-[4rem]"
          type="button"
          title="Start"
          onClick={onStart}
        />
        <button
          className="i-tabler-arrow-bar-to-right text-teal font-size-[4rem]"
          type="button"
          title="End"
          onClick={onEnd}
        />
        <div className="border-l-black border-l-1 mx-1" />
        <button
          className="i-tabler-speakerphone text-teal font-size-[4rem]"
          type="button"
          title="Open speaker view"
          onClick={() =>
            window.open(
              `${window.location.origin}${window.location.pathname}/speaker${window.location.search}`,
              undefined,
              'popup',
            )
          }
        />
        <button
          className="i-tabler-eyeglass text-teal font-size-[4rem]"
          type="button"
          title="Open audience view"
          onClick={() =>
            window.open(
              `${window.location.origin}${window.location.pathname}/view${window.location.search}`,
            )
          }
        />
        <Link
          className="flex"
          to={presentation ? `/${presentation.id}/notes` : '/'}
        >
          <button
            className="i-tabler-pencil text-teal font-size-[4rem]"
            type="button"
            title="Edit presentation"
          />
        </Link>
        <Link className="flex" to="/">
          <button
            className="i-tabler-home text-teal font-size-[4rem]"
            type="button"
            title="Home"
          />
        </Link>
        {/* <button
          className="i-tabler-tools-off text-teal font-size-[4rem]"
          type="button"
          title="Hide toolbar"
        /> */}
        <div className="border-l-black border-l-1 mx-1" />

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
          title="Toggle fullscreen"
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
