import clsx from 'clsx';
import {type MouseEventHandler} from 'react';

export default function Button({
  onClick,
  icon,
  label,
  title,
  disabled,
  border,
  className,
  submit,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon: string;
  label: string;
  title: string;
  disabled?: boolean;
  border?: boolean;
  className?: string;
  submit?: boolean;
}) {
  const optionalProps: {onClick?: MouseEventHandler<HTMLButtonElement>} = {};
  if (onClick !== undefined) {
    optionalProps.onClick = onClick;
  }

  return (
    <button
      disabled={Boolean(disabled)}
      type={submit ? 'submit' : 'button'}
      title={title}
      className={clsx(
        'flex flex-col justify-center items-center bg-gray-800 bg-opacity-90',
        border ? 'px-4 py2' : 'px-2 py-1',
        border && 'border-primary shadow-primary',
        disabled
          ? 'text-gray-300'
          : 'text-teal hover:(bg-gray-700) active:(text-white bg-black)',
        className,
      )}
      {...optionalProps}
    >
      <div className={clsx(icon)} />
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
}
