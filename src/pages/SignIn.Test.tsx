import {type PropsWithChildren, Suspense} from 'react';
import {screen, userEvent, renderRoute, cleanup} from '../test/test-utils';
import {UserProvider} from '../components/UserProvider';
import {auth} from '../firebase';

type OobCode = {
  oobLink: string;
};

type OobCodesResponse = {
  oobCodes: OobCode[];
};

describe('SignIn', () => {
  let loginLinkSearchParameters: string;
  it('can sign in with an email address', async () => {
    renderRoute('/signin');
    const emailInputElement = await screen.findByLabelText(/email/i);
    await userEvent.type(
      emailInputElement,
      'signin.test.user@doesnotexist.com{Enter}',
    );
    await screen.findByRole('button', {
      name: /email sent/i,
    });

    cleanup();

    // Get the list of Out Of Bound codes waiting to sign in
    // https://firebase.google.com/docs/reference/rest/auth#section-auth-emulator-oob
    const result = await fetch(
      'http://127.0.0.1:9099/emulator/v1/projects/demo-test/oobCodes',
    );
    const data = (await result.json()) as OobCodesResponse;

    expect(data.oobCodes.length).toBeGreaterThanOrEqual(1);

    // Assume the last code is ours
    const oobCode = data.oobCodes.at(-1)!;

    // Follow the link in the code, but don't redirect so we can capture the search params
    const loginResult = await fetch(oobCode.oobLink, {redirect: 'manual'});

    // Parse the search params in the redirect
    const redirectLocationHeader = loginResult.headers.get('location');
    expect(redirectLocationHeader).not.toBeNull();
    const redirectUrl = new URL(redirectLocationHeader!);
    loginLinkSearchParameters = redirectUrl.searchParams.toString();
    expect(loginLinkSearchParameters.length).toBeGreaterThan(0);
  });

  it('signs in', async () => {
    // Login with the search params that were captured in the previous test
    renderRoute(`/signin?${loginLinkSearchParameters}`, {
      wrapper: ({children}: PropsWithChildren) => (
        <UserProvider>
          <Suspense>{children}</Suspense>
        </UserProvider>
      ),
    });

    // Wait for the login to complete
    await screen.findByRole('button', {name: 'account'}, {timeout: 3000});

    expect(auth.currentUser).toHaveProperty(
      'email',
      'signin.test.user@doesnotexist.com',
    );
  });
});
