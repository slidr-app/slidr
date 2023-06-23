import clsx from 'clsx';
import {type MouseEventHandler} from 'react';
import {Link} from 'react-router-dom';

export default function Button({
  onClick,
  icon,
  label,
  title,
  to,
  anchor,
  disabled,
  newTab,
}:
  | {
      onClick: MouseEventHandler<HTMLButtonElement>;
      icon: string;
      label: string;
      title: string;
      to?: never;
      anchor?: never;
      disabled?: boolean;
      newTab?: never;
    }
  | {
      onClick?: MouseEventHandler<HTMLAnchorElement>;
      icon: string;
      label: string;
      title: string;
      anchor?: boolean;
      to: string;
      disabled?: never;
      newTab?: boolean;
    }) {
  const linkProps: {
    to?: string;
    className?: string;
    target?: string;
    rel?: string;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
  } = {};
  const buttonProps: {
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string;
    disabled?: boolean;
  } = {};

  const outterClasses = clsx(
    'px-2 py-1 flex flex-col justify-center items-center bg-gray-800',
    disabled
      ? 'text-gray-300'
      : 'text-teal hover:(bg-gray-700) active:(text-white)',
  );

  if (to === undefined) {
    // Button is the outer element
    buttonProps.onClick = onClick;
    buttonProps.className = outterClasses;
    buttonProps.disabled = Boolean(disabled);
  } else {
    // Link is the outer element
    linkProps.className = outterClasses;
    buttonProps.className = 'flex flex-col items-center justify-center';
    if (anchor && newTab) {
      linkProps.target = '_blank';
      linkProps.rel = 'noreferrer';
    }

    if (onClick) {
      linkProps.onClick = onClick;
    }
  }

  const ButtonContent = (
    <button type="button" title={title} {...buttonProps}>
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

  if (to === undefined) {
    return ButtonContent;
  }

  if (anchor) {
    return (
      // The following error is handled with the newTab property
      // eslint-disable-next-line react/jsx-no-target-blank
      <a href={to} {...linkProps}>
        {ButtonContent}
      </a>
    );
  }

  return (
    <Link to={to} {...linkProps}>
      {ButtonContent}
    </Link>
  );
}
