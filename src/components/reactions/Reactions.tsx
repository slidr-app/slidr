import clsx from 'clsx/lite';
import {useEffect, useMemo, useRef} from 'react';
import {type IconReaction, type IconReactionMap} from './reaction';
import reactionsIconMap from './reaction-icons-map';

// This file is inspired from these 2 articles:
// https://eng.butter.us/awesome-floating-emoji-reactions-using-framer-motion-styled-components-and-lottie-36b9f479a9f9
// https://www.daily.co/blog/add-flying-emoji-reactions-to-a-custom-daily-video-call/

function Reaction({
  onReactionDone,
  reaction,
}: {
  readonly onReactionDone: () => void;
  readonly reaction: IconReaction;
}) {
  // Keep a ref to the reaction div so we can add the random style vars
  const reactionReference = useRef<HTMLDivElement>(null);

  // Define the random style vars (only once per mount!)
  // Maybe one day css can do random natively???
  // In the meantime, we do random JS
  // Inspired from: https://css-tricks.com/random-numbers-css/
  const xRandom = useMemo(() => `${Math.random() * 100}%`, []);
  const durationRandom = useMemo(() => `${Math.random() * 13 + 2}s`, []);
  const bounceDistanceRandom = useMemo(() => `${Math.random() * 15 + 5}px`, []);

  useEffect(() => {
    if (reactionReference.current) {
      // Set the random style vars
      reactionReference.current.style.setProperty(
        '--reaction-x-offset',
        xRandom,
      );
      reactionReference.current.style.setProperty(
        '--reaction-duration',
        durationRandom,
      );
      reactionReference.current.style.setProperty(
        '--reaction-bounce-distance',
        bounceDistanceRandom,
      );

      // Add a handler to remove ourselves when the animation is done
      reactionReference.current.addEventListener(
        'animationend',
        onReactionDone,
      );
    }

    const reactionDiv = reactionReference.current;

    return () => {
      if (reactionDiv) {
        reactionDiv.removeEventListener('animationend', onReactionDone);
      }
    };
  }, [onReactionDone, xRandom, durationRandom, bounceDistanceRandom]);

  return (
    <div
      ref={reactionReference}
      aria-label={reaction}
      role="figure"
      style={{left: `var(--reaction-x-offset)`}}
      className={clsx(
        'animate-emoji absolute bottom--100px bottom--12 leading-none text-size-12 overflow-visible',
        reactionsIconMap.get(reaction)?.icon,
      )}
    />
  );
}

export function Reactions({
  reactions,
  removeReaction,
}: {
  readonly reactions: IconReactionMap;
  readonly removeReaction: (id: string) => void;
}) {
  return (
    <div className="fixed top-0 left-0 h-screen w-screen pointer-events-none">
      <div className="relative left-[calc(3rem_+_20px)] h-full w-[calc(calc(100vw_-_6rem)_-_40px)] max-h-screen">
        {Array.from(reactions.entries())
          .filter(([, renderedReaction]) => !renderedReaction.done)
          .map(([id, renderedReaction]) => (
            <Reaction
              key={id}
              reaction={renderedReaction.reaction}
              onReactionDone={() => {
                removeReaction(id);
              }}
            />
          ))}
      </div>
    </div>
  );
}
