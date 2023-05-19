import {useEffect, Fragment} from 'react';
import {Link} from 'react-router-dom';
import {presentations, thumbs} from './presentation-urls.ts';

const presentationSlugs = Object.keys(presentations).sort();

export default function Home() {
  useEffect(() => {
    document.title = `Present - Home`;
  }, []);

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="w-full px-4">
        <div className="header self-center w-full text-3xl">
          Present!
          <div className="i-tabler-microphone-2 ml-2" />
        </div>
      </div>
      <div className="p-4 grid grid-cols-[auto_auto] gap-y-6">
        {presentationSlugs.map((presentationSlug) => (
          <Fragment key={presentationSlug}>
            <Link
              to={`/${presentationSlug}`}
              className="shadow-primary border-primary rounded-r-none flex overflow-hidden bg-black"
            >
              {thumbs.has(presentationSlug) ? (
                <picture className="max-w-[600px] aspect-video object-contain relative">
                  <source
                    srcSet={thumbs.get(presentationSlug)?.webp}
                    type="image/webp"
                  />
                  <source
                    srcSet={thumbs.get(presentationSlug)?.avif}
                    type="image/avif"
                  />
                  <img
                    src={thumbs.get(presentationSlug)?.png}
                    className=""
                    loading="lazy"
                    decoding="async"
                    alt={`thumbnail ${presentationSlug}`}
                  />
                </picture>
              ) : (
                <div>no preview</div>
              )}
            </Link>

            <div className="border-2 border-primary shadow-primary border-l-none rounded-l-none relative p-4 flex flex-col justify-center bg-black">
              <div className="flex-grow flex items-center justify-center">
                <Link to={`/${presentationSlug}`}>
                  <button
                    className="btn border-none shadow-none p-0 flex flex-col items-center justify-center"
                    type="button"
                  >
                    <div className="text-3xl">
                      <div className="i-tabler-presentation mr-2" />
                      {presentationSlug}
                    </div>
                    <div className="text-base font-normal">present</div>
                  </button>
                </Link>
              </div>
              <div className="grid grid-cols-2 items-center justify-items-center">
                <Link to={`/${presentationSlug}/speaker`} className="flex">
                  <button
                    className="btn border-none shadow-none flex flex-col items-center p-0"
                    type="button"
                  >
                    <div className="i-tabler-speakerphone" />
                    <div className="text-base font-normal">speaker</div>
                  </button>
                </Link>
                <Link to={`/${presentationSlug}/view`} className="">
                  <button
                    className="btn border-none shadow-none flex flex-col items-center"
                    type="button"
                  >
                    <div className="i-tabler-eyeglass" />
                    <div className="text-base font-normal">audience</div>
                  </button>
                </Link>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
