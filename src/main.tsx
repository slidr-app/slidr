// eslint-disable-line unicorn/filename-case
import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Message from './Loading.tsx';
import ErrorPage from './ErrorPage.tsx';

const Viewer = lazy(async () => import('./Viewer.tsx'));
const Speaker = lazy(async () => import('./Speaker.tsx'));
const Presentation = lazy(async () => import('./Presentation.tsx'));
const Home = lazy(async () => import('./Home.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
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
    path: '*',
    element: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="h-screen w-screen">
          <Message />
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);
