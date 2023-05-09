import {useEffect, useState} from 'react';
import supabase from './supabase';

export default function useConfetti(onConfetti?: (data: any) => void) {
  const [postConfetti, setPostConfetti] = useState<() => void>(
    () => () => undefined,
  );

  useEffect(() => {
    const channel = supabase.channel('boom');

    channel
      .on('broadcast', {event: 'boom'}, (payload) => {
        console.log('supabase', payload);
        if (onConfetti) {
          onConfetti({});
        }
      })
      .subscribe((status) => {
        console.log('supabase subscription', status);
        if (status === 'SUBSCRIBED') {
          setPostConfetti(
            () => async () =>
              channel.send({type: 'broadcast', event: 'boom', payload: {}}),
          );
          // Void channel.send({
          //   type: 'broadcast',
          //   event: 'boom',
          //   payload: {},
          // });
        }
      });

    return () => {
      void channel.unsubscribe();
    };

    // Const confettiChannel = new BroadcastChannel('confetti');
    // const currentSlideHandler = (event: MessageEvent) => {
    //   console.log('confetti', event);
    //   if (onConfetti) {
    //     onConfetti({});
    //   }
    // };

    // confettiChannel.addEventListener('message', currentSlideHandler);
    // setPostConfetti(() => () => {
    //   console.log('posting confetti');
    //   confettiChannel.postMessage({});
    // });

    // return () => {
    //   confettiChannel.removeEventListener('message', currentSlideHandler);
    //   confettiChannel.close();
    // };
  }, [onConfetti]);

  return postConfetti;
}
