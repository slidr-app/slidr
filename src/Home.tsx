import {useEffect} from 'react';
import {Link} from 'react-router-dom';

export default function Home({
  presentationSlugs,
}: {
  presentationSlugs: string[];
}) {
  useEffect(() => {
    document.title = `Present - Home`;
  }, []);

  return (
    <div className="flex flex-col items-center mt-2">
      <div className="header self-center w-full text-3xl">
        Present!
        <div className="i-tabler-microphone-2 ml-2" />
      </div>
      <div className="p-4 grid grid-cols-[auto_auto_auto] gap-y-6">
        {presentationSlugs.map((presentationSlug) => (
          <div key={presentationSlug} className="contents">
            <Link to={`/${presentationSlug}`}>
              <button
                className="btn border-r-none rounded-r-none pl-6 w-full"
                type="button"
              >
                <div className="i-tabler-presentation mr-2" />
                {presentationSlug}
              </button>
            </Link>
            <Link to={`/${presentationSlug}/speaker`} className="">
              <button
                className="btn border-x-none rounded-r-none rounded-l-none w-full"
                type="button"
              >
                <div className="i-tabler-speakerphone" />
              </button>
            </Link>
            <Link to={`/${presentationSlug}/view`}>
              <button
                className="btn border-l-none rounded-l-none pr-6 w-full"
                type="button"
              >
                <div className="i-tabler-eyeglass" />
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
