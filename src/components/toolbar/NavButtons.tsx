import Button from './Button';

export default function NavButtons({
  onNext,
  onPrevious,
  onStart,
  onEnd,
}: {
  onNext: () => void;
  onPrevious: () => void;
  onStart: () => void;
  onEnd: () => void;
}) {
  return (
    <>
      <Button
        icon="i-tabler-arrow-big-left-filled"
        label="previous"
        title="Previous slide"
        onClick={onPrevious}
      />
      <Button
        icon="i-tabler-arrow-big-right-filled"
        label="next"
        title="Next slide"
        onClick={onNext}
      />
      <Button
        icon="i-tabler-arrow-bar-to-left"
        label="start"
        title="Go to start"
        onClick={onStart}
      />
      <Button
        icon="i-tabler-arrow-bar-to-right"
        label="end"
        title="Go to end"
        onClick={onEnd}
      />
    </>
  );
}
