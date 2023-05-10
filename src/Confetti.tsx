import ReactCanvasConfetti from 'react-canvas-confetti';

export default function Confetti({fire}: {fire: any}) {
  return (
    <ReactCanvasConfetti
      resize
      useWorker
      fire={fire} // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      angle={90}
      className="position-absolute top-0 left-0 w-screen h-screen"
      colors={[
        '#26ccff',
        '#a25afd',
        '#ff5e7e',
        '#88ff5a',
        '#fcff42',
        '#ffa62d',
        '#ff36ff',
      ]}
      decay={0.8}
      drift={0}
      gravity={1}
      origin={{
        x: Math.random(),
        y: Math.random(),
      }}
      particleCount={500}
      scalar={1}
      shapes={['circle', 'square', 'star']}
      spread={360}
      startVelocity={45}
      ticks={600}
    />
  );
}
