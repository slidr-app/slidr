import clsx from 'clsx';
import Button from '../toolbar/Button';
import {type IconReaction} from './reaction';
import reactionsIconMap from './reaction-icons-map';

export default function ReactionControls({
  handleConfetti,
  handleReaction,
}: {
  readonly handleConfetti: () => void;
  readonly handleReaction: (reaction: IconReaction) => void;
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
      {Array.from(reactionsIconMap.entries()).map(([label, {icon, title}]) => (
        <Button
          key={label}
          border
          label={label}
          title={title}
          icon={clsx(icon, 'h-8 w-8')}
          className="relative"
          onClick={() => {
            handleReaction(label);
          }}
        />
      ))}
    </div>
  );
}
