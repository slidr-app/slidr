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
  readonly onClick?: MouseEventHandler<HTMLAnchorElement>;
  readonly to: string;
  readonly icon: string;
  readonly label: string;
  readonly title: string;
  readonly newTab?: boolean;
}) {
  const anchorProperties: {target?: string; rel?: string} = {};
  if (newTab) {
    anchorProperties.target = '_blank';
    anchorProperties.rel = 'noreferrer';
  }

  return (
    // The following error is handled with the newTab property
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={to}
      className="flex flex-col items-center all-[button]:hover:(bg-gray-700) text-teal all-[button]:active:(text-white bg-black)"
      onClick={onClick}
      {...anchorProperties}
    >
      <button
        type="button"
        className="border-teal border-2 shadow-primary rounded-full w-[4rem] h-[4rem] flex items-center justify-center bg-gray-800 bg-opacity-80"
        title={title}
      >
        <div className={clsx('w-[2rem] h-[2rem]', icon)} />
      </button>
      <div className="text-sm text-white">{label}</div>
    </a>
  );
}
