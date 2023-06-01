import {Link, useRouteError} from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen min-w-screen gap-8">
      <div className="i-tabler-mood-sad-squint w-20 h-20 text-base animate-bounce-in" />
      <div className="prose">
        Something is not right. Try going <Link to="/">home</Link>.
      </div>
    </div>
  );
}
