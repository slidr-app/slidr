import clsx from 'clsx';

function ReactionButton({
  icon,
  handleReaction,
}: {
  icon: string;
  handleReaction: (icon: string) => void;
}) {
  return (
    <button
      className="btn relative"
      type="button"
      onClick={() => {
        handleReaction(icon);
      }}
    >
      <div className={clsx('w-8 h-8', icon)} />
    </button>
  );
}

export default function ReactionControls({
  handleConfetti,
  handleReaction,
}: {
  handleConfetti: () => void;
  handleReaction: (icon: string) => void;
}) {
  return (
    <div className="max-w-lg mx-auto grid grid-cols-4 gap-4">
      <button
        type="button"
        className="btn relative col-span-4"
        onClick={() => {
          handleConfetti();
        }}
      >
        <div className="i-fluent-emoji-flat-party-popper w-8 h-8" />
      </button>
      <ReactionButton
        icon="i-fluent-emoji-flat-red-heart"
        handleReaction={handleReaction}
      />
      <ReactionButton
        icon="i-fluent-emoji-flat-smiling-face"
        handleReaction={handleReaction}
      />
      <ReactionButton
        icon="i-fluent-emoji-flat-clapping-hands"
        handleReaction={handleReaction}
      />
      <ReactionButton
        icon="i-fluent-emoji-flat-exploding-head"
        handleReaction={handleReaction}
      />
    </div>
  );
}
