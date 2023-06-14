import clsx from 'clsx';
import Loading from './Loading';

export default function Slideshow({
  pageIndex,
  pages,
  forward,
  onClick,
}: {
  pageIndex: number;
  pages: string[];
  forward?: boolean;
  onClick?: () => void;
}) {
  if (pages.length === 0) {
    return (
      <div className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))] z--1">
        <Loading />
      </div>
    );
  }

  // Use a function for readability
  function pageUnder() {
    if (forward === true && pageIndex > 0) {
      return pageIndex - 1;
    }

    if (forward === false && pageIndex < pages.length - 1) {
      return pageIndex + 1;
    }
  }

  const pageUnderIndex = pageUnder();

  return (
    <div className="w-full aspect-video position-relative max-w-[calc(100vh_*_(16/9))]">
      {pageUnderIndex !== undefined && (
        <img
          key={pageUnderIndex}
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
          forward !== undefined && 'animate-fade-in animate-duration-500',
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
            (index !== pageUnderIndex || forward === undefined),
        )
        .map((page) => (
          <img
            key={page}
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
