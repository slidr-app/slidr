import Button from './Button';

export default function NavigateButtons({
  onNext,
  onPrevious,
  onStart,
  onEnd,
  isBorder,
}: {
  readonly onNext: () => void;
  readonly onPrevious: () => void;
  readonly onStart: () => void;
  readonly onEnd: () => void;
  readonly isBorder?: boolean;
}) {
  return (
    <>
      <Button
        icon="i-tabler-arrow-big-left-filled"
        label="previous"
        title="Previous slide"
        isBorderEnabled={isBorder}
        onClick={onPrevious}
      />
      <Button
        icon="i-tabler-arrow-big-right-filled"
        label="next"
        title="Next slide"
        isBorderEnabled={isBorder}
        onClick={onNext}
      />
      <Button
        icon="i-tabler-arrow-bar-to-left"
        label="start"
        title="Go to start"
        isBorderEnabled={isBorder}
        onClick={onStart}
      />
      <Button
        icon="i-tabler-arrow-bar-to-right"
        label="end"
        title="Go to end"
        isBorderEnabled={isBorder}
        onClick={onEnd}
      />
    </>
  );
}
