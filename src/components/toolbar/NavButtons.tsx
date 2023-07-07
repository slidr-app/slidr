import Button from './Button';

export default function NavButtons({
  onNext,
  onPrevious,
  onStart,
  onEnd,
  border,
}: {
  onNext: () => void;
  onPrevious: () => void;
  onStart: () => void;
  onEnd: () => void;
  border?: boolean;
}) {
  return (
    <>
      <Button
        icon="i-tabler-arrow-big-left-filled"
        label="previous"
        title="Previous slide"
        border={border}
        onClick={onPrevious}
      />
      <Button
        icon="i-tabler-arrow-big-right-filled"
        label="next"
        title="Next slide"
        border={border}
        onClick={onNext}
      />
      <Button
        icon="i-tabler-arrow-bar-to-left"
        label="start"
        title="Go to start"
        border={border}
        onClick={onStart}
      />
      <Button
        icon="i-tabler-arrow-bar-to-right"
        label="end"
        title="Go to end"
        border={border}
        onClick={onEnd}
      />
    </>
  );
}
