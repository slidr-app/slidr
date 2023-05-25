import clsx from 'clsx';
import {useEffect, useMemo, useRef} from 'react';
import {type Reaction as ReactionType} from './use-reactions';

function Reaction({
  onReactionDone,
  icon = 'i-fluent-emoji-flat-red-heart',
}: {
  onReactionDone: () => void;
  icon?: string;
}) {
  // Keep a ref to the reaction div so we can add the random style vars
  const reactionRef = useRef<HTMLDivElement>(null);

  // Define the random style vars (only once!)
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
    <div className="fixed top-0 left-0 h-screen w-screen">
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