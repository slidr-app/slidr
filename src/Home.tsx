import {Link} from 'react-router-dom';

export default function Home({presentations}: {presentations: string[]}) {
  return (
    <div className="max-w-md mx-auto p-4 flex flex-col">
      {presentations.map((presentation) => (
        <div key={presentation} className="">
          <Link to={`/${presentation}`}>
            <div className="i-fluent-emoji-flat-desktop-computer inline-block mx-2" />
            {presentation}
          </Link>
          <Link to={`/${presentation}/speaker`}>
            <div className="i-fluent-emoji-flat-megaphone inline-block mx-2" />
          </Link>
          <Link to={`/${presentation}/view`}>
            <div className="i-fluent-emoji-flat-eye inline-block mx-2" />
          </Link>
        </div>
      ))}
    </div>
  );
}
