import {useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {UserContext} from './UserProvider';
import {useLemon} from './use-lemon';

// Adapted from Lemon Squeezy docs
// https://docs.lemonsqueezy.com/help/lemonjs/using-with-frameworks-libraries#react
export default function GoProButton() {
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const lemonLoaded = useLemon();

  return (
    <a
      href="https://shop.slidr.app/buy/6ecf7e4f-c84a-4b5d-ad8e-306e0490b79c"
      // ClassName="lemonsqueezy-button"
      onClick={(event) => {
        event.preventDefault();

        if (user) {
          // If the user is signed in, open the Lemon Squeezy checkout
          // eslint-disable-next-line new-cap, unicorn/prefer-global-this
          window.LemonSqueezy.Url.Open(
            'https://shop.slidr.app/buy/6ecf7e4f-c84a-4b5d-ad8e-306e0490b79c',
          );
        } else {
          // If the user is not signed in, redirect to the sign-in page}
          navigate('/signin?redirect=/user');
        }
      }}
    >
      <button
        type="button"
        className="btn flex flex-row gap-2 self-start text-lg font-semibold hover:bg-teal hover:bg-opacity-20 items-center"
      >
        <div>{lemonLoaded ? 'Upgrade to Slidr Pro' : 'Loading...'}</div>
        <div className="i-tabler-arrow-right w-6 h-6" />
      </button>
    </a>
  );
}
