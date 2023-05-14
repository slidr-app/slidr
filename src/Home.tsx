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
    <div className="flex flex-col items-center">
      <div className="p-4 grid grid-cols-[auto_auto_auto] gap-y-4">
        {presentationSlugs.map((presentationSlug) => (
          <div key={presentationSlug} className="contents">
            <Link to={`/${presentationSlug}`}>
              <button
                className="btn border-r-none rounded-r-none"
                type="button"
              >
                <div className="i-tabler-presentation mr-2" />
                {presentationSlug}
              </button>
            </Link>
            <Link to={`/${presentationSlug}/speaker`} className="">
              <button
                className="btn border-x-none rounded-r-none rounded-l-none"
                type="button"
              >
                <div className="i-tabler-speakerphone" />
              </button>
            </Link>
            <Link to={`/${presentationSlug}/view`}>
              <button
                className="btn border-l-none rounded-l-none"
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
