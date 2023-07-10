// eslint-disable-line unicorn/filename-case
import {cleanup, render} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import Routes from '../Routes';

afterEach(() => {
  cleanup();
});

function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    // Wrap provider(s) here if needed
    wrapper: ({children}) => children,
    ...options,
  });
}

export function renderRoute(route: string, options = {}) {
  const router = createMemoryRouter(Routes, {initialEntries: [route]});
  return render(<RouterProvider router={router} />, options);
}

export * from '@testing-library/react';
export {default as userEvent} from '@testing-library/user-event';
// Override render export
export {customRender as render};
