// eslint-disable-line unicorn/filename-case
import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import ErrorPage from './pages/ErrorPage.tsx';
import Loading from './components/Loading.tsx';

const Viewer = lazy(async () => import('./pages/Viewer.tsx'));
const Speaker = lazy(async () => import('./pages/Speaker.tsx'));
const Presentation = lazy(async () => import('./pages/Presentation.tsx'));
const Home = lazy(async () => import('./pages/Home.tsx'));
const DefaultLayout = lazy(async () => import('./layouts/DefaultLayout.tsx'));
const SignIn = lazy(async () => import('./pages/SignIn.tsx'));
const Upload = lazy(async () => import('./pages/Upload.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <DefaultLayout
        title={
          <>
            Present!
            <div className="i-tabler-microphone-2 ml-2" />
          </>
        }
      >
        <Home />
      </DefaultLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '/signin',
    element: <SignIn />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:presentationSlug',
    element: <Presentation />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:presentationSlug/view',
    element: <Viewer />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:presentationSlug/speaker',
    element: <Speaker />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/upload',
    element: (
      <DefaultLayout title="Upload Presentation">
        <Upload />
      </DefaultLayout>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: '*',
    element: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="h-screen w-screen">
          <Loading />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);
