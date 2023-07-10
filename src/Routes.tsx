import {lazy} from 'react';
import {type RouteObject, redirect} from 'react-router-dom';
import ErrorPage from './pages/ErrorPage.tsx';

const Audience = lazy(async () => import('./pages/Audience.tsx'));
const Speaker = lazy(async () => import('./pages/Speaker.tsx'));
const Presentation = lazy(async () => import('./pages/Presentation.tsx'));
const Home = lazy(async () => import('./pages/Home.tsx'));
const SignIn = lazy(async () => import('./pages/SignIn.tsx'));
const Upload = lazy(async () => import('./pages/Upload.tsx'));
const PresentationPreferences = lazy(
  async () => import('./pages/PresentationPreferences.tsx'),
);
const UserPreferences = lazy(async () => import('./pages/UserPreferences.tsx'));
const Viewer = lazy(async () => import('./pages/Viewer.tsx'));

const Routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/signin',
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/upload',
    element: <Upload />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/user',
    element: <UserPreferences />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/p/:presentationId',
    element: <Presentation />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/r/p/:presentationId',
    // Note: redirects could also happen with a component and useNavigate... not sure which is better
    loader({request}) {
      const redirectTo = new URL(request.url);
      return redirect(
        `${redirectTo.pathname.replace('/r/', '/')}${redirectTo.search}`,
      );
    },
    errorElement: <ErrorPage />,
  },
  {
    path: '/i/:presentationId',
    element: <Audience />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/r/i/:presentationId',
    // Note: redirects could also happen with a component and useNavigate... not sure which is better
    loader({request}) {
      const redirectTo = new URL(request.url);
      return redirect(
        `${redirectTo.pathname.replace('/r/', '/')}${redirectTo.search}`,
      );
    },
    errorElement: <ErrorPage />,
  },
  {
    path: '/s/:presentationId',
    element: <Speaker />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/v/:presentationId',
    element: <Viewer />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/r/v/:presentationId',
    // Note: redirects could also happen with a component and useNavigate... not sure which is better
    loader({request}) {
      const redirectTo = new URL(request.url);
      return redirect(
        `${redirectTo.pathname.replace('/r/', '/')}${redirectTo.search}`,
      );
    },
    errorElement: <ErrorPage />,
  },
  {
    path: '/e/:presentationId',
    element: <PresentationPreferences />,
    errorElement: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
];

export default Routes;
