// eslint-disable-line unicorn/filename-case
import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Home from './Home.tsx';
import {presentations} from './presentation-urls.ts';

const Viewer = lazy(async () => import('./Viewer.tsx'));
const Speaker = lazy(async () => import('./Speaker.tsx'));
const Presentation = lazy(async () => import('./Presentation.tsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home presentationSlugs={Object.keys(presentations)} />,
  },
  {
    path: '/:presentationSlug',
    element: <Presentation />,
  },
  {
    path: '/:presentationSlug/view',
    element: <Viewer />,
  },
  {
    path: '/:presentationSlug/speaker',
    element: <Speaker />,
  },
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <div className="text-white font-sans text-xl">
      <Suspense fallback={<div>wait</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  </React.StrictMode>,
);
