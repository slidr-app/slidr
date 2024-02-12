import clsx from 'clsx';

export default function ProgressBar({
  slideIndex,
  slideCount,
  absolute,
}: {
  readonly slideIndex: number;
  readonly slideCount: number;
  readonly absolute?: boolean;
}) {
  const progressPercentage = (slideIndex * 100) / (slideCount - 1);

  return (
    <div
      className={clsx(
        absolute ? 'absolute' : 'fixed',
        'bottom-0 left-0 h-1 transition-all duration-500 ease-out z-1',
        progressPercentage > 90
          ? 'bg-red'
          : progressPercentage > 75
            ? 'bg-amber'
            : 'bg-teal',
      )}
      style={{width: `${progressPercentage}%`}}
    />
  );
}
