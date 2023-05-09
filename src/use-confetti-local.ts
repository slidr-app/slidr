import {useEffect, useState} from 'react';

export default function useConfetti(onConfetti?: (data: any) => void) {
  const [postConfetti, setPostConfetti] = useState<() => void>(
    () => () => undefined,
  );

  useEffect(() => {
    const confettiChannel = new BroadcastChannel('confetti');
    const currentSlideHandler = (event: MessageEvent) => {
      console.log('confetti', event);
      if (onConfetti) {
        onConfetti({});
      }
    };

    confettiChannel.addEventListener('message', currentSlideHandler);
    setPostConfetti(() => () => {
      console.log('posting confetti');
      confettiChannel.postMessage({});
    });

    return () => {
      confettiChannel.removeEventListener('message', currentSlideHandler);
      confettiChannel.close();
    };
  }, [onConfetti]);

  return postConfetti;
}
