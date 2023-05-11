// eslint-disable-line unicorn/filename-case
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Presentation from './Presentation.tsx';
import Speaker from './Speaker.tsx';
import Viewer from './Viewer.tsx';
import Home from './Home.tsx';
import {presentations} from './presentation-urls.ts';

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
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);
