import clsx from 'clsx';

export default function SaveIndicator({
  saveState,
}: {
  saveState: 'saved' | 'saving' | 'dirty';
}) {
  return (
    <div
      className={clsx(
        'w-full flex flex-row justify-center pointer-events-none fixed top-2 left-0 transition-opacity ease-in-out text-2xl',
        saveState === 'saved' && 'opacity-0 duration-5000',
        saveState === 'dirty' && 'opacity-100 duration-1000',
        saveState === 'saving' && 'opacity-100 duration-1000',
      )}
    >
      <div className="btn py-1 px-6 shadow-md flex flex-col items-center bg-gray-900 bg-opacity-85">
        <div
          className={clsx(
            'text-teal',
            saveState === 'saved' && 'i-tabler-check',
            ['saving', 'dirty'].includes(saveState) &&
              'i-tabler-loader-3 animate-spin',
          )}
        />
        <div className="leading-none text-sm">
          {saveState === 'saved' ? 'saved' : 'saving'}
        </div>
      </div>
    </div>
  );
}
