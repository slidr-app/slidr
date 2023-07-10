// eslint-disable-line unicorn/filename-case
import React, {Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import Loading from './components/Loading.tsx';
import {UserProvider} from './components/UserProvider.tsx';
import {UpdateProvider} from './components/UpdateProvider.tsx';
import Routes from './Routes.tsx';

const router = createBrowserRouter(Routes);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <UpdateProvider>
      <UserProvider>
        <Suspense
          fallback={
            <div className="h-screen w-screen">
              <Loading />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </UserProvider>
    </UpdateProvider>
  </React.StrictMode>,
);
