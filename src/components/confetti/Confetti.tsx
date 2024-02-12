import {useEffect, useRef, useState} from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import {type ConfettiReactionEntry} from '../reactions/reaction';

function confettiProperties(): confetti.Options {
  return {
    angle: 90,
    colors: [
      '#26ccff',
      '#a25afd',
      '#ff5e7e',
      '#88ff5a',
      '#fcff42',
      '#ffa62d',
      '#ff36ff',
    ],
    decay: 0.8,
    drift: 0,
    gravity: 1,
    origin: {
      x: Math.random(),
      y: Math.random(),
    },
    particleCount: 500,
    scalar: 1,
    shapes: ['circle', 'square', 'star'],
    spread: 360,
    startVelocity: 45,
    ticks: 600,
  };
}

export default function Confetti({
  confettiReactions,
  clear,
  fire,
}: {
  readonly confettiReactions: ConfettiReactionEntry[];
  readonly clear?: any;
  readonly fire?: any;
}) {
  const [doneReactions, setDoneReactions] = useState<string[]>([]);
  const confettiReference = useRef<confetti.CreateTypes>();
  useEffect(() => {
    for (const [id, confettiReaction] of confettiReactions) {
      if (doneReactions.includes(id)) {
        continue;
      }

      if (confettiReaction === 'confetti') {
        void confettiReference.current?.(confettiProperties());
      }

      setDoneReactions((currentDoneReactions) => [...currentDoneReactions, id]);
    }
  }, [confettiReactions, doneReactions]);

  useEffect(() => {
    if (clear) {
      console.log('clearing');
      confettiReference.current?.reset();
    }
  }, [clear]);

  useEffect(() => {
    if (fire) {
      void confettiReference.current?.(confettiProperties());
    }
  }, [fire]);

  return (
    <ReactCanvasConfetti
      globalOptions={{resize: true, useWorker: true}}
      className="position-fixed top-0 left-0 w-screen h-screen pointer-events-none"
      onInit={(confetti) => {
        confettiReference.current = confetti?.confetti ?? undefined;
      }}
    />
  );
}
