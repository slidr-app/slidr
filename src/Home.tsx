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
          <div
            key={presentationSlug}
            className="contents children:(shadow-xl shadow-teal-900 border-teal border-2 text-2xl p-4)"
          >
            <div className="rounded-l-md overflow-hidden flex flex-col justify-center border-r-none">
              <Link to={`/${presentationSlug}`}>
                <div className="i-tabler-presentation" />
                {presentationSlug}
              </Link>
            </div>
            <div className="overflow-hidden flex flex-col justify-center border-x-none">
              <Link to={`/${presentationSlug}/speaker`} className="">
                <div className="i-tabler-speakerphone" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-r-md flex flex-col justify-center border-l-none">
              <Link to={`/${presentationSlug}/view`}>
                <div className="i-tabler-eyeglass" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
