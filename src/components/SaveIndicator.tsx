import clsx from 'clsx';

export default function SaveIndicator({
  saveState,
}: {
  saveState: 'saved' | 'saving' | 'dirty';
}) {
  return (
    <div
      className={clsx(
        'btn fixed bottom-10 right-10 flex flex-row items-center shadow-md text-base transition-opacity ease-in-out bg-black',
        saveState === 'saved' && 'opacity-0 duration-5000',
        saveState === 'dirty' && 'opacity-100 duration-1000',
        saveState === 'saving' && 'opacity-100 duration-1000',
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
