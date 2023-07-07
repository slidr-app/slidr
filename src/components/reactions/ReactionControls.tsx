import Button from '../toolbar/Button';

export default function ReactionControls({
  handleConfetti,
  handleReaction,
}: {
  handleConfetti: () => void;
  handleReaction: (icon: string) => void;
}) {
  return (
    <div className="max-w-lg mx-auto grid grid-cols-[4rem_4rem_4rem_4rem] gap-4 grid-rows-[4rem_4rem]">
      <Button
        border
        label="confetti"
        title="Throw some confetti"
        icon="i-fluent-emoji-flat-party-popper h-8 w-8"
        className="relative col-span-4"
        onClick={() => {
          handleConfetti();
        }}
      />
      <Button
        border
        label="love"
        title="React with love"
        icon="i-fluent-emoji-flat-red-heart h-8 w-8"
        className="relative"
        onClick={() => {
          handleReaction('i-fluent-emoji-flat-red-heart');
        }}
      />
      <Button
        border
        label="smile"
        title="React with a smile"
        icon="i-fluent-emoji-flat-smiling-face h-8 w-8"
        className="relative"
        onClick={() => {
          handleReaction('i-fluent-emoji-flat-smiling-face');
        }}
      />
      <Button
        border
        label="clap"
        title="React with clapping hands"
        icon="i-fluent-emoji-flat-clapping-hands h-8 w-8"
        className="relative"
        onClick={() => {
          handleReaction('i-fluent-emoji-flat-clapping-hands');
        }}
      />
      <Button
        border
        label="explode"
        title="React with a exploding brain"
        icon="i-fluent-emoji-flat-exploding-head h-8 w-8"
        className="relative"
        onClick={() => {
          handleReaction('i-fluent-emoji-flat-exploding-head');
        }}
      />
    </div>
  );
}
