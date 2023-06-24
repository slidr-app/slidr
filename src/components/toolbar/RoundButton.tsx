import clsx from 'clsx';
import {type MouseEventHandler} from 'react';

export default function RoundButton({
  onClick,
  icon,
  label,
  title,
  to,
  newTab,
}: {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  to: string;
  icon: string;
  label: string;
  title: string;
  newTab?: boolean;
}) {
  const anchorProps: {target?: string; rel?: string} = {};
  if (newTab) {
    anchorProps.target = '_blank';
    anchorProps.rel = 'noreferrer';
  }

  return (
    // The following error is handled with the newTab property
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={to}
      className="flex flex-col items-center all-[button]:hover:(bg-gray-700)"
      onClick={onClick}
      {...anchorProps}
    >
      <button
        type="button"
        className="btn rounded-full w-[4rem] h-[4rem] flex items-center justify-center bg-gray-800"
        title={title}
      >
        <div
          className={clsx(
            'w-[2rem] h-[2rem] text-teal active:(text-white)',
            icon,
          )}
        />
      </button>
      <div className="text-sm">{label}</div>
    </a>
  );
}
