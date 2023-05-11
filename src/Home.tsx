import {Link} from 'react-router-dom';

export default function Home({
  presentationSlugs,
}: {
  presentationSlugs: string[];
}) {
  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      {presentationSlugs.map((presentationSlug) => (
        <div key={presentationSlug} className="">
          <Link to={`/${presentationSlug}`}>
            <div className="i-fluent-emoji-flat-desktop-computer inline-block mx-2" />
            {presentationSlug}
          </Link>
          <Link to={`/${presentationSlug}/speaker`}>
            <div className="i-fluent-emoji-flat-megaphone inline-block mx-2" />
          </Link>
          <Link to={`/${presentationSlug}/view`}>
            <div className="i-fluent-emoji-flat-eye inline-block mx-2" />
          </Link>
        </div>
      ))}
    </div>
  );
}
