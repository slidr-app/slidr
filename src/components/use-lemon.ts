import {useEffect, useState} from 'react';

export function useLemon() {
  const [lemonLoaded, setLemonLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.defer = true;
    script.addEventListener('load', () => {
      // eslint-disable-next-line unicorn/prefer-global-this
      window.createLemonSqueezy();
      setLemonLoaded(true);
    });

    document.body.append(script);

    return () => {
      script.remove();
    };
  }, []);

  return lemonLoaded;
}
