import clsx from 'clsx/lite';
import Loading from '../Loading';

export default function Slideshow({
  pageIndex,
  pages,
  isForward,
  onClick,
}: {
  readonly pageIndex: number;
  readonly pages: string[];
  readonly isForward?: boolean;
  readonly onClick?: () => void;
}) {
  if (pages.length === 0) {
    return (
      <div className="w-full aspect-video position-relative z--1">
        <Loading />
      </div>
    );
  }

  // Use a function for readability
  function pageUnder() {
    // Depending on the direction, the page under will be the previous or next index
    // There is nothing to render if we are already at the first or last index
    if (isForward === true && pageIndex > 0) {
      return pageIndex - 1;
    }

    if (isForward === false && pageIndex < pages.length - 1) {
      return pageIndex + 1;
    }
  }

  const pageUnderIndex = pageUnder();

  return (
    <div className="w-full aspect-video position-relative">
      {pageUnderIndex !== undefined && (
        <img
          key={pageUnderIndex}
          aria-hidden
          className="w-full h-full absolute top-0 left-0"
          // @ts-expect-error fetchPriority is not in the react typings
          // eslint-disable-next-line react/no-unknown-property
          fetchpriority="high"
          src={pages[pageUnderIndex]}
          alt={`Slide page ${pageUnderIndex + 1}`}
        />
      )}
      <img
        key={pageIndex}
        className={clsx(
          'w-full h-full absolute top-0 left-0',
          isForward !== undefined && 'animate-fade-in animate-duration-500',
        )}
        // @ts-expect-error fetchPriority is not in the react typings
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="high"
        src={pages[pageIndex]}
        alt={`Slide page ${pageIndex + 1}`}
        onClick={() => {
          onClick?.();
        }}
      />

      {/* Preload all of the other images at a low priority (if browser supported) */}
      {pages
        .filter(
          (_, index) =>
            index !== pageIndex &&
            (index !== pageUnderIndex || isForward === undefined),
        )
        .map((page) => (
          <img
            key={page}
            aria-hidden
            className="w-full h-full absolute top-0 left-0 hidden"
            // @ts-expect-error fetchPriority is not in the react typings
            // eslint-disable-next-line react/no-unknown-property
            fetchpriority="low"
            src={page}
          />
        ))}
    </div>
  );
}
