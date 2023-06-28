import {useRouteError} from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen min-w-screen gap-8">
      <div className="i-tabler-mood-sad-squint w-20 h-20 text-base animate-bounce-in" />
      <div className="prose">
        Something is not right. Try{' '}
        <a
          href={window.location.href}
          onClick={() => {
            window.location.reload();
          }}
        >
          refreshing
        </a>{' '}
        or going{' '}
        <a
          // Use an anchor tag to force a refresh, may not be necessary once PWA is implemented
          href="/"
        >
          home
        </a>
        .
      </div>
    </div>
  );
}
