import clsx from 'clsx';
import {useEffect, useMemo, useRef} from 'react';
import {type Reaction as ReactionType} from './use-reactions';

// This file is inspired from these 2 articles:
// https://eng.butter.us/awesome-floating-emoji-reactions-using-framer-motion-styled-components-and-lottie-36b9f479a9f9
// https://www.daily.co/blog/add-flying-emoji-reactions-to-a-custom-daily-video-call/

function Reaction({
  onReactionDone,
  icon = 'i-fluent-emoji-flat-red-heart',
}: {
  onReactionDone: () => void;
  icon?: string;
}) {
  // Keep a ref to the reaction div so we can add the random style vars
  const reactionRef = useRef<HTMLDivElement>(null);

  // Define the random style vars (only once per mount!)
  // Maybe one day css can do random natively???
  // In the meantime, we do random JS
  // Inspired from: https://css-tricks.com/random-numbers-css/
  const xRandom = useMemo(() => `${Math.random() * 100}%`, []);
  const durationRandom = useMemo(() => `${Math.random() * 13 + 2}s`, []);
  const bounceDistanceRandom = useMemo(() => `${Math.random() * 15 + 5}px`, []);

  useEffect(() => {
    if (reactionRef.current) {
      // Set the random style vars
      reactionRef.current.style.setProperty('--reaction-x-offset', xRandom);
      reactionRef.current.style.setProperty(
        '--reaction-duration',
        durationRandom,
      );
      reactionRef.current.style.setProperty(
        '--reaction-bounce-distance',
        bounceDistanceRandom,
      );

      // Add a handler to remove ourselves when the animation is done
      reactionRef.current.addEventListener('animationend', onReactionDone);
    }

    const reactionDiv = reactionRef.current;

    return () => {
      if (reactionDiv) {
        reactionDiv.removeEventListener('animationend', onReactionDone);
      }
    };
  }, [onReactionDone, xRandom, durationRandom, bounceDistanceRandom]);

  return (
    <div
      ref={reactionRef}
      style={{left: `var(--reaction-x-offset)`}}
      className={clsx(
        'animate-emoji absolute bottom--100px bottom--12 leading-none text-size-12 overflow-visible',
        icon,
      )}
    />
  );
}

export default function Reactions({
  reactions,
  removeReaction,
}: {
  reactions: ReactionType[];
  removeReaction: (reaction: ReactionType) => void;
}) {
  return (
    <div className="fixed top-0 left-0 h-screen w-screen pointer-events-none">
      <div className="relative left-[calc(3rem_+_20px)] h-full w-[calc(calc(100vw_-_6rem)_-_40px)] max-h-screen">
        {reactions.map((reaction) => (
          <Reaction
            key={reaction.id}
            icon={reaction.icon}
            onReactionDone={() => {
              removeReaction(reaction);
            }}
          />
        ))}
      </div>
    </div>
  );
}
