import clsx from 'clsx';
import {useEffect, useState} from 'react';
import {type PresentationAndId} from '../../../functions/src/presentation';
import {auth} from '../../firebase';
import Button from './Button';
import NavButtons from './NavButtons';
import LinkButton from './LinkButton';

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
  presentation: PresentationAndId;
}) {
  // Force the toolbar to be shown for a short time
  const [forceToolbar, setForceToolbar] = useState(false);
  useEffect(() => {
    setForceToolbar(true);

    let cancel = false;
    let handle: NodeJS.Timeout | undefined = setTimeout(() => {
      if (cancel) {
        return;
      }

      setForceToolbar(false);
      handle = undefined;
    }, 2000);

    return () => {
      cancel = true;
      if (handle) {
        clearTimeout(handle);
        handle = undefined;
      }
    };
  }, []);

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

  const isOwner = presentation.data?.uid === auth.currentUser?.uid;

  return (
    <div
      className={clsx(
        'max-w-screen fixed bottom-0 left-0 flex p-8 pb-3 pl-3 opacity-0 hover:opacity-100 transition-opacity duration-400 ease-out z-1 bg-transparent media-[(hover:_none)]:(opacity-100)',
        forceToolbar && 'opacity-100',
      )}
    >
      <div
        className={clsx(
          'grid gap-0.5 children:(shadow-lg shadow-teal-800)',
          'first:children:landscape:(rounded-l-md overflow-hidden) last:children:landscape:(rounded-r-md overflow-hidden)',
          'first:children:portrait:(rounded-t-md overflow-hidden) last:children:portrait:(rounded-b-md overflow-hidden)',
          isOwner ? 'grid-cols-10' : 'grid-cols-9',
          isOwner
            ? 'portrait:(grid-cols-1 grid-rows-10)'
            : 'portrait:(grid-cols-1 grid-rows-9)',
        )}
        onClick={(event) => {
          // Prevents navigating forward when toolbar is over the click to advance area
          event.stopPropagation();
        }}
      >
        <NavButtons
          onPrevious={onPrevious}
          onNext={onNext}
          onStart={onStart}
          onEnd={onEnd}
        />
        <LinkButton
          icon="i-tabler-speakerphone"
          label="speaker"
          title="Open speaker view"
          to={`${window.location.origin}/s/${presentation?.id ?? ''}${
            window.location.search
          }`}
          onClick={(event) => {
            event.preventDefault();
            window.open(
              `${window.location.origin}/s/${presentation?.id ?? ''}${
                window.location.search
              }`,
              undefined,
              'popup',
            );
          }}
        />
        <LinkButton
          newTab
          icon="i-tabler-eyeglass"
          label="audience"
          title="Open audience view"
          to={`${window.location.origin}/i/${presentation?.id ?? ''}${
            window.location.search
          }`}
        />
        <LinkButton
          clientRoute
          icon="i-tabler-eye"
          label="view"
          title="View presentation in browser"
          to={`/v/${presentation?.id ?? ''}${window.location.search}`}
        />
        {isOwner && (
          <LinkButton
            clientRoute
            icon="i-tabler-pencil"
            label="edit"
            title="Edit presentation"
            to={`/e/${presentation.id ?? ''}`}
          />
        )}
        {/* <button
                className="i-tabler-tools-off text-teal font-size-[4rem]"
                type="button"
                title="Hide toolbar"
              /> */}
        {/* <div className="border-l-black border-l-1 mx-1" /> */}
        <LinkButton
          clientRoute
          icon="i-tabler-home"
          label="home"
          title="Home"
          to="/"
        />
        <Button
          disabled={!document.fullscreenEnabled}
          icon={
            isFullscreen
              ? 'i-tabler-arrows-diagonal-minimize-2'
              : 'i-tabler-arrows-diagonal'
          }
          label={isFullscreen ? 'window' : 'fullscreen'}
          title="Toggle fullscreen"
          onClick={() => {
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
