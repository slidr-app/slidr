// eslint-disable-line unicorn/filename-case
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Speaker from './Speaker.tsx';
import Viewer from './Viewer.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/speaker',
    element: <Speaker />,
  },
  {
    path: '/viewer',
    element: <Viewer />,
  },
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <div className="text-white font-sans text-xl">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);
