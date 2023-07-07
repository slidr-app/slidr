import clsx from 'clsx';
import {type MouseEventHandler} from 'react';
import {Link} from 'react-router-dom';

export default function LinkButton({
  onClick,
  icon,
  label,
  title,
  to,
  disabled,
  newTab,
  clientRoute,
}: {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  icon: string;
  label: string;
  title: string;
  to: string;
  disabled?: never;
  newTab?: boolean;
  clientRoute?: boolean;
}) {
  const linkProps: {
    target?: string;
    rel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  } = {};

  const linkClasses = clsx(
    'px-2 py-1 flex flex-col justify-center items-center bg-gray-800 bg-opacity-80',
    disabled
      ? 'text-gray-300'
      : 'text-teal hover:(bg-gray-700) all-[button]:active:(text-white) active:bg-black',
  );

  // TODO: fix click anywhere makes icon white!

  if (!clientRoute && newTab) {
    linkProps.target = '_blank';
    linkProps.rel = 'noreferrer';
  }

  if (onClick) {
    linkProps.onClick = onClick;
  }

  const ButtonContent = (
    <button
      disabled={disabled}
      type="button"
      title={title}
      className="flex flex-col items-center justify-center"
    >
      <div className={icon} />
      <div
        className={clsx(
          'text-xs lt-sm:text-xs',
          disabled ? 'text-gray-300' : 'text-white',
        )}
      >
        {label}
      </div>
    </button>
  );

  if (clientRoute) {
    return (
      <Link to={to} className={linkClasses} {...linkProps}>
        {ButtonContent}
      </Link>
    );
  }

  return (
    // The following error is handled with the newTab property
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={to} className={linkClasses} {...linkProps}>
      {ButtonContent}
    </a>
  );
}
