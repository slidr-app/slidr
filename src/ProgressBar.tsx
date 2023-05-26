import clsx from 'clsx';

export default function ProgressBar({
  slideIndex,
  slideCount,
}: {
  slideIndex: number;
  slideCount: number;
}) {
  const progressPercentage = Math.round((slideIndex * 100) / (slideCount - 1));

  return (
    <div
      className={clsx(
        'fixed bottom-0 left-0 h-1 transition-all duration-500 ease-out z-1',
        `w-[${progressPercentage}%]`,
        progressPercentage > 90
          ? 'bg-red'
          : progressPercentage > 75
          ? 'bg-amber'
          : 'bg-teal',
      )}
    />
  );
}
