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

const presentations = import.meta.glob('./presentations/*.pdf', {
  as: 'url',
  eager: true,
});

const presentationNameUrlEntries: Array<[string, string]> = Object.entries(
  presentations,
).map(([name, url]) => [name.split('/').at(-1)!.replace('.pdf', ''), url]);

const routes = presentationNameUrlEntries.flatMap(([name, url]) => [
  {path: `/${name}`, element: <Presentation slideUrl={url} />},
  {path: `/${name}/speaker`, element: <Speaker slideUrl={url} />},
  {path: `/${name}/view`, element: <Viewer slideUrl={url} />},
]);

console.log(presentations, routes);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Home
        presentations={presentationNameUrlEntries.map(
          ([presentation]) => presentation,
        )}
      />
    ),
  },
  ...routes,
]);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <div className="text-white font-sans text-xl">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>,
);
